import { User } from "@prisma/client";
import { prismaMock } from "../prisma/singleton";
import request from "supertest";
import { app } from "../app";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// jwtをモック化する
jest.mock("jsonwebtoken");
const mockJwt = jest.mocked(jwt);

// bcryptをモック化する
jest.mock("bcrypt");
const mockBcrypt = jest.mocked(bcrypt);

describe("Integration test (auth)", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

  beforeAll(() => {
    // テスト用jwt設定
    mockJwt.sign.mockImplementation(() => "dummytoken");
    mockJwt.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  test("[正常系]Signup", async () => {
    prismaMock.user.create.mockResolvedValueOnce({
      id: 1,
      name: "kat",
      email: "katkatprog@example.com",
      image: null,
      hashedPassword: "dummyhashedPassword",
    });

    // 処理実行
    const res = await request(app).post("/auth/signup").send({
      name: "kat",
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
  });

  // auth
  describe("[異常系1]Signup(バリデーションチェック)", () => {
    test("[異常系1-1]nameが欠落", async () => {
      // 処理実行
      const res = await request(app).post("/auth/signup").send({
        email: "katkatprog@example.com",
        password: "P@ssw0rd",
      });

      // 実行結果
      expect(res.status).toBe(400);
      expect(res.text).toBe("お名前が入力されていません。");
    });

    test("[異常系1-2]emailが欠落", async () => {
      // 処理実行
      const res = await request(app).post("/auth/signup").send({
        name: "kat",
        password: "P@ssw0rd",
      });

      // 実行結果
      expect(res.status).toBe(400);
      expect(res.text).toBe(
        "メールアドレスが入力されていません。メールアドレスの形式が正しくありません。",
      );
    });

    test("[異常系1-3]passwordが欠落", async () => {
      // 処理実行
      const res = await request(app).post("/auth/signup").send({
        name: "kat",
        email: "katkatprog@example.com",
      });

      // 実行結果
      expect(res.status).toBe(400);
      expect(res.text).toBe(
        "パスワードが入力されていません。パスワードの桁数が足りません。パスワードの形式が正しくありません。",
      );
    });

    test("[異常系1-4]emailがメールアドレスの形式ではない", async () => {
      // 処理実行
      const res = await request(app).post("/auth/signup").send({
        name: "kat",
        email: "katkatprog",
        password: "P@ssw0rd",
      });

      // 実行結果
      expect(res.status).toBe(400);
      expect(res.text).toBe("メールアドレスの形式が正しくありません。");
    });

    test("[異常系1-5]passwordが8桁未満", async () => {
      // 処理実行
      const res = await request(app).post("/auth/signup").send({
        name: "kat",
        email: "katkatprog@example.com",
        password: "P@ssw0r",
      });

      // 実行結果
      expect(res.status).toBe(400);
      expect(res.text).toBe("パスワードの桁数が足りません。");
    });

    test("[異常系1-6]passwordが半角英数字記号になっていない", async () => {
      // 処理実行
      const res = await request(app).post("/auth/signup").send({
        name: "kat",
        email: "katkatprog@example.com",
        password: "P@sswrdあ",
      });

      // 実行結果
      expect(res.status).toBe(400);
      expect(res.text).toBe("パスワードの形式が正しくありません。");
    });

    test("[異常系1-7]ゲストユーザーのメールアドレスを登録しようとしている", async () => {
      // 処理実行
      const res = await request(app).post("/auth/signup").send({
        name: "guest",
        email: "guest@example.com",
        password: "P@ssw0rd",
      });

      // 実行結果
      expect(res.status).toBe(400);
      expect(res.text).toBe("そのメールアドレスを登録することはできません。");
    });
  });

  test("[異常系2]Signup(email重複)", async () => {
    // emailの重複が起きた場合を想定
    prismaMock.user.create.mockRejectedValue({
      code: "P2002",
    } as PrismaClientKnownRequestError);

    // 処理実行
    const res = await request(app).post("/auth/signup").send({
      name: "kat",
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("メールアドレスが登録済です。");
  });

  test("[異常系3]Signup", async () => {
    // 異常系1,2以外でエラーが起きた場合を想定
    prismaMock.user.create.mockRejectedValue(new Error());

    // 処理実行
    const res = await request(app).post("/auth/signup").send({
      name: "kat",
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(500);
    expect(res.text).toBe("想定外のエラーが発生しました。");
  });

  test("[正常系]Login", async () => {
    // 事前準備
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 1,
      name: "kat",
      email: "katkatprog@example.com",
      image: null,
      hashedPassword: "dummyhashedPassword",
    });
    mockBcrypt.compare.mockImplementationOnce(async () => true);

    // 処理実行
    const res = await request(app).post("/auth/login").send({
      name: "kat",
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
  });

  test("[異常系1]Login(リクエストパラメータ欠落)", async () => {
    // 処理実行(パスワード欠落)
    const res = await request(app).post("/auth/login").send({
      email: "katkatprog@example.com",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("パスワードが入力されていません。");
  });

  test("[異常系2]Login(emailが存在しない場合)", async () => {
    // emailのユーザーが存在しない場合を想定
    prismaMock.user.findUnique.mockResolvedValue(null);

    // 処理実行
    const res = await request(app).post("/auth/login").send({
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "メールアドレスもしくはパスワードが正しくありません。",
    );
  });

  test("[異常系3]Login(emailかpasswordが間違っている場合)", async () => {
    // passwordが間違っている場合を想定
    const user: User = {
      id: 1,
      email: "katkatprog@example.com",
      name: "kat",
      hashedPassword: "", // 入力の「Passw0rd」のハッシュ値と異なるハッシュ値（ここでは空白に設定）
      image: null,
    };
    prismaMock.user.findUnique.mockResolvedValue(user);

    // 処理実行
    const res = await request(app).post("/auth/login").send({
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "メールアドレスもしくはパスワードが正しくありません。",
    );
  });

  test("[異常系4]Login", async () => {
    // 異常系1,2,3以外でエラーが起きた場合を想定
    prismaMock.user.findUnique.mockRejectedValue(new Error());

    // 処理実行
    const res = await request(app).post("/auth/login").send({
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(500);
    expect(res.text).toBe("想定外のエラーが発生しました。");
  });

  // logout
  test("[正常系]Logout", async () => {
    // 処理実行
    const res = await request(app)
      .post("/auth/logout")
      .set("Cookie", "samplejwt");

    // 実行結果
    expect(res.status).toBe(200);
    // トークンがクリアされることのチェック
    // headerのset-cookieは["token=; Path=/; ..."]という形で入っているため、下記のようなチェックをしている
    expect(res.header["set-cookie"][0].includes("token=;")).toBe(true);
  });
});
