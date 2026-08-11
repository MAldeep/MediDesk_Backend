import { env } from "../config/env.js";
import { User } from "../models/user.models.js";
import { UserRole } from "../types/user.types.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
interface DecodedToken {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return next(
        new AppError(
          "You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }
    const jwtSecret = env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      return next(new AppError("JWT secret is not configured", 500));
    }
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401),
      );
    }
    req.user = currentUser;
    next();
  },
);
