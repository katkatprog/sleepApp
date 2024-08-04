import "dotenv/config";
import express from "express";
import { soundInfoRouter } from "./soundInfoRouter";
import { authRouter } from "./authRouter";

export const app = express();
app.use(express.json());

app.use("/sound-info", soundInfoRouter);
app.use("/auth", authRouter);
app.get("/health", async (req, res)=>{
  return res.json({
    status: "OK",
    message: "update at 20240331"
  })
})
