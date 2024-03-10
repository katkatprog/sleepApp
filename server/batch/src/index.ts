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
    console.log("単語生成処理が成功しました。");
    
    const ssml = wordsToSSML(wordsList);
    const s3Url = await generateAudio(ssml);
    if (!s3Url) {
      throw new Error("S3のURL生成に失敗しました。");
    }
    console.log("音声生成処理が成功しました。");
    
    await saveTodaysSoundInfo(s3Url, prisma);
    console.log("音声URLのDB保存が成功しました。");
    
    console.log("全処理が完了しました。");
  } catch (error) {
    console.log("エラー発生");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
