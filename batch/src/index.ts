import { PrismaClient } from ".prisma/client";
import {
  arrayShuffle,
  generateAudio,
  generateWordsList,
  saveSoundInfo,
  wordsToSSML,
} from "./func";

const main = async () => {
  const prisma = new PrismaClient();
  try {
    console.log("音声作成＆DB保存処理を開始します。");
    // ---------------------[start]リクエストの音声作成----------------------------
    console.log("リクエストされている音声作成を開始します。");

    const queueList = await prisma.soundReqQueue.findMany({
      orderBy: {
        requestedAt: "asc",
      },
      take: parseInt(process.env.RECORDS_PER_BATCH || "0"),
    });

    for (const queueInfo of queueList) {
      const wordsList = await generateWordsList(queueInfo.theme);

      const shuffledWordsList = arrayShuffle([...wordsList, ...wordsList]);
      // ssml(AmazonPollyに登録できる形式)に変換
      const ssml = wordsToSSML(shuffledWordsList);
      console.log("単語生成処理が成功しました。");

      // ボイス作成
      const speaker = queueInfo.isMaleVoice
        ? "Takumi"
        : Math.random() > 0.5
          ? "Kazuha"
          : "Tomoko"; // 話し手決定
      const s3Url = await generateAudio(ssml, speaker); // 音声作成＆URL発行
      await saveSoundInfo(s3Url, queueInfo.isMaleVoice, prisma, queueInfo);
    }

    // 処理したキューのレコードを削除
    await prisma.soundReqQueue.deleteMany({
      where: {
        userId: {
          in: queueList.map((queue) => queue.userId),
        },
      },
    });

    console.log("リクエストされている音声作成を終了します。");
    // ---------------------[End]リクエストの音声作成----------------------------

    // ---------------------[start]日時の音声作成----------------------------
    console.log("日次の音声作成を開始します。");
    // 生成AIで単語リストを作成
    const wordsList = await generateWordsList();
    const shuffledWordsList = arrayShuffle([...wordsList, ...wordsList]);
    // ssml(AmazonPollyに登録できる形式)に変換
    const ssml = wordsToSSML(shuffledWordsList);
    console.log("単語生成処理が成功しました。");

    // 男性ボイス作成
    const s3UrlMale = await generateAudio(ssml, "Takumi");
    await saveSoundInfo(s3UrlMale, true, prisma);

    // 女性ボイス作成
    const s3UrlFemale = await generateAudio(
      ssml,
      Math.random() > 0.5 ? "Kazuha" : "Tomoko",
    );
    await saveSoundInfo(s3UrlFemale, false, prisma);
    console.log("日次の音声作成を終了します。");
    // ---------------------[End]日時の音声作成---------------------------

    console.log("全処理が完了しました。");
  } catch (error) {
    console.log("想定外のエラーが発生しました。");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
