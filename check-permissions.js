const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPermissions() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
      select: {
        id: true,
        email: true,
        name: true,
        permissions: true,
        isAdmin: true,
        role: true
      }
    });

    console.log('User data:', JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();