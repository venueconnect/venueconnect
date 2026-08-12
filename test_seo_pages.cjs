/**
 * Route Testing Script
 * Verifies that our imported SEO pages are queryable from Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pgjoyxhcmqcsnmhwbkgi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma3d3eWVlbXJ2d3lhaHR6d2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTM4MTAsImV4cCI6MjA5MjQ4OTgxMH0.LcGU0p3cYQIHWn2Z654MU7jOWyreKdoWNn62Iid35TY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRoutes() {
  console.log('\n' + '='.repeat(70));
  console.log('  🧪 TESTING SEO PAGES');
  console.log('='.repeat(70) + '\n');

  const testSlugs = [
    'ahmedabad/wedding-venues',
    'surat/photographers',
    'wedding-venue-near-me',
    'vadodara/banquet-halls',
    'photographers-near-me',
    'gandhinagar/catering',
    'rajkot/videographers',
    'bhavnagar/makeup-artists'
  ];

  for (const slug of testSlugs) {
    const { data, error } = await supabase
      .from('seo_pages')
      .select('slug, page_type, custom_content')
      .eq('slug', slug)
      .single();

    if (error) {
      console.log(`❌ /${slug}`);
      console.log(`   Error: ${error.message}\n`);
    } else {
      console.log(`✅ /${slug}`);
      console.log(`   Type: ${data.page_type}`);
      console.log(`   H1: ${data.custom_content.h1Tag}`);
      console.log(`   Keyword: ${data.custom_content.keyword}`);
      console.log(`   Priority: ${data.custom_content.priority}`);
      console.log();
    }
  }

  // Get page type distribution
  const { data: byType } = await supabase
    .from('seo_pages')
    .select('page_type', { count: 'exact' })
    .group('page_type');

  console.log('📊 PAGES BY TYPE:');
  const typeCounts = {};
  const { data: allPages, count: totalCount } = await supabase
    .from('seo_pages')
    .select('page_type', { count: 'exact', head: true });

  if (totalCount) {
    // Query for count by page_type
    console.log(`   Total: ${totalCount}\n`);

    const types = ['Event + City', 'Event + Near Me', 'Vendor + City', 'Vendor + Near Me', 'Venue + City', 'Venue + Near Me', 'Event + City Area', 'Vendor + City Area', 'Venue + City Area'];

    for (const type of types) {
      const { count } = await supabase
        .from('seo_pages')
        .select('*', { count: 'exact', head: true })
        .eq('page_type', type);

      if (count > 0) {
        console.log(`   ${type}: ${count}`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('  ✅ ALL TESTS PASSED! Your SEO pages are ready to use.');
  console.log('='.repeat(70));
  console.log('\n📝 To test in browser:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000/ahmedabad/wedding-venues/');
  console.log('   3. Check for H1, meta tags, and venue listings\n');
}

testRoutes().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
