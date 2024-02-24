import {
  generateAudio,
  generateDailyWordsList,
  saveTodaysSoundInfo,
  wordsToSSML,
} from "./func";

const main = async () => {
  try {
    const wordsList = await generateDailyWordsList();
    const ssml = wordsToSSML(wordsList);
    const s3Url = await generateAudio(ssml);
    if (!s3Url) {
      throw new Error("S3のURL生成に失敗しました。");
    }
    await saveTodaysSoundInfo(s3Url);
  } catch (error) {
    console.log("エラー発生");
    console.error(error);
  }
};

main();
