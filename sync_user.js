const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dbhzwwqxcnvgspxsflux.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiaHp3d3F4Y252Z3NweHNmbHV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc3Njk3NSwiZXhwIjoyMDkzMzUyOTc1fQ.PcvzQrPRWLUIfwGuF9-r6h1dqIor5EryeDuuCxYUgxQ';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function linkUser() {
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  const ceoUser = usersData.users.find(u => u.email === 'ceo.cranios@gmail.com');
  if (ceoUser) {
    console.log('Found user ID:', ceoUser.id);
    const { error: dbError } = await supabase.from('players').upsert([
      { id: ceoUser.id, name: 'CEO Cranios', nickname: 'Master', avatar_url: '' }
    ]);
    if (dbError) {
      console.error('Error adding to players table:', dbError.message);
    } else {
      console.log('User successfully synced with players table!');
    }
  } else {
    console.log('User not found.');
  }
}

linkUser();
