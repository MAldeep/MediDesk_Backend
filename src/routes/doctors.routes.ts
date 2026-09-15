import { Router } from "express";
import { protect } from "../middlewares/auth.middlreware.js";
import { restrictTo } from "../middlewares/restrictTo.middleware.js";
import { DoctorControllers } from "../controllers/doctors.controllers.js";

const router = Router();

router.get(
  "/",
  protect,
  restrictTo("admin", "staff"),
  DoctorControllers.getAllDoctors,
);

export default router;
