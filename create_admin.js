const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dbhzwwqxcnvgspxsflux.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiaHp3d3F4Y252Z3NweHNmbHV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc3Njk3NSwiZXhwIjoyMDkzMzUyOTc1fQ.PcvzQrPRWLUIfwGuF9-r6h1dqIor5EryeDuuCxYUgxQ';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'ceo.cranios@gmail.com',
    password: 'W@rrio$2026',
    email_confirm: true
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user.id);
    
    // Also add to players table
    const { error: dbError } = await supabase.from('players').insert([
      { id: data.user.id, name: 'CEO Cranios', nickname: 'Master', avatar_url: '' }
    ]);
    if (dbError) {
      console.error('Error adding to players table:', dbError.message);
    } else {
      console.log('User added to players table.');
    }
  }
}

createAdmin();
