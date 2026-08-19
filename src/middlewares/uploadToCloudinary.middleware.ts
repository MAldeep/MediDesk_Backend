import { Response, NextFunction } from "express";
import sharp from "sharp";
import { catchAsync } from "../utils/catchAsync.js";
import { CloudinaryService } from "../services/cloudinary.service.js";

export const uploadPatientScanToCloudinary = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const processedBuffer = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: "inside" })
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toBuffer();

    const result = await CloudinaryService.uploadStream(
      processedBuffer,
      "medidesk/patient-scans",
    );
    req.body.scan = {
      url: result.url,
      publicId: result.publicId,
    };
    next();
  },
);
