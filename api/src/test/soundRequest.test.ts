import request from "supertest";
import { app } from "../app";

describe("Integration test (sound-request)", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

  test("[異常系]音声リクエスト情報取得(tokenが不正)", async () => {
    // 処理実行
    const res = await request(app).get("/sound-request").set("Cookie", "dummy");

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });

  test("[異常系]音声リクエスト(テーマが空)", async () => {
    // 処理実行
    const res = await request(app).post("/sound-request").send({
      isMaleVoice: false,
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("テーマが入力されていません。");
  });

  test("[異常系]音声リクエスト(女性ボイス/男性ボイスが数字以外)", async () => {
    // 処理実行
    const res = await request(app).post("/sound-request").send({
      theme: "テスト",
      isMaleVoice: "dummy",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("女性ボイス/男性ボイスの形式が正しくありません。");
  });

  test("[異常系]音声リクエスト(tokenが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .post("/sound-request")
      .set("Cookie", "dummy")
      .send({
        theme: "テスト",
        isMaleVoice: false,
      });

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });
});
