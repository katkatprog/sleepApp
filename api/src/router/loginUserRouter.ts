import express from "express";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../types/decodedToken";
import prisma from "../prisma/client";
import { checkJwt } from "../middleware/checkJwt";
import { body } from "express-validator";
import { checkReq } from "../middleware/checkReq";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import path from "path";

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

    // 復号結果にuserIdが存在しない、数値型ではないなら不正なトークンのため、nullを返す
    if (!decoded.userId || typeof decoded.userId !== "number") {
      return res.status(200).json(null);
    }

    loginUserId = decoded.userId;
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(200).json(null);
  }

  const user = await prisma.user.findUnique({
    where: { id: loginUserId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      hashedPassword: false,
    },
  });
  return res.status(200).json(user);
});

// ログインユーザー情報(name, email)の編集
// トークンが無い、不正ならエラー
loginUserRouter.put(
  "/",
  body("name").notEmpty().withMessage("お名前が入力されていません。"),
  body("email")
    .notEmpty()
    .withMessage("メールアドレスが入力されていません。")
    .isEmail()
    .withMessage("メールアドレスの形式が正しくありません。")
    .custom((email) => {
      // emailは環境変数GUEST_EMAILのアドレスではないことが正しい
      if (email === (process.env.GUEST_EMAIL || "guest@example.com")) {
        throw new Error();
      }
      return true;
    })
    .withMessage("そのメールアドレスに変更することはできません。"),
  checkReq,
  checkJwt,
  async (req, res) => {
    // ユーザー情報を更新し、結果を返却する
    try {
      // 編集前のメールアドレスがゲストユーザーのものならエラー
      const current = await prisma.user.findUnique({
        where: { id: res.locals.userId as number },
        select: { email: true },
      });
      if (
        current &&
        current.email === (process.env.GUEST_EMAIL || "guest@example.com")
      ) {
        return res
          .status(400)
          .send("そのユーザー情報を変更することはできません。");
      }

      // ユーザー情報編集
      const result = await prisma.user.update({
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          hashedPassword: false,
        },
        where: { id: res.locals.userId as number },
        data: {
          name: req.body.name as string,
          email: req.body.email as string,
        },
      });
      return res.status(200).json(result);
    } catch (error) {
      // email重複エラー
      if ((error as PrismaClientKnownRequestError).code === "P2002") {
        return res.status(400).send("メールアドレスが登録済です。");
      }

      console.log("エラー発生");
      console.log(error);
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);

// プロフィール画像投稿
loginUserRouter.post(
  "/upload-image",
  checkJwt,
  multer().single("profile-img"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .send("リクエストに画像ファイルが添付されていません。");
      }

      if (
        !["image/png", "image/jpeg", "image/webp"].includes(req.file.mimetype)
      ) {
        return res
          .status(400)
          .send("画像ファイルはjpg, png, webpである必要があります。");
      }

      if (req.file.size > 10000000) {
        return res
          .status(400)
          .send("画像ファイルは10MG以下である必要があります。");
      }

      // 編集前のメールアドレスがゲストユーザーのものならエラー
      const targetUser = await prisma.user.findUnique({
        where: { id: res.locals.userId as number },
        select: { email: true },
      });
      if (
        targetUser &&
        targetUser.email === (process.env.GUEST_EMAIL || "guest@example.com")
      ) {
        return res
          .status(400)
          .send("そのユーザー情報を変更することはできません。");
      }

      // S3 クライアントを用意する
      const client = new S3Client({
        region: "ap-northeast-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
      });

      // S3 にアップロードする処理
      const imageFileName = `${crypto.randomUUID()}${path.extname(req.file.originalname)}`; // <シリアルナンバー>.<拡張子>
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_PROFILE || "",
        Key: imageFileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype, // これを指定しないと、ファイルURLに直接アクセスしたときにダウンロードになってしまう
      });
      await client.send(command);

      // 画像のURLをDBに書き込む処理
      const imageFileUrl = `${process.env.CLOUD_FRONT_URL_PROFILE}/${imageFileName}`;
      await prisma.user.update({
        where: { id: res.locals.userId as number },
        data: {
          image: imageFileUrl,
        },
      });

      return res.status(200).json({ image: imageFileUrl });
    } catch (error) {
      // S3 アップロードに失敗した時の処理
      console.log("エラー発生");
      console.log(error);
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);

// 退会（ログインユーザー情報の削除）
// トークンが無い、不正ならエラー
// また、bodyのパスワードがDBのものと不一致ならエラー
loginUserRouter.delete(
  "/",
  body("password").notEmpty().withMessage("パスワードが入力されていません。"),
  checkReq,
  checkJwt,
  async (req, res) => {
    // ユーザー情報を更新し、結果を返却する
    try {
      const user = await prisma.user.findUnique({
        where: { id: res.locals.userId as number },
      });
      if (!user) {
        return res.status(404).send("指定のユーザーが存在しません。");
      }

      if (user.email === (process.env.GUEST_EMAIL || "guest@example.com")) {
        return res.status(400).send("そのユーザーを削除することはできません。");
      }

      // パスワード照合
      const isMatch = await bcrypt.compare(
        req.body.password as string,
        user.hashedPassword,
      );
      if (isMatch) {
        // パスワードが正しいならば、退会続行
        // ユーザー情報削除
        await prisma.user.delete({
          where: { id: res.locals.userId as number },
        });

        // DBのrelationの設定により、Userの削除に併せてSoundReqQueueの情報も削除される
        // ※Queue情報削除を行う理由：https://github.com/katkatprog/sleepApp/issues/79

        // cookie削除
        res.clearCookie("token", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          path: "/",
        });
        return res.status(200).send("OK");
      } else {
        return res.status(400).send("パスワードが正しくありません。");
      }
    } catch (error) {
      console.log("エラー発生");
      console.log(error);
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);
