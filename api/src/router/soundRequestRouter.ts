import express from "express";
import prisma from "../prisma/client";
import { checkJwt } from "../middleware/checkJwt";
import { body } from "express-validator";
import { checkReq } from "../middleware/checkReq";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getBatchDate } from "../utils/getBatchDate";

export const soundRequestRouter = express.Router();

// トークンをもとに音声リクエストの状況を取得する
soundRequestRouter.get("/", checkJwt, async (req, res) => {
  try {
    const [queueInfo, queueUserIdList] = await Promise.all([
      // req内のユーザーIDのレコード情報を取得
      prisma.soundReqQueue.findUnique({
        where: {
          userId: res.locals.userId as number,
        },
      }),
      // SoundQueueテーブルのレコードを作成日時でソートした一覧を取得（ユーザーIDのみ）
      // req内のユーザーIDのレコードが何番目かを求めるのに使用
      prisma.soundReqQueue.findMany({
        orderBy: { requestedAt: "asc" },
        select: { userId: true },
      }),
    ]);

    if (queueInfo) {
      // 音声リクエスト不可能

      // req内のユーザーIDがテーブルレコード内だと何番目かを求める
      const queueIndex = queueUserIdList.findIndex(
        (queue) => queue.userId === (res.locals.userId as number),
      );
      const batchCycle = Math.floor(
        queueIndex / Number(process.env.RECORDS_PER_BATCH || 70),
      );

      return res.status(200).json({
        queueInfo,
        batchDate: getBatchDate(
          Number(process.env.BATCH_EXEC_HOUR_GMT || 12),
          batchCycle,
        ),
      });
    } else {
      // 音声リクエスト可能
      const batchCycle = Math.floor(
        queueUserIdList.length / Number(process.env.RECORDS_PER_BATCH || 70),
      );

      return res.status(200).json({
        queueInfo: null,
        batchDate: getBatchDate(
          Number(process.env.BATCH_EXEC_HOUR_GMT || 12),
          batchCycle,
        ),
      });
    }
  } catch (error) {
    return res.status(500).send("想定外のエラーが発生しました。");
  }
});

// 音声リクエストデータを作成する
soundRequestRouter.post(
  "/",
  body("theme").notEmpty().withMessage("テーマが入力されていません。"),
  body("isMaleVoice")
    .isBoolean()
    .withMessage("女性ボイス/男性ボイスの形式が正しくありません。"),
  checkReq,
  checkJwt,
  async (req, res) => {
    try {
      const queueInfo = await prisma.soundReqQueue.create({
        data: {
          userId: res.locals.userId,
          theme: req.body.theme,
          isMaleVoice: req.body.isMaleVoice,
        },
      });

      return res.status(200).json(queueInfo);
    } catch (error) {
      if ((error as PrismaClientKnownRequestError).code === "P2002") {
        return res
          .status(400)
          .send("すでにリクエスト済みのため、新たなリクエストはできません。");
      }

      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);
