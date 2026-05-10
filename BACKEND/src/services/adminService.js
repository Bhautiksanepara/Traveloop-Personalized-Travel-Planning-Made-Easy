const prisma = require("../models/prisma/client");
const { getPagination, buildMeta } = require("../utils/query");
const { serializeUser } = require("../utils/serializers");

const getOverview = async () => {
  const [users, trips, cities, activities, publicTrips] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.trip.count(),
    prisma.city.count(),
    prisma.activity.count(),
    prisma.trip.count({ where: { isPublic: true } })
  ]);

  return {
    users,
    trips,
    cities,
    activities,
    publicTrips
  };
};

const listUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } }
    ];
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        trips: true
      }
    })
  ]);

  return {
    items: items.map((user) => ({
      ...serializeUser(user),
      totalTrips: user.trips.length
    })),
    meta: buildMeta(page, limit, total)
  };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      trips: true,
      savedDestinations: {
        include: {
          city: true
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  return {
    ...serializeUser(user),
    trips: user.trips,
    savedDestinations: user.savedDestinations
  };
};

const updateUser = async (id, payload) => {
  const user = await prisma.user.update({
    where: { id },
    data: payload
  });

  return serializeUser(user);
};

const listTrips = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  if (query.userId) {
    where.userId = query.userId;
  }

  const [total, items] = await Promise.all([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: true,
        stops: true
      }
    })
  ]);

  return {
    items: items.map((trip) => ({
      ...trip,
      user: serializeUser(trip.user),
      destinationCount: trip.stops.length
    })),
    meta: buildMeta(page, limit, total)
  };
};

const deleteTrip = (id) =>
  prisma.trip.delete({
    where: { id }
  });

const topCities = async () =>
  prisma.city.findMany({
    take: 10,
    orderBy: {
      tripStops: {
        _count: "desc"
      }
    },
    include: {
      _count: {
        select: {
          tripStops: true
        }
      }
    }
  });

const topActivities = async () =>
  prisma.activity.findMany({
    take: 10,
    orderBy: {
      stopActivities: {
        _count: "desc"
      }
    },
    include: {
      city: true,
      _count: {
        select: {
          stopActivities: true
        }
      }
    }
  });

const engagement = async () =>
  {
    const users = await prisma.user.findMany({
    where: {
      isDeleted: false
    },
    take: 20,
    orderBy: {
      trips: {
        _count: "desc"
      }
    },
    include: {
      _count: {
        select: {
          trips: true
        }
      }
    }
  });

    return users.map((user) => ({
      ...serializeUser(user),
      totalTrips: user._count.trips
    }));
  };

module.exports = {
  getOverview,
  listUsers,
  getUserById,
  updateUser,
  listTrips,
  deleteTrip,
  topCities,
  topActivities,
  engagement
};
