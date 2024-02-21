import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";

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
