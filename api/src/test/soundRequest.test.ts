import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";
import { prismaMock } from "../prisma/singleton";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// jwtをモック化する
jest.mock("jsonwebtoken");
const jwtMock = jest.mocked(jwt);

describe("Integration test (sound-request)", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

  beforeAll(() => {
    // テスト用jwt設定
    jwtMock.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  test("[正常系]音声リクエスト情報取得(リクエスト可)", async () => {
    // 事前準備
    prismaMock.soundReqQueue.findUnique.mockResolvedValueOnce(null);
    prismaMock.soundReqQueue.findMany.mockResolvedValueOnce([
      {
        userId: 2,
        theme: "秋",
        isMaleVoice: false,
        requestedAt: new Date("1970/2/1"),
      },
    ]);

    // 処理実行
    const res = await request(app)
      .get("/sound-request")
      .set("Cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body.queueInfo).toBe(null);
  });

  test("[正常系]音声リクエスト情報取得(リクエスト不可)", async () => {
    // 事前準備
    prismaMock.soundReqQueue.findUnique.mockResolvedValueOnce({
      userId: 1,
      theme: "夏",
      isMaleVoice: false,
      requestedAt: new Date("1970/2/1"),
    });
    prismaMock.soundReqQueue.findMany.mockResolvedValueOnce([
      {
        userId: 2,
        theme: "秋",
        isMaleVoice: false,
        requestedAt: new Date("1970/2/1"),
      },
      {
        userId: 1,
        theme: "夏",
        isMaleVoice: false,
        requestedAt: new Date("1970/2/1"),
      },
    ]);

    // 処理実行
    const res = await request(app)
      .get("/sound-request")
      .set("Cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body.queueInfo).not.toBe(null);
  });

  test("[異常系]音声リクエスト情報取得(tokenが不正)", async () => {
    // tokenが不正な場合、verifyでエラーになるためモックする
    jwtMock.verify.mockImplementationOnce(() => {
      throw new Error("");
    });

    // 処理実行
    const res = await request(app)
      .get("/sound-request")
      .set("Cookie", "token=invalidtoken");

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });

  test("[正常系]音声リクエスト", async () => {
    // 事前準備
    const testQueueInfo = {
      userId: 1,
      theme: "夏",
      isMaleVoice: false,
      requestedAt: new Date("1970/2/1"),
    };
    prismaMock.soundReqQueue.create.mockResolvedValueOnce(testQueueInfo);

    // 処理実行
    const res = await request(app)
      .post("/sound-request")
      .set("Cookie", "token=dummytoken")
      .send({
        theme: "テスト",
        isMaleVoice: false,
      });

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ...testQueueInfo,
      requestedAt: "1970-02-01T00:00:00.000Z",
    });
  });

  test("[異常系]音声リクエスト(テーマが空)", async () => {
    // 処理実行
    const res = await request(app)
      .post("/sound-request")
      .set("Cookie", "token=dummytoken")
      .send({
        isMaleVoice: false,
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("テーマが入力されていません。");
  });

  test("[異常系]音声リクエスト(女性ボイス/男性ボイスが数字以外)", async () => {
    // 処理実行
    const res = await request(app)
      .post("/sound-request")
      .set("Cookie", "token=dummytoken")
      .send({
        theme: "テスト",
        isMaleVoice: "dummy",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("女性ボイス/男性ボイスの形式が正しくありません。");
  });

  test("[異常系]音声リクエスト(リクエスト済)", async () => {
    // 事前準備
    prismaMock.soundReqQueue.create.mockRejectedValueOnce(
      new PrismaClientKnownRequestError("", {
        code: "P2002",
        clientVersion: "",
      }),
    );

    // 処理実行
    const res = await request(app)
      .post("/sound-request")
      .set("Cookie", "token=dummytoken")
      .send({
        theme: "テスト",
        isMaleVoice: false,
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "すでにリクエスト済みのため、新たなリクエストはできません。",
    );
  });

  test("[異常系]音声リクエスト(tokenが不正)", async () => {
    // tokenが不正な場合、verifyでエラーになるためモックする
    jwtMock.verify.mockImplementationOnce(() => {
      throw new Error("");
    });

    // 処理実行
    const res = await request(app)
      .post("/sound-request")
      .set("Cookie", "token=invalidtoken")
      .send({
        theme: "テスト",
        isMaleVoice: false,
      });

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });
});
