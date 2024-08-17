import express from "express";
import prisma from "../prisma/client";
import { param, query } from "express-validator";
import { checkReq } from "../middleware/checkReq";
import { checkJwt } from "../middleware/checkJwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
const soundsPerPage = 20;

export const soundFavoriteRouter = express.Router();

// いいねした音声一覧を取得する
soundFavoriteRouter.get(
  "/",
  query("page")
    .custom((page) => {
      // pageが存在するなら数字文字列であることが正しい
      if (page && isNaN(page)) {
        throw new Error();
      }
      return true;
    })
    .withMessage("クエリパラメータpageが数字ではありません。"),
  checkReq,
  checkJwt,
  async (req, res) => {
    // クエリパラメータpageが存在しない場合、1をセット
    const currentPage = Number(req.query.page || 1);
    if (currentPage <= 0) {
      return res.status(404).send("指定の検索ページが見つかりません。");
    }

    try {
      const result = await Promise.all([
        prisma.soundFavorite.findMany({
          where: {
            userId: res.locals.userId as number,
          },
          include: {
            SoundInfo: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: soundsPerPage,
          skip: soundsPerPage * (currentPage - 1),
        }),
        prisma.soundFavorite.count({
          where: {
            userId: res.locals.userId as number,
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

      return res.status(200).json({
        soundsList: soundsList.map((soundFav) => soundFav.SoundInfo),
        totalPages,
      });
    } catch (error) {
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);

// 音声をいいねしているか否かの状態を取得する
soundFavoriteRouter.get(
  "/:soundId",
  param("soundId").isNumeric().withMessage("音声IDの形式が正しくありません。"),
  checkReq,
  checkJwt,
  async (req, res) => {
    try {
      const result = await prisma.soundFavorite.count({
        where: {
          soundId: parseInt(req.params.soundId as string),
          userId: res.locals.userId as number,
        },
      });

      if (result === 1) {
        // いいねしている
        return res.status(200).json({ status: true });
      } else {
        // return === 0
        // いいねをしていない
        return res.status(200).json({ status: false });
      }
    } catch (error) {
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);

// 音声をいいねする/いいねを外す
soundFavoriteRouter.post(
  "/:soundId",
  param("soundId").isNumeric().withMessage("音声IDの形式が正しくありません。"),
  checkReq,
  checkJwt,
  async (req, res) => {
    // いいねの状態に関わらず、まずはいいねを付けに行く（レコードを作成しに行く）
    // ・レコード作成成功したら、いいね付け成功
    // ・重複エラーが起きた場合は、既にいいねが付いているということであるため、いいねを外す（レコードを削除する）
    try {
      // レコード作成（いいねをつける）
      await prisma.soundFavorite.create({
        data: {
          userId: res.locals.userId as number,
          soundId: parseInt(req.params.soundId as string),
        },
      });

      return res.status(200).send("OK");
    } catch (error) {
      if ((error as PrismaClientKnownRequestError).code === "P2002") {
        // 重複エラーの場合は既にレコードがある（いいねがついている）→ レコード削除（いいねを外す）
        await prisma.soundFavorite.delete({
          where: {
            userId_soundId: {
              userId: res.locals.userId as number,
              soundId: parseInt(req.params.soundId as string),
            },
          },
        });
        return res.status(200).send("OK");
      }
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);
