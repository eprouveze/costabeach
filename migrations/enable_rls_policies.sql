-- Add RLS policies to previously enabled tables
-- These policies define who can read/write to each table

-- 1. Document table policies
-- Allow public documents to be viewed by anyone authenticated
CREATE POLICY "Everyone can view public Documents" ON public."Document" 
  FOR SELECT USING (
    "visibility" = 'public' OR 
    auth.role() = 'service_role'
  );

-- Allow authenticated users with owner role to view owner documents
CREATE POLICY "Owners can view owner Documents" ON public."Document" 
  FOR SELECT USING (
    ("visibility" = 'owner' AND auth.jwt()->>'role' = 'owner') OR 
    auth.jwt()->>'role' = 'admin' OR 
    auth.role() = 'service_role'
  );

-- Allow admins and content editors to create documents
CREATE POLICY "Admin content creation for Documents" ON public."Document" 
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin' OR 
    auth.jwt()->>'role' = 'content_editor'
  );

-- Allow admins and content editors to update documents
CREATE POLICY "Admin content update for Documents" ON public."Document" 
  FOR UPDATE USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin' OR 
    auth.jwt()->>'role' = 'content_editor'
  );

-- Allow only admins to delete documents
CREATE POLICY "Admin delete for Documents" ON public."Document" 
  FOR DELETE USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- 2. User table policies
-- Allow all authenticated users to view user profiles
CREATE POLICY "Users can view User profiles" ON public."User" 
  FOR SELECT USING (true);

-- Users can only update their own profiles
CREATE POLICY "Users can update own profile" ON public."User" 
  FOR UPDATE USING (
    auth.uid()::text = "id" OR 
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- Only service role and admins can create users
CREATE POLICY "Admin user creation" ON public."User" 
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- Only service role and admins can delete users
CREATE POLICY "Admin user deletion" ON public."User" 
  FOR DELETE USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- 3. Account table policies
-- Users can only view their own accounts
CREATE POLICY "Users can view own accounts" ON public."Account" 
  FOR SELECT USING (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- Users can only create accounts for themselves
CREATE POLICY "Users can create own accounts" ON public."Account" 
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role'
  );

-- Users can only update their own accounts
CREATE POLICY "Users can update own accounts" ON public."Account" 
  FOR UPDATE USING (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role'
  );

-- Users can only delete their own accounts
CREATE POLICY "Users can delete own accounts" ON public."Account" 
  FOR DELETE USING (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role'
  );

-- 4. Session table policies
-- Users can only view their own sessions
CREATE POLICY "Users can view own sessions" ON public."Session" 
  FOR SELECT USING (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role'
  );

-- Users can only create sessions for themselves
CREATE POLICY "Users can create own sessions" ON public."Session" 
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role'
  );

-- Users can only update their own sessions
CREATE POLICY "Users can update own sessions" ON public."Session" 
  FOR UPDATE USING (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role'
  );

-- Users can only delete their own sessions
CREATE POLICY "Users can delete own sessions" ON public."Session" 
  FOR DELETE USING (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role'
  );

-- 5. OwnerRegistration table policies
-- Users can view their own registrations
CREATE POLICY "Users can view own registrations" ON public."OwnerRegistration" 
  FOR SELECT USING (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- Users can create registrations for themselves
CREATE POLICY "Users can create own registrations" ON public."OwnerRegistration" 
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role'
  );

-- Users can update their own registrations, admins can update any
CREATE POLICY "Users can update own registrations" ON public."OwnerRegistration" 
  FOR UPDATE USING (
    auth.uid()::text = "userId" OR 
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- Only admins can delete registrations
CREATE POLICY "Admins can delete registrations" ON public."OwnerRegistration" 
  FOR DELETE USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- 6. VerificationToken table policies
-- Only service role can access verification tokens
CREATE POLICY "Service role only for verification tokens" ON public."VerificationToken"
  USING (auth.role() = 'service_role');

-- 7. Allowlist table policies
-- Only admins can read the allowlist
CREATE POLICY "Admin read for allowlist" ON public."Allowlist" 
  FOR SELECT USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- Only admins can modify the allowlist
CREATE POLICY "Admin write for allowlist" ON public."Allowlist" 
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- Only admins can update the allowlist
CREATE POLICY "Admin update for allowlist" ON public."Allowlist" 
  FOR UPDATE USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- Only admins can delete from the allowlist
CREATE POLICY "Admin delete for allowlist" ON public."Allowlist" 
  FOR DELETE USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'admin'
  );

-- 8. _prisma_migrations table policies
-- Only service role can access migrations table
CREATE POLICY "Service role only for prisma migrations" ON public._prisma_migrations
  USING (auth.role() = 'service_role'); 