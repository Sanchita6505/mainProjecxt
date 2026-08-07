const { z } = require('zod');

const idParam = z.object({ params: z.object({ foodId: z.string().regex(/^\d+$/) }) });

const create = z.object({
  body: z.object({
    vendorId: z.number().int().positive(),
    categoryId: z.number().int().positive().optional(),
    name: z.string().min(2).max(200),
    description: z.string().max(1000).optional(),
    price: z.number().positive(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

const update = z.object({
  params: z.object({ foodId: z.string().regex(/^\d+$/) }),
  body: create.shape.body.partial(),
});

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    vendorId: z.string().optional(),
    categoryId: z.string().optional(),
    isVeg: z.string().optional(),
    maxPrice: z.string().optional(),
  }),
});

module.exports = { idParam, create, update, list };
