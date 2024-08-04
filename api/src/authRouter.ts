import express from "express";
import prisma from "./prisma/client";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
export const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  // 入力値代入、および存在チェック
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  if (!name || !email || !password) {
    return res.status(400).send("name, email or password is undefined...");
  }

  // ユーザー登録
  try {
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // DBへの保存
    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

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
});
