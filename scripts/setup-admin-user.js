const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupAdminUser() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/setup-admin-user.js your-email@example.com');
    process.exit(1);
  }

  try {
    console.log('🔧 Setting up admin user for:', email);
    
    // Create approved registration
    const registration = await prisma.ownerRegistration.upsert({
      where: { email },
      update: {
        status: 'approved',
        updatedAt: new Date()
      },
      create: {
        id: `reg_${Date.now()}`,
        email,
        name: 'Admin User',
        buildingNumber: 'A1', 
        apartmentNumber: '101',
        phoneNumber: '+212600000000',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Approved registration created:', registration.email);
    
    // Check if user already exists, if so make them admin
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          isAdmin: true,
          permissions: ['manageInformation', 'viewInformation', 'manageUsers', 'manageDocuments']
        }
      });
      console.log('✅ Existing user updated with admin permissions');
    }
    
    console.log('🎉 Setup complete! You can now:');
    console.log('1. Go to the login page');
    console.log('2. Enter your email:', email);
    console.log('3. Check your email for the verification link');
    console.log('4. Click the link to complete sign-in');
    console.log('5. Access /admin/information with full permissions');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdminUser();