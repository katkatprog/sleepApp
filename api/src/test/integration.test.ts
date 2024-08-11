import { SoundInfo, User } from "@prisma/client";
import { prismaMock } from "../prisma/singleton";
import request from "supertest";
import { app } from "../app";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

describe("Integration test", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

  test("[正常系]音声情報を個別取得", async () => {
    // データ準備
    const sInfo: SoundInfo = {
      id: 1,
      name: "test",
      createdAt: new Date(0).toString() as unknown as Date,
      url: "sampleurl",
      isMaleVoice: true,
      playCount: 0,
    };
    // データ設定
    prismaMock.soundInfo.findUnique.mockResolvedValue(sInfo);

    // 処理実行
    const res = await request(app).get("/sound-info/single/1");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...sInfo, playCount: 1 }); // DBから取得した値が返される（再生回数は1加算された状態で返される）
  });

  test("[異常系1]音声情報を個別取得", async () => {
    // 数字ではないidが指定された場合を想定
    // 処理実行
    const res = await request(app).get("/sound-info/single/str");

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("Request Param is not valid...");
  });

  test("[異常系2]音声情報を個別取得", async () => {
    // 指定したidのデータがDBに無かった場合を想定
    // データ設定
    prismaMock.soundInfo.findUnique.mockResolvedValue(null);

    // 処理実行
    const res = await request(app).get("/sound-info/single/1");

    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("Sound info was not found...");
  });

  test("[異常系3]音声情報を個別取得", async () => {
    // 異常系1,2以外で何らかのエラーが起きた場合を想定
    // データ設定
    prismaMock.soundInfo.findUnique.mockRejectedValue(
      new Error("Error on Test"),
    );

    // 処理実行
    const res = await request(app).get("/sound-info/single/1");

    // 実行結果
    expect(res.status).toBe(500);
    expect(res.text).toBe("Something went wrong...");
  });

  test("[正常系1]音声情報を検索(クエリパラメータなし)", async () => {
    // データ準備
    const sInfo: SoundInfo = {
      id: 1,
      name: "test",
      createdAt: new Date(0).toString() as unknown as Date,
      url: "sampleurl",
      isMaleVoice: true,
      playCount: 0,
    };
    // データ設定
    prismaMock.soundInfo.findMany.mockResolvedValue([sInfo]);
    prismaMock.soundInfo.count.mockResolvedValue(1);

    // 処理実行
    const res = await request(app).get("/sound-info/search");
    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ soundsList: [sInfo], totalPages: 1 });
  });

  test("[正常系2]音声情報を検索(クエリパラメータあり)", async () => {
    // データ準備
    const sInfo: SoundInfo = {
      id: 1,
      name: "test",
      createdAt: new Date(0).toString() as unknown as Date,
      url: "sampleurl",
      isMaleVoice: true,
      playCount: 0,
    };
    // データ設定
    prismaMock.soundInfo.findMany.mockResolvedValue([sInfo]);
    prismaMock.soundInfo.count.mockResolvedValue(1);

    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=1",
    );
    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ soundsList: [sInfo], totalPages: 1 });
  });

  test("[異常系1]音声情報を検索(不正なページ指定)", async () => {
    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=test",
    );
    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("Request Param is not valid...");
  });

  test("[異常系2]音声情報を検索(検索結果に対しての範囲を超えたページ指定(ページ数を0以下に設定した場合))", async () => {
    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=0",
    );
    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("Page is not found...");
  });

  test("[異常系3]音声情報を検索(検索結果に対しての範囲を超えたページ指定(ページ数が大きすぎる場合))", async () => {
    // データ設定
    prismaMock.soundInfo.findMany.mockResolvedValue([]);
    prismaMock.soundInfo.count.mockResolvedValue(1);

    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=10000",
    );
    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("Page is not found...");
  });

  test("[異常系4]音声情報を検索", async () => {
    // 異常系1,2,3以外で何らかのエラーが起きた場合を想定
    // データ設定
    prismaMock.soundInfo.findMany.mockRejectedValue(new Error("Error on Test"));
    prismaMock.soundInfo.count.mockRejectedValue(new Error("Error on Test"));

    // 処理実行
    const res = await request(app).get("/sound-info/search");

    // 実行結果
    expect(res.status).toBe(500);
    expect(res.text).toBe("Something went wrong...");
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
    expect(res.text).toBe("This email already exists...");
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
    expect(res.text).toBe("Something went wrong in signup...");
  });

  test("[異常系1]Signin(リクエストパラメータ欠落)", async () => {
    // 処理実行(パスワード欠落)
    const res = await request(app).post("/auth/signin").send({
      email: "katkatprog@example.com",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("email or password is empty...");
  });

  test("[異常系2]Signin(emailが存在しない場合)", async () => {
    // emailのユーザーが存在しない場合を想定
    prismaMock.user.findUnique.mockResolvedValue(null);

    // 処理実行
    const res = await request(app).post("/auth/signin").send({
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("email or password is incorrect...");
  });

  test("[異常系3]Signin(emailかpasswordが間違っている場合)", async () => {
    // passwordが間違っている場合を想定
    const user: User = {
      id: 1,
      email: "katkatprog@example.com",
      name: "kat",
      hashedPassword: "", // 入力の「Passw0rd」のハッシュ値と異なるハッシュ値（ここでは空白に設定）
    };
    prismaMock.user.findUnique.mockResolvedValue(user);

    // 処理実行
    const res = await request(app).post("/auth/signin").send({
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("email or password is incorrect...");
  });

  test("[異常系4]Signin", async () => {
    // 異常系1,2,3以外でエラーが起きた場合を想定
    prismaMock.user.findUnique.mockRejectedValue(new Error());

    // 処理実行
    const res = await request(app).post("/auth/signin").send({
      email: "katkatprog@example.com",
      password: "P@ssw0rd",
    });

    // 実行結果
    expect(res.status).toBe(500);
    expect(res.text).toBe("Something went wrong in signin...");
  });
});
