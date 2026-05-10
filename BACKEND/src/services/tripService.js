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

const formatTrip = (trip) => ({
  ...trip,
  budgetLimit: toNumber(trip.budgetLimit)
});

const listTrips = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    userId
  };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { description: { contains: query.search } }
    ];
  }

  const [total, items] = await Promise.all([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        startDate: "desc"
      },
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

  return prisma.stopActivity.create({
    data: {
      stopId,
      activityId: payload.activityId,
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
  await ensureStopBelongsToTrip(tripId, stopId);

  const stopActivity = await prisma.stopActivity.findFirst({
    where: {
      id: stopActivityId,
      stopId
    }
  });

  if (!stopActivity) {
    throw new AppError(404, "Stop activity not found.");
  }

  return prisma.stopActivity.update({
    where: { id: stopActivityId },
    data: {
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

const getItinerary = async (tripId, userId) => {
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
  trip.stops.forEach((stop) => {
    const current = new Date(stop.arriveDate);
    const end = new Date(stop.departDate);

    while (current <= end) {
      days.push({
        date: current.toISOString().slice(0, 10),
        city: stop.city,
        stopId: stop.id,
        activities: stop.activities.map((item) => ({
          id: item.id,
          orderIndex: item.orderIndex,
          scheduledTime: formatTime(item.scheduledTime),
          actualCost: toNumber(item.actualCost),
          activity: {
            ...item.activity,
            estimatedCost: toNumber(item.activity.estimatedCost)
          }
        }))
      });

      current.setUTCDate(current.getUTCDate() + 1);
    }
  });

  return {
    trip: formatTrip(trip),
    days
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
  const shared = await getPublicTrip(token);
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
