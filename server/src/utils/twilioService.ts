import twilio from 'twilio';

// Initialize Twilio client with your credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Create Twilio client
const client = twilio(accountSid, authToken);

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  try {
    // Format phone number to E.164 format if not already
    // This assumes the number is passed with country code
    const formattedNumber = to.startsWith('+91') ? to : `+91${to}`;
    
    // Send SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedNumber
    });
    
    console.log(`SMS sent with SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error);
    return false;
  }
};
