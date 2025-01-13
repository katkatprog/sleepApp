import { SoundInfo } from "@prisma/client";
import { prismaMock } from "../prisma/singleton";
import request from "supertest";
import { app } from "../app";

describe("Integration test (sound-info)", () => {
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
});
