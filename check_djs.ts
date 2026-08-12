import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pgjoyxhcmqcsnmhwbkgi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnam95eGhjbXFjc25taHdia2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MjM2MDgsImV4cCI6MjEwMjA5OTYwOH0.k5XPF_IsfBkYREnBpCjLaJN5UKiiQiCG9Bmr6arXaSE'
);

async function checkDJs() {
  console.log('Checking DJs in Junagadh...');
  const { data, error } = await supabase
    .from('vendors')
    .select('name, city, category, is_active')
    .ilike('city', '%Junagadh%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${data.length} vendors in Junagadh:`);
  data.forEach(v => {
    console.log(`- ${v.name} | Category: ${v.category} | Active: ${v.is_active} | City: ${v.city}`);
  });

  const djMatch = data.filter(v => v.category && v.category.toLowerCase().includes('dj'));
  console.log(`Found ${djMatch.length} DJs in Junagadh.`);
}

checkDJs();
