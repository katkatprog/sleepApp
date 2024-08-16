-- AddForeignKey
ALTER TABLE "SoundInfo" ADD CONSTRAINT "SoundInfo_reqUserId_fkey" FOREIGN KEY ("reqUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
