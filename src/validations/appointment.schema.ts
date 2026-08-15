import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    patient: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format"),
    doctor: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format"),
    date: z
      .string()
      .datetime()
      .refine(
        (val) => {
          const inputDate = new Date(val);
          const now = new Date();

          now.setHours(0, 0, 0, 0);

          return inputDate >= now;
        },
        {
          message: "Date can't be in the past",
        },
      ),
    status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Appointment ID format"),
  }),
  body: z.object({
    status: z.enum(["scheduled", "completed", "cancelled"]),
  }),
});
export const getOrDeleteAppointmentParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID"),
  }),
});
export type CreateAppointmentInput = z.infer<
  typeof createAppointmentSchema
>["body"];
