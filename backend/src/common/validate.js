const { ValidationError } = require('./errors');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    // Log validation errors for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error('Validation Error:', { errors, body: req.body, query: req.query });
    }
    return next(new ValidationError('Validation failed', errors));
  }

  req.validated = result.data;
  return next();
};

module.exports = validate;
