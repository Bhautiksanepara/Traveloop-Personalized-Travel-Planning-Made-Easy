const crypto = require("crypto");

const hashValue = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const createRandomToken = () => crypto.randomBytes(32).toString("hex");

module.exports = {
  hashValue,
  createRandomToken
};
