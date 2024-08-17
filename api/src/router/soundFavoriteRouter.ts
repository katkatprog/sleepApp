import express from "express";
import prisma from "../prisma/client";
import { body } from "express-validator";
import { checkReq } from "../middleware/checkReq";
import { checkJwt } from "../middleware/checkJwt";

export const soundFavoriteRouter = express.Router();

// 音声をいいねする/いいねを外す
soundFavoriteRouter.post(
  "/",
  body("soundId")
    .notEmpty()
    .withMessage("音声IDが入力されていません。")
    .isNumeric()
    .withMessage("音声IDの形式が正しくありません。"),
  checkReq,
  checkJwt,
  async (req, res) => {
    try {
      const result = await prisma.soundFavorite.findUnique({
        where: {
          userId_soundId: {
            userId: res.locals.userId as number,
            soundId: req.body.soundId as number,
          },
        },
      });

      if (result) {
        // レコードがある（いいねがついている）→ レコード削除（いいねを外す）
        await prisma.soundFavorite.delete({
          where: {
            userId_soundId: {
              userId: res.locals.userId as number,
              soundId: req.body.soundId as number,
            },
          },
        });
      } else {
        // レコードが無い（いいねがついてない）→ レコード作成（いいねをつける）
        await prisma.soundFavorite.create({
          data: {
            userId: res.locals.userId as number,
            soundId: req.body.soundId as number,
          },
        });
      }

      return res.status(200).send("OK");
    } catch (error) {
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);
