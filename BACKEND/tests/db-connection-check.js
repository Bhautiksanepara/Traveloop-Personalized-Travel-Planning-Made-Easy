const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Checking database connection...");

    const result = await prisma.$queryRawUnsafe("SELECT 1 AS connected");

    console.log("Database connection successful.");
    console.log("Result:", result);
    process.exitCode = 0;
  } catch (error) {
    console.error("Database connection failed.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
