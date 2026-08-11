import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().url("MONGODB_URI must be a valid connection string"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("Invalid environment variables");
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;
