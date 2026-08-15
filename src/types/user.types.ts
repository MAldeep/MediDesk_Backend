import { Document } from "mongoose";
import { Request } from "express";

export type UserRole = "admin" | "doctor" | "staff";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  refreshToken?: string | null;
  isVerified: boolean;
  setPasswordToken?: string;
  setPasswordExpires: Date;
  passwordResetToken?: string;
  passwordResetExpires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}
