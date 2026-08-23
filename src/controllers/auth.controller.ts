import { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AuthService } from "../services/auth.services.js";
import { AppError } from "../utils/appError.js";

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 15 * 60 * 1000,
};

export class AuthController {
  // register
  static register = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);
    res.status(201).json({
      status: "success",
      message: "User Created Successfully!",
      data: { user },
    });
  });
  // login
  static login = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await AuthService.login(
      req.body,
    );
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.status(200).json({
      status: "success",
      message: "User logged in successfully!",
      data: {
        user,
        accessToken,
      },
    });
  });
  // refreshToken
  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
      throw new AppError("No refresh token provided", 401);
    }
    const {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    } = await AuthService.refreshToken(incomingRefreshToken);
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: {
        user,
        accessToken,
      },
    });
  });
  // Logout
  static logout = catchAsync(async (req: Request, res: Response) => {
    if (req.user) {
      await AuthService.logout(req.user._id.toString());
    }
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    });
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  });
  // forgotPassword
  static forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.forgotPassword(req.body.email);
    res.status(200).json({
      status: "success",
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  });
  // resetPassword
  static resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const resetToken = Array.isArray(token) ? token[0] : token;

    if (!resetToken) {
      throw new AppError("Reset token is missing", 400);
    }

    await AuthService.resetPassword(resetToken, req.body.password);
    res.status(200).json({
      status: "success",
      message: "Password Reset Successfully!",
    });
  });
  // setPassword
  static setPassword = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const setToken = Array.isArray(token) ? token[0] : token;
    if (!setToken) {
      throw new AppError("Reset token is missing", 400);
    }
    const newUser = await AuthService.setPassword(setToken, req.body.password);
    res.status(200).json({
      status: "success",
      message: "Password set successfully!",
    });
  });
  // inviteUser
  static inviteUser = catchAsync(async (req: Request, res: Response) => {
    const { newUserData } = req.body;
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const adminName = req.user.name;
    const user = await AuthService.inviteUser(newUserData, adminName);
    res.status(201).json({
      status: "success",
      message: "User invited successfully",
      data: { user },
    });
  });
}
