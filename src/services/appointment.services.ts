import { Appointment } from "../models/appointment.model.js";
import { AppointmentStatus, IAppointment } from "../types/appointment.types.js";
import { UserRole } from "../types/user.types.js";
import { AppError } from "../utils/appError.js";
import { CreateAppointmentInput } from "../validations/appointment.schema.js";

export class AppointmentService {
  // get all
  static async getAll(userId: string, role: UserRole): Promise<IAppointment[]> {
    const filter: Record<string, any> = {};
    if (role === "doctor") {
      filter.doctor = userId;
    }
    const appointments = await Appointment.find(filter)
      .populate("doctor", "name email")
      .populate("createdBy", "name email")
      .sort({ date: 1 });
    return appointments;
  }
  // create
  static async create(
    data: CreateAppointmentInput,
    userId: string,
  ): Promise<IAppointment> {
    const appointment = await Appointment.create({
      ...data,
      createdBy: userId,
    });
    return appointment;
  }
  // get one
  static async getById(
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<IAppointment> {
    const appointment = await Appointment.findById(id)
      .populate("doctor", "name email")
      .populate("createdBy", "name email");
    if (!appointment) {
      throw new AppError("Not found appointment", 404);
    }
    const doctorId =
      typeof appointment.doctor === "object" &&
      appointment.doctor &&
      "_id" in appointment.doctor
        ? appointment.doctor._id.toString()
        : String(appointment.doctor);
    if (role === "doctor" && doctorId !== userId) {
      throw new AppError(
        "You do not have permission to view this appointment",
        403,
      );
    }
    return appointment;
  }
  // update
  static async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<IAppointment> {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    return appointment;
  }
  // delete
  static async delete(id: string): Promise<IAppointment> {
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }
    return appointment;
  }
}
