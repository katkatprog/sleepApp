import "dotenv/config";
import express from "express";
import { soundInfoRouter } from "./soundInfoRouter";

const app = express();
app.use(express.json());

app.use("/sound-info", soundInfoRouter);

app.listen(8080, () => {
  console.log(`API Server started...`);
});
