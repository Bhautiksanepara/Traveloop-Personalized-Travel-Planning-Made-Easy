const { Prisma } = require("@prisma/client");
const AppError = require("../utils/appError");
const { sendError } = require("../utils/apiResponse");

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let normalized = error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      normalized = new AppError(409, "Resource already exists.", error.meta);
    } else if (error.code === "P2025") {
      normalized = new AppError(404, "Requested resource was not found.");
    } else {
      normalized = new AppError(400, "Database request failed.", error.meta);
    }
  }

  const statusCode = normalized.statusCode || 500;
  const message = normalized.message || "Something went wrong.";
  const details =
    normalized.details !== null && normalized.details !== undefined
      ? normalized.details
      : process.env.NODE_ENV === "development"
        ? normalized.stack
        : undefined;

  return sendError(res, statusCode, message, details);
};

module.exports = errorHandler;
