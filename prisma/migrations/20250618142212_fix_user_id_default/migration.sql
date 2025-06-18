-- CreateEnum
CREATE TYPE "InformationStatus" AS ENUM ('draft', 'published', 'archived');

-- AlterEnum
ALTER TYPE "Language" ADD VALUE 'english';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'manageInformation';
ALTER TYPE "Permission" ADD VALUE 'viewInformation';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateTable
CREATE TABLE "information_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" "InformationStatus" NOT NULL DEFAULT 'draft',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(6),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "information_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "information_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "information_id" UUID NOT NULL,
    "language" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "information_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "information_posts_created_by_idx" ON "information_posts"("created_by");

-- CreateIndex
CREATE INDEX "information_posts_status_idx" ON "information_posts"("status");

-- CreateIndex
CREATE INDEX "information_posts_is_published_idx" ON "information_posts"("is_published");

-- CreateIndex
CREATE INDEX "information_posts_published_at_idx" ON "information_posts"("published_at");

-- CreateIndex
CREATE INDEX "information_translations_information_id_idx" ON "information_translations"("information_id");

-- CreateIndex
CREATE INDEX "information_translations_language_idx" ON "information_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "information_translations_information_id_language_key" ON "information_translations"("information_id", "language");

-- AddForeignKey
ALTER TABLE "information_posts" ADD CONSTRAINT "information_posts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "information_translations" ADD CONSTRAINT "information_translations_information_id_fkey" FOREIGN KEY ("information_id") REFERENCES "information_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
