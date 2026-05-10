const { sendError } = require("../utils/apiResponse");

const notFound = (req, res) => sendError(res, 404, `Route ${req.originalUrl} not found.`);

module.exports = notFound;
