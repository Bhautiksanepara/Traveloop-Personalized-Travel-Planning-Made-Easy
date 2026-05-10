const prisma = require("../models/prisma/client");
const AppError = require("../utils/appError");
const { getPagination, buildMeta } = require("../utils/query");
const { serializeUser } = require("../utils/serializers");

const getProfile = async (userId) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false
    }
  });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  return serializeUser(user);
};

const updateProfile = async (userId, payload) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload
  });

  return serializeUser(user);
};

const deleteAccount = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true
    }
  });

  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

const listSavedDestinations = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const where = { userId };

  const [total, records] = await Promise.all([
    prisma.savedDestination.count({ where }),
    prisma.savedDestination.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        savedAt: "desc"
      },
      include: {
        city: true
      }
    })
  ]);

  return {
    items: records,
    meta: buildMeta(page, limit, total)
  };
};

const addSavedDestination = async (userId, cityId) => {
  const existing = await prisma.savedDestination.findFirst({
    where: {
      userId,
      cityId
    },
    include: {
      city: true
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.savedDestination.create({
    data: {
      userId,
      cityId
    },
    include: {
      city: true
    }
  });
};

const removeSavedDestination = async (userId, cityId) => {
  await prisma.savedDestination.delete({
    where: {
      userId_cityId: {
        userId,
        cityId
      }
    }
  });
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  listSavedDestinations,
  addSavedDestination,
  removeSavedDestination
};
