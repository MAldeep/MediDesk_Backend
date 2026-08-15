import { Response } from "express";
import { AuthenticatedRequest } from "../types/user.types.js";
import { catchAsync } from "../utils/catchAsync.js";
import { PatientService } from "../services/patient.services.js";

export class PatientController {
  // get all
  static getAll = catchAsync(
    async (_req: AuthenticatedRequest, res: Response) => {
      const patients = await PatientService.getAll();
      res.status(200).json({
        status: "success",
        result: patients.length,
        data: { patients },
      });
    },
  );
  // get one
  static getById = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const patientId = Array.isArray(id) ? id[0] : id;
      const patient = await PatientService.getById(patientId);
      res.status(200).json({
        status: "success",
        data: { patient },
      });
    },
  );
  // create
  static create = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const data = req.body;
      const newPatient = await PatientService.add(data);
      res.status(201).json({
        status: "success",
        message: "Patient Added Successfully !",
        data: { newPatient },
      });
    },
  );
  // update
  static update = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const updateData = req.body;
      const { id } = Array.isArray(req.params) ? req.params[0] : req.params;
      const patient = await PatientService.update(id, updateData);
      res.status(200).json({
        status: "success",
        message: "patient updated successfully !",
        data: { patient },
      });
    },
  );
  static delete = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = Array.isArray(req.params) ? req.params[0] : req.params;
      const deletedPatient = await PatientService.delete(id);
      res.status(200).json({
        status: "success",
        message: "patient deleted successfully !",
        data: { deletedPatient },
      });
    },
  );
}
