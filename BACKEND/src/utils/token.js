const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const env = require("../config/env");

const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    },
    env.accessTokenSecret,
    { expiresIn: env.accessTokenExpiresIn, jwtid: uuidv4() }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      type: "refresh"
    },
    env.refreshTokenSecret,
    { expiresIn: env.refreshTokenExpiresIn, jwtid: uuidv4() }
  );

const verifyAccessToken = (token) => jwt.verify(token, env.accessTokenSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.refreshTokenSecret);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
