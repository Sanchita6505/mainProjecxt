const { z } = require('zod');

const idParam = z.object({ params: z.object({ vendorId: z.string().regex(/^\d+$/) }) });

const create = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(1000).optional(),
    city: z.string().min(2).max(100),
    address: z.string().max(300).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    phone: z.string().max(20).optional(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    categoryIds: z.array(z.number().int().positive()).optional(),
  }),
});

const update = z.object({
  params: z.object({ vendorId: z.string().regex(/^\d+$/) }),
  body: create.shape.body.partial(),
});

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    city: z.string().optional(),
    category: z.string().optional(),
    minRating: z.string().optional(),
    sort: z.enum(['rating', 'createdAt', 'name']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    ownerId: z.string().regex(/^\d+$/).optional(),
  }),
});

module.exports = { idParam, create, update, list };
