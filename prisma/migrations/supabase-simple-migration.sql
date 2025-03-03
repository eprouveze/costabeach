-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE,
  "email_verified" TIMESTAMP,
  "image" TEXT,
  "role" TEXT DEFAULT 'user',
  "is_admin" BOOLEAN DEFAULT FALSE,
  "building_number" TEXT,
  "apartment_number" TEXT,
  "phone_number" TEXT,
  "is_verified_owner" BOOLEAN DEFAULT FALSE,
  "permissions" TEXT[],
  "preferred_language" TEXT DEFAULT 'french',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to handle new user creation
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
    coalesce(new.raw_user_meta_data->>'preferred_language', 'french')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a user record when a new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to handle user updates
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

-- Create a trigger to automatically update the user record when an auth user is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create RLS policies for the users table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read their own data" ON "users"
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON "users"
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to read all users
CREATE POLICY "Service role can read all users" ON "users"
  FOR SELECT USING (auth.role() = 'service_role');

-- Allow service role to update all users
CREATE POLICY "Service role can update all users" ON "users"
  FOR UPDATE USING (auth.role() = 'service_role');

-- Allow service role to insert users
CREATE POLICY "Service role can insert users" ON "users"
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create a test user with verified owner status
INSERT INTO public.users (id, email, name, role, is_admin, is_verified_owner, preferred_language)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  'Test User',
  'user',
  false,
  true,
  'french'
) ON CONFLICT (id) DO UPDATE SET is_verified_owner = true; 