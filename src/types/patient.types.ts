import { Document, Types } from "mongoose";
import { IAppointment } from "./appointment.types.js";
export interface IScan {
  url: string;
  publicId: string;
}
export interface IPatient extends Document {
  name: string;
  phone: string;
  address: string;
  age: number;
  gender: "male" | "female";
  history?: string;
  appointments: Types.ObjectId[] | IAppointment[];
  scan?: IScan[];
}
