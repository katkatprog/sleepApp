import { SoundInfo } from "@prisma/client"
import { prismaMock } from "../prisma/singleton"
import request from "supertest"
import { app } from "../app"

test('should create new user ', async () => {
  const sInfo:SoundInfo = {
    id: 1,
    name:"test",
    createdAt: (new Date(0)).toString() as unknown as Date,
    url:"sampleurl",
    isMaleVoice: true,
    playCount:0
  }

  prismaMock.soundInfo.findUnique.mockResolvedValue(sInfo)
  prismaMock.soundInfo.update.mockResolvedValue({...sInfo, playCount: 1})

  const res = await request(app).get("/sound-info/single/1")
  expect(res.status).toBe(200)
  expect(res.body).toEqual({...sInfo, playCount: 1})
})

