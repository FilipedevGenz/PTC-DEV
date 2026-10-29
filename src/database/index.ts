import { PrismaClient } from "@prisma/client";
import { logger } from "../infra/Logger";

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    logger.info("Successfully connected to database");
  })
  .catch((error) => {
    logger.error("Error connecting to database", error);
  });

export default prisma;
