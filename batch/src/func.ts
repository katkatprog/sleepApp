import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
  VoiceId,
} from "@aws-sdk/client-polly";

import { Prisma, PrismaClient, SoundReqQueue } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { exec } from "child_process";
import * as fs from "fs";

// 単語リストを作成する
// 引数themeあり：テーマ指定ありの音声作成、なし：テーマ指定無しの音声生成（本日の音声）
export const generateWordsList = async (theme?: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("環境変数のGeminiのAPIキーが空欄です");
  }
  // Gemini連携準備
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
  let wordsList = resContent.split(/[,、]/);
  wordsList.shift(); //一番最初のカンマより前の要素は削除
  wordsList.pop(); //一番最後のカンマより後の要素は削除

  // 生成された単語のうち1文字のものをひらがな化の対象としてフィルター（1文字の単語が最も訓読み、音読みの読み間違いが起きやすいため）
  // 下記のtry-catchでひらがな化を行う
  let hiraWordsList = wordsList.filter((word) => word.length === 1);

  try {
    // 漢字の単語リストをファイルに書き込む(,でつなげた文字列を書き込む)
    fs.writeFileSync("tmpWords/inout.txt", hiraWordsList.join(","));

    // pythonスクリプトを実行し、ファイルに書き出した漢字の単語リストをひらがなに変換する
    await new Promise((resolve, reject) => {
      exec(
        ". /path/to/venv/bin/activate && python3 src/convertToHiragana.py && deactivate",
        (error) => {
          if (error) {
            reject();
          } else {
            resolve("");
          }
        },
      );
    });

    // ひらがなの単語リストをファイルから読み込む
    const strHiraWordsList = fs.readFileSync("tmpWords/inout.txt", {
      encoding: "utf-8",
    });

    // 漢字の単語リスト(ひらがな化実行前)とひらがなの単語リストの長さを見比べ、長さが一致していたら変換成功と判断する
    if (hiraWordsList.length === strHiraWordsList.split(",").length) {
      hiraWordsList = strHiraWordsList.split(",");
    } else {
      throw new Error("");
    }
  } catch {
    console.log("単語リストのひらがな化に失敗したため、漢字のまま進みます。");
  }

  wordsList = [
    ...hiraWordsList, //ひらがな化した単語リスト
    ...wordsList.filter((word) => word.length > 1), //ひらがな化をスキップした2文字以上の単語リスト
  ];

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
    OutputS3BucketName: process.env.S3_BUCKET_SOUND,
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
// 引数queueInfoあり：テーマ指定ありの音声作成、なし：テーマ指定無しの音声生成（本日の音声）
export const saveSoundInfo = async (
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

// S3のURLをCloudFrontのURLに変換する
export const changeToCloudfrontUrl = (
  s3Url: string,
  cloudfrontDomain: string,
) => {
  const tmpArray = s3Url.split("/");
  const fileName = tmpArray[tmpArray.length - 1];

  return `${cloudfrontDomain}/${fileName}`;
};
