import express from "express";
import cors from 'cors';
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import placesRouter from "./routes/places.js";
import sendEmail from './utils/emailService.js';
import appointmentRouter from './routes/appointmentRoutes.js';

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());

// 🔓 TEMP: Open CORS during deployment testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// ✅ Later, lock this down after frontend deployed:
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://your-frontend-domain.com" // replace later
// ];
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
// }));

// API Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/places", placesRouter);
app.use("/", appointmentRouter);

// Email test route
app.get('/test-email', async (req, res) => {
  const testEmail = process.env.EMAIL_USER;
  const testTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await sendEmail(
      testEmail,
      '⏰ Appointment Reminder (Test)',
      `This is a test reminder email for your appointment scheduled at ${testTime.toLocaleString()}.`
    );
    res.send('✅ Test email sent!');
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    res.status(500).send('❌ Failed to send test email');
  }
});

// Base route
app.get("/", (req, res) => {
  res.send("API Working");
});

// Start Server
app.listen(port, () => console.log(`🚀 Server started on PORT:${port}`));
