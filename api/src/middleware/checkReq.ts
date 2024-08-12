import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const checkReq = (req: Request, res: Response, next: NextFunction) => {
  // バリデーションチェック
  const valiResult = validationResult(req);
  if (!valiResult.isEmpty()) {
    const valiMsgArray = valiResult.array().map((vali) => vali.msg);
    return res.status(400).send(valiMsgArray.join(""));
  } else {
    next();
  }
};
