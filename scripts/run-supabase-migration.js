const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  // Create a Supabase client with admin privileges
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../prisma/migrations/supabase-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into separate statements
    const statements = migrationSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('pgclient', { query: statement + ';' });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          // Continue with the next statement
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (statementError) {
        console.error(`Exception executing statement ${i + 1}:`, statementError);
        // Continue with the next statement
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 