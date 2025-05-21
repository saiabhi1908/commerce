import express from 'express';
import { 
    loginUser, 
    registerUser, 
    getProfile, 
    updateProfile, 
    bookAppointment, 
    listAppointment, 
    cancelAppointment, 
    paymentStripe, 
    verifyStripe,
    sendOTP,
    sendResetOTP,
    verifyOtp,
    verifyResetOTP,
    resetPassword
} from '../controllers/userController.js';

import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getProfile);
userRouter.put("/update-profile", upload.single('image'), authUser, updateProfile);

userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

userRouter.post("/payment-stripe", authUser, paymentStripe);
userRouter.post("/verify-stripe", authUser, verifyStripe);

// OTP routes
userRouter.post('/send-otp', sendOTP);             // Registration OTP
userRouter.post('/send-reset-otp', sendResetOTP);  // Password reset OTP

// OTP verification routes
userRouter.post('/verify-otp', verifyOtp);          // Registration OTP verification
userRouter.post('/verify-reset-otp', verifyResetOTP); // Password reset OTP verification

// Password reset
userRouter.post('/reset-password', resetPassword);

// Test route
userRouter.get('/test', (req, res) => {
    res.send('✅ /api/user/test is working!');
});

export default userRouter;
