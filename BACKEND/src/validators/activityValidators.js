const { z, paginationSchema, idSchema } = require("./commonValidators");

const activityQuerySchema = paginationSchema.extend({
  cityId: idSchema.optional(),
  category: z.string().optional(),
  maxCost: z.coerce.number().min(0).optional()
});

module.exports = {
  activityQuerySchema
};
