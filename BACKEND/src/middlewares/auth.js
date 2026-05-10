const prisma = require("../models/prisma/client");
const AppError = require("../utils/appError");
const { verifyAccessToken } = require("../utils/token");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError(401, "Authentication token is required."));
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        isDeleted: false
      }
    });

    if (!user) {
      return next(new AppError(401, "User session is invalid."));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new AppError(401, "Authentication token is invalid or expired."));
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return next(new AppError(403, "Admin access is required."));
  }

  return next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
