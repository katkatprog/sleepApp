import { arrayShuffle } from "./func";

describe("配列シャッフル処理のテスト", () => {
  let inputArray: string[];
  let outputArray: string[];

  beforeAll(() => {
    inputArray = ["a", "b", "c", "d", "e"];
    outputArray = arrayShuffle(inputArray);
    console.log(outputArray);
  });

  it("シャッフル前後で配列の長さが同じことのテスト", () => {
    expect(inputArray.length).toBe(outputArray.length);
  });

  it("シャッフル前後で要素の欠落がないことのテスト", () => {
    inputArray.forEach((input) => {
      const existEle = outputArray.find((output) => output === input); //要素が存在すればその要素、存在しなければundefinedが返ってくる
      expect(existEle).not.toBe(undefined);
    });
  });

  it("シャッフル前後でinput配列の変更がないことのテスト", () => {
    expect(inputArray).toEqual(inputArray);
  });
});
