import { PrismaClient } from "@prisma/client";
import express from "express";
const prisma = new PrismaClient();
export const soundInfoRouter = express.Router();

soundInfoRouter.get("/:id", async (req, res) => {
  const numParam = Number(req.params.id);
  if (isNaN(numParam)) {
    return res.status(400).send("Request Param is not valid...");
  }
  try {
    const result = await prisma.soundInfo.findUnique({
      where: { id: numParam },
    });
    if (!result) {
      return res.status(404).send("Sound info was not found...");
    }
    return res.send(result);
  } catch (error) {
    return res.status(500).send("Something went wrong...");
  }
});
