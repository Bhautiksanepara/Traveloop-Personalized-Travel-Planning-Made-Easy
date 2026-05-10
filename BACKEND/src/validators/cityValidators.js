const { z, paginationSchema } = require("./commonValidators");

const cityQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional()
});

const cityActivityQuerySchema = paginationSchema.extend({
  category: z.string().optional()
});

module.exports = {
  cityQuerySchema,
  cityActivityQuerySchema
};
