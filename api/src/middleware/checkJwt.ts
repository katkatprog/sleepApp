import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../types/decodedToken";

// JWTトークンチェック、および復号したトークンから取り出したuserIdを後続で使えるようにするミドルウェア
export const checkJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token: string | undefined = req.cookies.token;
  if (!token) {
    return res.status(401).send("認証情報が正しくありません。");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "",
    ) as DecodedToken;

    // 復号したトークンから取り出したuserIdを、後続の関数で使えるようにする
    res.locals.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).send("認証情報が正しくありません。");
  }
};
