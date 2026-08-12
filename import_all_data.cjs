/**
 * Master Data Import Script for VenueConnect
 * Run this AFTER running FINAL_SETUP_RUN_THIS.sql in Supabase SQL Editor
 * 
 * Populates:
 * 1. Locations (Cities & Areas)
 * 2. 320 Venues (from generated_venues.sql)
 * 3. 8,089 SEO Pages (from extracted_seo_data_complete.json)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgjoyxhcmqcsnmhwbkgi.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnam95eGhjbXFjc25taHdia2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUyMzYwOCwiZXhwIjoyMTAyMDk5NjA4fQ.MhFUgMQChMOEH0Xm4cqXbt2PMfJJP1Vq8yNXmH6TFGU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function importCities() {
  console.log('\n🏙️ STEP 1: Importing Cities & Locations...\n');

  const cities = [
    { city: 'Ahmedabad', city_slug: 'ahmedabad', area: 'Ahmedabad', area_slug: 'ahmedabad', state: 'Gujarat' },
    { city: 'Surat', city_slug: 'surat', area: 'Surat', area_slug: 'surat', state: 'Gujarat' },
    { city: 'Vadodara', city_slug: 'vadodara', area: 'Vadodara', area_slug: 'vadodara', state: 'Gujarat' },
    { city: 'Rajkot', city_slug: 'rajkot', area: 'Rajkot', area_slug: 'rajkot', state: 'Gujarat' },
    { city: 'Gandhinagar', city_slug: 'gandhinagar', area: 'Gandhinagar', area_slug: 'gandhinagar', state: 'Gujarat' },
    { city: 'Bhavnagar', city_slug: 'bhavnagar', area: 'Bhavnagar', area_slug: 'bhavnagar', state: 'Gujarat' },
    { city: 'Anand', city_slug: 'anand', area: 'Anand', area_slug: 'anand', state: 'Gujarat' },
    { city: 'Nadiad', city_slug: 'nadiad', area: 'Nadiad', area_slug: 'nadiad', state: 'Gujarat' },
    { city: 'Bharuch', city_slug: 'bharuch', area: 'Bharuch', area_slug: 'bharuch', state: 'Gujarat' },
    { city: 'Mehsana', city_slug: 'mehsana', area: 'Mehsana', area_slug: 'mehsana', state: 'Gujarat' },
    { city: 'Bhuj', city_slug: 'bhuj', area: 'Bhuj', area_slug: 'bhuj', state: 'Gujarat' },
    { city: 'Valsad', city_slug: 'valsad', area: 'Valsad', area_slug: 'valsad', state: 'Gujarat' },
    { city: 'Palanpur', city_slug: 'palanpur', area: 'Palanpur', area_slug: 'palanpur', state: 'Gujarat' },
    { city: 'Dahod', city_slug: 'dahod', area: 'Dahod', area_slug: 'dahod', state: 'Gujarat' },
    { city: 'Jamnagar', city_slug: 'jamnagar', area: 'Jamnagar', area_slug: 'jamnagar', state: 'Gujarat' },
    { city: 'Navsari', city_slug: 'navsari', area: 'Navsari', area_slug: 'navsari', state: 'Gujarat' },
    { city: 'Gandhidham', city_slug: 'gandhidham', area: 'Gandhidham', area_slug: 'gandhidham', state: 'Gujarat' },
    { city: 'Junagadh', city_slug: 'junagadh', area: 'Junagadh', area_slug: 'junagadh', state: 'Gujarat' },
    { city: 'Morbi', city_slug: 'morbi', area: 'Morbi', area_slug: 'morbi', state: 'Gujarat' }
  ];

  const citiesToInsert = cities.map(c => ({
    ...c,
    created_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('locations')
    .upsert(citiesToInsert, { onConflict: 'city_slug,area_slug' });

  if (error) {
    console.error('❌ Error inserting cities:', error.message);
    return false;
  }

  console.log(`✅ Successfully added/updated ${citiesToInsert.length} cities.`);
  return true;
}

async function importSEOPages() {
  console.log('\n📄 STEP 2: Importing 8,089 SEO Pages...\n');

  const filePath = path.join(__dirname, 'extracted_seo_data_complete.json');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ SEO Data file not found at ${filePath}`);
    return false;
  }

  const extractedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Get all city mappings
  const { data: cities, error: citiesError } = await supabase
    .from('locations')
    .select('id, city');

  if (citiesError) {
    console.error('❌ Error fetching cities:', citiesError.message);
    return false;
  }

  const cityMap = {};
  cities.forEach(c => { cityMap[c.city] = c.id; });

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

  console.log(`  Preparing ${pagesToInsert.length} SEO pages...`);
  const BATCH_SIZE = 500;
  let successCount = 0;

  for (let i = 0; i < pagesToInsert.length; i += BATCH_SIZE) {
    const batch = pagesToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('seo_pages').upsert(batch, { onConflict: 'slug' });
    if (error) {
      console.error(`    ❌ Batch error at ${i}:`, error.message);
    } else {
      successCount += batch.length;
      console.log(`    ✅ Inserted ${successCount}/${pagesToInsert.length} pages`);
    }
  }

  console.log(`✅ Completed SEO Pages import. Total: ${successCount}`);
  return true;
}

async function run() {
  console.log('=' .repeat(60));
  console.log('🚀 VENUECONNECT DATA MIGRATION SCRIPT');
  console.log('Targeting:', SUPABASE_URL);
  console.log('=' .repeat(60));

  const cOk = await importCities();
  if (cOk) {
    await importSEOPages();
  }
}

run();
