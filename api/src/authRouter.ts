import express from "express";
import prisma from "./prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { body, validationResult } from "express-validator";
export const authRouter = express.Router();

// サインアップ
authRouter.post(
  "/signup",
  body("name").not().isEmpty(),
  body("email").not().isEmpty().isEmail(),
  body("password")
    .not()
    .isEmpty()
    .isLength({ min: 8 })
    .matches(
      // eslint-disable-next-line no-useless-escape
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).+$/,
    ),
  async (req, res) => {
    // バリデーションチェック
    const valiResult = validationResult(req);
    if (!valiResult.isEmpty()) {
      return res.status(400).send("Validation error...");
    }

    // 入力値代入
    const name: string = req.body.name;
    const email: string = req.body.email;
    const password: string = req.body.password;

    // ユーザー登録
    try {
      // パスワードのハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);

      // DBへの保存
      const user = await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
      });

      // DB保存後、jwt発行
      const token = jwt.sign(
        {
          // ペイロードにはユーザーIDを含める
          userId: user.id,
        },
        process.env.JWT_SECRET || "",
        { expiresIn: process.env.JWT_EXPIRE || "24h" },
      );

      res.cookie("token", token);

      return res.send("OK");
    } catch (error) {
      console.log("エラー発生");
      console.log(error);
      // email重複エラー
      if ((error as PrismaClientKnownRequestError).code === "P2002") {
        return res.status(400).send("This email already exists...");
      }

      return res.status(500).send("Something went wrong in signup...");
    }
  },
);

// サインイン
authRouter.post("/signin", async (req, res) => {
  // 入力値代入、および存在チェック
  const email: string = req.body.email || "";
  const password: string = req.body.password || "";
  if (!email || !password) {
    return res.status(400).send("email or password is empty...");
  }

  try {
    // emailをキーにデータ取得
    const user = await prisma.user.findUnique({ where: { email } });

    // リクエストのemailで登録されたユーザーが存在しない場合
    if (!user) {
      return res.status(400).send("email or password is incorrect...");
    }

    // パスワード照合
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (isMatch) {
      // パスワードが正しいならば、jwt発行
      const token = jwt.sign(
        {
          // ペイロードにはユーザーIDを含める
          userId: user.id,
        },
        process.env.JWT_SECRET || "",
        { expiresIn: process.env.JWT_EXPIRE || "24h" },
      );

      res.cookie("token", token);

      return res.status(200).send("OK");
    } else {
      return res.status(400).send("email or password is incorrect...");
    }
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(500).send("Something went wrong in signin...");
  }
});
