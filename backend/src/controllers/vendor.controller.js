const vendorService = require('../services/vendor.service');
const { success, created, noContent, paginated } = require('../common/response');

const list = async (req, res, next) => {
  try {
    const { vendors, pagination } = await vendorService.list(req.validated.query);
    return paginated(res, vendors, pagination);
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const vendor = await vendorService.getById(req.validated.params.vendorId);
    return success(res, vendor);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const vendor = await vendorService.create(req.validated.body, req.user.id);
    return created(res, vendor, 'Vendor created');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const vendor = await vendorService.update(
      req.validated.params.vendorId,
      req.validated.body,
      req.user.id,
      req.user.role
    );
    return success(res, vendor, 'Vendor updated');
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await vendorService.remove(req.validated.params.vendorId, req.user.id, req.user.role);
    return noContent(res);
  } catch (err) {
    return next(err);
  }
};

module.exports = { list, getById, create, update, remove };
