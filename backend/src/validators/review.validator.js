const { z } = require('zod');

const idParam = z.object({ params: z.object({ reviewId: z.string().regex(/^\d+$/) }) });

const create = z.object({
  body: z.object({
    vendorId: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    text: z.string().max(2000).optional(),
  }),
});

const update = z.object({
  params: z.object({ reviewId: z.string().regex(/^\d+$/) }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    text: z.string().max(2000).optional(),
  }),
});

module.exports = { idParam, create, update };
