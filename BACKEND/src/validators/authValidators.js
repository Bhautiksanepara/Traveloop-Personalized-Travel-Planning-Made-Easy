const { z } = require("./commonValidators");

const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  language: z.string().min(2).max(10).default("en"),
  avatarUrl: z.string().url().optional().nullable()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  deviceLabel: z.string().max(120).optional().nullable()
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
  deviceLabel: z.string().max(120).optional().nullable()
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(128)
});

module.exports = {
  signupSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
