import request from "supertest";
import { app } from "../app";

describe("Integration test (login-user)", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

  // ログインユーザー取得
  test("[正常系]ログインユーザー取得(token無し)", async () => {
    // 処理実行
    const res = await request(app).get("/login-user");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toBe(null);
  });

  test("[正常系]ログインユーザー取得(token不正)", async () => {
    // 処理実行
    // cookieには"dummy"というtokenを含める
    const res = await request(app).get("/login-user").set("Cookie", "dummy");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toBe(null);
  });

  test("[異常系]ログインユーザー編集(nameが空)", async () => {
    // 処理実行
    const res = await request(app).put("/login-user").send({
      name: "",
      email: "test@example.com",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("お名前が入力されていません。");
  });

  test("[異常系]ログインユーザー編集(emailが空)", async () => {
    // 処理実行
    const res = await request(app).put("/login-user").send({
      name: "testuser",
      email: "",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "メールアドレスが入力されていません。メールアドレスの形式が正しくありません。",
    );
  });

  test("[異常系]ログインユーザー編集(emailが不正)", async () => {
    // 処理実行
    const res = await request(app).put("/login-user").send({
      name: "testuser",
      email: "test@",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("メールアドレスの形式が正しくありません。");
  });

  test("[異常系]ログインユーザー編集(token不正)", async () => {
    // 処理実行
    // cookieには"dummy"というtokenを含める
    const res = await request(app)
      .put("/login-user")
      .set("Cookie", "dummy")
      .send({
        id: 1,
        name: "testuser",
        email: "test@example.com",
      });

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });

  test("[異常系]ログインユーザー編集(token不正)", async () => {
    // 処理実行
    // cookieには"dummy"というtokenを含める
    const res = await request(app).put("/login-user").send({
      id: 1,
      name: "guest",
      email: "guest@example.com",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("そのメールアドレスに変更することはできません。");
  });

  test("[異常系]ログインユーザー削除(パスワードが空)", async () => {
    // 処理実行
    const res = await request(app).delete("/login-user").send({
      password: "",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("パスワードが入力されていません。");
  });

  test("[異常系]ログインユーザー削除(tokenが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .delete("/login-user")
      .send({
        password: "P@ssw0rd",
      })
      .set("Cookie", "dummy");

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });
});
