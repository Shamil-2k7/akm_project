const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const useragent = require("express-useragent");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(useragent.express());

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://akm-project-one.vercel.app",
  "https://akm-project-iws5xa29n-shamil-s-projects7.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman/server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/sections", require("./routes/sectionRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
