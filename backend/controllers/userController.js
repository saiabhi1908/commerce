import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary';
import stripe from "stripe";
import nodemailer from 'nodemailer';

// Stripe instance
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ========= OTP FUNCTIONS =========

// Send OTP
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000;

        await userModel.updateOne({ email }, { otp, otpExpires });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`
        });

        res.json({ success: true, message: 'OTP sent' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const sendResetOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000;

        user.resetOtp = otp;
        user.resetOtpExpires = otpExpires;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your password reset OTP is ${otp}. It is valid for 5 minutes.`
        });

        res.json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.isEmailVerified) return res.json({ success: false, message: 'User already verified' });
        if (user.otp !== otp) return res.json({ success: false, message: 'Invalid OTP' });
        if (Date.now() > user.otpExpires) return res.json({ success: false, message: 'OTP expired' });

        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await userModel.findOne({ email });

        if (!user || !user.resetVerified) {
            return res.json({ success: false, message: 'OTP not verified or session expired' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;

        // ✅ Reset fields after password is changed
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        user.resetVerified = false;

        await user.save();

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// ========= USER AUTH =========

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000;

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified: false
        });

        await newUser.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email - OTP Code',
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`
        });

        res.json({ success: true, message: 'OTP sent to your email for verification' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) return res.json({ success: false, message: "User not found" });

        if (!user.isEmailVerified) {
            return res.json({ success: false, message: "Email not verified. Please complete verification." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ========= USER PROFILE =========

const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId).select('-password');
        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" });
        }

        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: JSON.parse(address),
            dob,
            gender
        });

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, { image: imageURL });
        }

        res.json({ success: true, message: 'Profile Updated' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ========= APPOINTMENTS =========

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;
        const docData = await doctorModel.findById(docId).select("-password");

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' });
        }

        let slots_booked = docData.slots_booked;

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [slotTime];
        }

        const userData = await userModel.findById(userId).select("-password");
        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Booked' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ========= PAYMENTS =========

const paymentStripe = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const { origin } = req.headers;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' });
        }

        const currency = process.env.CURRENCY.toLowerCase();

        const line_items = [{
            price_data: {
                currency,
                product_data: { name: "Appointment Fees" },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }];

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const verifyResetOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.resetOtp !== otp || Date.now() > user.resetOtpExpires) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.resetVerified = true; // ✅ Mark user as verified
        await user.save();

        res.json({ success: true, message: 'OTP verified. You can now reset your password.' });
    } catch (error) {
        console.error('Error verifying reset OTP:', error);
        res.status(500).json({ success: false, message: 'Server error verifying OTP' });
    }
};


  
const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.body;

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
            return res.json({ success: true, message: 'Payment Successful' });
        }

        res.json({ success: false, message: 'Payment Failed' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ========= EXPORT ALL =========

export {
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
    resetPassword,
    verifyOtp,
    sendResetOTP,
    verifyResetOTP
};
