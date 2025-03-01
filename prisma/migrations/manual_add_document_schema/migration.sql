-- CreateEnum
CREATE TYPE "Language" AS ENUM ('french', 'arabic');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('manageUsers', 'manageDocuments', 'manageComiteDocuments', 'manageSocieteDocuments', 'manageLegalDocuments', 'approveRegistrations');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('comiteDeSuivi', 'societeDeGestion', 'legal');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "permissions" "Permission"[],
                  ADD COLUMN "preferredLanguage" "Language" NOT NULL DEFAULT 'french';

-- AlterTable
ALTER TABLE "OwnerRegistration" ADD COLUMN "preferredLanguage" "Language" NOT NULL DEFAULT 'french';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'contentEditor';

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "language" "Language" NOT NULL,
    "translatedDocumentId" TEXT,
    "isTranslated" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_translatedDocumentId_fkey" FOREIGN KEY ("translatedDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 