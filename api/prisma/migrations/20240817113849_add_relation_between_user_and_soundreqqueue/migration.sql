-- AddForeignKey
ALTER TABLE "SoundReqQueue" ADD CONSTRAINT "SoundReqQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
