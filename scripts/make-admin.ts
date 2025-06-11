import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = "manu@prouveze.fr";
  
  try {
    const user = await prisma.users.upsert({
      where: { email },
      update: {
        is_admin: true,
        role: "admin"
      },
      create: {
        id: crypto.randomUUID(),
        email,
        is_admin: true,
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