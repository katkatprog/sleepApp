import { PrismaClient } from ".prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  if (!process.env.TEST_SOUND_URL) {
    throw new Error("urlが空白");
  }
  console.log("start seed...");
  await prisma.soundInfo.createMany({
    data: [
      {
        name: "本日の音声",
        isMaleVoice: true,
        url: process.env.TEST_SOUND_URL,
      },
      {
        name: "本日の音声",
        isMaleVoice: true,
        url: process.env.TEST_SOUND_URL,
      },
      {
        name: "本日の音声",
        isMaleVoice: true,
        url: process.env.TEST_SOUND_URL,
      },
    ],
  });
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("end seed...");
    await prisma.$disconnect();
  });
