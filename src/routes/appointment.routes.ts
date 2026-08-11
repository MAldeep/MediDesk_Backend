import { Router } from "express";
import { protect } from "../middlewares/auth.middlreware.js";
import { AppointmentController } from "../controllers/appointment.controller.js";
import { restrictTo } from "../middlewares/restrictTo.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../validations/appointment.schema.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(AppointmentController.getAll)
  .post(
    restrictTo("admin", "staff"),
    validate(createAppointmentSchema),
    AppointmentController.create,
  );

router
  .route("/:id")
  .get(AppointmentController.getById)
  .delete(restrictTo("admin"), AppointmentController.delete)
  .patch(
    restrictTo("admin", "staff"),
    validate(updateAppointmentStatusSchema),
    AppointmentController.update,
  );

export default router;
