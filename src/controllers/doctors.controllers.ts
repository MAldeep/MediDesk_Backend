import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { DoctorServices } from "../services/doctor.services.js";

export class DoctorControllers {
  // get all
  static getAllDoctors = catchAsync(async (req: Request, res: Response) => {
    const doctors = await DoctorServices.getAllDoctors(req.query);

    res.status(200).json({
      status: "success",
      results: doctors.length,
      data: {
        doctors,
      },
    });
  });
}
