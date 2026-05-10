const bcrypt = require("bcryptjs");
const prisma = require("../models/prisma/client");
const AppError = require("../utils/appError");
const { hashValue, createRandomToken } = require("../utils/crypto");
const { sendMail } = require("../utils/mail");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/token");
const { serializeUser } = require("../utils/serializers");
const env = require("../config/env");

const createAuthPayload = async (user, deviceLabel = null) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const decodedRefresh = verifyRefreshToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashValue(refreshToken),
      deviceLabel,
      expiresAt: new Date(decodedRefresh.exp * 1000)
    }
  });

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken
  };
};

const signup = async ({ name, email, password, language, avatarUrl }) => {
  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing && !existing.isDeleted) {
    throw new AppError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      avatarUrl,
      language,
      isDeleted: false
    },
    create: {
      name,
      email,
      passwordHash,
      avatarUrl,
      language
    }
  });

  return createAuthPayload(user);
};

const login = async ({ email, password, deviceLabel }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.isDeleted) {
    throw new AppError(401, "Invalid email or password.");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new AppError(401, "Invalid email or password.");
  }

  return createAuthPayload(user, deviceLabel);
};

const refreshSession = async ({ refreshToken, deviceLabel }) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError(401, "Refresh token is invalid or expired.");
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash: hashValue(refreshToken),
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  if (!storedToken || storedToken.user.isDeleted) {
    throw new AppError(401, "Refresh token is no longer valid.");
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      revokedAt: new Date()
    }
  });

  return createAuthPayload(storedToken.user, deviceLabel || storedToken.deviceLabel);
};

const logout = async ({ refreshToken }) => {
  const tokenHash = hashValue(refreshToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.isDeleted) {
    return;
  }

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      consumedAt: null
    },
    data: {
      consumedAt: new Date()
    }
  });

  const resetToken = createRandomToken();
  const expiresAt = new Date(Date.now() + env.passwordResetTokenTtlMinutes * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashValue(resetToken),
      expiresAt
    }
  });

  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;

  await sendMail({
    to: user.email,
    subject: "Traveloop password reset",
    text: `Reset your Traveloop password using this link: ${resetUrl}`,
    html: `<p>Reset your Traveloop password by clicking <a href="${resetUrl}">this link</a>.</p>`
  });
};

const resetPassword = async ({ token, password }) => {
  const tokenHash = hashValue(token);

  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      consumedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  if (!record || record.user.isDeleted) {
    throw new AppError(400, "Password reset token is invalid or expired.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() }
    }),
    prisma.refreshToken.updateMany({
      where: {
        userId: record.userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    })
  ]);
};

module.exports = {
  signup,
  login,
  refreshSession,
  logout,
  forgotPassword,
  resetPassword
};
