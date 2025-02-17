import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "manu@prouveze.fr";
  
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        isAdmin: true,
        role: "admin"
      },
      create: {
        email,
        isAdmin: true,
        role: "admin",
        name: "Manu Prouveze"
      }
    });
    
    console.log(`User ${user.email} is now an admin!`);
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 