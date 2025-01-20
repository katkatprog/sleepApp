import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";
import { prismaMock } from "../prisma/singleton";
import { SoundFavorite } from "@prisma/client";

// jwtをモック化する
jest.mock("jsonwebtoken");
const jwtMock = jest.mocked(jwt);

describe("🧪いいねした音声を一覧取得", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

  beforeAll(() => {
    // テスト用jwt設定
    jwtMock.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  const soundFavInfo = {
    userId: 1,
    soundId: 1,
    createdAt: "1970-02-01T00:00:00.000Z" as unknown as Date,
    SoundInfo: {
      id: 1,
      name: "test sound",
      createdAt: "1970-01-01T00:00:00.000Z",
      url: "https://example.com",
      isMaleVoice: false,
      playCount: 10,
      reqUserId: null,
    },
  };

  test("🟢音声いいね一覧取得", async () => {
    // 事前準備
    prismaMock.soundFavorite.findMany.mockResolvedValueOnce([
      soundFavInfo as SoundFavorite,
    ]);
    prismaMock.soundFavorite.count.mockResolvedValueOnce(1);

    // 処理実行
    const res = await request(app)
      .get("/sound-favorite?page=1")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      soundsList: [soundFavInfo.SoundInfo],
      totalPages: 1,
    });
  });

  test("🟢音声いいね一覧取得(ページ指定なし)", async () => {
    // 事前準備
    prismaMock.soundFavorite.findMany.mockResolvedValueOnce([
      soundFavInfo as SoundFavorite,
    ]);
    prismaMock.soundFavorite.count.mockResolvedValueOnce(1);

    // 処理実行
    const res = await request(app)
      .get("/sound-favorite")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      soundsList: [soundFavInfo.SoundInfo],
      totalPages: 1,
    });
  });

  test("🚨音声いいね一覧取得(ページが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .get("/sound-favorite?page=invalid")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("クエリパラメータpageが数字ではありません。");
  });

  test("🚨音声いいね一覧取得(ページが0以下)", async () => {
    // 処理実行
    const res = await request(app)
      .get("/sound-favorite?page=0")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("指定の検索ページが見つかりません。");
  });

  test("🚨音声いいね一覧取得", async () => {
    // 事前準備
    prismaMock.soundFavorite.findMany.mockResolvedValueOnce([]);
    prismaMock.soundFavorite.count.mockResolvedValueOnce(1);

    // 処理実行
    const res = await request(app)
      .get("/sound-favorite?page=2")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("指定の検索ページが見つかりません。");
  });
});

describe("🧪音声のいいね状態を取得", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)
  beforeAll(() => {
    // テスト用jwt設定
    jwtMock.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  test("🟢音声いいね状態取得(いいねしている)", async () => {
    // 事前準備
    prismaMock.soundFavorite.count.mockResolvedValueOnce(1);

    // 処理実行
    const res = await request(app)
      .get("/sound-favorite/1")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: true });
  });

  test("🟢音声いいね状態取得(いいねしていない)", async () => {
    // 事前準備
    prismaMock.soundFavorite.count.mockResolvedValueOnce(0);

    // 処理実行
    const res = await request(app)
      .get("/sound-favorite/1")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: false });
  });

  test("🚨音声いいね状態取得(音声IDが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .get("/sound-favorite/dummy")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("音声IDの形式が正しくありません。");
  });

  test("🚨音声いいね状態取得(tokenが不正)", async () => {
    // tokenが不正な場合、verifyでエラーになるためモックする
    jwtMock.verify.mockImplementationOnce(() => {
      throw new Error("");
    });

    // 処理実行
    const res = await request(app)
      .get("/sound-favorite/1")
      .set("cookie", "token=invalidtoken");

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });
});

describe("🧪音声をいいねする", () => {
  // prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)
  beforeAll(() => {
    // テスト用jwt設定
    jwtMock.verify.mockImplementation(() => ({
      userId: 1,
    }));
  });

  test("🟢音声いいね", async () => {
    // 処理実行
    const res = await request(app)
      .post("/sound-favorite/1")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.text).toEqual("OK");
  });

  test("🚨音声いいね(音声IDが不正)", async () => {
    // 処理実行
    const res = await request(app)
      .post("/sound-favorite/dummy")
      .set("cookie", "token=dummytoken");

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("音声IDの形式が正しくありません。");
  });

  test("🚨音声いいね(tokenが不正)", async () => {
    // tokenが不正な場合、verifyでエラーになるためモックする
    jwtMock.verify.mockImplementationOnce(() => {
      throw new Error("");
    });

    // 処理実行
    const res = await request(app)
      .post("/sound-favorite/1")
      .set("cookie", "token=invalidtoken");

    // 実行結果
    expect(res.status).toBe(401);
    expect(res.text).toBe("認証情報が正しくありません。");
  });
});
