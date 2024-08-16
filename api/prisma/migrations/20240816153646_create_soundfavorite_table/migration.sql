-- CreateTable
CREATE TABLE "SoundFavorite" (
    "userId" INTEGER NOT NULL,
    "soundId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SoundFavorite_userId_soundId_key" ON "SoundFavorite"("userId", "soundId");

-- AddForeignKey
ALTER TABLE "SoundFavorite" ADD CONSTRAINT "SoundFavorite_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "SoundInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundFavorite" ADD CONSTRAINT "SoundFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
