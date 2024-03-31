-- CreateTable
CREATE TABLE "SoundInfo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "isMaleVoice" BOOLEAN,

    CONSTRAINT "SoundInfo_pkey" PRIMARY KEY ("id")
);
