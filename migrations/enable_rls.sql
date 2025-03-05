-- Enable RLS for all tables and create appropriate policies
-- This script addresses Supabase security notifications about missing RLS

-- _prisma_migrations table
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
-- For _prisma_migrations, typically only administrators should have access
CREATE POLICY "Admin only access for _prisma_migrations" ON public._prisma_migrations
  USING (auth.role() = 'service_role');

-- VerificationToken table
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
-- Only allow service role (server) to access verification tokens
CREATE POLICY "Service role only for VerificationToken" ON public."VerificationToken"
  USING (auth.role() = 'service_role');

-- Allowlist table
ALTER TABLE public."Allowlist" ENABLE ROW LEVEL SECURITY;
-- Only admins can read/write to allowlist
CREATE POLICY "Admin read for Allowlist" ON public."Allowlist" 
  FOR SELECT USING (auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admin write for Allowlist" ON public."Allowlist" 
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admin update for Allowlist" ON public."Allowlist" 
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admin delete for Allowlist" ON public."Allowlist" 
  FOR DELETE USING (auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');

-- Account table
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
-- Users can only access their own accounts, admins can access all
CREATE POLICY "Users can view own Account" ON public."Account" 
  FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Users can insert own Account" ON public."Account" 
  FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');
CREATE POLICY "Users can update own Account" ON public."Account" 
  FOR UPDATE USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');
CREATE POLICY "Users can delete own Account" ON public."Account" 
  FOR DELETE USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Session table
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
-- Users can only access their own sessions, admins can access all
CREATE POLICY "Users can view own Session" ON public."Session" 
  FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');
CREATE POLICY "Users can insert own Session" ON public."Session" 
  FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');
CREATE POLICY "Users can update own Session" ON public."Session" 
  FOR UPDATE USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');
CREATE POLICY "Users can delete own Session" ON public."Session" 
  FOR DELETE USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- User table
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
-- Users can view public user profiles and their own profile
CREATE POLICY "Users can view User profiles" ON public."User" 
  FOR SELECT USING (true); -- Everyone can view user profiles
CREATE POLICY "Users can update own profile" ON public."User" 
  FOR UPDATE USING (auth.uid()::text = id OR auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Only service role can create users" ON public."User" 
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Only service role can delete users" ON public."User" 
  FOR DELETE USING (auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');

-- OwnerRegistration table
ALTER TABLE public."OwnerRegistration" ENABLE ROW LEVEL SECURITY;
-- Users can view their own registrations, admins can view all
CREATE POLICY "Users can view own OwnerRegistration" ON public."OwnerRegistration" 
  FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Users can create own OwnerRegistration" ON public."OwnerRegistration" 
  FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');
CREATE POLICY "Users can update own OwnerRegistration" ON public."OwnerRegistration" 
  FOR UPDATE USING (auth.uid()::text = "userId" OR auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins can delete OwnerRegistration" ON public."OwnerRegistration" 
  FOR DELETE USING (auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');

-- Document table
ALTER TABLE public."Document" ENABLE ROW LEVEL SECURITY;
-- Public documents are visible to all authenticated users
-- Admin-only documents are only visible to admins
-- Owner documents are visible to owners and admins
CREATE POLICY "Everyone can view public Documents" ON public."Document" 
  FOR SELECT USING (visibility = 'public' OR auth.role() = 'service_role' OR auth.jwt()->>'role' = 'admin');
CREATE POLICY "Owners can view owner Documents" ON public."Document" 
  FOR SELECT USING (
    visibility = 'owner' AND 
    (auth.jwt()->>'role' = 'owner' OR auth.jwt()->>'role' = 'admin' OR auth.role() = 'service_role')
  );
CREATE POLICY "Only admins and content editors can create Documents" ON public."Document" 
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin' OR 
    auth.jwt()->>'role' = 'content_editor'
  );
CREATE POLICY "Only admins and content editors can update Documents" ON public."Document" 
  FOR UPDATE USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin' OR 
    auth.jwt()->>'role' = 'content_editor'
  );
CREATE POLICY "Only admins can delete Documents" ON public."Document" 
  FOR DELETE USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  ); 