import { Document, Types } from "mongoose";
import { IUser } from "./user.types.js";
import { IPatient } from "./patient.types.js";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface IAppointment extends Document {
  patient: Types.ObjectId | IPatient;
  doctor: Types.ObjectId | IUser;
  date: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  procedure: string;
  notes?: string;
  createdBy: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}
