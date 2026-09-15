import { Types } from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import { AppointmentStatus, IAppointment } from "../types/appointment.types.js";
import { UserRole } from "../types/user.types.js";
import { AppError } from "../utils/appError.js";
import { CreateAppointmentInput } from "../validations/appointment.schema.js";
import { APIFeatures } from "../utils/apiFeatures.js";

export class AppointmentService {
  // get all
  static async getAll(
    userId: string,
    role: UserRole,
    queryString: Record<string, any> = {},
  ): Promise<IAppointment[]> {
    // 1. الفلترة حسب دور المستخدم
    const baseFilter: Record<string, any> = {};
    if (role === "doctor") {
      baseFilter.doctor = userId;
    }

    const mergedQuery = { ...queryString, ...baseFilter };

    // 2. حالة البحث (Search Mode): السيرش في أسماء المرضى والدكاترة والـ status
    if (queryString.search) {
      const searchTerm = queryString.search as string;
      const page = Math.max(1, parseInt(queryString.page, 10) || 1);
      const limit = Math.max(1, parseInt(queryString.limit, 10) || 10);
      const skip = (page - 1) * limit;

      // تحديد اتجاه الترتيب (Sort)
      let sortStage: Record<string, 1 | -1> = { date: -1 };
      if (queryString.sort) {
        const isDesc = (queryString.sort as string).startsWith("-");
        const field = (queryString.sort as string).replace("-", "");
        sortStage = { [field]: isDesc ? -1 : 1 };
      }

      const pipeline: any[] = [
        { $match: baseFilter },
        {
          $lookup: {
            from: "patients",
            localField: "patient",
            foreignField: "_id",
            as: "patient",
          },
        },
        { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "doctor",
            foreignField: "_id",
            as: "doctor",
          },
        },
        { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { "patient.name": { $regex: searchTerm, $options: "i" } },
              { "patient.phone": { $regex: searchTerm, $options: "i" } },
              { "doctor.name": { $regex: searchTerm, $options: "i" } },
              { status: { $regex: searchTerm, $options: "i" } },
            ],
          },
        },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
      ];

      return await Appointment.aggregate(pipeline);
    }

    // 3. الحالة العادية (بدون search): استخدام APIFeatures
    const features = new APIFeatures<IAppointment>(Appointment, mergedQuery)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const appointments = await features.query
      .populate("doctor", "name email")
      .populate("createdBy", "name email")
      .populate("patient", "name phone");

    return appointments as IAppointment[];
  }
  // create
  static async create(
    data: CreateAppointmentInput,
    userId: string,
  ): Promise<IAppointment> {
    const { doctor, date, durationMinutes = 30 } = data;

    const doctorObjectId = new Types.ObjectId(doctor);
    const newStartTime = new Date(date);
    const newEndTime = new Date(
      newStartTime.getTime() + durationMinutes * 60000,
    );

    const existingAppointment = await Appointment.findOne({
      doctor: doctorObjectId,
      status: { $ne: "cancelled" },
      date: { $lt: newEndTime },
      $expr: {
        $gt: [
          { $add: ["$date", { $multiply: ["$durationMinutes", 60000] }] },
          newStartTime,
        ],
      },
    });

    if (existingAppointment) {
      throw new AppError(
        "Doctor already has an overlapping appointment at this time",
        400,
      );
    }

    const appointment = await Appointment.create({
      ...data,
      doctor: doctorObjectId,
      durationMinutes,
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
