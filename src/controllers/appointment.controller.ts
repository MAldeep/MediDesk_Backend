import { AppointmentService } from "../services/appointment.services.js";
import { AuthenticatedRequest } from "../types/user.types.js";
import { catchAsync } from "../utils/catchAsync.js";
import { Response } from "express";
export class AppointmentController {
  // get all
  static getAll = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const appointments = await AppointmentService.getAll(
        req.user._id.toString(),
        req.user.role,
      );
      res.status(200).json({
        status: "success",
        results: appointments.length,
        data: { appointments },
      });
    },
  );
  // create
  static create = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const appointment = await AppointmentService.create(
        req.body,
        req.user._id.toString(),
      );
      res.status(201).json({
        status: "success",
        data: { appointment },
      });
    },
  );
  // get by id
  static getById = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const appointment = await AppointmentService.getById(
        id,
        req.user._id.toString(),
        req.user.role,
      );
      res.status(200).json({
        status: "success",
        data: { appointment },
      });
    },
  );
  // update status
  static update = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const appointment = await AppointmentService.updateStatus(
        id,
        req.body.status,
      );
      res.status(200).json({
        status: "success",
        data: { appointment },
      });
    },
  );
  // delete
  static delete = catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const appointment = await AppointmentService.delete(id);
      res.status(204).json({
        status: "success",
        data: appointment,
      });
    },
  );
}
