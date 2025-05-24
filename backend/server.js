import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import placesRouter from "./routes/places.js";
import sendEmail from "./utils/emailService.js";
import axios from "axios";
import jwt from "jsonwebtoken";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Connect to DB and Cloudinary
connectDB();
connectCloudinary();

// Middleware
app.use(express.json());
app.use(cors());

// Debug print environment variables (Remove or comment out in production)
console.log("HMS_APP_ACCESS_KEY:", process.env.HMS_APP_ACCESS_KEY);
console.log("HMS_APP_SECRET:", process.env.HMS_APP_SECRET ? "*****" : "Not Set");
console.log("HMS_ROOM_ID:", process.env.HMS_ROOM_ID);
console.log("OpenRouter API Key:", process.env.VITE_OPENROUTER_API_KEY ? "Set ✅" : "Missing ❌");

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/places", placesRouter);

// Test email route
app.get("/test-email", async (req, res) => {
  const testEmail = process.env.EMAIL_USER;
  const testTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  try {
    await sendEmail(
      testEmail,
      "⏰ Appointment Reminder (Test)",
      `This is a test reminder email for your appointment scheduled at ${testTime.toLocaleString()}.`
    );
    res.send("✅ Test email sent!");
  } catch (error) {
    console.error("❌ Failed to send test email:", error);
    res.status(500).send("❌ Failed to send test email");
  }
});

//
// ✅ 100ms Video Token Generator
//
app.post("/api/video/generate-token", async (req, res) => {
  const { user_id, role } = req.body;

  try {
    const managementToken = generateManagementToken();
    console.log("Generated Management Token:", managementToken);

    const response = await axios.post(
      `https://api.100ms.live/v2/rooms/${process.env.HMS_ROOM_ID}/tokens`,
      {
        user_id,
        role,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${managementToken}`,
        },
      }
    );

    res.json({ token: response.data.token });
  } catch (error) {
    console.error("❌ Full error generating token:", error);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }

    res.status(500).json({ error: "Failed to generate 100ms token" });
  }
});

function generateManagementToken() {
  const payload = {
    access_key: process.env.HMS_APP_ACCESS_KEY,
    type: "management",
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    jti: Math.random().toString(36).substring(2),
  };

  return jwt.sign(payload, process.env.HMS_APP_SECRET, { algorithm: "HS256" });
}

//
// ✅ OpenRouter Chat Completion Proxy Route
//
app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ OpenRouter Error:", errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Failed to fetch OpenRouter:", error);
    res.status(500).json({ error: "Failed to fetch from OpenRouter" });
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log(`🚀 Server started on PORT: ${port}`));
