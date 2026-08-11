import mongoose from "mongoose";
import { Server } from "http";
import app from "./app.js";
import { env } from "./config/env.js";

process.on("uncaughtException", (err: Error) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT = env.PORT || 5000;
const DB_URI = env.MONGODB_URI;

let server: Server;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Database Connected Successfully!");
    server = app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  });

// 3. Unhandled Rejections (للتعامل مع الـ Promises المرفوضة خارج الـ Handlers)
process.on("unhandledRejection", (err: any) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err?.name, err?.message);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
