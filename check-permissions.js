const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

checkPermissions().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
  try {
    const user = await prisma.user.findUnique({
      where: { id: process.argv[2] || process.env.USER_ID },
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

checkPermissions().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});