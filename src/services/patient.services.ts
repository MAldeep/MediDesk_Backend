import { Patient } from "../models/patient.model.js";
import { IPatient, IScan } from "../types/patient.types.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import { AppError } from "../utils/appError.js";
import { CloudinaryService } from "./cloudinary.service.js";
interface AddPatientInput {
  name: string;
  phone: string;
  address: string;
  age: number;
  gender: "male" | "female";
  history?: string;
}
export type UpdatePatientInput = Partial<AddPatientInput>;
export class PatientService {
  // get all
  static async getAll(queryString: Record<string, any>): Promise<IPatient[]> {
    const features = new APIFeatures(Patient, queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const patients = await features.query;
    return patients;
  }
  // get one
  static async getById(patientId: string): Promise<IPatient> {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new AppError("Patient Not Found", 404);
    }
    return patient;
  }
  // add one
  static async add(data: AddPatientInput): Promise<IPatient> {
    const newPatient = await Patient.create(data);
    return newPatient;
  }
  // update one
  static async update(id: string, data: UpdatePatientInput): Promise<IPatient> {
    const updatedPatient = await Patient.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedPatient) {
      throw new AppError("Patient Not Found", 404);
    }

    return updatedPatient;
  }
  // delete one
  static async delete(id: string): Promise<IPatient> {
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      throw new AppError("Patient Not Found", 404);
    }
    return patient;
  }
  // add scan (with cloud)
  static async addScan(patientId: string, scanData: IScan): Promise<IPatient> {
    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { $push: { scan: scanData } },
      { new: true, runValidators: true },
    );
    if (!patient) {
      throw new AppError("Patient Not found", 404);
    }
    return patient;
  }
  // delete scan
  static async deleteScan(
    patientId: string,
    publicId: string,
  ): Promise<IPatient> {
    await CloudinaryService.deleteImage(publicId);

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { $pull: { scan: { publicId: publicId } } },
      { new: true },
    );

    if (!patient) {
      throw new AppError("Patient Not found", 404);
    }

    return patient;
  }
}
