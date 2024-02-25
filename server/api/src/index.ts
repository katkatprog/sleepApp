import "dotenv/config";
import express from "express";

const app = express();
app.listen(process.env.PORT || 3001, () => {
  console.log(`Server started at ${process.env.PORT} port!`);
});
