import "dotenv/config";
import express from "express";
import { soundInfoRouter } from "./soundInfoRouter";

const app = express();
app.use(express.json());

app.use("/sound-info", soundInfoRouter);
app.get("/api/health", async (req, res)=>{
  return res.json({
    status: "OK",
    message: "自動デプロイの成功を確認"
  })
})

app.listen(8080, () => {
  console.log(`API Server started...`);
});
