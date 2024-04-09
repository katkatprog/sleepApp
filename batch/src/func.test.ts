import OpenAI from "openai";
import { arrayShuffle, generateDailyWordsList, wordsToSSML } from "./func";

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async () => {
            return {
              choices: [
                {
                  message: {
                    content:
                      '{\n  "noun": [\n    "テーブル",\n    "椅子",\n    "コンピュータ"\n  ]\n}',
                  },
                },
              ],
            };
          }),
        },
      },
    };
  });
});
jest.mocked(OpenAI);

describe("単語リスト生成処理のテスト", () => {
  it("正しくstring型配列を生成できることのテスト", async () => {
    const result = await generateDailyWordsList();
    expect(result).toEqual(["テーブル", "椅子", "コンピュータ"]);
  });
});

describe("SSML作成処理のテスト", () => {
  it("文字列の配列から、期待したSSMLが作られるかテスト", () => {
    const inputArray = ["a", "b", "c"];
    const outputStr = wordsToSSML(inputArray);
    expect(outputStr).toBe(
      `<speak><prosody rate="95%">a<break time="6s"/>b<break time="6s"/>c<break time="6s"/></prosody></speak>`,
    );
  });
});

describe("配列シャッフル処理のテスト", () => {
  const inputArray = ["a", "b", "c", "d", "e"];
  const outputArray = arrayShuffle(inputArray);

  it("シャッフル前後で配列の長さが同じことのテスト", () => {
    expect(inputArray.length).toBe(outputArray.length);
  });

  it("シャッフル前後で要素の欠落がないことのテスト", () => {
    inputArray.forEach((input) => {
      const existEle = outputArray.find((output) => output === input); //要素が存在すればその要素、存在しなければundefinedが返ってくる
      expect(existEle).not.toBe(undefined);
    });
  });
});
