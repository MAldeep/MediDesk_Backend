import { Document } from "mongoose";
import { Request } from "express";

export type UserRole = "admin" | "doctor" | "staff";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}
