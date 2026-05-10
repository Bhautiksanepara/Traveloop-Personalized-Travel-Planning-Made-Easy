const AppError = require("../utils/appError");

const validate = (schema, target = "body") => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    return next(
      new AppError(
        400,
        "Validation failed.",
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      )
    );
  }

  req[target] = result.data;
  return next();
};

module.exports = validate;
