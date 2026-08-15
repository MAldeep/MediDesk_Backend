import { model, Schema } from "mongoose";
import { IAppointment } from "../types/appointment.types.js";

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      required: [true, "Patient name is required"],
      ref: "Patient",
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Appointment must belong to a doctor"],
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Appointment must have a creator"],
    },
  },
  {
    timestamps: true,
  },
);
// appointmentSchema.pre(/^find/, function (this: any, next: () => void) {
//   this.populate({
//     path: "patient",
//     select: "name phone age gender",
//   }).populate({
//     path: "doctor",
//     select: "name email role",
//   });

//   if (next) {
//     next();
//   }
// });
// appointmentSchema.index({ doctor: 1, date: 1 }, { unique: true });
export const Appointment = model<IAppointment>(
  "Appointment",
  appointmentSchema,
);
