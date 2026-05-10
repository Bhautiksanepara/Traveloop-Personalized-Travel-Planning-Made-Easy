const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./config/env");
const rootRouter = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
const allowedOrigins = env.corsOrigin.split(",").map((value) => value.trim()).filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: `${env.appName} is healthy.`
  });
});

app.use(env.apiPrefix, rootRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
