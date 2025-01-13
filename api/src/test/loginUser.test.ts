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

describe("Integration test (login-user)", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

  beforeAll(() => {
    // テスト用jwt設定
    jwtMock.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  // ログインユーザー取得
  test("[正常系]ログインユーザー取得", async () => {
    // 事前準備
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "kat",
      email: "katkatprog@example.com",
      image: null,
      hashedPassword: "dummyhashedPassword",
    });

    // 処理実行
    const res = await request(app)
      .get("/login-user")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      name: "kat",
      email: "katkatprog@example.com",
      image: null,
      hashedPassword: "dummyhashedPassword",
    });
  });

  test("[正常系]ログインユーザー取得(token無し)", async () => {
    // 処理実行
    const res = await request(app).get("/login-user");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toBe(null);
  });

  test("[正常系]ログインユーザー取得(token不正)", async () => {
    // tokenが不正な場合、verifyでエラーになるためモックする
    jwtMock.verify.mockImplementationOnce(() => {
      throw new Error("");
    });

    // 処理実行
    const res = await request(app)
      .get("/login-user")
      .set("cookie", "token=invalidtoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toBe(null);
  });

  test("[正常系]ログインユーザー編集", async () => {
    // 事前準備
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "kat",
      email: "katkatprog@example.com",
      image: null,
      hashedPassword: "dummyhashedPassword",
    });
    prismaMock.user.update.mockResolvedValue({
      id: 1,
      name: "katupdate",
      email: "katkatprog@example.com",
      image: null,
    } as User); // Userが期待されるが、実際にはhashedPasswordはカットするため、asを使用

    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=invalidtoken")
      .send({
        id: 1,
        name: "katupdate",
        email: "katkatprog@example.com",
      });

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      name: "katupdate",
      email: "katkatprog@example.com",
      image: null,
    });
  });

  test("[異常系]ログインユーザー編集(nameが空)", async () => {
    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=dummytoken")
      .send({
        name: "",
        email: "test@example.com",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("お名前が入力されていません。");
  });

  test("[異常系]ログインユーザー編集(emailが空)", async () => {
    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=dummytoken")
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

  test("[異常系]ログインユーザー編集(emailが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=dummytoken")
      .send({
        name: "testuser",
        email: "test@",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("メールアドレスの形式が正しくありません。");
  });

  test("[異常系]ログインユーザー編集(token不正)", async () => {
    // tokenが不正な場合、verifyでエラーになるためモックする
    jwtMock.verify.mockImplementationOnce(() => {
      throw new Error("");
    });

    // 処理実行
    // cookieには"dummy"というtokenを含める
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=invalidtoken")
      .send({
        id: 1,
        name: "testuser",
        email: "test@example.com",
      });

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });

  test("[異常系]ログインユーザー編集(ゲストユーザーのemailに変更することの防止)", async () => {
    // 処理実行
    const res = await request(app)
      .put("/login-user")
      .set("cookie", "token=dummytoken")
      .send({
        id: 1,
        name: "guest",
        email: "guest@example.com",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("そのメールアドレスに変更することはできません。");
  });

  test("[正常系]ログインユーザー削除", async () => {
    // 事前準備
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "kat",
      email: "katkatprog@example.com",
      image: null,
      hashedPassword: "dummyhashedPassword",
    });
    bcryptMock.compare.mockImplementationOnce(async () => true);

    // 処理実行
    const res = await request(app)
      .delete("/login-user")
      .set("cookie", "token=invalidtoken")
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

  test("[異常系]ログインユーザー削除(パスワードが空)", async () => {
    // 処理実行
    const res = await request(app)
      .delete("/login-user")
      .set("cookie", "token=dummytoken")
      .send({
        password: "",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("パスワードが入力されていません。");
  });

  test("[異常系]ログインユーザー削除(tokenが不正)", async () => {
    // tokenが不正な場合、verifyでエラーになるためモックする
    jwtMock.verify.mockImplementationOnce(() => {
      throw new Error("");
    });

    // 処理実行
    const res = await request(app)
      .delete("/login-user")
      .set("cookie", "token=invalidtoken")
      .send({
        password: "P@ssw0rd",
      });

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });
});
