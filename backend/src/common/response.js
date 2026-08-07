const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = {}, message = 'Created') =>
  success(res, data, message, 201);

const noContent = (res) => res.status(204).send();

const error = (res, message = 'Something went wrong', statusCode = 500, errors = []) =>
  res.status(statusCode).json({ success: false, message, errors });

const paginated = (res, items, pagination, message = 'Success') =>
  success(res, { items, pagination }, message);

module.exports = { success, created, noContent, error, paginated };
