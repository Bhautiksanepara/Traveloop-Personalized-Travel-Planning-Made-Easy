const { z, paginationSchema } = require("./commonValidators");

const userQuerySchema = paginationSchema.extend({
  search: z.string().optional()
});

const updateUserSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    avatarUrl: z.string().url().optional().nullable(),
    language: z.string().min(2).max(10).optional(),
    isAdmin: z.boolean().optional(),
    isDeleted: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });

const tripQuerySchema = paginationSchema.extend({
  userId: z.string().uuid().optional()
});

module.exports = {
  userQuerySchema,
  updateUserSchema,
  tripQuerySchema
};
