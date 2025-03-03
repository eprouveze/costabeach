import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function testAwsConnection() {
  try {
    // Read the dummy PDF file
    const filePath = path.join(process.cwd(), "public", "dummy.pdf");
    const fileContent = fs.readFileSync(filePath);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key: "test-document.pdf",
      Body: fileContent,
      ContentType: "application/pdf",
    });

    console.log("Attempting to upload test document to S3...");
    const response = await s3Client.send(command);
    console.log("Successfully uploaded test document to S3!", response);
    
    console.log("\nAWS Configuration Test Results:");
    console.log("✅ AWS Credentials Valid");
    console.log(`✅ Using Region: ${process.env.AWS_REGION}`);
    console.log(`✅ Bucket Name: ${process.env.BUCKET_NAME}`);
    
  } catch (error) {
    console.error("Error testing AWS connection:", error);
    process.exit(1);
  }
}

testAwsConnection(); 