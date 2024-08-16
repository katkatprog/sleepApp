import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
  VoiceId,
} from "@aws-sdk/client-polly";

import { Prisma, PrismaClient, SoundReqQueue } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// [日次]単語リストを作成する
export const generateDailyWordsList = async (theme?: string) => {
  // Gemini連携準備
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = gemini.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: { maxOutputTokens: 1000 }, //過剰生成防止
  });
  // Geminiに単語リスト作成依頼
  const prompt = `${theme ? `「${theme}に関する」` : ``}名詞を無作為に200個表示してください。※カンマ区切りで表示してください。※名詞は、できる限り形状のあるものを選んでください。※重複はできる限り避けてください。※ネガティブな単語はできる限り避けてください。`;
  const result = await model.generateContent(prompt);
  let resContent = result.response.text();
  // 返答
  if (!resContent) {
    throw new Error("Geminiからの返答の文字列がありません");
  }
  console.log(`Geminiからの返答：${resContent}`);

  // 文字列整形
  resContent = resContent.replaceAll(" ", "").replaceAll("\n", "");

  // 返答(文字列)からカンマ区切り部分を抜き出し、それをJavaScriptの配列に変換
  const indexOfStartArr = resContent.indexOf(",");
  const indexOfEndArr = resContent.lastIndexOf(",");
  const wordsList: string[] = resContent
    .substring(indexOfStartArr + 1, indexOfEndArr)
    .split(",");

  console.log(`生成された単語リスト：${wordsList}`);
  console.log(`単語数: ${wordsList.length}`);

  return wordsList;
};

// 単語配列を、Amazon Pollyに読み上げを依頼するためのフォーマットであるSSMLに変換
export const wordsToSSML = (words: string[]) => {
  let ssml = `<speak><prosody rate="95%">`;
  words.forEach((word) => {
    ssml += `${word}<break time="6s"/>`;
  });
  ssml += `</prosody></speak>`;

  return ssml;
};

// SSMLをPollyに送信し、音声ファイルの作成 & S3への格納を行う
export const generateAudio = async (ssml: string, speaker: VoiceId) => {
  console.log(`音声作成を開始します。(読み手：${speaker})`);

  // awsアクセスキー
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  // アクセスキーが空欄ならエラーにする
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("アクセスキーが空欄");
  }

  const client = new PollyClient({
    region: "ap-northeast-1",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  const command = new StartSpeechSynthesisTaskCommand({
    Engine: "neural",
    LanguageCode: "ja-JP",
    OutputFormat: "mp3",
    OutputS3BucketName: process.env.S3_BUCKET_NAME,
    Text: ssml,
    TextType: "ssml",
    VoiceId: speaker,
  });

  const result = await client.send(command);
  const s3Url = result.SynthesisTask?.OutputUri;
  if (!s3Url) {
    throw new Error("音声ファイルの作成に失敗しました。");
  }
  console.log(`音声作成に成功しました。(読み手：${speaker})`);

  return s3Url;
};

// 本日の音声情報をDBに保存する
export const saveTodaysSoundInfo = async (
  url: string,
  isMaleVoice: boolean,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  queueInfo?: SoundReqQueue,
) => {
  await prisma.soundInfo.create({
    data: {
      name: queueInfo ? `「${queueInfo.theme}」に関する音声` : "本日の音声",
      url,
      isMaleVoice,
      reqUserId: queueInfo ? queueInfo.userId : null,
    },
  });
  console.log("音声URLのDB保存が成功しました。");
};

// 配列をシャッフルする
export const arrayShuffle = (inArray: string[]) => {
  const tmpArray = [...inArray]; // 引数の配列をコピー(関数の呼び出し元に影響が出ないようにコピーする)
  const outArray: string[] = []; // 出力用の配列

  // ランダムに配列番号を指定、その配列番号の値をtmpArrayからoutArrayの末尾に移動
  // それをtmpArrayの長さが０になるまで繰り返す
  while (tmpArray.length > 0) {
    const indexMoveVal = Math.floor(Math.random() * tmpArray.length);
    outArray.push(tmpArray[indexMoveVal]);
    tmpArray.splice(indexMoveVal, 1);
  }
  return outArray;
};
