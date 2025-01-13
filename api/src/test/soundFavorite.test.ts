import request from "supertest";
import { app } from "../app";

describe("Integration test (sound-favorite)", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

  test("[異常系]音声いいね状態取得(音声IDが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .get("/sound-favorite/dummy")
      .set("Cookie", "dummy");

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("音声IDの形式が正しくありません。");
  });

  test("[異常系]音声いいね状態取得(tokenが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .get("/sound-favorite/1")
      .set("Cookie", "dummy");

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });

  test("[異常系]音声いいね(音声IDが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .post("/sound-favorite/dummy")
      .set("Cookie", "dummy");

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("音声IDの形式が正しくありません。");
  });

  test("[異常系]音声いいね(tokenが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .post("/sound-favorite/1")
      .set("Cookie", "dummy");

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });

  test("[異常系]いいねした音声一覧を取得(tokenが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .get("/sound-favorite")
      .set("Cookie", "dummy");

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });
});
