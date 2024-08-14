import "dotenv/config";
import express from "express";
import { soundInfoRouter } from "./router/soundInfoRouter";
import { authRouter } from "./router/authRouter";
import { loginUserRouter } from "./router/loginUserRouter";
import cors from "cors";
import cookieParser from "cookie-parser";
import { soundRequestRouter } from "./router/soundRequestRouter";

export const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
  }),
);

app.use("/sound-info", soundInfoRouter);
app.use("/sound-request", soundRequestRouter);
app.use("/auth", authRouter);
app.use("/login-user", loginUserRouter);
app.get("/health", async (req, res) => {
  return res.json({
    status: "OK",
    message: "update at 20240331",
  });
});
