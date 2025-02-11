import { SoundInfo } from "@prisma/client";
import { prismaMock } from "../prisma/singleton";
import request from "supertest";
import { app } from "../app";
// prismaMockは各々のテスト前に初期化される(singleton.tsに設定あり)

// 使用データ
const sInfo: SoundInfo = {
  id: 1,
  name: "test",
  createdAt: new Date(0).toString() as unknown as Date,
  url: "sampleurl",
  isMaleVoice: true,
  playCount: 0,
  reqUserId: null,
};

describe("🧪音声個別取得", () => {
  test("🟢音声情報を個別取得", async () => {
    // データ設定
    prismaMock.soundInfo.findUnique.mockResolvedValueOnce(sInfo);

    // 処理実行
    const res = await request(app).get("/sound-info/single/1");

    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...sInfo, playCount: 1 }); // DBから取得した値が返される（再生回数は1加算された状態で返される）
  });

  test("🚨音声情報を個別取得", async () => {
    // 数字ではないidが指定された場合を想定
    // 処理実行
    const res = await request(app).get("/sound-info/single/str");

    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("音声のIDが数字ではありません。");
  });

  test("🚨音声情報を個別取得", async () => {
    // 指定したidのデータがDBに無かった場合を想定
    // データ設定
    prismaMock.soundInfo.findUnique.mockResolvedValueOnce(null);

    // 処理実行
    const res = await request(app).get("/sound-info/single/1");

    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("音声情報が見つかりません。");
  });
});

describe("🧪音声複数取得", () => {
  test("🟢音声情報を検索(クエリパラメータなし)", async () => {
    // データ設定
    prismaMock.soundInfo.findMany.mockResolvedValueOnce([sInfo]);
    prismaMock.soundInfo.count.mockResolvedValueOnce(1);

    // 処理実行
    const res = await request(app).get("/sound-info/search");
    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ soundsList: [sInfo], totalPages: 1 });
  });

  test("🟢音声情報を検索(クエリパラメータあり)", async () => {
    // データ設定
    prismaMock.soundInfo.findMany.mockResolvedValueOnce([sInfo]);
    prismaMock.soundInfo.count.mockResolvedValueOnce(1);

    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=1",
    );
    // 実行結果
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ soundsList: [sInfo], totalPages: 1 });
  });

  test("🚨音声情報を検索(不正なページ指定)", async () => {
    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=test",
    );
    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("クエリパラメータpageが数字ではありません。");
  });

  test("🚨音声情報を検索(検索結果に対しての範囲を超えたページ指定(ページ数を0以下に設定した場合))", async () => {
    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=0",
    );
    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("指定の検索ページが見つかりません。");
  });

  test("🚨音声情報を検索(検索結果に対しての範囲を超えたページ指定(ページ数が大きすぎる場合))", async () => {
    // データ設定
    prismaMock.soundInfo.findMany.mockResolvedValueOnce([]);
    prismaMock.soundInfo.count.mockResolvedValueOnce(1);

    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=count&page=10000",
    );
    // 実行結果
    expect(res.status).toBe(404);
    expect(res.text).toBe("指定の検索ページが見つかりません。");
  });

  test("🚨音声情報を検索(sortByの指定が正しくない)", async () => {
    // 処理実行
    const res = await request(app).get(
      "/sound-info/search?q=test&sort=dummy&page=1",
    );
    // 実行結果
    expect(res.status).toBe(400);
    expect(res.text).toBe("クエリパラメータsortの指定が正しくありません。");
  });
});
