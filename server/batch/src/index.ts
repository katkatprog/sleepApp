import { PrismaClient } from ".prisma/client";
import {
  arrayShuffle,
  generateAudio,
  generateDailyWordsList,
  saveTodaysSoundInfo,
  wordsToSSML,
} from "./func";

const main = async () => {
  const prisma = new PrismaClient();
  try {
    console.log("音声作成＆DB保存処理を開始します。");

    // 生成AIで単語リストを作成
    const wordsList = await generateDailyWordsList();
    const shuffledWordsList = arrayShuffle(wordsList);
    // ssml(AmazonPollyに登録できる形式)に変換
    const ssml = wordsToSSML(shuffledWordsList);
    console.log("単語生成処理が成功しました。");

    // 男性ボイス作成
    const s3UrlMale = await generateAudio(ssml, "Takumi");
    await saveTodaysSoundInfo(s3UrlMale, true, prisma);

    // 女性ボイス作成
    const s3UrlFemale = await generateAudio(
      ssml,
      Math.random() > 0.5 ? "Kazuha" : "Tomoko",
    );
    await saveTodaysSoundInfo(s3UrlFemale, false, prisma);

    console.log("全処理が完了しました。");
  } catch (error) {
    console.log("エラー発生");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
