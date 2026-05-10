const prisma = require("../models/prisma/client");
const { getPagination, buildMeta } = require("../utils/query");

const buildCityWhere = (query) => {
  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { country: { contains: query.search } },
      { region: { contains: query.search } }
    ];
  }

  if (query.country) {
    where.country = { equals: query.country };
  }

  if (query.region) {
    where.region = { equals: query.region };
  }

  return where;
};

const listCities = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = buildCityWhere(query);
  const sortFieldMap = {
    popularity: "popularityScore",
    cost: "costIndex",
    name: "name",
    country: "country"
  };
  const orderBy = {
    [sortFieldMap[query.sortBy] || "popularityScore"]: query.sortOrder || "desc"
  };

  const [total, items] = await Promise.all([
    prisma.city.count({ where }),
    prisma.city.findMany({
      where,
      skip,
      take: limit,
      orderBy
    })
  ]);

  return {
    items,
    meta: buildMeta(page, limit, total)
  };
};

const getCityById = (id) =>
  prisma.city.findUnique({
    where: { id }
  });

const getCityActivities = async (cityId, query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    cityId
  };

  if (query.category) {
    where.category = query.category;
  }

  const [total, items] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        estimatedCost: "asc"
      }
    })
  ]);

  return {
    items,
    meta: buildMeta(page, limit, total)
  };
};

module.exports = {
  listCities,
  getCityById,
  getCityActivities
};
