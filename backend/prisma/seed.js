const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  { name: 'Street Food', slug: 'street-food' },
  { name: 'South Indian', slug: 'south-indian' },
  { name: 'North Indian', slug: 'north-indian' },
  { name: 'Chinese', slug: 'chinese' },
  { name: 'Chaat', slug: 'chaat' },
  { name: 'Biryani', slug: 'biryani' },
  { name: 'Rolls & Wraps', slug: 'rolls-wraps' },
  { name: 'Desserts', slug: 'desserts' },
  { name: 'Beverages', slug: 'beverages' },
  { name: 'Fast Food', slug: 'fast-food' },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const password = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dillibites.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@dillibites.com', passwordHash: password, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'customer@dillibites.com' },
    update: {},
    create: { name: 'Test Customer', email: 'customer@dillibites.com', passwordHash: password, role: 'CUSTOMER', city: 'Delhi' },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@dillibites.com' },
    update: {},
    create: { name: 'Test Vendor', email: 'vendor@dillibites.com', passwordHash: password, role: 'VENDOR', city: 'Delhi' },
  });

  const chaat = await prisma.category.findUnique({ where: { slug: 'chaat' } });

  await prisma.vendor.upsert({
    where: { id: 1 },
    update: {},
    create: {
      ownerId: vendorUser.id,
      name: 'Sharma Ji Ki Chaat',
      description: 'Famous chaat stall in Old Delhi',
      city: 'Delhi',
      address: 'Chandni Chowk, Old Delhi',
      phone: '9999900000',
      openingTime: '10:00',
      closingTime: '22:00',
      categories: chaat ? { create: [{ categoryId: chaat.id }] } : undefined,
    },
  });

  console.log('Seed complete');
  console.log('  admin@dillibites.com    / Password@123  (ADMIN)');
  console.log('  customer@dillibites.com / Password@123  (CUSTOMER)');
  console.log('  vendor@dillibites.com   / Password@123  (VENDOR)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
