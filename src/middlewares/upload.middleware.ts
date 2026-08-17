import multer from "multer";
import { AppError } from "../utils/appError.js";

const storage = multer.memoryStorage();

const multerFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("file must be an image", 400));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 mg
  },
});
