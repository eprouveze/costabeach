import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { PrismaClient, DocumentCategory, Language } from "@prisma/client";
import crypto from "crypto";

// Load environment variables
config();

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface SampleDocument {
  title: string;
  description: string;
  category: DocumentCategory;
  filename: string;
}

const sampleDocuments: SampleDocument[] = [
  {
    title: "Annual Financial Report 2023",
    description: "Detailed financial report for the year 2023 including income statements and balance sheets",
    category: "financial",
    filename: "financial-report-2023.pdf"
  },
  {
    title: "Q1 2024 Financial Statement",
    description: "First quarter financial statement for 2024 with budget tracking",
    category: "financial",
    filename: "q1-2024-statement.pdf"
  },
  {
    title: "Property Management Contract 2024",
    description: "Current contract with the property management company",
    category: "societeDeGestion",
    filename: "management-contract-2024.pdf"
  },
  {
    title: "Building Maintenance Schedule",
    description: "Annual maintenance schedule for common areas and facilities",
    category: "societeDeGestion",
    filename: "maintenance-schedule.pdf"
  },
  {
    title: "Costa Beach 3 Bylaws",
    description: "Official bylaws and regulations for the property",
    category: "legal",
    filename: "bylaws-2024.pdf"
  },
  {
    title: "Insurance Policy 2024",
    description: "Current property insurance policy and coverage details",
    category: "legal",
    filename: "insurance-policy.pdf"
  },
  {
    title: "Meeting Minutes - March 2024",
    description: "Minutes from the latest committee meeting",
    category: "comiteDeSuivi",
    filename: "march-2024-minutes.pdf"
  },
  {
    title: "Committee Election Results 2024",
    description: "Results and details of the recent committee elections",
    category: "comiteDeSuivi",
    filename: "election-results.pdf"
  }
];

async function uploadDocument(doc: SampleDocument): Promise<string> {
  const dummyPdfPath = path.join(process.cwd(), "public", "dummy.pdf");
  const fileContent = fs.readFileSync(dummyPdfPath);

  const s3Key = `documents/${doc.category.toLowerCase()}/${doc.filename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: s3Key,
    Body: fileContent,
    ContentType: "application/pdf",
  });

  await s3Client.send(command);
  return s3Key;
}

async function uploadSampleDocuments() {
  try {
    console.log("Starting to upload sample documents...\n");

    // First get or create a system admin user
    let adminUser = await prisma.user.findFirst({
      where: { is_admin: true }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: "info@costabeach.ma",
          name: "System Admin",
          is_admin: true,
          role: "admin",
          preferred_language: "french"
        }
      });
    }

    for (const doc of sampleDocuments) {
      console.log(`Processing: ${doc.title}`);
      
      // Upload to S3
      const filePath = await uploadDocument(doc);
      console.log(`✅ Uploaded to S3: ${filePath}`);

      // Create database entry
      const dbEntry = await prisma.documents.create({
        data: {
          title: doc.title,
          description: doc.description,
          category: doc.category,
          file_path: filePath,
          file_size: fs.statSync(path.join(process.cwd(), "public", "dummy.pdf")).size,
          file_type: "application/pdf",
          language: "french",
          is_public: true,
          created_by: adminUser.id
        }
      });
      console.log(`✅ Created database entry: ${dbEntry.id}\n`);
    }

    console.log("\n🎉 Successfully uploaded all sample documents!");
    
  } catch (error) {
    console.error("Error uploading sample documents:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

uploadSampleDocuments(); 