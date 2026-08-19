import { Response } from "express";
import { AuthenticatedRequest } from "../types/user.types.js";
import { catchAsync } from "../utils/catchAsync.js";
import { PatientService } from "../services/patient.services.js";
import { AppError } from "../utils/appError.js";

export class PatientController {
  // get all
  static getAll = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const patients = await PatientService.getAll(req.query);
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
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const patient = await PatientService.getById(id);
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
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
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
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const deletedPatient = await PatientService.delete(id);
      res.status(200).json({
        status: "success",
        message: "patient deleted successfully !",
        data: { deletedPatient },
      });
    },
  );
  static uploadScan = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.body.scan) {
        throw new AppError("choose an image to add", 400);
      }
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const patient = await PatientService.addScan(id, req.body.scan);
      res.status(200).json({
        status: "success",
        message: "Image added successfully !",
        data: { patient },
      });
    },
  );
  static deleteScan = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const { publicId } = req.body;
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      if (!publicId) {
        throw new AppError("Provide public_id", 400);
      }
      const updatedPatient = await PatientService.deleteScan(id, publicId);
      res.status(200).json({
        status: "success",
        message: "Image Deleted Successfully !",
        data: { updatedPatient },
      });
    },
  );
}
