import express from "express";
import prisma from "../prisma/client";
import { checkJwt } from "../middleware/checkJwt";
import { body } from "express-validator";
import { checkReq } from "../middleware/checkReq";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const soundRequestRouter = express.Router();

// トークンをもとに音声リクエストの状況を取得する
soundRequestRouter.get("/", checkJwt, async (req, res) => {
  if (!res.locals.userId) {
    return res.status(401).send("認証情報が正しくありません。");
  }

  try {
    const queueInfo = await prisma.soundReqQueue.findUnique({
      where: { userId: res.locals.userId as number },
    });
    if (!queueInfo) {
      // 音声リクエスト可能
      return res.status(200).json(null);
    } else {
      // 音声リクエスト不可能

      // 返す情報
      // ・queueInfoの情報一通り
      // ・音声作成予定日時（GMT） ←一旦保留

      return res.status(200).json({
        ...queueInfo,
        // soundWillBeCreatedAt:
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
    if (!res.locals.userId) {
      return res.status(401).send("認証情報が正しくありません。");
    }

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
