import express from "express";
import prisma from "./client";
export const soundInfoRouter = express.Router();
const soundsPerPage = 20;

// 音声情報取得(個別)
soundInfoRouter.get("/single/:id", async (req, res) => {
  const soundId = Number(req.params.id);
  if (isNaN(soundId)) {
    return res.status(400).send("Request Param is not valid...");
  }
  try {
    // 音声情報取得
    const soundInfo = await prisma.soundInfo.findUnique({
      where: { id: soundId },
    });
    if (!soundInfo) {
      return res.status(404).send("Sound info was not found...");
    }
    // 再生数加算
    await prisma.soundInfo.update({
      data: {
        playCount: soundInfo.playCount + 1,
      },
      where: {
        id: soundId,
      },
    });
    return res.send({ ...soundInfo, playCount: soundInfo.playCount + 1 });
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(500).send("Something went wrong...");
  }
});

// 音声情報取得(一覧)
soundInfoRouter.get("/search", async (req, res) => {
  // クエリパラメータpageが存在しない場合、1をセット
  const currentPage = Number(req.query.page || 1);
  if (isNaN(currentPage)) {
    return res.status(400).send("Request Param is not valid...");
  }
  if (currentPage <= 0) {
    return res.status(404).send("Page is not found...");
  }

  // クエリパラメータsortの整理
  const sortBy = String(req.query.sort || "created");
  let sortCondition: { createdAt: "desc" } | { playCount: "desc" };
  if (sortBy === "created") {
    sortCondition = { createdAt: "desc" };
  } else if (sortBy === "count") {
    sortCondition = { playCount: "desc" };
  } else {
    return res.status(400).send("Request Param is not valid...");
  }

  // 検索キーワードを元に検索条件を作成
  const searchWord = String(req.query.q || "");
  let wordsConditions: { name: { contains: string } }[] = [];
  // eslint-disable-next-line no-irregular-whitespace
  const wordsArray: string[] = searchWord.split(/ |　/);
  wordsConditions = wordsArray.map((word) => ({
    name: {
      contains: word,
    },
  }));

  try {
    // 下記を同時に行う
    // ・音声情報リストを取得
    // ・音声情報検索結果 総ページ数
    const result = await Promise.all([
      prisma.soundInfo.findMany({
        where: {
          AND: [...wordsConditions],
        },
        orderBy: sortCondition,
        take: soundsPerPage,
        skip: soundsPerPage * (currentPage - 1),
      }),
      prisma.soundInfo.count({
        where: {
          AND: [...wordsConditions],
        },
      }),
    ]);

    const soundsList = result[0];
    const totalSounds = result[1];
    const totalPages = Math.ceil(totalSounds / soundsPerPage);

    return res.send({ soundsList, totalPages });
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(500).send("Something went wrong...");
  }
});
