const { z } = require('zod');

const locationSchema = z.object({
  city: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

const search = z.object({
  body: z.object({
    query: z.string().min(1).max(500),
    location: locationSchema.optional(),
    filters: z.record(z.unknown()).optional(),
  }),
});

const recommend = z.object({
  body: z.object({
    location: locationSchema,
    filters: z.record(z.unknown()).optional(),
  }),
});

const chat = z.object({
  body: z.object({
    message: z.string().min(1).max(1000),
    location: locationSchema.optional(),
  }),
});

const reviewSummary = z.object({
  body: z.object({
    vendorId: z.number().int().positive(),
  }),
});

module.exports = { search, recommend, chat, reviewSummary };
