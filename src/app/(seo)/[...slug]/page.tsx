import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Star, ArrowRight, Building2, Sparkles, ChevronRight, CheckCircle2, Phone, MessageCircle, Info, IndianRupee, Users2, Building, Store, ShieldCheck, Clock, Eye, Heart, PencilLine, Share2, Check, Camera } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getSEOPageBySlug, generateSEOPage, type SEOPageRow } from '@/lib/seo/pageGenerator';
import { buildMetadata, buildMetadataFromSlugs } from '@/lib/seo/metaBuilder';
import { unslugify } from '@/lib/seo/slugify';
import { sanitizeHTML } from '@/lib/sanitize';
import ListingFilter from '@/components/ListingFilter';
import { VENUE_TYPES, VENDOR_TYPES, GUJARAT_CITIES } from "@/lib/constants";
import SEOCollectionView from '@/components/seo/SEOCollectionView';
import { SEOVendorHubView } from '@/components/seo/SEOVendorHubView';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { RelatedSearches } from '@/components/seo/RelatedSearches';
import { SafeImage } from '@/components/ui/SafeImage';
import { cache } from 'react';

import ReviewsList from "@/components/ReviewsList";
import GetQuoteModal from "@/components/GetQuoteModal";
import VenueGallery from "@/components/listing/VenueGallery";
import ListingDescription from "@/components/listing/ListingDescription";
import VenueEnquiryForm from "@/components/listing/VenueEnquiryForm";
import ListingShareButton from "@/components/listing/ListingShareButton";
import { 
    QuickInfoBar, 
    PricingDetails, 
    AmenitiesGrid, 
    SpacesCapacity, 
    CateringPolicy, 
    LocationMap,
    NearestLandmarks,
    PolicyTerms,
    AboutVenue,
    GoodForOccasions,
    CuisinesServed,
    FacilitiesList,
    SpaceTypeAvailable,
    CarParking,
    MoreInformation,
    VenueSummary,
    FAQs
} from "@/components/listing/VenueSections";
import { VendorQuickStats, VendorServices, VendorPortfolio, VendorServiceAreas } from "@/components/listing/VendorSections";
import VendorEnquiryForm from "@/components/listing/VendorEnquiryForm";
import SimilarVendors from "@/components/listing/SimilarVendors";
import { enrichListings, getEnrichedImage, cleanName, enrichGallery } from '@/lib/imageEnricher';

// Cache critical lookups to share across generateMetadata and the Page component
const cachedGetSEOPageBySlug = cache(getSEOPageBySlug);
const cachedGetVenueBySlug = cache(async (slug: string) => {
    const supabase = await createClient();
    let res = await supabase.from('venues').select('*').ilike('slug', slug).maybeSingle();
    if (!res.data && slug.includes('-in-')) {
        const baseSlug = slug.split('-in-')[0];
        res = await supabase.from('venues').select('*').ilike('slug', baseSlug).maybeSingle();
    }
    return res;
});
const cachedGetVendorBySlug = cache(async (slug: string) => {
    const supabase = await createClient();
    let res = await supabase.from('vendors').select('*').ilike('slug', slug).maybeSingle();
    if (!res.data && slug.includes('-in-')) {
        const baseSlug = slug.split('-in-')[0];
        res = await supabase.from('vendors').select('*').ilike('slug', baseSlug).maybeSingle();
    }
    return res;
});

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function slugifyPathSegment(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
}

// Venue category slugs from categories table + common aliases
const VENUE_CATEGORY_SLUGS = new Set([
    'banquet-halls', 'banquet-hall', 'farmhouse', 'farmhouses',
    'hotels', 'hotel', 'resorts', 'resort',
    'party-plots', 'party-plot',
    'wedding-venues', 'wedding-venue',
    'lawn', 'lawns', 'convention-centre', 'convention-center', 'convention-centers',
    'venues', 'restaurants', 'restaurant',
    'club', 'clubs', 'rooftop-venue', 'rooftop-venues', 'garden-venue', 'garden-venues',
    'heritage-venue', 'heritage-venues', 'luxury-venue', 'luxury-venues',
    'birthday-party-venue', 'engagement-venue', 'corporate-event-venue', 
    'reception-venue', 'sangeet-ceremony-venue', 'garba-night-venue',
    'pool-party-venue', 'kitty-party-venue', 'cocktail-party-venue',
    'baby-shower-venue', 'anniversary-party-venue', 'pre-wedding-shoot-venue',
]);

const VENDOR_CATEGORY_SLUGS = new Set([
    'photographers', 'photographer', 'wedding-photographers',
    'videographers', 'videographer',
    'caterers', 'caterer', 'catering',
    'decorators', 'decorator',
    'mehndi-artists', 'mehndi-artist', 'mehendi-artists', 'mehendi-artist',
    'djs', 'dj',
    'bands', 'band',
    'event-planners', 'event-planner', 'wedding-planners', 'wedding-planner',
    'makeup-artists', 'makeup-artist',
    'florists', 'florist',
    'tent-houses', 'tent-house',
    'choreographers', 'choreographer',
    'invitation-cards', 'invitation-card',
    'cake-shops', 'cake-shop',
    'jewellers', 'jeweller',
    'astrologers', 'astrologer',
    'magicians', 'magician',
    'entertainers', 'entertainer',
    'bridal-wear', 'groom-wear',
    'vendors', 'all-vendors'
]);

function parseSlug(slugArr: string[]) {
    const cleanSlugArr = slugArr.filter(Boolean);
    const rawSlug = cleanSlugArr.join('/');

    // Keywords Identification
    const FOOD_TYPES = ['veg', 'non-veg', 'pure-veg'];
    const CITY_SLUGS = GUJARAT_CITIES.map(c => c.toLowerCase());

    // 1 Segment: /[city] or /[category] or /[category]-near-me
    if (slugArr.length === 1) {
        const s = slugArr[0].toLowerCase();
        // Near-me pages: /wedding-venue-near-me, /photographers-near-me, etc.
        if (s.endsWith('-near-me')) {
            const baseCategory = s.slice(0, s.length - '-near-me'.length);
            return { categorySlug: baseCategory, citySlug: 'gujarat', isNearMe: true, rawSlug };
        }
        if (VENDOR_CATEGORY_SLUGS.has(s)) {
            return { categorySlug: s, citySlug: 'all', isVendorSearch: true, isGlobal: true, rawSlug };
        }
        if (VENUE_CATEGORY_SLUGS.has(s)) {
            return { categorySlug: s, citySlug: 'all', isGlobal: true, rawSlug };
        }
        // Fallback: it's a city page /[city]
        return { citySlug: s, categorySlug: 'venues', rawSlug };
    }

    // 2 Segments: /[city]/[category] or /[city]/[property-slug]
    if (slugArr.length === 2) {
        const city = slugArr[0].toLowerCase();
        const item = slugArr[1].toLowerCase();

        // Explicit /all/vendors handling
        if (city === 'all' && (item === 'vendors' || item === 'all-vendors')) {
            return { citySlug: 'all', categorySlug: 'vendors', isVendorSearch: true, isGlobal: true, rawSlug };
        }

        if (FOOD_TYPES.includes(item)) {
            return { citySlug: city, categorySlug: 'venues', foodTypeSlug: item, rawSlug };
        }

        // Explicit vendor category slug → mark as vendor search
        if (VENDOR_CATEGORY_SLUGS.has(item)) {
            return { citySlug: city, categorySlug: item, isVendorSearch: true, rawSlug };
        }

        // Explicit venue category slug → venue search
        if (VENUE_CATEGORY_SLUGS.has(item)) {
            return { citySlug: city, categorySlug: item, isVendorSearch: false, rawSlug };
        }

        // Could be a venue/vendor property slug — check DB (handled downstream)
        return { citySlug: city, categorySlug: slugArr[1], isVendorSearch: false, rawSlug };
    }

    // 3 Segments: /[city]/vendors/[vendor-type] or /[city]/[area]/[category]
    if (slugArr.length === 3) {
        const [city, mid, last] = slugArr;
        if (mid === 'vendors') {
            return { citySlug: city, categorySlug: last, isVendorSearch: true, isVendorSlugPath: true, rawSlug };
        }

        if (FOOD_TYPES.includes(mid)) {
            return { citySlug: city, categorySlug: last, foodTypeSlug: mid, rawSlug };
        }

        return { citySlug: city, areaSlug: mid, categorySlug: last, rawSlug };
    }

    // 4 Segments: /[city]/[area]/vendors/[vendor-type]
    if (slugArr.length === 4) {
        const [city, area, mid, last] = slugArr;
        if (mid === 'vendors') {
            return { citySlug: city, areaSlug: area, categorySlug: last, isVendorSearch: true, isVendorSlugPath: true, rawSlug };
        }
        // Generic 4-segment fallback
        return { citySlug: city, areaSlug: area, categorySlug: last, rawSlug };
    }

    return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug: slugArr } = await params;
    const parsed = parseSlug(slugArr);
    if (!parsed) return {};

    const supabase = await createClient();
    // Check for listing first using cached lookups
    const { data: listing } = await cachedGetVenueBySlug(parsed.categorySlug);
    if (listing) {
        return {
            title: `${listing.name} - ${listing.city} | VenueConnect`,
            description: listing.description?.slice(0, 160) || `Check out ${listing.name} in ${listing.city}.`,
        };
    }

    // Near-me pages
    const isNearMe = (parsed as any).isNearMe;
    const headerList = await headers();
    const detectedCity = headerList.get('x-vercel-ip-city') || 'Ahmedabad';
    
    // For global pages, we keep 'gujarat' for metadata, but use detected city for fallback generation
    const displayCity = parsed.citySlug;
    const targetCityForMeta = (isNearMe && displayCity === 'gujarat') ? 'gujarat' : displayCity;

    const page = await cachedGetSEOPageBySlug(parsed.rawSlug);
    
    if (page && isNearMe && displayCity !== 'gujarat' && page.custom_content) {
        const content = page.custom_content as Record<string, any>;
        const localizedCity = unslugify(detectedCity);
        ['meta_title', 'meta_description', 'h1Tag', 'metaTitle', 'pageTitle', 'metaDesc', 'keyword', 'secondaryKeywords'].forEach(f => {
            if (content[f] && typeof content[f] === 'string' && content[f].includes('Gujarat')) {
                content[f] = content[f].replace(/Gujarat/g, localizedCity);
            }
        });
    }

    if (page) return buildMetadata(page);
    
    if (isNearMe) {
        const { buildMetadataFromSlugs: bm } = await import('@/lib/seo/metaBuilder');
        return bm(parsed.categorySlug + '-near-me', targetCityForMeta);
    }
    // Standard collection logic
    const categorySlug = parsed.categorySlug.toLowerCase();
    const citySlug = parsed.citySlug.toLowerCase();
    
    // Detect Area-only pages (e.g. /ahmedabad/prahlad-nagar)
    // If 2 segments and categorySlug is NOT in our known types, it's likely an area search for venues
    let finalCatForMeta = categorySlug;
    let finalAreaForMeta = (parsed as any).areaSlug;
    
    if (slugArr && slugArr.length === 2 && 
        !isNearMe && 
        !VENUE_CATEGORY_SLUGS.has(categorySlug) && 
        !VENDOR_CATEGORY_SLUGS.has(categorySlug) &&
        categorySlug !== 'venues' && categorySlug !== 'vendors') {
        finalCatForMeta = 'venues';
        finalAreaForMeta = categorySlug;
    }

    return buildMetadataFromSlugs(
        finalCatForMeta,
        citySlug,
        finalAreaForMeta
    );
}

export default async function TopLevelRouter({ params, searchParams }: PageProps) {
    const { slug: slugArr } = await params;
    const sParams = await searchParams;

    // Guard against static files being caught by the catch-all route
    const firstSegment = slugArr?.[0]?.toLowerCase();
    if (firstSegment && (
        firstSegment.endsWith('.ico') || 
        firstSegment.endsWith('.xml') || 
        firstSegment.endsWith('.txt') ||
        firstSegment.endsWith('.png') ||
        firstSegment.endsWith('.jpg') ||
        firstSegment.endsWith('.webmanifest')
    )) {
        return notFound();
    }

    const parsed = parseSlug(slugArr);
    if (!parsed) return notFound();

    let { categorySlug, citySlug, rawSlug, areaSlug, isVendorSearch } = parsed;
    const isNearMe = (parsed as any).isNearMe || false;
    
    // City Detection for Near-Me Pages
    const headerList = await headers();
    const detectedCity = headerList.get('x-vercel-ip-city') || 'Ahmedabad'; // Default to Ahmedabad for local/unknown
    
    let cityForData = citySlug;
    if (isNearMe && citySlug === 'gujarat') {
        cityForData = detectedCity.toLowerCase();
        console.log(`[NearMe] Detected data city: ${cityForData} for global slug: ${rawSlug}`);
    }
    
    const supabase = await createClient();

    // 1. IS IT A VENUE? (Check 2-segment slug if it's potentially a property)
    if (slugArr.length === 2) {
        const { data: venue } = await cachedGetVenueBySlug(categorySlug);

        if (venue) {
            const { data: profile } = venue.owner_id
                ? await supabase.from('profiles').select('phone_number, full_name').eq('id', venue.owner_id).maybeSingle()
                : { data: null };
            return <VenueDetailView venue={{ ...venue, profiles: profile }} cityParam={citySlug} />;
        }

        // Exact match check only for now, partial moved to end
    }

    // 2. IS IT A VENDOR?
    const isVendorSlugPath = (parsed as any).isVendorSlugPath;
    if (slugArr.length === 2 || (isVendorSlugPath && slugArr.length === 3)) {
        const targetSlug = categorySlug;
        const { data: vendor } = await cachedGetVendorBySlug(targetSlug);

        if (vendor) {
            const { data: profile } = vendor.owner_id
                ? await supabase.from('profiles').select('phone_number, full_name, email').eq('id', vendor.owner_id).maybeSingle()
                : { data: null };
            return <VendorDetailView vendor={{ ...vendor, profiles: profile }} cityParam={citySlug} />;
        }

        // If it was a 3-segment path /city/vendors/something but NO vendor found, it could be a category.
        // We continue below.
    }

    // 3. IS IT AN SEO PAGE OR CATEGORY?
    const [seoPage, catRow, cityRow] = await Promise.all([
        cachedGetSEOPageBySlug(rawSlug),
        supabase.from('categories').select('id, type').ilike('slug', categorySlug).maybeSingle().then(r => r.data),
        supabase.from('locations').select('id').ilike('city_slug', citySlug).maybeSingle().then(r => r.data),
    ]);
    
    console.log(`[TopLevelRouter] Slug: ${rawSlug}, SEO Page found: ${!!seoPage}, City: ${citySlug}`);

    // FALLBACK: If 2 segments and NONE of the above matched, it's likely an area!
    let forcedArea = areaSlug;
    let finalCategory = categorySlug;
    let forcedSpaceType = (parsed as any).spaceTypeSlug;
    let forcedFoodType = (parsed as any).foodTypeSlug;

    // Refine vendor detection using our canonical sets
    isVendorSearch = isVendorSearch || isVendorSlugPath || catRow?.type === 'vendor' || VENDOR_CATEGORY_SLUGS.has(categorySlug.toLowerCase()) || categorySlug.toLowerCase() === 'vendors';

    // Only treat 2nd segment as area if it's genuinely not a known category
    if (slugArr.length === 2 && !seoPage && !catRow
        && !VENUE_CATEGORY_SLUGS.has(categorySlug.toLowerCase())
        && !VENDOR_CATEGORY_SLUGS.has(categorySlug.toLowerCase())
        && categorySlug !== 'venues' && categorySlug !== 'vendors'
        && !forcedFoodType && !isVendorSearch) {
        forcedArea = categorySlug; // Treat 2nd segment as area
        finalCategory = 'venues';  // Show all venues for that area
    }

    const finalSeoPage = seoPage || (cityRow ? await generateSEOPage(finalCategory, catRow?.id ?? null, citySlug, cityRow.id) : null);

    // Dynamic Localization for City-Specific pages - Override DB 'Gujarat' ONLY if a specific city was targeted
    // For Global 'Near Me' pages (like /decorators-near-me), we keep 'Gujarat' as per sheet
    if (isNearMe && citySlug !== 'gujarat' && finalSeoPage?.custom_content) {
        const content = finalSeoPage.custom_content as Record<string, any>;
        const localizedCity = unslugify(citySlug);
        
        const fieldsToLocalize = [
            'h1Tag', 'h1_tag', 
            'metaTitle', 'meta_title', 
            'pageTitle', 'page_title', 
            'metaDesc', 'meta_description'
        ];
        fieldsToLocalize.forEach(field => {
            if (content[field] && typeof content[field] === 'string' && content[field].includes('Gujarat')) {
                content[field] = content[field].replace(/Gujarat/g, localizedCity);
            }
        });
    }

    // FETCH BOTH FOR ALL COLLECTIONS (Omni-Discovery)
    const [rawVenues, rawVendors] = await Promise.all([
        fetchVenues(finalCategory, cityForData, sParams, catRow?.id || finalSeoPage?.category_id, forcedArea, forcedSpaceType, forcedFoodType),
        fetchVendors(finalCategory, cityForData, sParams, catRow?.id || finalSeoPage?.category_id, forcedArea)
    ]);

    const venues = enrichListings(rawVenues);
    const vendors = enrichListings(rawVendors);

    // 4. RENDER VENDOR HUB (If exactly [city]/vendors - Skip for 'all' to show directory list)
    if (slugArr.length === 2 && categorySlug.toLowerCase() === 'vendors' && citySlug.toLowerCase() !== 'all') {
        return (
            <SEOVendorHubView
                citySlug={citySlug}
                locationLabel={unslugify(citySlug)}
                vendors={vendors}
            />
        );
    }

    console.log(`[TopLevelRouter] Final SEO Page H1: ${finalSeoPage?.custom_content?.h1Tag || 'NULL'}, isNearMe: ${isNearMe}`);

    return <SEOCollectionView
        seoPage={finalSeoPage}
        venues={venues}
        vendors={vendors}
        categorySlug={finalCategory}
        citySlug={citySlug}
        areaSlug={forcedArea}
        spaceType={forcedSpaceType}
        foodType={forcedFoodType}
        isVendorContext={isVendorSearch}
        isNearMe={isNearMe}
        rawSlug={rawSlug}
        sParams={sParams}
    />;
}

// ─── PARTIAL VIEWS ────────────────────────────────────────────────────────────

function VenueDetailView({ venue, cityParam }: { venue: any, cityParam: string }) {
    const enrichedMainImage = getEnrichedImage(venue);
    const cleanedName = cleanName(venue.name);
    const images = enrichGallery(venue.images, venue);

    return (
        <div className="min-h-screen bg-white">
            {/* TOP LEVEL BREADCRUMB */}
            <div className="bg-white border-b border-slate-50 md:border-none">
                <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-3 md:py-4">
                    <nav className="flex flex-wrap items-center gap-1.5 text-[11px] md:text-[13px] font-medium text-[#777]">
                        <Link href="/" className="hover:text-primary">Home</Link>
                        <span className="text-slate-300">/</span>
                        <Link href={`/${cityParam.toLowerCase()}`} className="hover:text-primary">{unslugify(cityParam)}</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 font-bold line-clamp-1">{cleanedName}</span>
                    </nav>
                </div>
            </div>

            {/* HERO SECTION WITH TITLE & RATING */}
            <div className="max-w-[1300px] mx-auto px-4 md:px-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                        {cleanedName}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                            <Star size={14} className="fill-current" />
                            <span className="text-sm font-black">4.2</span>
                        </div>
                        <span className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">(12 reviews)</span>
                        <ListingShareButton title={cleanedName} />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-slate-500">
                    <MapPin size={16} className="text-primary/60" />
                    <span className="text-sm font-medium">{venue.location || venue.area}, {venue.city}</span>
                </div>
            </div>

            <div className="max-w-[1300px] mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                    
                    {/* LEFT CONTENT AREA */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* 1. Images Smaller and side-by-side with form */}
                        <div className="mb-6">
                            <VenueGallery images={images} name={cleanedName} />
                        </div>

                        {/* 2. About Section (Description, Ambience, Services) */}
                        <AboutVenue venue={venue} />

                        {/* 2. Space Capacity */}
                        <SpacesCapacity venue={venue} />

                        {/* 3. Good for Occasions */}
                        <GoodForOccasions venue={venue} />

                        {/* 4. Cuisines Served */}
                        <CuisinesServed venue={venue} />

                        {/* 5. Facilities */}
                        <FacilitiesList venue={venue} />

                        {/* 6. Space Type Available */}
                        <SpaceTypeAvailable venue={venue} />

                        {/* 7. Car Parking */}
                        <CarParking />

                        {/* 8. More Information (Policies Table) */}
                        <MoreInformation venue={venue} />

                        {/* 9. Summary */}
                        <VenueSummary venue={venue} />

                        {/* 10. Reviews */}
                        <section id="reviews" className="scroll-mt-24 pt-12 border-t border-slate-100">
                            <h3 className="text-xl font-black text-slate-950 mb-8">Reviews & Ratings</h3>
                            <ReviewsList listingId={venue.id} listingType="venue" />
                        </section>

                        {/* 11. FAQs */}
                        <FAQs venue={venue} />

                        {/* 12. Location Map */}
                        <LocationMap venue={venue} />
                    </div>

                    {/* RIGHT SIDEBAR: FORM & LANDMARKS */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="sticky top-24 space-y-8">
                            {/* Lead Form */}
                            <VenueEnquiryForm venue={venue} />
                            
                            {/* Nearest Landmarks (Requested below form) */}
                            <NearestLandmarks venue={venue} />

                            {/* Policy Terms & Disclaimer (Requested below form) */}
                            <PolicyTerms />
                        </div>
                    </div>
                </div>
            </div>

            {/* RELATED VENUES / MORE LIKE THIS */}
            <div className="max-w-[1300px] mx-auto px-4 md:px-6 mt-20 pb-24 border-t border-slate-100 pt-20">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">More Like This in {unslugify(cityParam)}</h2>
                    <Link href={`/${cityParam}/venues`} className="text-sm font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>
                {/* This would normally be a carousel of similar venues */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <p className="text-slate-400 italic font-medium col-span-full text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        Discovering similar premium venues in {unslugify(cityParam)}...
                    </p>
                </div>
            </div>
        </div>
    );
}

function VendorDetailView({ vendor, cityParam }: { vendor: any, cityParam: string }) {
    const enrichedMainImage = getEnrichedImage(vendor);
    const cleanedName = cleanName(vendor.name);
    const images = enrichGallery(vendor.images, vendor);
    const isApproved = vendor.is_approved === true || vendor.is_verified === true;

    return (
        <div className="min-h-screen bg-slate-50/30">
            {/* BREADCRUMBS */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-3">
                    <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary">Home</Link><ChevronRight className="w-3 h-3" />
                        <Link href={`/${cityParam}`} className="hover:text-primary">{unslugify(cityParam)}</Link><ChevronRight className="w-3 h-3" />
                        <Link href={`/${cityParam}/vendors`} className="hover:text-primary">Vendors</Link><ChevronRight className="w-3 h-3" />
                        <span className="text-slate-900 truncate">{cleanedName}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-6 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">

                    {/* LEFT COLUMN: VISUALS & DETAILS */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* GALLERY BLOCK */}
                        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                            <VenueGallery images={images} name={cleanedName} />
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h1 className="text-2xl md:text-5xl font-black text-slate-900 leading-tight mb-2 md:mb-4 tracking-tight">{cleanedName}</h1>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[12px] md:text-sm font-bold text-slate-400 flex items-center gap-1.5">
                                                <MapPin size={14} className="text-primary" /> {vendor.location || vendor.address || vendor.city}
                                            </p>
                                            {isApproved && <Badge className="bg-green-500/10 text-green-600 border-none font-bold uppercase tracking-widest text-[9px]">Verified Pro</Badge>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-start md:self-center">
                                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl">
                                            <Star size={18} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-xl font-black text-slate-900">{vendor.rating || '4.8'}</span>
                                            <span className="text-slate-400 font-bold text-sm">({vendor.reviews || 0} Reviews)</span>
                                        </div>
                                        <ListingShareButton title={cleanedName} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting Price</p>
                                        <p className="text-lg font-black text-slate-900">₹{vendor.starting_price?.toLocaleString('en-IN') || 'Consult'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                        <p className="text-lg font-black text-slate-900">{vendor.category || 'Expert'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response Time</p>
                                        <p className="text-lg font-black text-slate-900">2-4 Hours</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exp.</p>
                                        <p className="text-lg font-black text-slate-900">5+ Years</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STICKY TAB NAVIGATION */}
                        <div className="bg-white border-y border-slate-100 sticky top-20 z-30 shadow-sm -mx-4 md:-mx-6 px-4 md:px-6 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-8 py-4">
                                {[
                                    { id: 'overview', label: 'Overview' },
                                    { id: 'portfolio', label: 'Portfolio' },
                                    { id: 'pricing', label: 'Pricing' },
                                    { id: 'contact', label: 'Contact' },
                                    { id: 'reviews', label: 'Reviews' }
                                ].map((tab) => (
                                    <a 
                                        key={tab.id} 
                                        href={`#${tab.id}`} 
                                        className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors whitespace-nowrap"
                                    >
                                        {tab.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* SECTIONS */}
                        <section id="overview" className="scroll-mt-32">
                             <h3 className="text-xl font-black text-slate-950 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-primary rounded-full" /> About {cleanedName}
                            </h3>
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                                <ListingDescription description={vendor.description || `Professional ${vendor.category || 'vendor'} providing premium services in ${cityParam}.`} />
                                
                                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-50">
                                    {[
                                        { label: 'Services', val: 'Wedding & Events' },
                                        { label: 'Experience', val: '5+ Years' },
                                        { label: 'Travel', val: 'Available' },
                                        { label: 'Booking', val: '20% Advance' }
                                    ].map((spec, i) => (
                                        <div key={i}>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                                            <p className="text-sm font-bold text-slate-900">{spec.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="portfolio" className="scroll-mt-32">
                            <VendorPortfolio images={images} name={cleanedName} />
                        </section>

                        <section id="pricing" className="scroll-mt-32">
                             <h3 className="text-xl font-black text-slate-950 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-primary rounded-full" /> Packages & Services
                            </h3>
                            <VendorServices vendor={vendor} />
                        </section>

                        <section id="contact" className="scroll-mt-32">
                             <h3 className="text-xl font-black text-slate-950 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-primary rounded-full" /> Contact & Location
                            </h3>
                            <VendorServiceAreas vendor={vendor} />
                        </section>

                        <section id="reviews" className="scroll-mt-32">
                             <h3 className="text-xl font-black text-slate-950 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-primary rounded-full" /> Reviews & Ratings
                            </h3>
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                                <ReviewsList listingId={vendor.id} listingType="vendor" />
                            </div>
                        </section>

                        {/* OTHER SERVICES IN CITY */}
                        <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                             <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mb-32 -mr-32 blur-3xl" />
                             <h3 className="text-2xl font-black mb-2">Other services in {unslugify(cityParam)}</h3>
                             <p className="text-white/40 font-bold text-xs uppercase tracking-[2px] mb-8">Comprehensive Event Solutions</p>
                             
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Venues', 'Caterers', 'Photographers', 'Decorators'].map(srv => (
                                    <Link key={srv} href={`/${cityParam}/${srv.toLowerCase()}`} className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{srv}</p>
                                        <ArrowRight size={14} className="mt-2 text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                    </Link>
                                ))}
                             </div>
                        </section>

                        {/* SIMILAR VENDORS */}
                        <section className="pt-10 border-t border-slate-100">
                             <SimilarVendors currentId={vendor.id} city={vendor.city || cityParam} category={vendor.category || 'Photographers'} />
                        </section>
                    </div>

                    {/* RIGHT COLUMN: STICKY FORM */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
                        <VendorEnquiryForm vendor={vendor} />
                        
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-500" /> Quality Commitment
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { t: 'Fast Response', d: 'Replies within 4 hours' },
                                    { t: 'Verified Work', d: 'All portfolio images are authentic' },
                                    { t: 'Secure Payment', d: 'Safe booking with VenueConnect' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={12} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 leading-none mb-1">{item.t}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM INSPIRATION SECTION (ALREADY IN PAGE) */}
            <div className="max-w-[1300px] mx-auto px-4 md:px-6 mt-10 pb-20">
                <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-950 mb-8 flex items-center gap-4">
                        <Camera className="text-primary" /> Event Planning Inspiration & Ideas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { t: 'Wedding Makeup Trends 2026', i: 'https://images.unsplash.com/photo-1529316275402-0462fcc4abd6?w=800&q=80' },
                            { t: 'Top 10 Photographer Poses', i: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80' },
                            { t: 'Best Decor Themes for Outdoors', i: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80' }
                        ].map((post, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-slate-100 relative">
                                    <SafeImage src={post.i} alt={post.t} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{post.t}</h4>
                                <p className="text-xs text-slate-400 mt-2 font-medium">Read more insights from experts <ArrowRight size={10} className="inline ml-1" /></p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function resolveOrCreateSEOPage(parsed: any, categorySlug: string, citySlug: string): Promise<SEOPageRow | null> {
    const supabase = await createClient();
    const existing = await getSEOPageBySlug(parsed.rawSlug);
    if (existing) return existing;

    const [{ data: catRow }, { data: cityRow }] = await Promise.all([
        supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle(),
        supabase.from('locations').select('id').eq('city_slug', citySlug).maybeSingle(),
    ]);

    if (!cityRow?.id) return null;
    return generateSEOPage(categorySlug, catRow?.id ?? null, citySlug, cityRow.id);
}

// Updated fetchers to use Category ID for accuracy
// Updated fetchers to use Category ID and Area for accuracy
// Maps URL category slugs → actual DB venue 'type' values (for broad OR matching)
const VENUE_SLUG_TO_TYPES: Record<string, string[]> = {
    'banquet-halls': ['Banquet Hall'],
    'banquet-hall': ['Banquet Hall'],
    'farmhouse': ['Farmhouse'],
    'farmhouses': ['Farmhouse'],
    'hotels': ['Hotel'],
    'hotel': ['Hotel'],
    'resorts': ['Resort'],
    'resort': ['Resort'],
    'party-plots': ['Party Plot'],
    'party-plot': ['Party Plot'],
    'wedding-venues': ['Banquet Hall', 'Heritage Venue', 'Convention Center', 'Boutique Venue', 'Resort', 'Hotel', 'Farmhouse'],
    'wedding-venue': ['Banquet Hall', 'Heritage Venue', 'Convention Center', 'Boutique Venue', 'Resort', 'Hotel', 'Farmhouse'],
    'lawn': ['Lawn', 'Farmhouse'],
    'lawns': ['Lawn', 'Farmhouse'],
    'convention-centre': ['Convention Center'],
    'convention-centers': ['Convention Center'],
    'restaurants': ['Restaurant', 'Cafe', 'Dining'],
    'restaurant': ['Restaurant', 'Cafe', 'Dining'],
    'birthday-party-venue': ['Banquet Hall', 'Restaurant', 'Party Plot', 'Hotel'],
    'engagement-venue': ['Banquet Hall', 'Hotel', 'Resort', 'Lawn'],
    'corporate-event-venue': ['Hotel', 'Banquet Hall', 'Convention Center', 'Resort'],
    'reception-venue': ['Banquet Hall', 'Hotel', 'Resort', 'Party Plot'],
    'sangeet-ceremony-venue': ['Banquet Hall', 'Hotel', 'Resort', 'Lawn'],
    'garba-night-venue': ['Party Plot', 'Lawn', 'Convention Center'],
    'pool-party-venue': ['Resort', 'Hotel', 'Farmhouse'],
    'kitty-party-venue': ['Restaurant', 'Cafe', 'Banquet Hall'],
    'cocktail-party-venue': ['Hotel', 'Resort', 'Restaurant', 'Club'],
    'baby-shower-venue': ['Banquet Hall', 'Restaurant', 'Hotel'],
    'anniversary-party-venue': ['Banquet Hall', 'Restaurant', 'Hotel'],
    'pre-wedding-shoot-venue': ['Resort', 'Farmhouse', 'Heritage Venue', 'Lawn'],
};

async function fetchVenues(categorySlug: string, citySlug: string, sParams: any, categoryId?: string | null, areaSlug?: string, spaceType?: string, foodType?: string) {
    const supabase = await createClient();
    let query = supabase.from('venues').select('*').eq('is_active', true);

    // Filter by city
    // 'gujarat' is used for near-me pages (state-wide) — skip city filter like 'all'
    if (citySlug && citySlug !== 'venues' && citySlug !== 'all' && citySlug !== 'gujarat') {
        const cityDecoded = unslugify(citySlug);
        console.log(`[fetchVenues] Filtering by city: ${cityDecoded} (slug: ${citySlug})`);
        query = query.or(`city.ilike.%${cityDecoded}%,city.ilike.%${citySlug}%`);
    }

    // Handle Path Food Type
    if (foodType) {
        const val = foodType.includes('non') ? 'Non-Veg' : 'Veg';
        query = query.ilike('food_type', `%${val}%`);
    }

    // Handle Area from Path (High Precision Fuzzy)
    if (areaSlug) {
        const fuzzyArea = areaSlug.split('-').join('%');
        query = query.or(`location.ilike.%${fuzzyArea}%,address.ilike.%${fuzzyArea}%`);
    }

    // Handle Horizontal Filters (sParams)
    if (sParams?.area) {
        const areaVal = unslugify(sParams.area);
        query = query.or(`location.ilike.%${areaVal}%,address.ilike.%${areaVal}%`);
    }
    if (sParams?.q) {
        const q = sParams.q;
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,type.ilike.%${q}%`);
    }
    if (sParams?.food && sParams.food !== 'Any') {
        if (sParams.food === 'Only Veg' || sParams.food === 'Pure Veg') query = query.ilike('food_type', '%Veg%').not('food_type', 'ilike', '%Non-Veg%');
        else if (sParams.food === 'Non-Veg') query = query.ilike('food_type', '%Non-Veg%');
    }
    if (sParams?.type && !spaceType) {
        query = query.ilike('type', `%${unslugify(sParams.type)}%`);
    }

    if (sParams?.budget) {
        if (sParams.budget === 'Under ₹1000') query = query.lt('veg_price_per_plate', 1000);
        else if (sParams.budget === '₹1000 - ₹1500') query = query.gte('veg_price_per_plate', 1000).lte('veg_price_per_plate', 1500);
        else if (sParams.budget === '₹1500 - ₹2000') query = query.gte('veg_price_per_plate', 1500).lte('veg_price_per_plate', 2000);
        else if (sParams.budget === 'Above ₹2000') query = query.gt('veg_price_per_plate', 2000);
    }

    if (sParams?.capacity) {
        if (sParams.capacity === 'Under 100') query = query.lt('max_capacity', 100);
        else if (sParams.capacity === '100 - 500') query = query.gte('max_capacity', 100).lte('max_capacity', 500);
        else if (sParams.capacity === '500 - 1000') query = query.gte('max_capacity', 500).lte('max_capacity', 1000);
        else if (sParams.capacity === 'Above 1000') query = query.gt('max_capacity', 1000);
    }

    if (sParams?.rating && sParams.rating !== 'Any') {
        const r = parseFloat(sParams.rating);
        if (!isNaN(r)) query = query.gte('rating', r);
    }

    if (sParams?.cuisine) {
        const cuisineList = sParams.cuisine.split(',');
        query = query.overlaps('cuisines', cuisineList);
    }

    // Filter by category using slug→type map OR category ID
    const slugKey = categorySlug.toLowerCase();
    const mappedTypes = VENUE_SLUG_TO_TYPES[slugKey];

    if (mappedTypes && mappedTypes.length > 0) {
        // Build OR filter across all mapped types
        const typeConditions = mappedTypes.map(t => `type.ilike.%${t}%`).join(',');
        query = query.or(typeConditions);
    } else if (categoryId && categorySlug !== 'venues' && categorySlug !== 'vendors' && categorySlug !== 'all') {
        const catName = unslugify(categorySlug);
        query = query.or(`category_id.eq.${categoryId},type.ilike.%${catName}%`);
    } else if (categorySlug !== 'venues' && categorySlug !== 'vendors' && categorySlug !== 'all' && slugKey !== 'wedding-venues') {
        const catName = unslugify(categorySlug);
        query = query.ilike('type', `%${catName}%`);
    }
    // If it's 'venues', 'all', or 'wedding-venues' with no mapping, return all venues in city (no type filter)

    let { data, error } = await query.order('rating', { ascending: false }).limit(40);
    
    // FALLBACK: If area search returned nothing, try broadening to just the city
    if ((!data || data.length === 0) && areaSlug && citySlug !== 'all') {
        console.log(`[fetchVenues] No results for area ${areaSlug}, falling back to city ${citySlug}`);
        const cityDecoded = unslugify(citySlug);
        let cityQuery = supabase.from('venues').select('*').eq('is_active', true);
        cityQuery = cityQuery.or(`city.ilike.%${cityDecoded}%,city.ilike.%${citySlug}%`);
        
        // Re-apply type filter
        if (mappedTypes && mappedTypes.length > 0) {
            cityQuery = cityQuery.or(mappedTypes.map(t => `type.ilike.%${t}%`).join(','));
        } else if (categoryId && categorySlug !== 'venues' && categorySlug !== 'vendors' && categorySlug !== 'all') {
            cityQuery = cityQuery.or(`category_id.eq.${categoryId},type.ilike.%${unslugify(categorySlug)}%`);
        } else if (categorySlug !== 'venues' && categorySlug !== 'vendors' && categorySlug !== 'all' && slugKey !== 'wedding-venues') {
            cityQuery = cityQuery.ilike('type', `%${unslugify(categorySlug)}%`);
        }

        const { data: cityData } = await cityQuery.order('rating', { ascending: false }).limit(40);
        data = cityData;
    }

    return (data || []).map((v: any) => ({ ...v, area: v.area, locations: { city: v.city, area: v.area || v.location } }));
}

async function fetchVendors(categorySlug: string, citySlug: string, sParams: any, categoryId?: string | null, areaSlug?: string) {
    const supabase = await createClient();

    // DIAGNOSTIC: Try fetching without strict active filter if nothing found later
    let query = supabase.from('vendors').select('*');

    // 'gujarat' is used for near-me pages (state-wide) — skip city filter like 'all'
    if (citySlug && citySlug !== 'all' && citySlug !== 'gujarat') {
        const cityDecoded = unslugify(citySlug);
        console.log(`[fetchVendors] Filtering by city: ${cityDecoded} (slug: ${citySlug})`);
        query = query.or(`city.ilike.%${cityDecoded}%,city.ilike.%${citySlug}%`);
    }

    if (areaSlug) {
        const fuzzyArea = areaSlug.split('-').join('%');
        query = query.or(`location.ilike.%${fuzzyArea}%`);
    }
    if (sParams?.area && sParams.area !== 'Any') {
        const fuzzy = typeof sParams.area === 'string' ? unslugify(sParams.area) : '';
        if (fuzzy) query = query.or(`location.ilike.%${fuzzy}%`);
    }

    // Mapping for plural/singular/alternative names (Exhaustive Authority Map)
    const MAPPINGS: Record<string, string> = {
        'photographers': 'Photographer',
        'photography': 'Photographer',
        'photographer': 'Photographer',
        'wedding-photographers': 'Photographer',
        'caterers': 'Caterer',
        'catering': 'Caterer',
        'caterer': 'Caterer',
        'food-services': 'Caterer',
        'decorators': 'Decorator',
        'decorator': 'Decorator',
        'decoration': 'Decorator',
        'makeup-artists': 'Makeup Artist',
        'makeup': 'Makeup Artist',
        'makeup-artist': 'Makeup Artist',
        'makeup-and-hair': 'Makeup Artist',
        'jewelry': 'Jeweller',
        'jewellery': 'Jeweller',
        'jewellers': 'Jeweller',
        'jeweller': 'Jeweller',
        'djs': 'DJ',
        'dj': 'DJ',
        'disc-jockeys': 'DJ',
        'mehendi': 'Mehndi Artist',
        'mehendi-artists': 'Mehndi Artist',
        'mehendi-artist': 'Mehndi Artist',
        'mehndi': 'Mehndi Artist',
        'mehndi-artists': 'Mehndi Artist',
        'mehndi-artist': 'Mehndi Artist',
        'pandit': 'Pandit',
        'pandits': 'Pandit',
        'astrologers': 'Astrologer',
        'astrologer': 'Astrologer',
        'videographers': 'Videographer',
        'videography': 'Videographer',
        'videographer': 'Videographer',
        'event-planners': 'Event Planner',
        'event-planner': 'Event Planner',
        'planners': 'Event Planner',
        'planner': 'Event Planner',
        'wedding-planners': 'Wedding Planner',
        'wedding-planner': 'Wedding Planner',
        'florists': 'Florist',
        'florist': 'Florist',
        'bands': 'Band',
        'band': 'Band',
        'music-band': 'Band',
        'choreography': 'Choreographer',
        'choreographers': 'Choreographer',
        'choreographer': 'Choreographer',
        'cakes': 'Cake Shop',
        'cake': 'Cake Shop',
        'wedding-cake': 'Cake Shop',
        'gifts': 'Gift',
        'gift': 'Gift',
        'return-gift': 'Gift',
        'invitations': 'Invitation Card',
        'invitation': 'Invitation Card',
        'invitation-wedding-card': 'Invitation Card',
        'magicians': 'Magician',
        'magician': 'Magician',
        'entertainers': 'Entertainer',
        'entertainer': 'Entertainer',
        'tent-houses': 'Tent House',
        'tent-house': 'Tent House',
        'all-vendors': 'Vendor',
        'vendors': 'Vendor'
    };

    const targetType = MAPPINGS[categorySlug.toLowerCase()] || unslugify(categorySlug);

    if (categorySlug !== 'venues' && categorySlug !== 'vendors' && categorySlug !== 'all-vendors' && categorySlug !== 'all') {
        const catName = unslugify(categorySlug);
        // Extremely broad OR filter using confirmed existing columns
        // Search for targetType (singular), catName (unslugified), or categorySlug (raw)
        // Also search in name/description for maximum reach
        query = query.or(`category.ilike.%${targetType}%,category.ilike.%${catName}%,category.ilike.%${categorySlug}%,name.ilike.%${targetType}%,name.ilike.%${catName}%,description.ilike.%${targetType}%`);
    }

    let { data, error } = await query.order('rating', { ascending: false }).limit(100);

    // FALLBACK: If area search returned nothing, try broadening to just the city
    if ((!data || data.length === 0) && areaSlug && citySlug !== 'all') {
        console.log(`[fetchVendors] No results for area ${areaSlug}, falling back to city ${citySlug}`);
        const cityDecoded = unslugify(citySlug);
        let cityQuery = supabase.from('vendors').select('*');
        cityQuery = cityQuery.or(`city.ilike.%${cityDecoded}%,city.ilike.%${citySlug}%`);
        
        // Re-apply category filter
        if (categorySlug !== 'vendors' && categorySlug !== 'all') {
            cityQuery = cityQuery.or(`category.ilike.%${targetType}%,category.ilike.%${unslugify(categorySlug)}%,category.ilike.%${categorySlug}%,name.ilike.%${targetType}%,description.ilike.%${targetType}%`);
        }
        
        const { data: cityData } = await cityQuery.order('rating', { ascending: false }).limit(60);
        data = cityData;
    }

    if (error) {
        console.error('fetchVendors error:', error);
        // SAFE FALLBACK: Try a very minimal query
        const { data: safeData } = await supabase.from('vendors').select('*').limit(20);
        return (safeData || []).map((v: any) => ({ ...v, type: v.category }));
    }

    // FINAL FALLBACK: Global (only for 'all' city or if truly empty)
    if (!data || data.length === 0) {
        if (citySlug === 'all') {
            let globalQuery = supabase.from('vendors').select('*');
            if (categorySlug !== 'vendors' && categorySlug !== 'all') {
                globalQuery = globalQuery.or(`category.ilike.%${targetType}%,category.ilike.%${unslugify(categorySlug)}%,category.ilike.%${categorySlug}%,name.ilike.%${targetType}%`);
            }
            const { data: globalData } = await globalQuery.order('rating', { ascending: false }).limit(60);
            if (globalData && globalData.length > 0) return globalData.map((v: any) => ({ ...v, type: v.category }));
        }
    }

    return (data || []).map((v: any) => ({ ...v, type: v.category }));
}
