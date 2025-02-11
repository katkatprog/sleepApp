import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";
import { prismaMock } from "../prisma/singleton";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

// jwtをモック化する
jest.mock("jsonwebtoken");
const jwtMock = jest.mocked(jwt);

// bcryptをモック化する
jest.mock("bcrypt");
const bcryptMock = jest.mocked(bcrypt);

// prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

// テスト使用データ
const uInfo = {
  id: 1,
  name: "kat",
  email: "katkatprog@example.com",
  image: null,
  hashedPassword: "dummyhashedPassword",
};

describe("🧪ユーザー取得", () => {
  beforeAll(() => {
    // テスト用jwt設定
    jwtMock.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  // ログインユーザー取得
  test("🟢ログインユーザー取得", async () => {
    // 事前準備
    prismaMock.user.findUnique.mockResolvedValueOnce(uInfo);

    // 処理実行
    const res = await request(app)
      .get("/login-user")
      .set("cookie", "token=validtoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual(uInfo);
  });

  test("🟢ログインユーザー取得(token無しなら未ログイン状態として扱う)", async () => {
    // 処理実行
    const res = await request(app).get("/login-user");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toBe(null);
  });

  test("🟢ログインユーザー取得(token不正なら未ログイン状態として扱う)", async () => {
    // 処理実行
    const res = await request(app).get("/login-user").set("cookie", "token=");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toBe(null);
  });
});

describe("🧪ユーザー編集", () => {
  beforeAll(() => {
    // テスト用jwt設定
    jwtMock.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  test("🟢ログインユーザー編集", async () => {
    // 事前準備
    const updUInfo = {
      id: 1,
      name: "katupdate",
      email: "katkatprog@example.com",
      image: null,
    };
    prismaMock.user.findUnique.mockResolvedValueOnce(uInfo);
    prismaMock.user.update.mockResolvedValueOnce(updUInfo as User); // Userが期待されるが、実際にはhashedPasswordはカットするため、asを使用

    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=validtoken")
      .send({
        id: 1,
        name: "katupdate",
        email: "katkatprog@example.com",
      });

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updUInfo);
  });

  test("🚨ログインユーザー編集(nameが空)", async () => {
    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=validtoken")
      .send({
        name: "",
        email: "test@example.com",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("お名前が入力されていません。");
  });

  test("🚨ログインユーザー編集(emailが空)", async () => {
    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=validtoken")
      .send({
        name: "testuser",
        email: "",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "メールアドレスが入力されていません。メールアドレスの形式が正しくありません。",
    );
  });

  test("🚨ログインユーザー編集(emailが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=validtoken")
      .send({
        name: "testuser",
        email: "test@",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("メールアドレスの形式が正しくありません。");
  });

  test("🚨ログインユーザー編集(token不正)", async () => {
    // 処理実行
    // cookieには"dummy"というtokenを含める
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=")
      .send({
        id: 1,
        name: "testuser",
        email: "test@example.com",
      });

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });

  test("🚨ログインユーザー編集(ゲストユーザーのemailに変更することの防止)", async () => {
    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=validtoken")
      .send({
        id: 1,
        name: "guest",
        email: "guest@example.com",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("そのメールアドレスに変更することはできません。");
  });
});

describe("🧪ユーザー削除", () => {
  beforeAll(() => {
    // テスト用jwt設定
    jwtMock.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });
  test("🟢ログインユーザー削除", async () => {
    // 事前準備
    prismaMock.user.findUnique.mockResolvedValueOnce(uInfo);
    bcryptMock.compare.mockImplementationOnce(async () => true);

    // 処理実行
    const res = await request(app)
      .delete("/login-user")
      .set("cookie", "token=validtoken")
      .send({
        password: "P@ssw0rd",
      });

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
    // トークンがクリアされることのチェック
    // headerのset-cookieは["token=; Path=/; ..."]という形で入っているため、下記のようなチェックをしている
    expect(res.header["set-cookie"][0].includes("token=;")).toBe(true);
  });

  test("🚨ログインユーザー削除(パスワードが空)", async () => {
    // 処理実行
    const res = await request(app)
      .delete("/login-user")
      .set("cookie", "token=validtoken")
      .send({
        password: "",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("パスワードが入力されていません。");
  });

  test("🚨ログインユーザー削除(tokenが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .delete("/login-user")
      .set("cookie", "token=")
      .send({
        password: "P@ssw0rd",
      });

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });
});
