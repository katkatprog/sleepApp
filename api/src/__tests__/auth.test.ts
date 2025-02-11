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

// テスト使用データ
const uInfo = {
  id: 1,
  name: "kat",
  email: "katkatprog@example.com",
  image: null,
  hashedPassword: "dummyhashedPassword",
};
const signupReq = {
  name: "kat",
  email: "katkatprog@example.com",
  password: "P@ssw0rd",
};
const loginReq = {
  email: "katkatprog@example.com",
  password: "P@ssw0rd",
};

describe("🧪Signup", () => {
  beforeAll(() => {
    // テスト用jwt設定
    mockJwt.sign.mockImplementation(() => "validtoken");
    mockJwt.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  test("🟢Signup", async () => {
    prismaMock.user.create.mockResolvedValueOnce(uInfo);

    // 処理実行
    const res = await request(app).post("/auth/signup").send(signupReq);

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
  });

  // auth
  test("🚨nameが欠落", async () => {
    // 処理実行
    const res = await request(app).post("/auth/signup").send({
      email: signupReq.email,
      password: signupReq.password,
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("お名前が入力されていません。");
  });

  test("🚨emailが欠落", async () => {
    // 処理実行
    const res = await request(app).post("/auth/signup").send({
      name: signupReq.name,
      password: signupReq.password,
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "メールアドレスが入力されていません。メールアドレスの形式が正しくありません。",
    );
  });

  test("🚨passwordが欠落", async () => {
    // 処理実行
    const res = await request(app).post("/auth/signup").send({
      name: signupReq.name,
      email: signupReq.email,
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "パスワードが入力されていません。パスワードの桁数が足りません。パスワードの形式が正しくありません。",
    );
  });

  test("🚨emailがメールアドレスの形式ではない", async () => {
    // 処理実行
    const res = await request(app)
      .post("/auth/signup")
      .send({
        ...signupReq,
        email: "katkatprog",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("メールアドレスの形式が正しくありません。");
  });

  test("🚨passwordが8桁未満", async () => {
    // 処理実行
    const res = await request(app)
      .post("/auth/signup")
      .send({
        ...signupReq,
        password: "P@ssw0r",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("パスワードの桁数が足りません。");
  });

  test("🚨passwordが半角英数字記号になっていない", async () => {
    // 処理実行
    const res = await request(app)
      .post("/auth/signup")
      .send({
        ...signupReq,
        password: "P@sswrdあ",
      });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("パスワードの形式が正しくありません。");
  });

  test("🚨ゲストユーザーのメールアドレスを登録しようとしている", async () => {
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

  test("🚨Signup(email重複)", async () => {
    // emailの重複が起きた場合を想定
    prismaMock.user.create.mockRejectedValueOnce({
      code: "P2002",
    } as PrismaClientKnownRequestError);

    // 処理実行
    const res = await request(app).post("/auth/signup").send(signupReq);

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("メールアドレスが登録済です。");
  });
});

describe("🧪Login", () => {
  beforeAll(() => {
    // テスト用jwt設定
    mockJwt.sign.mockImplementation(() => "validtoken");
    mockJwt.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  test("🟢Login", async () => {
    // 事前準備
    prismaMock.user.findUnique.mockResolvedValueOnce(uInfo);
    mockBcrypt.compare.mockImplementationOnce(async () => true);

    // 処理実行
    const res = await request(app).post("/auth/login").send(loginReq);

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.text).toBe("OK");
  });

  test("🚨Login(リクエストパラメータ欠落)", async () => {
    // 処理実行(パスワード欠落)
    const res = await request(app).post("/auth/login").send({
      email: loginReq.email,
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("パスワードが入力されていません。");
  });

  test("🚨Login(emailが存在しない場合)", async () => {
    // emailのユーザーが存在しない場合を想定
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    // 処理実行
    const res = await request(app).post("/auth/login").send(loginReq);

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "メールアドレスもしくはパスワードが正しくありません。",
    );
  });

  test("🚨Login(emailかpasswordが間違っている場合)", async () => {
    // passwordが間違っている場合を想定
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...uInfo,
      hashedPassword: "", // 正しいパスワード「Passw0rd」のハッシュ値と異なるハッシュ値（ここでは空白に設定）
    });

    // 処理実行
    const res = await request(app).post("/auth/login").send(loginReq);

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe(
      "メールアドレスもしくはパスワードが正しくありません。",
    );
  });
});

describe("🧪Logout", () => {
  // logout
  test("🟢Logout", async () => {
    // 処理実行
    const res = await request(app)
      .post("/auth/logout")
      .set("Cookie", "token=validtoken");

    // 実行結果
    expect(res.status).toBe(200);
    // トークンがクリアされることのチェック
    // headerのset-cookieは["token=; Path=/; ..."]という形で入っているため、下記のようなチェックをしている
    expect(res.header["set-cookie"][0].includes("token=;")).toBe(true);
  });
});
