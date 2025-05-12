import { PrismaClient } from ".prisma/client";
import {
  arrayShuffle,
  generateAudio,
  generateWordsList,
  saveSoundInfo,
  changeToCloudfrontUrl,
  wordsToSSML,
} from "./func";

const main = async () => {
  if (!process.env.CLOUD_FRONT_DOMAIN_SOUND || !process.env.RECORDS_PER_BATCH) {
    console.log("環境変数に不備があります");
    return;
  }

  const prisma = new PrismaClient();
  try {
    console.log("音声作成＆DB保存処理を開始します。");
    // ---------------------[start]リクエストの音声作成----------------------------
    console.log("リクエストされている音声作成を開始します。");

    const queueList = await prisma.soundReqQueue.findMany({
      orderBy: {
        requestedAt: "asc",
      },
      take: parseInt(process.env.RECORDS_PER_BATCH),
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
      await saveSoundInfo(
        changeToCloudfrontUrl(s3Url, process.env.CLOUD_FRONT_DOMAIN_SOUND),
        queueInfo.isMaleVoice,
        prisma,
        queueInfo,
      );

      // 処理したキューのレコードを削除
      await prisma.soundReqQueue.delete({
        where: {
          userId: queueInfo.userId,
        },
      });
    }

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

    // 女性ボイス作成
    const s3UrlFemale = await generateAudio(
      ssml,
      Math.random() > 0.5 ? "Kazuha" : "Tomoko",
    );
    await saveSoundInfo(
      changeToCloudfrontUrl(s3UrlFemale, process.env.CLOUD_FRONT_DOMAIN_SOUND),
      false,
      prisma,
    );
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
