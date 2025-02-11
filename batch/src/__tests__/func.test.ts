import { arrayShuffle, changeToCloudfrontUrl, wordsToSSML } from "../func";

jest.mock("@google/generative-ai"); //モジュール全体をモック

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

describe("S3のURLをCloudFrontのURLに変換できるかのテスト", () => {
  it("正しく変換できるかのテスト", () => {
    const cloudFrontUrl = changeToCloudfrontUrl(
      "https://dummy.s3.ap-northeast-1.amazonaws.com/1.jpg",
      "https://dummy.cloudfront.net",
    );
    expect(cloudFrontUrl).toBe("https://dummy.cloudfront.net/1.jpg");
  });
});
