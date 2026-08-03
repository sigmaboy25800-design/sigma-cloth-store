const { validationResult } = require("express-validator");

// Runs after express-validator chains; returns a 422 with field-level
// errors if any validation rule failed, otherwise passes through.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: "Validation failed.",
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
