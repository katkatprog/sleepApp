-- CreateTable
CREATE TABLE "SoundReqQueue" (
    "userId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "isMaleVoice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoundReqQueue_pkey" PRIMARY KEY ("userId")
);
