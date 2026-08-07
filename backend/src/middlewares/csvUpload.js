const multer = require('multer');
const { ValidationError } = require('../common/errors');

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      return cb(null, true);
    }
    cb(new ValidationError('Only CSV files are allowed'));
  },
});

module.exports = csvUpload;
