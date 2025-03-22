import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import twilio from 'twilio';

const prisma = new PrismaClient();

// Initialize Twilio client
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } else {
    console.warn('Twilio credentials not found in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
}

export const checkAdharCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adharNumber } = req.body;

    if (!adharNumber) {
      res.status(400).json({ error: 'Adhar number is required' });
      return;
    }

    // Check if adhar card exists
    const adharCard = await prisma.adharCard.findUnique({
      where: { adharNumber }
    });

    if (!adharCard) {
      res.status(404).json({ error: 'Adhar card not found' });
      return;
    }

    // Check if farmer already exists with this adhar card
    const existingFarmer = await prisma.farmers.findFirst({
      where: { adharUUID: adharCard.id }
    });

    if (existingFarmer) {
      res.status(200).json({
        success: true,
        message: 'Farmer already registered with this Adhar card',
        isRegistered: true,
        farmerId: existingFarmer.id,
        adharUUID: existingFarmer.adharUUID,
        name: adharCard.name,
        mobileNumber: adharCard.mobileNumber
      });
      return;
    }

    // Check if mobile number exists
    if (!adharCard.mobileNumber) {
      res.status(400).json({ error: 'Mobile number not found for this Adhar card' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Adhar card verified successfully',
      isRegistered: false,
      adharUUID: adharCard.id,
      name: adharCard.name,
      mobileNumber: adharCard.mobileNumber
    });
  } catch (error) {
    console.error('Error checking adhar card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adharUUID, mobileNumber } = req.body;

    if (!adharUUID || !mobileNumber) {
      res.status(400).json({ error: 'Adhar UUID and mobile number are required' });
      return;
    }

    // Check if Twilio client is initialized
    if (!twilioClient) {
      res.status(500).json({ error: 'SMS service is not available' });
      return;
    }

    // First, verify that the adharUUID exists in the AdharCard table
    const adharCard = await prisma.adharCard.findUnique({
      where: { id: adharUUID }
    });

    if (!adharCard) {
      res.status(404).json({ error: 'Invalid Adhar UUID' });
      return;
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry time (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Check if a farmer record already exists with this adharUUID
    let farmer = await prisma.farmers.findFirst({
      where: { adharUUID }
    });

    if (farmer) {
      // Update the existing farmer record with new OTP
      farmer = await prisma.farmers.update({
        where: { id: farmer.id },
        data: {
          otp,
          otpExpiry
        }
      });
    } else {
      // Create a new farmer record with the valid adharUUID
      farmer = await prisma.farmers.create({
        data: {
          adharUUID,
          password: 'temporary', // Will be updated later
          otp,
          otpExpiry
        }
      });
    }

    // Send OTP via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your OTP for farmer registration is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobileNumber}` // Assuming Indian mobile number
      });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      res.status(500).json({ error: 'Failed to send OTP' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      farmerId: farmer.id
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const verifyOTP = async (req: Request, res: Response): Promise<void>=> {
  try {
    const { farmerId, otp } = req.body;

    if (!farmerId || !otp) {
      res.status(400).json({ error: 'Farmer ID and OTP are required' });
      return;
    }

    // Find the farmer record
    const farmer = await prisma.farmers.findUnique({
      where: { id: farmerId }
    });

    if (!farmer) {
      res.status(404).json({ error: 'Farmer not found' });
      return;
    }

    // Check if OTP is valid
    if (farmer.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    // Check if OTP is expired
    if (farmer.otpExpiry && farmer.otpExpiry < new Date()) {
      res.status(400).json({ error: 'OTP has expired' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      farmerId: farmer.id,
      
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerFarmer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmerId, password, adharUUID } = req.body;

    if (!farmerId || !password || !adharUUID) {
      res.status(400).json({ error: 'Farmer ID, password, and Adhar UUID are required' });
      return;
    }

    // Find the farmer record
    const farmer = await prisma.farmers.findUnique({
      where: { id: farmerId }
    });

    if (!farmer) {
      res.status(404).json({ error: 'Farmer not found' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the farmer record with the password and clear OTP
    const updatedFarmer = await prisma.farmers.update({
      where: { id: farmerId },
      data: {
        password: hashedPassword,
        adharUUID: adharUUID, // Update the adharUUID with the real one
        otp: null,
        otpExpiry: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Farmer registered successfully',
      farmerId: updatedFarmer.id
    });
  } catch (error) {
    console.error('Error registering farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const loginFarmer = async (req: Request, res: Response): Promise<void>=> {
  try {
    const { adharNumber, password } = req.body;

    if (!adharNumber || !password) {
      res.status(400).json({ error: 'Adhar number and password are required' });
      return;
    }

    // Find the adhar card
    const adharCard = await prisma.adharCard.findUnique({
      where: { adharNumber }
    });

    if (!adharCard) {
      res.status(404).json({ error: 'Adhar card not found' });
      return;
    }

    // Find the farmer
    const farmer = await prisma.farmers.findFirst({
      where: { adharUUID: adharCard.id }
    });

    if (!farmer) {
      res.status(404).json({ error: 'Farmer not found' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, farmer.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      farmerId: farmer.id,
      adharUUID: farmer.adharUUID
    });
  } catch (error) {
    console.error('Error logging in farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerFarmerComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adharNumber, password, mobileNumber } = req.body;

    if (!adharNumber || !password || !mobileNumber) {
      res.status(400).json({ error: 'Adhar number, password, and mobile number are required' });
      return;
    }

    // Step 1: Check Adhar Card
    const adharCard = await prisma.adharCard.findUnique({
      where: { adharNumber }
    });

    if (!adharCard) {
      res.status(404).json({ error: 'Adhar card not found' });
      return;
    }

    // Check if farmer already exists with this adhar card
    const existingFarmer = await prisma.farmers.findFirst({
      where: { adharUUID: adharCard.id }
    });

    if (existingFarmer) {
      res.status(200).json({
        success: true,
        message: 'Farmer already registered with this Adhar card',
        isRegistered: true,
        farmerId: existingFarmer.id,
        adharUUID: existingFarmer.adharUUID,
        name: adharCard.name,
        mobileNumber: adharCard.mobileNumber
      });
      return;
    }

    // Check if mobile number exists and matches
    if (!adharCard.mobileNumber) {
      res.status(400).json({ error: 'Mobile number not found for this Adhar card' });
      return;
    }

    if (adharCard.mobileNumber !== mobileNumber) {
      res.status(400).json({ error: 'Mobile number does not match the one registered with this Adhar card' });
      return;
    }

    // Step 2: Generate and "send" OTP (we'll skip actual sending for this flow)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Step 3: Create farmer record with OTP
    let farmer = await prisma.farmers.create({
      data: {
        adharUUID: adharCard.id,
        password: 'temporary', // Will be updated later
        otp,
        otpExpiry
      }
    });

    // Step 4: "Verify" OTP (we're auto-verifying since we just generated it)
    // In a real scenario, you'd wait for the user to input the OTP

    // Step 5: Complete registration by updating password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    farmer = await prisma.farmers.update({
      where: { id: farmer.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Farmer registered successfully',
      farmerId: farmer.id,
      adharUUID: farmer.adharUUID,
      name: adharCard.name,
      mobileNumber: adharCard.mobileNumber
    });
  } catch (error) {
    console.error('Error in complete farmer registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
