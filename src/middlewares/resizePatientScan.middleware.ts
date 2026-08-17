import { Response, NextFunction } from "express";
import sharp from "sharp";
import { catchAsync } from "../utils/catchAsync.js";

export const resizePatientScan = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const filename = `patient-${req.params.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(1000, 1000, { fit: "inside" })
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(`uploads/patients/${filename}`);

    req.body.scan = filename;

    next();
  },
);
