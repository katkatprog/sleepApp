import express from "express";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../types/decodedToken";
import prisma from "../prisma/client";
import { checkJwt } from "../middleware/checkJwt";
import { body } from "express-validator";
import { checkReq } from "../middleware/checkReq";

export const loginUserRouter = express.Router();

// トークンをもとにログインユーザーの情報取得
// トークンが無い、不正ならエラーにはせずnullを返す
loginUserRouter.get("/", async (req, res) => {
  const token: string | undefined = req.cookies.token;
  if (!token) {
    return res.status(200).json(null);
  }

  let loginUserId: number;
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "",
    ) as DecodedToken;

    loginUserId = decoded.userId;
  } catch (error) {
    return res.status(200).json(null);
  }

  const user = await prisma.user.findUnique({
    where: { id: loginUserId },
    select: { id: true, name: true, email: true, hashedPassword: false },
  });
  return res.status(200).json(user);
});

// ログインユーザー情報(name, email)の編集
// トークンが無い、不正ならエラー
// また、トークン内のユーザーIDとbodyのユーザーIDが一致しなければエラー
loginUserRouter.put(
  "/",
  body("id").notEmpty().withMessage("idが入力されていません。"),
  body("name").notEmpty().withMessage("お名前が入力されていません。"),
  body("email")
    .notEmpty()
    .withMessage("メールアドレスが入力されていません。")
    .isEmail()
    .withMessage("メールアドレスの形式が正しくありません。"),
  checkReq,
  checkJwt,
  async (req, res) => {
    // トークン内のユーザーIDとbodyのユーザーIDが一致しなければエラー
    if (res.locals.userId !== req.body.id) {
      res.status(401).send("認証情報が正しくありません。");
    }

    // ユーザー情報を更新し、結果を返却する
    try {
      const result = await prisma.user.update({
        select: { id: true, email: true, name: true, hashedPassword: false },
        where: { id: req.body.id as number },
        data: {
          name: req.body.name as string,
          email: req.body.email as string,
        },
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json("想定外のエラーが発生しました。");
    }
  },
);
