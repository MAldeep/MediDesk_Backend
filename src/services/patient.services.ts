import { Patient } from "../models/patient.model.js";
import { IPatient } from "../types/patient.types.js";
import { AppError } from "../utils/appError.js";
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
  static async getAll(): Promise<IPatient[]> {
    const patients = await Patient.find();
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
}
