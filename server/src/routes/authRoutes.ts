import express from 'express';
import {
 sendOTP,
 verifyOTPAndRegister,
 login,
 generateResetOTP,
 resetPassword
} from '../controllers/authController';

const router = express.Router();

// Registration flow
router.post('/send-otp', sendOTP);
router.post('/verify-otp-register', verifyOTPAndRegister);

// Login
router.post('/login', login);

// Password reset flow
router.post('/reset-otp', generateResetOTP);
router.post('/reset-password',resetPassword);

export default router;
