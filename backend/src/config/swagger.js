const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DilliBites API',
      version: '1.0.0',
      description: 'Street food recommendation platform API',
    },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['CUSTOMER', 'VENDOR', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Vendor: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            city: { type: 'string' },
            address: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            phone: { type: 'string' },
            openingTime: { type: 'string' },
            closingTime: { type: 'string' },
            avgRating: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Food: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            vendorId: { type: 'integer' },
            categoryId: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            isVeg: { type: 'boolean' },
            isAvailable: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            vendorId: { type: 'integer' },
            userId: { type: 'integer' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            text: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
        Location: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
          },
        },
        BulkUploadResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                created: { type: 'integer' },
                skipped: { type: 'integer' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      row: { type: 'integer' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } } } },
        },
      },
      '/ready': {
        get: {
          tags: ['System'],
          summary: 'Readiness check (DB connectivity)',
          responses: {
            200: { description: 'Ready' },
            503: { description: 'Not ready' },
          },
        },
      },

      // Auth
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', minLength: 2, maxLength: 100 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    role: { type: 'string', enum: ['CUSTOMER', 'VENDOR'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Email already in use' },
          },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } } } },
            401: { description: 'Invalid credentials' },
          },
        },
      },

      // Users
      '/api/v1/users/profile': {
        get: {
          tags: ['Users'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update current user profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Profile updated' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/users/favorites': {
        get: {
          tags: ['Users'],
          summary: 'Get favorite vendors',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of favorite vendors', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Vendor' } } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/users/favorites/{vendorId}': {
        post: {
          tags: ['Users'],
          summary: 'Add vendor to favorites',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'vendorId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Added to favorites' },
            401: { description: 'Unauthorized' },
            404: { description: 'Vendor not found' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Remove vendor from favorites',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'vendorId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Removed from favorites' },
            401: { description: 'Unauthorized' },
          },
        },
      },

      // Vendors
      '/api/v1/vendors': {
        get: {
          tags: ['Vendors'],
          summary: 'List vendors',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'minRating', in: 'query', schema: { type: 'number' } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['rating', 'createdAt', 'name'] } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: {
            200: { description: 'Paginated vendor list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Vendor' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } } },
          },
        },
        post: {
          tags: ['Vendors'],
          summary: 'Create a vendor (VENDOR or ADMIN)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'city'],
                  properties: {
                    name: { type: 'string', minLength: 2, maxLength: 200 },
                    description: { type: 'string', maxLength: 1000 },
                    city: { type: 'string', minLength: 2, maxLength: 100 },
                    address: { type: 'string', maxLength: 300 },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    phone: { type: 'string', maxLength: 20 },
                    openingTime: { type: 'string' },
                    closingTime: { type: 'string' },
                    categoryIds: { type: 'array', items: { type: 'integer' } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Vendor created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Vendor' } } } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/api/v1/vendors/{vendorId}': {
        get: {
          tags: ['Vendors'],
          summary: 'Get vendor by ID',
          parameters: [{ name: 'vendorId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Vendor details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Vendor' } } } } } },
            404: { description: 'Not found' },
          },
        },
        put: {
          tags: ['Vendors'],
          summary: 'Update vendor',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'vendorId', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    city: { type: 'string' },
                    address: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    phone: { type: 'string' },
                    openingTime: { type: 'string' },
                    closingTime: { type: 'string' },
                    categoryIds: { type: 'array', items: { type: 'integer' } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Vendor updated' },
            401: { description: 'Unauthorized' },
            404: { description: 'Not found' },
          },
        },
        delete: {
          tags: ['Vendors'],
          summary: 'Delete vendor',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'vendorId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Vendor deleted' },
            401: { description: 'Unauthorized' },
            404: { description: 'Not found' },
          },
        },
      },

      // Foods
      '/api/v1/foods': {
        get: {
          tags: ['Foods'],
          summary: 'List food items',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'vendorId', in: 'query', schema: { type: 'integer' } },
            { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
            { name: 'isVeg', in: 'query', schema: { type: 'boolean' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          ],
          responses: {
            200: { description: 'Paginated food list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Food' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } } },
          },
        },
        post: {
          tags: ['Foods'],
          summary: 'Create a food item (VENDOR or ADMIN)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['vendorId', 'name', 'price'],
                  properties: {
                    vendorId: { type: 'integer' },
                    categoryId: { type: 'integer' },
                    name: { type: 'string', minLength: 2, maxLength: 200 },
                    description: { type: 'string', maxLength: 1000 },
                    price: { type: 'number', minimum: 0 },
                    isVeg: { type: 'boolean' },
                    isAvailable: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Food item created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Food' } } } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/api/v1/foods/{foodId}': {
        get: {
          tags: ['Foods'],
          summary: 'Get food item by ID',
          parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Food item details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Food' } } } } } },
            404: { description: 'Not found' },
          },
        },
        put: {
          tags: ['Foods'],
          summary: 'Update food item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categoryId: { type: 'integer' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    isVeg: { type: 'boolean' },
                    isAvailable: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Food item updated' },
            401: { description: 'Unauthorized' },
            404: { description: 'Not found' },
          },
        },
        delete: {
          tags: ['Foods'],
          summary: 'Delete food item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'foodId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Food item deleted' },
            401: { description: 'Unauthorized' },
            404: { description: 'Not found' },
          },
        },
      },

      // Reviews
      '/api/v1/reviews/{reviewId}': {
        get: {
          tags: ['Reviews'],
          summary: 'Get review by ID',
          parameters: [{ name: 'reviewId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Review details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Review' } } } } } },
            404: { description: 'Not found' },
          },
        },
        put: {
          tags: ['Reviews'],
          summary: 'Update review',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'reviewId', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    text: { type: 'string', maxLength: 2000 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Review updated' },
            401: { description: 'Unauthorized' },
            404: { description: 'Not found' },
          },
        },
        delete: {
          tags: ['Reviews'],
          summary: 'Delete review',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'reviewId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Review deleted' },
            401: { description: 'Unauthorized' },
            404: { description: 'Not found' },
          },
        },
      },
      '/api/v1/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Create a review',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['vendorId', 'rating'],
                  properties: {
                    vendorId: { type: 'integer' },
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    text: { type: 'string', maxLength: 2000 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Review created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Review' } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
      },

      // Categories
      '/api/v1/categories': {
        get: {
          tags: ['Categories'],
          summary: 'List all categories',
          responses: {
            200: { description: 'Category list', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } } },
          },
        },
        post: {
          tags: ['Categories'],
          summary: 'Create a category (ADMIN only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } },
              },
            },
          },
          responses: {
            201: { description: 'Category created' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
      },

      // Search
      '/api/v1/search': {
        get: {
          tags: ['Search'],
          summary: 'Full-text search across vendors and foods',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: { description: 'Search results', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } } } } },
          },
        },
      },

      // AI
      '/api/v1/ai/search': {
        post: {
          tags: ['AI'],
          summary: 'Semantic AI search',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['query'],
                  properties: {
                    query: { type: 'string', minLength: 1, maxLength: 500 },
                    location: { $ref: '#/components/schemas/Location' },
                    filters: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'AI search results' },
          },
        },
      },
      '/api/v1/ai/recommend': {
        post: {
          tags: ['AI'],
          summary: 'Personalized recommendations (auth required)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['location'],
                  properties: {
                    location: { $ref: '#/components/schemas/Location' },
                    filters: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Recommendations' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/ai/chat': {
        post: {
          tags: ['AI'],
          summary: 'Conversational food assistant (auth required)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: {
                    message: { type: 'string', minLength: 1, maxLength: 1000 },
                    location: { $ref: '#/components/schemas/Location' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Chat response' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      // Bulk Upload (ADMIN)
      '/api/v1/admin/bulk-upload/customers': {
        post: {
          tags: ['Admin / Bulk Upload'],
          summary: 'Bulk create customers from CSV',
          description: 'CSV columns: `name`, `email`, `password`, `city`',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: { file: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Upload result', content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkUploadResult' } } } },
            400: { description: 'No file or invalid CSV' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden – ADMIN only' },
          },
        },
      },
      '/api/v1/admin/bulk-upload/vendors': {
        post: {
          tags: ['Admin / Bulk Upload'],
          summary: 'Bulk create vendors from CSV',
          description: 'CSV columns: `name`, `email`, `password`, `city`, `vendorName` *(optional)*, `description`, `address`, `phone`, `openingTime`, `closingTime`, `latitude`, `longitude`',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: { file: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Upload result', content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkUploadResult' } } } },
            400: { description: 'No file or invalid CSV' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden – ADMIN only' },
          },
        },
      },
      '/api/v1/admin/bulk-upload/foods': {
        post: {
          tags: ['Admin / Bulk Upload'],
          summary: 'Bulk create food items from CSV',
          description: 'CSV columns: `vendorId`, `name`, `price`, `description`, `categoryId`, `isVeg`, `isAvailable`',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: { file: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Upload result', content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkUploadResult' } } } },
            400: { description: 'No file or invalid CSV' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden – ADMIN only' },
          },
        },
      },
      '/api/v1/admin/bulk-upload/reviews': {
        post: {
          tags: ['Admin / Bulk Upload'],
          summary: 'Bulk create reviews from CSV',
          description: 'CSV columns: `userId`, `vendorId`, `rating` (1–5), `text`',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: { file: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Upload result', content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkUploadResult' } } } },
            400: { description: 'No file or invalid CSV' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden – ADMIN only' },
          },
        },
      },

      '/api/v1/ai/review-summary': {
        post: {
          tags: ['AI'],
          summary: 'AI-generated review summary for a vendor',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['vendorId'],
                  properties: {
                    vendorId: { type: 'integer' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Review summary' },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
