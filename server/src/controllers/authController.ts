import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { sendSMS } from '../utils/twilioService';

const prisma = new PrismaClient();

// Step 1: Send OTP to mobile number for verification
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mobileNumber } = req.body;
  
      if (!mobileNumber) {
        res.status(400).json({ message: 'Mobile number is required' });
        return;
      }
  
      // Check if mobile number is already registered
      const existingUser = await prisma.users.findUnique({
        where: { mobileNumber }
      });
  
      if (existingUser) {
        res.status(400).json({ message: 'Mobile number is already registered' });
        return;
      }
  
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
  
      // Create a temporary user record or update if exists
      const tempUser = await prisma.users.upsert({
        where: { 
          mobileNumber 
        },
        update: {
          otp,
          otpExpiry
        },
        create: {
          mobileNumber,
          otp,
          otpExpiry,
          password: '' // Temporary password, will be updated during registration
        }
      });
  
      // Send OTP via Twilio SMS
      const message = `Your verification code is: ${otp}. Valid for 10 minutes.`;
      const smsSent = await sendSMS(mobileNumber, message);
  
      if (!smsSent) {
        res.status(500).json({ message: 'Failed to send OTP via SMS. Please try again.' });
        return;
      }
  
      // In development environment, also log the OTP
      if (process.env.NODE_ENV !== 'production') {
        console.log(`OTP for ${mobileNumber}: ${otp}`);
      }
  
      res.status(200).json({ 
        message: 'OTP sent successfully to your mobile number',
        // Only include OTP in response for development environments
        ...(process.env.NODE_ENV !== 'production' && { otp })
      });
    } catch (error) {
      console.error('OTP sending error:', error);
      res.status(500).json({ 
        message: 'Error sending OTP', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

// Step 2: Verify OTP and register user
export const verifyOTPAndRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      mobileNumber, 
      otp, 
      emailID, 
      password, 
      state, 
      city, 
      pincode, 
      longitude, 
      latitude 
    } = req.body;

    if (!mobileNumber || !otp || !password) {
      res.status(400).json({ message: 'Mobile number, OTP, and password are required' });
      return;
    }

    // Find user by mobile number
    const user = await prisma.users.findUnique({
      where: { mobileNumber }
    });

    if (!user) {
      res.status(404).json({ message: 'No OTP was sent to this mobile number' });
      return;
    }

    // Verify OTP
    if (user.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    // Check if OTP is expired
    if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
      res.status(400).json({ message: 'OTP has expired' });
      return;
    }

    // Check if email is already registered (if provided)
    if (emailID) {
      const emailExists = await prisma.users.findUnique({
        where: { emailID }
      });

      if (emailExists && emailExists.mobileNumber !== mobileNumber) {
        res.status(400).json({ message: 'Email is already registered' });
        return;
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with registration details
    const updatedUser = await prisma.users.update({
      where: { mobileNumber },
      data: {
        emailID,
        password: hashedPassword,
        state,
        city,
        pincode,
        longitude,
        latitude,
        otp: null,
        otpExpiry: null
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: updatedUser.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailID, mobileNumber, password } = req.body;

    if (!emailID && !mobileNumber) {
      res.status(400).json({ message: 'Email or mobile number is required' });
      return;
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { emailID: emailID || undefined },
          { mobileNumber: mobileNumber || undefined },
        ],
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    console.log('Plain Text Password:', password);
    console.log('Hashed Password in DB:', user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Generate OTP for password reset
export const generateResetOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mobileNumber } = req.body;
  
      if (!mobileNumber) {
        res.status(400).json({ message: 'Mobile number is required' });
        return;
      }
  
      // Find user
      const user = await prisma.users.findUnique({
        where: { mobileNumber }
      });
  
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
  
      // Save OTP to user record
      await prisma.users.update({
        where: { id: user.id },
        data: { otp, otpExpiry }
      });
  
      // Send OTP via Twilio SMS
      const message = `Your password reset code is: ${otp}. Valid for 10 minutes.`;
      const smsSent = await sendSMS(mobileNumber, message);
  
      if (!smsSent) {
        res.status(500).json({ message: 'Failed to send OTP via SMS. Please try again.' });
        return;
      }
  
      // In development environment, also log the OTP
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Reset OTP for ${mobileNumber}: ${otp}`);
      }
  
      res.status(200).json({ 
        message: 'OTP sent successfully to your mobile number',
        // Only include OTP in response for development environments
        ...(process.env.NODE_ENV !== 'production' && { otp })
      });
    } catch (error) {
      console.error('OTP generation error:', error);
      res.status(500).json({ 
        message: 'Error generating OTP', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

// Verify OTP and reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mobileNumber, otp, newPassword } = req.body;

    if (!mobileNumber || !otp || !newPassword) {
      res.status(400).json({ message: 'Mobile number, OTP, and new password are required' });
      return;
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { mobileNumber }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify OTP
    if (user.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    // Check if OTP is expired
    if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
      res.status(400).json({ message: 'OTP has expired' });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

