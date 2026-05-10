const { z, paginationSchema } = require("./commonValidators");

const cityQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  sortBy: z.enum(["popularity", "cost", "name", "country"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

const cityActivityQuerySchema = paginationSchema.extend({
  category: z.string().optional()
});

module.exports = {
  cityQuerySchema,
  cityActivityQuerySchema
};
