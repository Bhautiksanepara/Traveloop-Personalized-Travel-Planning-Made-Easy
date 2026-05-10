const { z } = require("zod");

const uuidParamSchema = z.object({
  id: z.string().uuid()
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

module.exports = {
  z,
  uuidParamSchema,
  paginationSchema
};
