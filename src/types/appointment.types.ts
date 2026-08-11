import { Document, Types } from "mongoose";
import { IUser } from "./user.types.js";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface IAppointment extends Document {
  patientName: string;
  doctor: Types.ObjectId | IUser;
  date: Date;
  status: AppointmentStatus;
  createdBy: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}
