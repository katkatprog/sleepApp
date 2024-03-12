import { PrismaClient } from ".prisma/client";
import {
  generateAudio,
  generateDailyWordsList,
  saveTodaysSoundInfo,
  wordsToSSML,
} from "./func";

const main = async () => {
  const prisma = new PrismaClient();
  try {
    console.log("音声作成＆DB保存処理を開始します。");

    const wordsList = await generateDailyWordsList();
    const ssml = wordsToSSML(wordsList);
    console.log("単語生成処理が成功しました。");

    // 男性ボイス作成
    console.log("音声作成を開始します。(読み手：男性)");
    const s3UrlMale = await generateAudio(ssml, "Takumi");
    if (!s3UrlMale) {
      throw new Error("音声ファイルの作成に失敗しました。");
    }
    console.log("音声作成に成功しました。(読み手：男性)");
    await saveTodaysSoundInfo(s3UrlMale, true, prisma);
    console.log("音声URLのDB保存が成功しました。(読み手：男性)");

    // 女性ボイス作成
    console.log("音声作成を開始します。(読み手：女性)");
    const s3UrlFemale = await generateAudio(ssml, "Kazuha");
    if (!s3UrlFemale) {
      throw new Error("音声ファイルの作成に失敗しました。");
    }
    console.log("音声作成に成功しました。(読み手：女性)");
    await saveTodaysSoundInfo(s3UrlFemale, false, prisma);
    console.log("音声URLのDB保存が成功しました。(読み手：女性)");

    console.log("全処理が完了しました。");
  } catch (error) {
    console.log("エラー発生");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
