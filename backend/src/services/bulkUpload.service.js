const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const aiService = require('../integrations/ai/aiService');

/** Parse CSV buffer → array of objects using header row */
function parseCsv(buffer) {
  const lines = buffer.toString('utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

function toBool(val, fallback = true) {
  if (val === undefined || val === '') return fallback;
  return val === 'true' || val === '1';
}

function toIntOrUndef(val) {
  const n = parseInt(val);
  return isNaN(n) ? undefined : n;
}

function toFloatOrUndef(val) {
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

/**
 * Customers CSV columns:
 * name, email, password, city
 */
async function bulkCreateCustomers(buffer) {
  const rows = parseCsv(buffer);
  const results = { created: 0, skipped: 0, errors: [] };

  for (const [i, row] of rows.entries()) {
    const rowNum = i + 2;
    if (!row.name || !row.email || !row.password) {
      results.errors.push({ row: rowNum, message: 'Missing required fields: name, email, password' });
      results.skipped++;
      continue;
    }
    try {
      const existing = await prisma.user.findFirst({ where: { email: row.email } });
      if (existing) {
        results.errors.push({ row: rowNum, message: `Email already exists: ${row.email}` });
        results.skipped++;
        continue;
      }
      const passwordHash = await bcrypt.hash(row.password, 10);
      await prisma.user.create({
        data: { name: row.name, email: row.email, passwordHash, role: 'CUSTOMER', city: row.city || null },
      });
      results.created++;
    } catch (e) {
      results.errors.push({ row: rowNum, message: e.message });
      results.skipped++;
    }
  }
  return results;
}

/**
 * Vendors CSV columns:
 * name, email, password, city, address, phone, openingTime, closingTime, description, latitude, longitude
 * Creates a VENDOR user + Vendor profile per row.
 */
async function bulkCreateVendors(buffer) {
  const rows = parseCsv(buffer);
  const results = { created: 0, skipped: 0, errors: [] };

  for (const [i, row] of rows.entries()) {
    const rowNum = i + 2;
    if (!row.name || !row.email || !row.password || !row.city) {
      results.errors.push({ row: rowNum, message: 'Missing required fields: name, email, password, city' });
      results.skipped++;
      continue;
    }
    try {
      const existing = await prisma.user.findFirst({ where: { email: row.email } });
      if (existing) {
        results.errors.push({ row: rowNum, message: `Email already exists: ${row.email}` });
        results.skipped++;
        continue;
      }
      const passwordHash = await bcrypt.hash(row.password, 10);
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { name: row.name, email: row.email, passwordHash, role: 'VENDOR', city: row.city },
        });
        await tx.vendor.create({
          data: {
            ownerId: user.id,
            name: row.vendorName || row.name,
            description: row.description || null,
            city: row.city,
            address: row.address || null,
            phone: row.phone || null,
            openingTime: row.openingTime || null,
            closingTime: row.closingTime || null,
            latitude: toFloatOrUndef(row.latitude),
            longitude: toFloatOrUndef(row.longitude),
          },
        });
      });
      results.created++;
    } catch (e) {
      results.errors.push({ row: rowNum, message: e.message });
      results.skipped++;
    }
  }
  return results;
}

/**
 * Food items CSV columns:
 * vendorId, name, price, description, categoryId, isVeg, isAvailable
 */
async function bulkCreateFoods(buffer) {
  const rows = parseCsv(buffer);
  const results = { created: 0, skipped: 0, errors: [] };

  for (const [i, row] of rows.entries()) {
    const rowNum = i + 2;
    const vendorId = toIntOrUndef(row.vendorId);
    const price = toFloatOrUndef(row.price);

    if (!vendorId || !row.name || price === undefined) {
      results.errors.push({ row: rowNum, message: 'Missing required fields: vendorId, name, price' });
      results.skipped++;
      continue;
    }
    try {
      const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, deletedAt: null } });
      if (!vendor) {
        results.errors.push({ row: rowNum, message: `Vendor not found: ${vendorId}` });
        results.skipped++;
        continue;
      }
      await prisma.food.create({
        data: {
          vendorId,
          name: row.name,
          price,
          description: row.description || null,
          categoryId: toIntOrUndef(row.categoryId),
          isVeg: toBool(row.isVeg, true),
          isAvailable: toBool(row.isAvailable, true),
        },
      });
      results.created++;
    } catch (e) {
      results.errors.push({ row: rowNum, message: e.message });
      results.skipped++;
    }
  }
  return results;
}

/**
 * Reviews CSV columns:
 * userId, vendorId, rating, text
 */
async function bulkCreateReviews(buffer) {
  const rows = parseCsv(buffer);
  const results = { created: 0, skipped: 0, errors: [] };

  for (const [i, row] of rows.entries()) {
    const rowNum = i + 2;
    const userId = toIntOrUndef(row.userId);
    const vendorId = toIntOrUndef(row.vendorId);
    const rating = toIntOrUndef(row.rating);

    if (!userId || !vendorId || rating === undefined) {
      results.errors.push({ row: rowNum, message: 'Missing required fields: userId, vendorId, rating' });
      results.skipped++;
      continue;
    }
    if (rating < 1 || rating > 5) {
      results.errors.push({ row: rowNum, message: `Invalid rating: ${rating}. Must be 1–5` });
      results.skipped++;
      continue;
    }
    try {
      const existing = await prisma.review.findFirst({ where: { userId, vendorId, deletedAt: null } });
      if (existing) {
        results.errors.push({ row: rowNum, message: `Review already exists for userId=${userId} vendorId=${vendorId}` });
        results.skipped++;
        continue;
      }
      const review = await prisma.review.create({
        data: { userId, vendorId, rating, text: row.text || null },
      });

      // update vendor avg rating
      const stats = await prisma.review.aggregate({
        where: { vendorId, deletedAt: null },
        _avg: { rating: true },
        _count: { id: true },
      });
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { avgRating: stats._avg.rating ?? 0, reviewCount: stats._count.id },
      });

      if (review.text) {
        const result = await aiService.embedReview(review.id, vendorId, review.text, rating);
        const embeddingId = result?.data?.embedding_id;
        if (embeddingId) {
          await prisma.review.update({ where: { id: review.id }, data: { embeddingId } });
        }
      }

      results.created++;
    } catch (e) {
      results.errors.push({ row: rowNum, message: e.message });
      results.skipped++;
    }
  }
  return results;
}

module.exports = { bulkCreateCustomers, bulkCreateVendors, bulkCreateFoods, bulkCreateReviews };
