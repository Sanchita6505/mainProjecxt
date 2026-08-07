const svc = require('../services/bulkUpload.service');
const { success } = require('../common/response');
const { ValidationError } = require('../common/errors');

const handle = (fn) => async (req, res, next) => {
  try {
    if (!req.file) throw new ValidationError('CSV file is required');
    const result = await fn(req.file.buffer);
    success(res, result, `Bulk upload complete: ${result.created} created, ${result.skipped} skipped`);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  uploadCustomers: handle(svc.bulkCreateCustomers),
  uploadVendors:   handle(svc.bulkCreateVendors),
  uploadFoods:     handle(svc.bulkCreateFoods),
  uploadReviews:   handle(svc.bulkCreateReviews),
};
