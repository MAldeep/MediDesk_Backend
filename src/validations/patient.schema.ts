import z from "zod";

export const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Patient's name is required"),
    phone: z
      .string()
      .regex(/^01[0125][0-9]{8}$/, "must be valid egyptian phone number"),
    address: z.string().optional(),
    age: z.number().min(1, "At least one"),
    gender: z.enum(["male", "female"]),
    history: z.string().optional(),
  }),
});

export const getOneOrDeletePatientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID"),
  }),
});

// patient.schema.ts

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID"),
  }),
  body: createPatientSchema.shape.body
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "Must provide at least one field to update",
    ),
});
