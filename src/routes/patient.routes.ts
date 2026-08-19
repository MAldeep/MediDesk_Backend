import { Router } from "express";
import { protect } from "../middlewares/auth.middlreware.js";
import { restrictTo } from "../middlewares/restrictTo.middleware.js";
import { PatientController } from "../controllers/patient.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPatientSchema,
  getOneOrDeletePatientSchema,
  updatePatientSchema,
} from "../validations/patient.schema.js";
import { upload } from "../middlewares/upload.middleware.js";
import { resizePatientScan } from "../middlewares/resizePatientScan.middleware.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(restrictTo("admin", "staff"), PatientController.getAll)
  .post(
    restrictTo("admin", "staff"),
    validate(createPatientSchema),
    PatientController.create,
  );

router
  .route("/:id")
  // not restricted as doctors may need to see patient profiles before appointments
  .get(validate(getOneOrDeletePatientSchema), PatientController.getById)
  // not restricted as doctors may need to add data to patient history
  // help me with the update patient zod schema
  .patch(validate(updatePatientSchema), PatientController.update)
  .delete(
    restrictTo("admin"),
    validate(getOneOrDeletePatientSchema),
    PatientController.delete,
  );
router.post(
  "/:id/scan",
  upload.single("scan"),
  resizePatientScan,
  PatientController.uploadScan,
);

export default router;
