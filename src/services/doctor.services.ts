import { User } from "../models/user.models.js";
import { IUser } from "../types/user.types.js";
import { APIFeatures } from "../utils/apiFeatures.js";

export class DoctorServices {
  static async getAllDoctors(
    queryString: Record<string, any>,
  ): Promise<IUser[]> {
    const queryObj = { ...queryString, role: "doctor" };

    const features = new APIFeatures(User, queryObj)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doctors = await features.query;
    return doctors;
  }
}
