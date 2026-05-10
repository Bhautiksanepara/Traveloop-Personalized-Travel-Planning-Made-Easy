const { z } = require("zod");

const idSchema = z
  .string()
  .regex(/^[A-Za-z0-9-]{36}$/, "Invalid id format.");

const uuidParamSchema = z.object({
  id: idSchema
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

module.exports = {
  z,
  idSchema,
  uuidParamSchema,
  paginationSchema
};
