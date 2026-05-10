const app = require("./app");
const env = require("./config/env");
const prisma = require("./models/prisma/client");

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`${env.appName} listening on port ${env.port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
