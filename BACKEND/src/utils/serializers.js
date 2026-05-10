const toNumber = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  return typeof value === "object" && typeof value.toNumber === "function"
    ? value.toNumber()
    : Number(value);
};

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  language: user.language,
  isAdmin: user.isAdmin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

module.exports = {
  toNumber,
  serializeUser
};
