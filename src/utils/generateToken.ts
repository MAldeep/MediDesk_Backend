import { env } from "../config/env.js";
import { UserRole } from "../types/user.types.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
interface TokenPayload {
  id: string;
  role: UserRole;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const generateToken = (
  userId: string,
  role: UserRole,
): TokenResponse => {
  const jwtAccessSecret = env.JWT_ACCESS_SECRET;
  const jwtRefreshSecret = env.JWT_REFRESH_SECRET;
  if (!jwtAccessSecret || !jwtRefreshSecret) {
    throw new Error("JWT secrets are not defined in environment variables");
  }
  const accessToken = jwt.sign(
    { id: userId, role } as TokenPayload,
    jwtAccessSecret,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign({ id: userId }, jwtRefreshSecret, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

export const createPasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};
