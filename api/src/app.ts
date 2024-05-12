import "dotenv/config";
import express from "express";
import { soundInfoRouter } from "./soundInfoRouter";

export const app = express();
app.use(express.json());

app.use("/sound-info", soundInfoRouter);
app.get("/health", async (req, res)=>{
  return res.json({
    status: "OK",
    message: "update at 20240331"
  })
})
