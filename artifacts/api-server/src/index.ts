import app from "./app";
import { logger } from "./lib/logger";
import { createSchema } from "./db/legacy-schema";
import { seedDatabase } from "./db/legacy-seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const start = async () => {
  try {
    await createSchema();
    await seedDatabase();
  } catch (error) {
    logger.error({ err: error }, "Database setup failed");
    process.exit(1);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
};

start();
