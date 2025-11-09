import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import nodeRoutes from "./routes/nodeRoutes";
import { errorHandler, notFound } from "./middleware/errorMiddleware";

dotenv.config();
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/nodes", nodeRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
