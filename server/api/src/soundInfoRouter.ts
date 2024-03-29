import { PrismaClient } from "@prisma/client";
import express from "express";
const prisma = new PrismaClient();
export const soundInfoRouter = express.Router();

// 音声情報取得(個別)
soundInfoRouter.get("/:id", async (req, res) => {
  const numParam = Number(req.params.id);
  if (isNaN(numParam)) {
    return res.status(400).send("Request Param is not valid...");
  }
  try {
    const result = await prisma.soundInfo.findUnique({
      where: { id: numParam },
    });
    if (!result) {
      return res.status(404).send("Sound info was not found...");
    }
    return res.send(result);
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(500).send("Something went wrong...");
  }
});

// 音声情報取得(一覧)
soundInfoRouter.get("/list/:page", async (req, res) => {
  const numSoundsPerPage = 20;
  const numPage = Number(req.params.page);
  if (isNaN(numPage)) {
    return res.status(400).send("Request Param is not valid...");
  }

  try {
    // 音声情報リストを取得
    const result = await prisma.soundInfo.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: numSoundsPerPage,
      skip: numSoundsPerPage * (numPage - 1),
    });
    return res.send(result);
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(500).send("Something went wrong...");
  }
});
