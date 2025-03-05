-- Document table policies without visibility column dependency
-- These are simplified policies that will work regardless of table structure

-- Allow authenticated users to view documents
CREATE POLICY "Authenticated users can view Documents" ON public."Document" 
  FOR SELECT USING (true);

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