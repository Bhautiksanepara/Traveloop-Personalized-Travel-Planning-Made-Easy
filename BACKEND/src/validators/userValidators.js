const { z, paginationSchema, idSchema } = require("./commonValidators");

const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    avatarUrl: z.string().url().optional().nullable(),
    language: z.string().min(2).max(10).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });

const savedDestinationSchema = z.object({
  cityId: idSchema
});

const savedDestinationQuerySchema = paginationSchema;

module.exports = {
  updateProfileSchema,
  savedDestinationSchema,
  savedDestinationQuerySchema
};
