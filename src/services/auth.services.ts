import bcrypt from "bcryptjs";
import { User } from "../models/user.models.js";
import { createPasswordResetToken } from "../utils/generateToken.js";
import { UserRole } from "../types/user.types.js";
import { AppError } from "../utils/appError.js";
import { generateToken } from "../utils/generateToken.js";
import { LoginInput, RegisterInput } from "../validations/auth.schema.js";
import crypto from "crypto";
import { EmailServices } from "./email.service.js";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}
interface InviteUser {
  name: string;
  email: string;
  role: "doctor" | "staff";
}
export class AuthService {
  // Register
  static async register(data: RegisterInput): Promise<SafeUser> {
    // check if email used
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email already used", 400);
    }
    // create the user
    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "admin",
      isVerified: true,
    });
    EmailServices.sendWelcomeEmail(data.email, data.name).catch((err) => {
      console.error("Non-blocking error: Failed to send welcome email:", err);
    });
    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: "admin",
    };
  }
  // Invite User by admin
  static async inviteUser(data: InviteUser, adminName: string) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const newUser = await User.create({
      name: data.name,
      email: data.email,
      role: data.role,
      isVerified: false,
      setPasswordToken: hashedToken,
      setPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    EmailServices.sendSetPasswordEmail(
      newUser.email,
      newUser.name,
      adminName,
      rawToken,
    ).catch((err) => {
      console.error("Failed to send set-password email:", err);
    });
    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified,
    };
  }
  // forgot password
  // static async forgotPassword(email: string) {
  //   const exisitingUser = await User.findOne({ email: email });
  //   if (!exisitingUser) {
  //     throw new AppError("User with this email not found", 404);
  //   }
  //   const { rawToken, hashedToken } = createPasswordResetToken();
  //   exisitingUser.passwordResetToken = hashedToken;
  //   exisitingUser.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  //   await exisitingUser.save({ validateBeforeSave: false });
  //   await EmailService.sendResetPasswordEmail(exisitingUser.email, rawToken);
  //   // i don't know what should i return here
  // }
  // reset password
  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const existingUser = await User.findOne({
      passwordResetToken: hashedToken,
    });
    if (
      !existingUser ||
      !existingUser.passwordResetExpires ||
      existingUser.passwordResetExpires.getTime() < Date.now()
    ) {
      throw new AppError("Invalid or expired password reset token", 400);
    }
    existingUser.password = newPassword;
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetExpires = undefined;
    await existingUser.save();
  }
  // set password for doctor and staff
  static async setPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const existingUser = await User.findOne({
      setPasswordToken: hashedToken,
    });

    if (
      !existingUser ||
      !existingUser.setPasswordExpires ||
      existingUser.setPasswordExpires.getTime() < Date.now()
    ) {
      throw new AppError("Invalid or expired password set token", 400);
    }

    existingUser.password = newPassword;
    existingUser.isVerified = true;
    existingUser.setPasswordToken = undefined;
    existingUser.setPasswordExpires = undefined;

    await existingUser.save();
  }
  // Login
  static async login(data: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: data.email }).select(
      "+password +refreshToken",
    );
    if (!user || !user.password) {
      throw new AppError("Invalid email or password", 401);
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }
    const { accessToken, refreshToken } = generateToken(
      user._id.toString(),
      user.role,
    );
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
  // Refresh token
  static async refreshToken(incomingRefreshToken: string): Promise<AuthResult> {
    const user = await User.findOne({ refreshToken: incomingRefreshToken });
    if (!user) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      user._id.toString(),
      user.role,
    );
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
  // logout
  static async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}
