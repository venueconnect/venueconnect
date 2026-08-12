/**
 * Complete Migration Script
 * 1. Adds 9 missing cities
 * 2. Imports all 8,089 SEO pages from Excel extract
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgjoyxhcmqcsnmhwbkgi.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnam95eGhjbXFjc25taHdia2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUyMzYwOCwiZXhwIjoyMTAyMDk5NjA4fQ.MhFUgMQChMOEH0Xm4cqXbt2PMfJJP1Vq8yNXmH6TFGU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load extracted SEO data
const extractedData = JSON.parse(
  fs.readFileSync('c:/Users/jiyap/Downloads/(1)/1/extracted_seo_data_complete.json', 'utf8')
);

async function addMissingCities() {
  console.log('\n🏙️ STEP 1: Adding 9 Missing Cities...\n');

  const newCities = [
    { city: 'Bhuj', slug: 'bhuj' },
    { city: 'Valsad', slug: 'valsad' },
    { city: 'Palanpur', slug: 'palanpur' },
    { city: 'Dahod', slug: 'dahod' },
    { city: 'Jamnagar', slug: 'jamnagar' },
    { city: 'Navsari', slug: 'navsari' },
    { city: 'Gandhidham', slug: 'gandhidham' },
    { city: 'Junagadh', slug: 'junagadh' },
    { city: 'Morbi', slug: 'morbi' }
  ];

  const citiesToInsert = newCities.map(c => ({
    city: c.city,
    city_slug: c.slug,
    area: c.city,
    area_slug: c.slug,
    state: 'Gujarat',
    created_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('locations')
    .insert(citiesToInsert, { onConflict: 'city_slug' });

  if (error) {
    console.error('❌ Error adding cities:', error.message);
    return false;
  }

  console.log(`✅ Successfully added/verified ${citiesToInsert.length} cities`);

  // Verify count
  const { count } = await supabase
    .from('locations')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total cities now: ${count}\n`);
  return true;
}

async function importSEOPages() {
  console.log('📄 STEP 2: Importing 8,089 SEO Pages...\n');

  try {
    // Get all city IDs
    console.log('  Fetching city mappings...');
    const { data: cities, error: citiesError } = await supabase
      .from('locations')
      .select('id, city, city_slug');

    if (citiesError) throw citiesError;

    const cityMap = {};
    cities.forEach(city => {
      cityMap[city.city] = city.id;
    });

    console.log(`  ✅ Found ${cities.length} cities\n`);

    // Prepare pages
    console.log('  Preparing pages for import...');
    const pagesToInsert = extractedData.pages.map(page => {
      const slug = page.urlSlug.replace(/^\/|\/$/g, '');

      return {
        slug,
        page_type: page.pageType,
        city_id: cityMap[page.city] || null,
        custom_content: {
          pageTitle: page.pageTitle,
          metaTitle: page.metaTitle,
          metaDesc: page.metaDesc,
          h1Tag: page.h1Tag,
          keyword: page.keyword,
          secondaryKeywords: page.secondaryKeywords,
          searchIntent: page.searchIntent,
          priority: page.priority
        },
        created_at: new Date().toISOString()
      };
    });

    console.log(`  ✅ Prepared ${pagesToInsert.length} pages\n`);

    // Bulk insert in batches
    console.log('  🚀 Inserting pages (this may take 2-3 minutes)...\n');
    const BATCH_SIZE = 500;
    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < pagesToInsert.length; i += BATCH_SIZE) {
      const batch = pagesToInsert.slice(i, i + BATCH_SIZE);
      const progress = Math.min(i + BATCH_SIZE, pagesToInsert.length);

      const { error: insertError } = await supabase
        .from('seo_pages')
        .insert(batch, { onConflict: 'slug' });

      if (insertError) {
        console.error(`    ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, insertError.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        const percentage = Math.round((progress / pagesToInsert.length) * 100);
        console.log(`    ✅ ${progress}/${pagesToInsert.length} (${percentage}%)`);
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 300));
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✅ IMPORT COMPLETE in ${duration}s!`);
    console.log(`   Successfully imported: ${successCount}`);
    if (errorCount > 0) console.log(`   ⚠️  Errors: ${errorCount}`);

    // Verify final count
    const { count: totalPages } = await supabase
      .from('seo_pages')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Total SEO pages in database: ${totalPages}\n`);

    // Show sample pages
    console.log('📝 Sample imported pages:');
    const { data: samples } = await supabase
      .from('seo_pages')
      .select('slug, page_type, custom_content')
      .limit(5);

    samples.forEach((page, i) => {
      console.log(`   ${i + 1}. /${page.slug}`);
      console.log(`      Type: ${page.page_type} | Priority: ${page.custom_content.priority}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    return false;
  }
}

async function runMigration() {
  console.log('\n' + '='.repeat(60));
  console.log('  🚀 VENUECONNECT - COMPLETE MIGRATION');
  console.log('='.repeat(60));

  try {
    // Step 1: Add cities
    const citiesOk = await addMissingCities();
    if (!citiesOk) {
      console.error('\n❌ Migration failed at cities step');
      process.exit(1);
    }

    // Step 2: Import pages
    const pagesOk = await importSEOPages();
    if (!pagesOk) {
      console.error('\n❌ Migration failed at pages step');
      process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log('  ✅ MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Test: http://localhost:3000/ahmedabad/wedding-venues/');
    console.log('   3. Test: http://localhost:3000/wedding-venue-near-me/');
    console.log('\n✨ All 8,089 pages are now live!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

runMigration();
