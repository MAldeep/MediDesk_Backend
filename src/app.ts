import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { AppError } from "./utils/appError.js";
import globalErrorHandler from "./middlewares/errorHandler.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS Setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://medi-desk-frontend.vercel.app",
];

if (env.CLIENT_URL) {
  allowedOrigins.push(env.CLIENT_URL);
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS policy"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-App-Version",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
// 3. Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "fail",
    message:
      "Too many requests from this IP, please try again after 15 minutes!",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// 4. Logger in Development
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 5. Body Parsers & Cookies
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// 6. Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/users/doctor", doctorRoutes);
// 7. 404 Route Handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 8. Global Error Handler
app.use(globalErrorHandler);

export default app;
