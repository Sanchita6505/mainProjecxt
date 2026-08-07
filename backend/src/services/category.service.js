const categoryRepo = require('../repositories/category.repository');
const { ConflictError } = require('../common/errors');

const list = () => categoryRepo.findAll();

const create = async ({ name }) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const existing = await categoryRepo.findBySlug(slug);
  if (existing) throw new ConflictError('Category already exists');
  return categoryRepo.create({ name, slug });
};

module.exports = { list, create };
