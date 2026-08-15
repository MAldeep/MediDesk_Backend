import { model, Schema } from "mongoose";
import { IPatient } from "../types/patient.types.js";

const patientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      match: /^01[0125][0-9]{8}$/,
    },
    address: {
      type: String,
      required: false,
    },
    age: {
      type: Number,
      required: [true, "Age is Required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female"],
    },
  },
  {
    timestamps: true,
  },
);

export const Patient = model<IPatient>("Patient", patientSchema);
