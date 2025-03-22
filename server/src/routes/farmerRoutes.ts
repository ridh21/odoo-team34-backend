import express from 'express';
import {
  checkAdharCard,
  sendOTP,
  verifyOTP,
  registerFarmer,
  loginFarmer,
  registerFarmerComplete,
  sendLoginOTP,
  verifyLoginOTP,
  getFarmerDetails 
} from '../controllers/farmerController';

// Create router without explicit type annotation
const router = express.Router();

// Routes for farmer registration
router.post('/check-adhar', checkAdharCard);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', registerFarmer);
router.post('/login', loginFarmer);
router.post('/send-login-otp', sendLoginOTP);
router.post('/verify-login-otp', verifyLoginOTP)
router.post('/register-complete', registerFarmerComplete);

router.get('/:farmerId/details', getFarmerDetails);

export default router;
