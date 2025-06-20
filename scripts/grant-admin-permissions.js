const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function grantAdminPermissions() {
  const email = 'manu@prouveze.fr';
  
  try {
    console.log('🔧 Granting admin permissions to:', email);
    
const user = await prisma.user.upsert({
  where: { email },
  update: { isAdmin: true, permissions: PERMISSIONS },
  create: { email, isAdmin: true, permissions: PERMISSIONS }
});
        permissions: [
          'manageInformation', 
          'viewInformation', 
          'manageUsers', 
          'manageDocuments',
          'manageComiteDocuments',
          'manageSocieteDocuments',
          'manageLegalDocuments',
          'approveRegistrations'
        ]
      }
    });
    
    console.log('✅ Admin permissions granted to:', user.email);
    console.log('📋 Permissions:', user.permissions);
    
  } catch (error) {
    console.error('❌ Error granting permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

grantAdminPermissions();