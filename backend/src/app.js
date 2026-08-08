require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const env = require('./config/env');
const requestLogger = require('./middlewares/requestLogger');
const errorMiddleware = require('./common/errorMiddleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const vendorRoutes = require('./routes/vendor.routes');
const foodRoutes = require('./routes/food.routes');
const reviewRoutes = require('./routes/review.routes');
const categoryRoutes = require('./routes/category.routes');
const searchRoutes = require('./routes/search.routes');
const aiRoutes = require('./routes/ai.routes');
const bulkUploadRoutes = require('./routes/bulkUpload.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, '..', env.UPLOAD_DIR)));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', async (req, res) => {
  try {
    const prisma = require('./config/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/vendors`, vendorRoutes);
app.use(`${API}/foods`, foodRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/search`, searchRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/admin/bulk-upload`, bulkUploadRoutes);
app.use(`${API}/admin`, adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found', errors: [] }));
app.use(errorMiddleware);

module.exports = app;
