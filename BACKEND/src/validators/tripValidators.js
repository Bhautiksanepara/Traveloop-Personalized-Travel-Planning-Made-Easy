const { z, paginationSchema, idSchema } = require("./commonValidators");

const tripSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  coverPhotoUrl: z.string().url().optional().nullable(),
  budgetLimit: z.coerce.number().min(0).optional().nullable(),
  slug: z.string().max(80).optional().nullable()
});

const tripUpdateSchema = tripSchema.partial();

const tripQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["all", "upcoming", "ongoing", "completed"]).optional(),
  sortBy: z.enum(["startDate", "endDate", "name", "budgetLimit", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

const itineraryQuerySchema = z.object({
  search: z.string().trim().optional(),
  cityId: idSchema.optional(),
  stopId: idSchema.optional(),
  hasActivities: z.coerce.boolean().optional(),
  dayType: z.enum(["arrival", "departure", "full"]).optional(),
  groupBy: z.enum(["day", "city", "stop"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

const stopSchema = z.object({
  cityId: idSchema,
  arriveDate: z.string().date(),
  departDate: z.string().date(),
  orderIndex: z.number().int().min(0),
  budgetForStop: z.coerce.number().min(0).optional().nullable()
});

const stopUpdateSchema = stopSchema.partial();

const reorderStopsSchema = z.object({
  items: z.array(
    z.object({
      stopId: idSchema,
      orderIndex: z.number().int().min(0)
    })
  ).min(1)
});

const stopActivitySchema = z.object({
  activityId: idSchema,
  scheduledDate: z.string().date().optional().nullable(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  actualCost: z.coerce.number().min(0).optional().nullable(),
  orderIndex: z.number().int().min(0)
});

const stopActivityUpdateSchema = z.object({
  scheduledDate: z.string().date().optional().nullable(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  actualCost: z.coerce.number().min(0).optional().nullable(),
  orderIndex: z.number().int().min(0).optional()
});

const reorderStopActivitiesSchema = z.object({
  items: z.array(
    z.object({
      stopActivityId: idSchema,
      orderIndex: z.number().int().min(0)
    })
  ).min(1)
});

const expenseSchema = z.object({
  stopId: idSchema.optional().nullable(),
  category: z.enum(["transport", "accommodation", "activities", "meals", "other"]),
  label: z.string().max(200).optional().nullable(),
  amount: z.coerce.number().min(0),
  expenseDate: z.string().date(),
  notes: z.string().max(2000).optional().nullable()
});

const expenseUpdateSchema = expenseSchema.partial();

const packingItemSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(["clothing", "documents", "electronics", "toiletries", "medicines", "other"]),
  isPacked: z.boolean().optional(),
  orderIndex: z.number().int().min(0)
});

const packingItemUpdateSchema = packingItemSchema.partial();

const noteSchema = z.object({
  stopId: idSchema.optional().nullable(),
  content: z.string().min(1).max(5000),
  noteDate: z.string().date().optional()
});

const noteUpdateSchema = noteSchema.partial();

const noteQuerySchema = paginationSchema.extend({
  stopId: idSchema.optional()
});

const shareUpdateSchema = z.object({
  isActive: z.boolean()
});

module.exports = {
  tripSchema,
  tripUpdateSchema,
  tripQuerySchema,
  itineraryQuerySchema,
  stopSchema,
  stopUpdateSchema,
  reorderStopsSchema,
  stopActivitySchema,
  stopActivityUpdateSchema,
  reorderStopActivitiesSchema,
  expenseSchema,
  expenseUpdateSchema,
  packingItemSchema,
  packingItemUpdateSchema,
  noteSchema,
  noteUpdateSchema,
  noteQuerySchema,
  shareUpdateSchema
};
