import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateWordsList } from "../func";

jest.mock("@google/generative-ai"); //モジュール全体をモック
const MockGoogleGenerativeAI = GoogleGenerativeAI as jest.Mock; // TypeScriptでは型変換する必要がある

describe("単語リスト生成処理のテスト(半角カンマ)", () => {
  MockGoogleGenerativeAI.mockImplementationOnce(() => {
    // geminiに代入するオブジェクトのモック
    return {
      getGenerativeModel: () => {
        // modelに代入するオブジェクトのモック
        return {
          generateContent: async () => {
            // resultに代入するオブジェクトのモック
            return {
              response: {
                text: () => {
                  return "dummy1, 空, テーブル, 椅子, 水, コンピュータ, dummy2";
                },
              },
            };
          },
        };
      },
    };
  });

  it("正しくstring型配列を生成できることのテスト(半角カンマ)", async () => {
    process.env.GEMINI_API_KEY = "dummy";
    const result = await generateWordsList();
    expect(result).toEqual([
      "そら",
      "みず",
      "テーブル",
      "椅子",
      "コンピュータ",
    ]);
  });
});

describe("単語リスト生成処理のテスト(全角カンマ)", () => {
  MockGoogleGenerativeAI.mockImplementationOnce(() => {
    // geminiに代入するオブジェクトのモック
    return {
      getGenerativeModel: () => {
        // modelに代入するオブジェクトのモック
        return {
          generateContent: async () => {
            // resultに代入するオブジェクトのモック
            return {
              response: {
                text: () => {
                  return "dummy1、 空、 テーブル、 椅子、 水、 コンピュータ、 dummy2";
                },
              },
            };
          },
        };
      },
    };
  });

  it("正しくstring型配列を生成できることのテスト(全角カンマ)", async () => {
    process.env.GEMINI_API_KEY = "dummy";
    const result = await generateWordsList();
    expect(result).toEqual([
      "そら",
      "みず",
      "テーブル",
      "椅子",
      "コンピュータ",
    ]);
  });
});
