import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";

import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

// [日次]単語リストを作成する
export const generateDailyWordsList = async () => {
  // ChatGPT連携準備
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
  });
  // ChatGPTに単語リスト作成依頼
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "日本語で返答してください。",
      },
      {
        role: "user",
        content:
          "100個の名詞をJSONの配列形式で表示してください。※ただし重複させてはいけません。※改行なしで表示してください。",
      },
    ],
    model: "gpt-3.5-turbo",
  });
  // 返答
  const resContent = chatCompletion.choices[0].message.content;
  if (!resContent) {
    throw new Error("GPTからの返答の文字列がありません");
  }
  // 返答(文字列)から配列部分を抜き出し、それをJavaScriptの配列に変換
  const indexOfStartArr = resContent.indexOf("[");
  const indexOfEndArr = resContent.indexOf("]");
  const wordsList: string[] = JSON.parse(
    resContent.substring(indexOfStartArr, indexOfEndArr + 1),
  );

  return wordsList;
};

// 単語配列を、Amazon Pollyに読み上げを依頼するためのフォーマットであるSSMLに変換
export const wordsToSSML = (words: string[]) => {
  let ssml = "<speak>";
  words.forEach((word) => {
    ssml += `${word}<break time="5s"/>`;
  });
  ssml += "</speak>";

  return ssml;
};

// SSMLをPollyに送信し、音声ファイルの作成 & S3への格納を行う
export const generateAudio = async (ssml: string) => {
  const client = new PollyClient({ region: "ap-northeast-1" });
  const command = new StartSpeechSynthesisTaskCommand({
    Engine: "standard",
    LanguageCode: "ja-JP",
    OutputFormat: "mp3",
    OutputS3BucketName: process.env.S3_BUCKET_NAME,
    Text: ssml,
    TextType: "ssml",
    VoiceId: "Takumi",
  });

  const result = await client.send(command);
  return result.SynthesisTask?.OutputUri;
};

// 本日の音声情報をDBに保存する
export const saveTodaysSoundInfo = async (url: string) => {
  const prisma = new PrismaClient();
  await prisma.soundInfo.create({
    data: {
      name: "本日の音声",
      url,
    },
  });
};
