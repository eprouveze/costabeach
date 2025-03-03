-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'contentEditor');
CREATE TYPE "Language" AS ENUM ('french', 'arabic', 'english', 'EN', 'FR', 'AR');
CREATE TYPE "DocumentCategory" AS ENUM ('comiteDeSuivi', 'societeDeGestion', 'legal', 'financial', 'general', 'COMITE_DE_SUIVI', 'SOCIETE_DE_GESTION', 'LEGAL', 'GENERAL', 'FINANCE');
CREATE TYPE "RegistrationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE,
  "email_verified" TIMESTAMP,
  "image" TEXT,
  "hashed_password" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "login" TEXT,
  "role" "UserRole" DEFAULT 'user',
  "is_admin" BOOLEAN DEFAULT FALSE,
  "building_number" TEXT,
  "apartment_number" TEXT,
  "phone_number" TEXT,
  "is_verified_owner" BOOLEAN DEFAULT FALSE,
  "permissions" TEXT[],
  "preferred_language" "Language" DEFAULT 'french'
);

-- Create documents table
CREATE TABLE IF NOT EXISTS "documents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "file_path" TEXT NOT NULL,
  "file_size" INTEGER NOT NULL,
  "file_type" TEXT NOT NULL,
  "category" "DocumentCategory" NOT NULL,
  "language" "Language" NOT NULL,
  "translated_document_id" UUID REFERENCES "documents"("id"),
  "is_translated" BOOLEAN DEFAULT FALSE,
  "is_published" BOOLEAN DEFAULT TRUE,
  "view_count" INTEGER DEFAULT 0,
  "download_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "author_id" UUID REFERENCES "users"("id") NOT NULL
);

-- Create information table
CREATE TABLE IF NOT EXISTS "information" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" "DocumentCategory" NOT NULL,
  "language" "Language" NOT NULL,
  "translated_from" TEXT,
  "view_count" INTEGER DEFAULT 0,
  "is_published" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "author_id" UUID REFERENCES "users"("id") NOT NULL
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "user_id" UUID REFERENCES "users"("id") NOT NULL,
  "details" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create owner_registrations table
CREATE TABLE IF NOT EXISTS "owner_registrations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "building_number" TEXT NOT NULL,
  "apartment_number" TEXT NOT NULL,
  "phone_number" TEXT NOT NULL,
  "status" "RegistrationStatus" DEFAULT 'pending',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "notes" TEXT,
  "preferred_language" "Language" DEFAULT 'french'
);

-- Create allowlist table
CREATE TABLE IF NOT EXISTS "allowlist" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "information" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "owner_registrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "allowlist" ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can read their own data" ON "users"
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON "users"
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for documents
CREATE POLICY "Anyone can read published documents" ON "documents"
  FOR SELECT USING (is_published = true);
  
CREATE POLICY "Authors can update their own documents" ON "documents"
  FOR UPDATE USING (auth.uid() = author_id);
  
CREATE POLICY "Authors can delete their own documents" ON "documents"
  FOR DELETE USING (auth.uid() = author_id);

-- Create policies for information
CREATE POLICY "Anyone can read published information" ON "information"
  FOR SELECT USING (is_published = true);
  
CREATE POLICY "Authors can update their own information" ON "information"
  FOR UPDATE USING (auth.uid() = author_id);
  
CREATE POLICY "Authors can delete their own information" ON "information"
  FOR DELETE USING (auth.uid() = author_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, is_admin, is_verified_owner, preferred_language)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user',
    false,
    false,
    coalesce(new.raw_user_meta_data->>'preferred_language', 'french')::Language
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = new.email,
    updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update(); 