import bcrypt from "bcryptjs";
import { User } from "../models/user.models.js";
import { UserRole } from "../types/user.types.js";
import { AppError } from "../utils/appError.js";
import { generateToken } from "../utils/generateToken.js";
import { LoginInput, RegisterInput } from "../validations/auth.schema.js";
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

export class AuthService {
  // Register
  static async register(data: RegisterInput): Promise<SafeUser> {
    // check if email used
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("Email already used", 400);
    }
    // create the user
    const newUser = await User.create(data);
    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
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
