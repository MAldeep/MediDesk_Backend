import { Document } from "mongoose";

export interface IPatient extends Document {
  name: string;
  phone: string;
  address: string;
}
