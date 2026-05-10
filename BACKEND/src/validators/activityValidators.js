const { z, paginationSchema } = require("./commonValidators");

const activityQuerySchema = paginationSchema.extend({
  cityId: z.string().uuid().optional(),
  category: z.string().optional(),
  maxCost: z.coerce.number().min(0).optional()
});

module.exports = {
  activityQuerySchema
};
