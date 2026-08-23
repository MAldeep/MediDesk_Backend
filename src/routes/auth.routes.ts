import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  inviteUsersSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validations/auth.schema.js";
import { AuthController } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middlreware.js";
import { restrictTo } from "../middlewares/restrictTo.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", protect, AuthController.logout);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);
// same schema for set and reset
router.post(
  "/set-password/:token",
  validate(resetPasswordSchema),
  AuthController.setPassword,
);
router.post(
  "/invite-user",
  protect,
  restrictTo("admin"),
  validate(inviteUsersSchema),
  AuthController.inviteUser,
);
export default router;
