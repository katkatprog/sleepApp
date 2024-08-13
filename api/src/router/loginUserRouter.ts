import express from "express";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../types/decodedToken";
import prisma from "../prisma/client";

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
