import { PrismaClient } from "@prisma/client";
import express from "express";
const prisma = new PrismaClient();
export const soundInfoRouter = express.Router();
const soundsPerPage = 20;

// 音声情報取得(個別)
soundInfoRouter.get("/single/:id", async (req, res) => {
  const soundId = Number(req.params.id);
  if (isNaN(soundId)) {
    return res.status(400).send("Request Param is not valid...");
  }
  try {
    const result = await prisma.soundInfo.findUnique({
      where: { id: soundId },
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
soundInfoRouter.get("/search", async (req, res) => {
  const currentPage = Number(req.query.page);
  if (isNaN(currentPage)) {
    return res.status(400).send("Request Param is not valid...");
  }

  if (currentPage <= 0) {
    return res.status(404).send("Page is not found...");
  }

  try {
    // 音声情報リストを取得
    const result = await prisma.soundInfo.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: soundsPerPage,
      skip: soundsPerPage * (currentPage - 1),
    });

    if (result.length === 0) {
      return res.status(404).send("Page is not found...");
    }

    return res.send(result);
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(500).send("Something went wrong...");
  }
});

// 音声検索結果の総ページ数を計算
soundInfoRouter.get("/total-search-result-pages", async (req, res) => {
  try {
    const totalSounds = await prisma.soundInfo.count();
    const totalPages = Math.ceil(totalSounds / soundsPerPage);
    return res.json(totalPages);
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(500).send("Something went wrong...");
  }
});
