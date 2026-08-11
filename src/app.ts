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

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS Setup
const allowedOrigins = ["http://localhost:3000"];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS policy"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
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

// 7. 404 Route Handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 8. Global Error Handler
app.use(globalErrorHandler);

export default app;
