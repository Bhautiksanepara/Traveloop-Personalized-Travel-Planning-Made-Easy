const { v4: uuidv4 } = require("uuid");
const prisma = require("../models/prisma/client");
const AppError = require("../utils/appError");
const { getPagination, buildMeta } = require("../utils/query");
const { toDateOnly, toSqlTimeDate, formatTime } = require("../utils/dateTime");
const { toNumber, serializeUser } = require("../utils/serializers");

const ensureTripOwner = async (tripId, userId) => {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId
    }
  });

  if (!trip) {
    throw new AppError(404, "Trip not found.");
  }

  return trip;
};

const ensureStopBelongsToTrip = async (tripId, stopId) => {
  const stop = await prisma.tripStop.findFirst({
    where: {
      id: stopId,
      tripId
    },
    include: {
      city: true
    }
  });

  if (!stop) {
    throw new AppError(404, "Trip stop not found.");
  }

  return stop;
};

const assertStopWithinTripDates = (trip, arriveDate, departDate) => {
  const tripStart = new Date(trip.startDate);
  const tripEnd = new Date(trip.endDate);

  if (arriveDate < tripStart || departDate > tripEnd || departDate < arriveDate) {
    throw new AppError(400, "Stop dates must fall within the trip date range.");
  }
};

const assertDateWithinStopRange = (stop, scheduledDate) => {
  if (!scheduledDate) {
    return;
  }

  const stopStart = new Date(stop.arriveDate);
  const stopEnd = new Date(stop.departDate);

  if (scheduledDate < stopStart || scheduledDate > stopEnd) {
    throw new AppError(400, "Scheduled activity date must fall within the selected stop date range.");
  }
};

const formatTrip = (trip) => ({
  ...trip,
  budgetLimit: toNumber(trip.budgetLimit)
});

const getInclusiveDates = (startDateValue, endDateValue) => {
  const dates = [];
  const current = new Date(startDateValue);
  const end = new Date(endDateValue);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};

const distributeActivitiesAcrossDays = (activities, dayCount) => {
  if (!dayCount) {
    return [];
  }

  const buckets = Array.from({ length: dayCount }, () => []);

  if (!activities.length) {
    return buckets;
  }

  const targetPerDay = Math.max(Math.ceil(activities.length / dayCount), 1);

  activities.forEach((activity, index) => {
    const dayIndex = Math.min(Math.floor(index / targetPerDay), dayCount - 1);
    buckets[dayIndex].push(activity);
  });

  return buckets;
};

const sortDays = (days, sortOrder = "asc") => {
  const direction = sortOrder === "desc" ? -1 : 1;

  return [...days].sort((left, right) => {
    const leftTime = new Date(left.date).getTime();
    const rightTime = new Date(right.date).getTime();

    if (leftTime !== rightTime) {
      return (leftTime - rightTime) * direction;
    }

    return (left.dayNumber - right.dayNumber) * direction;
  });
};

const buildItineraryGroups = (days, groupBy) => {
  if (groupBy === "day") {
    return days.map((day) => ({
      key: `${day.stopId}-${day.date}`,
      label: `Day ${day.dayNumber}`,
      secondaryLabel: `${day.city?.name || "City"} • ${day.date}`,
      type: "day",
      items: [day]
    }));
  }

  const buckets = new Map();

  days.forEach((day) => {
    const key = groupBy === "city" ? day.city?.id || day.city?.name || day.stopId : day.stopId;
    const existing = buckets.get(key);

    if (existing) {
      existing.items.push(day);
      return;
    }

    buckets.set(key, {
      key,
      label: groupBy === "city" ? day.city?.name || "Unknown City" : `${day.city?.name || "Stop"} stop`,
      secondaryLabel:
        groupBy === "city"
          ? `${day.city?.country || ""}`.trim()
          : `${day.stopDateRange?.arriveDate || ""} - ${day.stopDateRange?.departDate || ""}`.trim(),
      type: groupBy,
      items: [day]
    });
  });

  return [...buckets.values()];
};

const formatPublicTripCard = (sharedTrip) => {
  const stops = sharedTrip.trip?.stops || [];
  const uniqueCities = [...new Set(stops.map((stop) => stop.city?.name).filter(Boolean))];

  return {
    id: sharedTrip.id,
    publicToken: sharedTrip.publicToken,
    viewCount: sharedTrip.viewCount,
    createdAt: sharedTrip.createdAt,
    updatedAt: sharedTrip.updatedAt,
    trip: {
      id: sharedTrip.trip.id,
      name: sharedTrip.trip.name,
      description: sharedTrip.trip.description,
      startDate: sharedTrip.trip.startDate,
      endDate: sharedTrip.trip.endDate,
      coverPhotoUrl: sharedTrip.trip.coverPhotoUrl,
      budgetLimit: toNumber(sharedTrip.trip.budgetLimit),
      slug: sharedTrip.trip.slug,
      user: serializeUser(sharedTrip.trip.user),
      stopsCount: stops.length,
      activitiesCount: stops.reduce((sum, stop) => sum + stop.activities.length, 0),
      cities: uniqueCities.slice(0, 4)
    }
  };
};

const findSharedTripByToken = async (token) => {
  const shared = await prisma.sharedTrip.findFirst({
    where: {
      publicToken: token,
      isActive: true
    },
    include: {
      trip: {
        include: {
          user: true,
          stops: {
            include: {
              city: true,
              activities: {
                include: {
                  activity: true
                },
                orderBy: {
                  orderIndex: "asc"
                }
              }
            },
            orderBy: {
              orderIndex: "asc"
            }
          },
          packingItems: {
            orderBy: {
              orderIndex: "asc"
            }
          },
          notes: {
            orderBy: {
              noteDate: "desc"
            }
          }
        }
      }
    }
  });

  if (!shared) {
    throw new AppError(404, "Shared trip not found or inactive.");
  }

  return shared;
};

const listTrips = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    userId
  };
  const now = new Date();

  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { description: { contains: query.search } }
    ];
  }

  if (query.status === "upcoming") {
    where.startDate = { gt: now };
  }

  if (query.status === "ongoing") {
    where.startDate = { lte: now };
    where.endDate = { gte: now };
  }

  if (query.status === "completed") {
    where.endDate = { lt: now };
  }

  const sortFieldMap = {
    startDate: "startDate",
    endDate: "endDate",
    name: "name",
    budgetLimit: "budgetLimit",
    createdAt: "createdAt"
  };
  const orderBy = {
    [sortFieldMap[query.sortBy] || "startDate"]: query.sortOrder || "desc"
  };

  const [total, items] = await Promise.all([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        stops: true
      }
    })
  ]);

  return {
    items: items.map((trip) => ({
      ...formatTrip(trip),
      destinationCount: trip.stops.length
    })),
    meta: buildMeta(page, limit, total)
  };
};

const createTrip = async (userId, payload) => {
  const trip = await prisma.trip.create({
    data: {
      userId,
      name: payload.name,
      description: payload.description,
      startDate: toDateOnly(payload.startDate),
      endDate: toDateOnly(payload.endDate),
      coverPhotoUrl: payload.coverPhotoUrl,
      budgetLimit: payload.budgetLimit,
      slug: payload.slug || null
    }
  });

  return formatTrip(trip);
};

const listPublicTrips = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    isActive: true,
    trip: query.search
      ? {
          OR: [
            { name: { contains: query.search } },
            { description: { contains: query.search } },
            {
              stops: {
                some: {
                  city: {
                    OR: [{ name: { contains: query.search } }, { country: { contains: query.search } }]
                  }
                }
              }
            }
          ]
        }
      : undefined
  };

  const [total, items] = await Promise.all([
    prisma.sharedTrip.count({ where }),
    prisma.sharedTrip.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      include: {
        trip: {
          include: {
            user: true,
            stops: {
              include: {
                city: true,
                activities: true
              },
              orderBy: {
                orderIndex: "asc"
              }
            }
          }
        }
      }
    })
  ]);

  return {
    items: items.map(formatPublicTripCard),
    meta: buildMeta(page, limit, total)
  };
};

const getTripById = async (tripId, userId) => {
  await ensureTripOwner(tripId, userId);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        include: {
          city: true,
          activities: {
            include: {
              activity: true
            },
            orderBy: {
              orderIndex: "asc"
            }
          }
        },
        orderBy: {
          orderIndex: "asc"
        }
      },
      expenses: true,
      packingItems: {
        orderBy: {
          orderIndex: "asc"
        }
      },
      notes: {
        orderBy: {
          noteDate: "desc"
        }
      },
      sharedTrip: true
    }
  });

  return formatTrip(trip);
};

const updateTrip = async (tripId, userId, payload) => {
  await ensureTripOwner(tripId, userId);

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      ...payload,
      startDate: payload.startDate ? toDateOnly(payload.startDate) : undefined,
      endDate: payload.endDate ? toDateOnly(payload.endDate) : undefined
    }
  });

  return formatTrip(trip);
};

const deleteTrip = async (tripId, userId) => {
  await ensureTripOwner(tripId, userId);
  await prisma.trip.delete({
    where: { id: tripId }
  });
};

const addStop = async (tripId, userId, payload) => {
  const trip = await ensureTripOwner(tripId, userId);
  const arriveDate = toDateOnly(payload.arriveDate);
  const departDate = toDateOnly(payload.departDate);
  assertStopWithinTripDates(trip, arriveDate, departDate);

  return prisma.tripStop.create({
    data: {
      tripId,
      cityId: payload.cityId,
      arriveDate,
      departDate,
      orderIndex: payload.orderIndex,
      budgetForStop: payload.budgetForStop
    },
    include: {
      city: true
    }
  });
};

const updateStop = async (tripId, stopId, userId, payload) => {
  const trip = await ensureTripOwner(tripId, userId);
  const existingStop = await ensureStopBelongsToTrip(tripId, stopId);

  const arriveDate = payload.arriveDate ? toDateOnly(payload.arriveDate) : existingStop.arriveDate;
  const departDate = payload.departDate ? toDateOnly(payload.departDate) : existingStop.departDate;
  assertStopWithinTripDates(trip, arriveDate, departDate);

  return prisma.tripStop.update({
    where: { id: stopId },
    data: {
      cityId: payload.cityId,
      arriveDate,
      departDate,
      orderIndex: payload.orderIndex,
      budgetForStop: payload.budgetForStop
    },
    include: {
      city: true
    }
  });
};

const deleteStop = async (tripId, stopId, userId) => {
  await ensureTripOwner(tripId, userId);
  await ensureStopBelongsToTrip(tripId, stopId);
  await prisma.tripStop.delete({
    where: { id: stopId }
  });
};

const reorderStops = async (tripId, userId, items) => {
  await ensureTripOwner(tripId, userId);

  await prisma.$transaction(
    items.map((item) =>
      prisma.tripStop.update({
        where: { id: item.stopId },
        data: { orderIndex: item.orderIndex }
      })
    )
  );
};

const addStopActivity = async (tripId, stopId, userId, payload) => {
  await ensureTripOwner(tripId, userId);
  const stop = await ensureStopBelongsToTrip(tripId, stopId);
  const activity = await prisma.activity.findUnique({
    where: {
      id: payload.activityId
    }
  });

  if (!activity) {
    throw new AppError(404, "Activity not found.");
  }

  if (activity.cityId !== stop.cityId) {
    throw new AppError(400, "Activity must belong to the same city as the selected stop.");
  }

  const scheduledDate = payload.scheduledDate ? toDateOnly(payload.scheduledDate) : null;
  assertDateWithinStopRange(stop, scheduledDate);

  return prisma.stopActivity.create({
    data: {
      stopId,
      activityId: payload.activityId,
      scheduledDate,
      scheduledTime: payload.scheduledTime ? toSqlTimeDate(payload.scheduledTime) : null,
      actualCost: payload.actualCost,
      orderIndex: payload.orderIndex
    },
    include: {
      activity: true
    }
  });
};

const updateStopActivity = async (tripId, stopId, stopActivityId, userId, payload) => {
  await ensureTripOwner(tripId, userId);
  const stop = await ensureStopBelongsToTrip(tripId, stopId);

  const stopActivity = await prisma.stopActivity.findFirst({
    where: {
      id: stopActivityId,
      stopId
    }
  });

  if (!stopActivity) {
    throw new AppError(404, "Stop activity not found.");
  }

  const scheduledDate =
    payload.scheduledDate === null
      ? null
      : payload.scheduledDate
        ? toDateOnly(payload.scheduledDate)
        : undefined;

  if (scheduledDate !== undefined) {
    assertDateWithinStopRange(stop, scheduledDate);
  }

  return prisma.stopActivity.update({
    where: { id: stopActivityId },
    data: {
      scheduledDate,
      scheduledTime: payload.scheduledTime ? toSqlTimeDate(payload.scheduledTime) : undefined,
      actualCost: payload.actualCost,
      orderIndex: payload.orderIndex
    },
    include: {
      activity: true
    }
  });
};

const deleteStopActivity = async (tripId, stopId, stopActivityId, userId) => {
  await ensureTripOwner(tripId, userId);
  await ensureStopBelongsToTrip(tripId, stopId);

  await prisma.stopActivity.deleteMany({
    where: {
      id: stopActivityId,
      stopId
    }
  });
};

const reorderStopActivities = async (tripId, stopId, userId, items) => {
  await ensureTripOwner(tripId, userId);
  await ensureStopBelongsToTrip(tripId, stopId);

  await prisma.$transaction(
    items.map((item) =>
      prisma.stopActivity.update({
        where: { id: item.stopActivityId },
        data: { orderIndex: item.orderIndex }
      })
    )
  );
};

const getItinerary = async (tripId, userId, query = {}) => {
  await ensureTripOwner(tripId, userId);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        orderBy: {
          orderIndex: "asc"
        },
        include: {
          city: true,
          activities: {
            orderBy: {
              orderIndex: "asc"
            },
            include: {
              activity: true
            }
          }
        }
      }
    }
  });

  const days = [];
  let dayNumber = 1;

  trip.stops.forEach((stop, stopIndex) => {
    const stopDates = getInclusiveDates(stop.arriveDate, stop.departDate);
    const normalizedActivities = stop.activities.map((item) => ({
      id: item.id,
      orderIndex: item.orderIndex,
      scheduledDate: item.scheduledDate ? item.scheduledDate.toISOString().slice(0, 10) : null,
      scheduledTime: formatTime(item.scheduledTime),
      actualCost: toNumber(item.actualCost),
      activity: {
        ...item.activity,
        estimatedCost: toNumber(item.activity.estimatedCost)
      }
    }));
    const datedBuckets = Array.from({ length: stopDates.length }, () => []);
    const flexibleActivities = [];

    normalizedActivities.forEach((activity) => {
      if (activity.scheduledDate) {
        const dayIndex = stopDates.findIndex((date) => date === activity.scheduledDate);

        if (dayIndex >= 0) {
          datedBuckets[dayIndex].push(activity);
          return;
        }
      }

      flexibleActivities.push(activity);
    });

    const flexibleBuckets = distributeActivitiesAcrossDays(flexibleActivities, stopDates.length);

    stopDates.forEach((date, dateIndex) => {
      const dayActivities = [...datedBuckets[dateIndex], ...flexibleBuckets[dateIndex]].sort(
        (left, right) => left.orderIndex - right.orderIndex
      );

      days.push({
        date,
        dayNumber,
        city: stop.city,
        stopId: stop.id,
        stopOrder: stopIndex + 1,
        stopDateRange: {
          arriveDate: stop.arriveDate,
          departDate: stop.departDate
        },
        isArrivalDay: dateIndex === 0,
        isDepartureDay: dateIndex === stopDates.length - 1,
        activities: dayActivities
      });

      dayNumber += 1;
    });
  });

  const normalizedSearch = query.search?.trim().toLowerCase();
  let filteredDays = days.filter((day) => {
    if (query.cityId && day.city?.id !== query.cityId) {
      return false;
    }

    if (query.stopId && day.stopId !== query.stopId) {
      return false;
    }

    if (query.hasActivities !== undefined) {
      const hasActivities = day.activities.length > 0;
      if (hasActivities !== query.hasActivities) {
        return false;
      }
    }

    if (query.dayType === "arrival" && !day.isArrivalDay) {
      return false;
    }

    if (query.dayType === "departure" && !day.isDepartureDay) {
      return false;
    }

    if (query.dayType === "full" && (day.isArrivalDay || day.isDepartureDay)) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      day.city?.name?.toLowerCase().includes(normalizedSearch) ||
      day.city?.country?.toLowerCase().includes(normalizedSearch) ||
      day.activities.some(
        (item) =>
          item.activity.name.toLowerCase().includes(normalizedSearch) ||
          item.activity.category.toLowerCase().includes(normalizedSearch)
      )
    );
  });

  filteredDays = sortDays(filteredDays, query.sortOrder || "asc");
  const groupBy = query.groupBy || "day";

  return {
    trip: formatTrip(trip),
    query: {
      search: query.search || "",
      cityId: query.cityId || "",
      stopId: query.stopId || "",
      hasActivities: query.hasActivities,
      dayType: query.dayType || "",
      groupBy,
      sortOrder: query.sortOrder || "asc"
    },
    summary: {
      totalDays: filteredDays.length,
      totalStops: new Set(filteredDays.map((day) => day.stopId)).size,
      totalActivities: filteredDays.reduce((sum, day) => sum + day.activities.length, 0)
    },
    filters: {
      cities: trip.stops.map((stop) => ({
        id: stop.city.id,
        name: stop.city.name,
        country: stop.city.country
      })),
      stops: trip.stops.map((stop) => ({
        id: stop.id,
        cityId: stop.cityId,
        cityName: stop.city.name,
        arriveDate: stop.arriveDate,
        departDate: stop.departDate
      }))
    },
    days: filteredDays,
    groups: buildItineraryGroups(filteredDays, groupBy)
  };
};

const calculateBudgetSummary = async (tripId, userId) => {
  const trip = await ensureTripOwner(tripId, userId);
  const expenses = await prisma.tripExpense.findMany({
    where: { tripId }
  });

  const summary = {
    budgetLimit: toNumber(trip.budgetLimit) || 0,
    totalSpent: 0,
    remaining: 0,
    averageCostPerDay: 0,
    categories: {
      transport: 0,
      accommodation: 0,
      activities: 0,
      meals: 0,
      other: 0
    }
  };

  expenses.forEach((expense) => {
    const amount = toNumber(expense.amount);
    summary.totalSpent += amount;
    summary.categories[expense.category] = (summary.categories[expense.category] || 0) + amount;
  });

  const tripDays =
    Math.floor((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1;

  summary.remaining = summary.budgetLimit - summary.totalSpent;
  summary.averageCostPerDay = tripDays > 0 ? Number((summary.totalSpent / tripDays).toFixed(2)) : 0;

  return summary;
};

const listExpenses = async (tripId, userId) => {
  await ensureTripOwner(tripId, userId);
  return prisma.tripExpense.findMany({
    where: { tripId },
    orderBy: {
      expenseDate: "desc"
    }
  });
};

const createExpense = async (tripId, userId, payload) => {
  await ensureTripOwner(tripId, userId);

  if (payload.stopId) {
    await ensureStopBelongsToTrip(tripId, payload.stopId);
  }

  return prisma.tripExpense.create({
    data: {
      tripId,
      stopId: payload.stopId,
      category: payload.category,
      label: payload.label,
      amount: payload.amount,
      expenseDate: toDateOnly(payload.expenseDate),
      notes: payload.notes
    }
  });
};

const updateExpense = async (tripId, expenseId, userId, payload) => {
  await ensureTripOwner(tripId, userId);
  if (payload.stopId) {
    await ensureStopBelongsToTrip(tripId, payload.stopId);
  }

  return prisma.tripExpense.update({
    where: { id: expenseId },
    data: {
      stopId: payload.stopId,
      category: payload.category,
      label: payload.label,
      amount: payload.amount,
      expenseDate: payload.expenseDate ? toDateOnly(payload.expenseDate) : undefined,
      notes: payload.notes
    }
  });
};

const deleteExpense = async (tripId, expenseId, userId) => {
  await ensureTripOwner(tripId, userId);
  await prisma.tripExpense.deleteMany({
    where: {
      id: expenseId,
      tripId
    }
  });
};

const listPackingItems = async (tripId, userId) => {
  await ensureTripOwner(tripId, userId);
  return prisma.packingItem.findMany({
    where: { tripId },
    orderBy: [{ category: "asc" }, { orderIndex: "asc" }]
  });
};

const createPackingItem = async (tripId, userId, payload) => {
  await ensureTripOwner(tripId, userId);
  return prisma.packingItem.create({
    data: {
      tripId,
      name: payload.name,
      category: payload.category,
      isPacked: payload.isPacked || false,
      orderIndex: payload.orderIndex
    }
  });
};

const updatePackingItem = async (tripId, itemId, userId, payload) => {
  await ensureTripOwner(tripId, userId);
  return prisma.packingItem.update({
    where: { id: itemId },
    data: payload
  });
};

const deletePackingItem = async (tripId, itemId, userId) => {
  await ensureTripOwner(tripId, userId);
  await prisma.packingItem.deleteMany({
    where: {
      id: itemId,
      tripId
    }
  });
};

const resetPackingItems = async (tripId, userId) => {
  await ensureTripOwner(tripId, userId);
  await prisma.packingItem.updateMany({
    where: { tripId },
    data: { isPacked: false }
  });
};

const listNotes = async (tripId, userId, query) => {
  await ensureTripOwner(tripId, userId);
  const { page, limit, skip } = getPagination(query);
  const where = { tripId };

  if (query.stopId) {
    where.stopId = query.stopId;
  }

  const [total, items] = await Promise.all([
    prisma.tripNote.count({ where }),
    prisma.tripNote.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        noteDate: "desc"
      }
    })
  ]);

  return {
    items,
    meta: buildMeta(page, limit, total)
  };
};

const createNote = async (tripId, userId, payload) => {
  await ensureTripOwner(tripId, userId);
  if (payload.stopId) {
    await ensureStopBelongsToTrip(tripId, payload.stopId);
  }

  return prisma.tripNote.create({
    data: {
      tripId,
      stopId: payload.stopId,
      content: payload.content,
      noteDate: payload.noteDate ? toDateOnly(payload.noteDate) : undefined
    }
  });
};

const updateNote = async (tripId, noteId, userId, payload) => {
  await ensureTripOwner(tripId, userId);
  if (payload.stopId) {
    await ensureStopBelongsToTrip(tripId, payload.stopId);
  }

  return prisma.tripNote.update({
    where: { id: noteId },
    data: {
      stopId: payload.stopId,
      content: payload.content,
      noteDate: payload.noteDate ? toDateOnly(payload.noteDate) : undefined
    }
  });
};

const deleteNote = async (tripId, noteId, userId) => {
  await ensureTripOwner(tripId, userId);
  await prisma.tripNote.deleteMany({
    where: {
      id: noteId,
      tripId
    }
  });
};

const createShare = async (tripId, userId) => {
  await ensureTripOwner(tripId, userId);
  return prisma.sharedTrip.upsert({
    where: {
      tripId
    },
    update: {
      isActive: true,
      publicToken: `TL-${uuidv4().replace(/-/g, "").slice(0, 20)}`
    },
    create: {
      tripId,
      publicToken: `TL-${uuidv4().replace(/-/g, "").slice(0, 20)}`,
      isActive: true
    }
  });
};

const updateShare = async (tripId, userId, payload) => {
  await ensureTripOwner(tripId, userId);
  return prisma.sharedTrip.update({
    where: {
      tripId
    },
    data: {
      isActive: payload.isActive
    }
  });
};

const deleteShare = async (tripId, userId) => {
  await ensureTripOwner(tripId, userId);
  await prisma.sharedTrip.deleteMany({
    where: {
      tripId
    }
  });
};

const getPublicTrip = async (token) => {
  const shared = await findSharedTripByToken(token);

  await prisma.sharedTrip.update({
    where: { id: shared.id },
    data: {
      viewCount: {
        increment: 1
      }
    }
  });

  return {
    ...shared,
    trip: {
      ...shared.trip,
      budgetLimit: toNumber(shared.trip.budgetLimit),
      user: serializeUser(shared.trip.user)
    }
  };
};

const copyPublicTrip = async (token, userId) => {
  const shared = await findSharedTripByToken(token);
  const sourceTrip = shared.trip;

  return prisma.$transaction(async (tx) => {
    const newTrip = await tx.trip.create({
      data: {
        userId,
        name: `${sourceTrip.name} (Copy)`,
        description: sourceTrip.description,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        coverPhotoUrl: sourceTrip.coverPhotoUrl,
        budgetLimit: sourceTrip.budgetLimit,
        isPublic: false,
        slug: null
      }
    });

    const stopMap = new Map();

    for (const stop of sourceTrip.stops) {
      const createdStop = await tx.tripStop.create({
        data: {
          tripId: newTrip.id,
          cityId: stop.cityId,
          arriveDate: stop.arriveDate,
          departDate: stop.departDate,
          orderIndex: stop.orderIndex,
          budgetForStop: stop.budgetForStop
        }
      });

      stopMap.set(stop.id, createdStop.id);

      for (const stopActivity of stop.activities) {
        await tx.stopActivity.create({
          data: {
            stopId: createdStop.id,
            activityId: stopActivity.activityId,
            scheduledDate: stopActivity.scheduledDate,
            scheduledTime: stopActivity.scheduledTime,
            actualCost: stopActivity.actualCost,
            orderIndex: stopActivity.orderIndex
          }
        });
      }
    }

    for (const item of sourceTrip.packingItems) {
      await tx.packingItem.create({
        data: {
          tripId: newTrip.id,
          name: item.name,
          category: item.category,
          isPacked: false,
          orderIndex: item.orderIndex
        }
      });
    }

    for (const note of sourceTrip.notes) {
      await tx.tripNote.create({
        data: {
          tripId: newTrip.id,
          stopId: note.stopId ? stopMap.get(note.stopId) : null,
          content: note.content,
          noteDate: note.noteDate
        }
      });
    }

    return newTrip;
  });
};

module.exports = {
  listTrips,
  createTrip,
  listPublicTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addStop,
  updateStop,
  deleteStop,
  reorderStops,
  addStopActivity,
  updateStopActivity,
  deleteStopActivity,
  reorderStopActivities,
  getItinerary,
  calculateBudgetSummary,
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  listPackingItems,
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
  resetPackingItems,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  createShare,
  updateShare,
  deleteShare,
  getPublicTrip,
  copyPublicTrip
};
