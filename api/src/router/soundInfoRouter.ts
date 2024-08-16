import express from "express";
import prisma from "../prisma/client";
import { param, query } from "express-validator";
import { checkReq } from "../middleware/checkReq";
export const soundInfoRouter = express.Router();
const soundsPerPage = 20;

// 音声情報取得(個別)
soundInfoRouter.get(
  "/single/:id",
  param("id").isNumeric().withMessage("音声のIDが数字ではありません。"), // リクエストのバリデーション準備
  checkReq, // リクエストのバリデーションチェック
  async (req, res) => {
    const soundId = Number(req.params.id);
    try {
      // 音声情報取得
      const soundInfo = await prisma.soundInfo.findUnique({
        where: { id: soundId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      if (!soundInfo) {
        return res.status(404).send("音声情報が見つかりません。");
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
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);

// 音声情報取得(一覧)
soundInfoRouter.get(
  "/search",
  // リクエストのバリデーション準備
  query("page")
    .custom((page) => {
      // pageが存在するなら数字文字列であることが正しい
      if (page && isNaN(page)) {
        throw new Error();
      }
      return true;
    })
    .withMessage("クエリパラメータpageが数字ではありません。"),
  query("sort")
    .custom((sort) => {
      // sortが存在するなら"created"もしくは"count"であることが正しい
      if (sort && !["created", "count"].includes(sort)) {
        throw new Error();
      }
      return true;
    })
    .withMessage("クエリパラメータsortの指定が正しくありません。"),
  checkReq, // リクエストのバリデーションチェック
  async (req, res) => {
    // クエリパラメータpageが存在しない場合、1をセット
    const currentPage = Number(req.query.page || 1);
    if (currentPage <= 0) {
      return res.status(404).send("指定の検索ページが見つかりません。");
    }

    // クエリパラメータsortの整理
    const sortBy = String(req.query.sort || "created");
    let sortCondition: { createdAt: "desc" } | { playCount: "desc" };
    if (sortBy === "created") {
      sortCondition = { createdAt: "desc" };
    } else {
      // } else if (sortBy === "count") {
      sortCondition = { playCount: "desc" };
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
      const totalPages =
        soundsList.length === 0 ? 1 : Math.ceil(totalSounds / soundsPerPage);

      // 検索結果に対して範囲を超えたページ番号が指定された場合、404エラーを出す
      if (soundsList.length === 0 && currentPage >= 2) {
        return res.status(404).send("指定の検索ページが見つかりません。");
      }

      return res.send({ soundsList, totalPages });
    } catch (error) {
      console.log("エラー発生");
      console.log(error);
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);
