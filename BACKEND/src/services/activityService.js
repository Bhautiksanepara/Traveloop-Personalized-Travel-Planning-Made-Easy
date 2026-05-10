const prisma = require("../models/prisma/client");
const { getPagination, buildMeta } = require("../utils/query");

const listActivities = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  if (query.cityId) {
    where.cityId = query.cityId;
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.maxCost) {
    where.estimatedCost = {
      lte: Number(query.maxCost)
    };
  }

  const [total, items] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        city: true
      }
    })
  ]);

  return {
    items,
    meta: buildMeta(page, limit, total)
  };
};

const getActivityById = (id) =>
  prisma.activity.findUnique({
    where: { id },
    include: {
      city: true
    }
  });

module.exports = {
  listActivities,
  getActivityById
};
