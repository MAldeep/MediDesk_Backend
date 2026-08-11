import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/user.types.js";
import { AppError } from "../utils/appError.js";

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
