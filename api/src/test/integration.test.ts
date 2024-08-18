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
      reqUserId: null,
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
    expect(res.text).toBe("音声のIDが数字ではありません。");
  });

  test("[異常系2]音声情報を個別取得", async () => {
    // 指定したidのデータがDBに無かった場合を想定
    // データ設定
    prismaMock.soundInfo.findUnique.mockResolvedValue(null);

    // 処理実行
    const res = await request(app).get("/sound-info/single/1");

    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("音声情報が見つかりません。");
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
    expect(res.text).toBe("想定外のエラーが発生しました。");
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
      reqUserId: null,
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
      reqUserId: null,
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
    expect(res.text).toBe("クエリパラメータpageが数字ではありません。");
  });

  test("[異常系2]音声情報を検索(検索結果に対しての範囲を超えたページ指定(ページ数を0以下に設定した場合))", async () => {
    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=0",
    );
    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("指定の検索ページが見つかりません。");
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
    expect(res.text).toBe("指定の検索ページが見つかりません。");
  });

  test("[異常系4]音声情報を検索(sortByの指定が正しくない)", async () => {
    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=dummy&page=1",
    );
    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("クエリパラメータsortの指定が正しくありません。");
  });

  test("[異常系5]音声情報を検索", async () => {
    // 異常系1,2,3,4以外で何らかのエラーが起きた場合を想定
    // データ設定
    prismaMock.soundInfo.findMany.mockRejectedValue(new Error("Error on Test"));
    prismaMock.soundInfo.count.mockRejectedValue(new Error("Error on Test"));

    // 処理実行
    const res = await request(app).get("/sound-info/search");

    // 実行結果
    expect(res.status).toBe(500);
    expect(res.text).toBe("想定外のエラーが発生しました。");
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
