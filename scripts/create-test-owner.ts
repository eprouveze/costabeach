import { PrismaClient, RegistrationStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Create a test owner registration
  const testOwner = await prisma.ownerRegistration.create({
    data: {
      id: uuidv4(),
      email: 'manu@prouveze.fr',
      name: 'Emmanuel Prouveze',
      buildingNumber: 'A1',
      apartmentNumber: '101',
      phoneNumber: '+1234567890',
      status: 'approved' as RegistrationStatus,
      preferredLanguage: 'french',
      updatedAt: new Date(),
    },
  });

  console.log('Created test owner registration:', testOwner);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });