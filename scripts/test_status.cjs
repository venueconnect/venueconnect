const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pgjoyxhcmqcsnmhwbkgi.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnam95eGhjbXFjc25taHdia2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUyMzYwOCwiZXhwIjoyMTAyMDk5NjA4fQ.MhFUgMQChMOEH0Xm4cqXbt2PMfJJP1Vq8yNXmH6TFGU';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testStatusUpdate() {
  const { error } = await supabaseAdmin.from('user_requirements').update({ status: 'contacted' }).eq('id', 'dbfa3a1d-f939-443a-bec5-4979779059ef');
  console.log('Update status on user_requirements error:', error);
}

testStatusUpdate();
