import "dotenv/config";
import express from "express";
import { soundInfoRouter } from "./soundInfoRouter";

const app = express();
app.use(express.json());

app.use("/sound-info", soundInfoRouter);

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server started at ${process.env.PORT} port!`);
});
