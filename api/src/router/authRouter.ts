import express from "express";
import prisma from "../prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { body } from "express-validator";
import { checkReq } from "../middleware/checkReq";
export const authRouter = express.Router();

// サインアップ
authRouter.post(
  "/signup",
  // リクエストバリデーション準備
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
    .withMessage("そのメールアドレスを登録することはできません。"),
  body("password")
    .notEmpty()
    .withMessage("パスワードが入力されていません。")
    .isLength({ min: 8 })
    .withMessage("パスワードの桁数が足りません。")
    .matches(
      // eslint-disable-next-line no-useless-escape
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+$/,
    )
    .withMessage("パスワードの形式が正しくありません。"),
  checkReq, // リクエストのバリデーションチェック
  async (req, res) => {
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

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
      });

      return res.send("OK");
    } catch (error) {
      console.log("エラー発生");
      console.log(error);
      // email重複エラー
      if ((error as PrismaClientKnownRequestError).code === "P2002") {
        return res.status(400).send("メールアドレスが登録済です。");
      }

      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);

// ログイン
authRouter.post(
  "/login",
  // リクエストバリデーション準備
  body("email").notEmpty().withMessage("メールアドレスが入力されていません。"),
  body("password").notEmpty().withMessage("パスワードが入力されていません。"),
  checkReq, // リクエストのバリデーションチェック
  async (req, res) => {
    // 入力値代入
    const email: string = req.body.email;
    const password: string = req.body.password;

    try {
      // emailをキーにデータ取得
      const user = await prisma.user.findUnique({ where: { email } });

      // リクエストのemailで登録されたユーザーが存在しない場合
      if (!user) {
        return res
          .status(400)
          .send("メールアドレスもしくはパスワードが正しくありません。");
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

        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          path: "/",
        });

        return res.status(200).send("OK");
      } else {
        return res
          .status(400)
          .send("メールアドレスもしくはパスワードが正しくありません。");
      }
    } catch (error) {
      console.log("エラー発生");
      console.log(error);
      return res.status(500).send("想定外のエラーが発生しました。");
    }
  },
);

// サインアウト
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });
  return res.status(200).send("OK");
});

// ゲストログイン
authRouter.post("/guest-login", async (req, res) => {
  try {
    // ゲスト用emailをキーにデータ取得
    let user = await prisma.user.findUnique({
      where: { email: process.env.GUEST_EMAIL || "guest@example.com" },
    });

    // ゲストユーザーが存在しない場合、作成する
    if (!user) {
      const hashedPassword = await bcrypt.hash(
        process.env.GUEST_PASSWORD || "P@ssw0rd",
        10,
      );

      user = await prisma.user.create({
        data: {
          email: process.env.GUEST_EMAIL || "guest@example.com",
          name: "ゲストユーザー",
          hashedPassword,
        },
      });
    }

    // jwt発行
    const token = jwt.sign(
      {
        // ペイロードにはユーザーIDを含める
        userId: user.id,
      },
      process.env.JWT_SECRET || "",
      { expiresIn: process.env.JWT_EXPIRE || "24h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    });

    return res.status(200).send("OK");
  } catch (error) {
    console.log("エラー発生");
    console.log(error);
    return res.status(500).send("想定外のエラーが発生しました。");
  }
});
