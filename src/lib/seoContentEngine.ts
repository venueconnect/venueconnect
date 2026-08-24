import { citiesData } from "./citiesData";
import { formatSlug as formatTitle } from "./seoConstants";

export { formatTitle };

export interface SEOData {
    title: string;
    description: string;
    h1: string;
    heroSubtitle: string;
    content: string;
    faqSchema: string;
    cityImage?: string;
    breadcrumbs: { name: string, item: string }[];

    // NEW — added for AEO & Advanced SEO
    introParagraph1: string;
    introParagraph2: string;
    introParagraph3: string;
    faqs: Array<{ question: string; answer: string }>;
    breadcrumbSchema: string;
    localBusinessSchema: Record<string, any>;
    webPageSchema: string;
}

const CITY_CONTEXT: Record<string, string> = {
    ahmedabad: "UNESCO World Heritage old city (Pols walled area), Sabarmati riverfront, GIFT City corporate hub, SG Highway, Bodakdev & Prahlad Nagar as premium event zones, largest city in Gujarat",
    surat: "India's diamond & textile capital, super-affluent business families known for extravagant multi-day celebrations, Vesu & Adajan as upscale areas, fastest-growing city in India",
    vadodara: "Gujarat's cultural capital (Baroda), Navratri epicentre of India, Laxmi Vilas Palace as iconic heritage backdrop, MS University arts culture, Alkapuri & Fatehgunj as prime event belts",
    rajkot: "Kathiawadi warmth & hospitality, traditional Gujarati wedding culture, 150 Ft Ring Road commercial hub, Kalawad Road & Gondal Road event areas, Saurashtra's largest city",
    gandhinagar: "Gujarat's planned capital, Mahatma Mandir (one of India's largest convention centres), GIFT City proximity, IT sector and government corporate events, clean sector-based layout",
    bhavnagar: "Port city, Takhteshwar Temple as landmark, steel industry professional community, tight-knit family celebration traditions, Saurashtra's cultural hub",
    jamnagar: "Home of Reliance's oil refinery (world's largest), Lakhota Lake scenic setting, Jadeja royal heritage, traditional Saurashtra culture",
    anand: "Milk capital of India (Amul HQ + NDDB), Anand Agricultural University, growing FMCG and cooperative sector corporate events",
    junagadh: "Gateway to Gir forest (Asia's only wild lions), Girnar mountain pilgrimage, historic Nawabi architecture, deeply traditional Gujarati celebrations",
    morbi: "World's #1 ceramic tiles exporter, strong industrial community, business conferences and trade exhibitions are primary demand drivers"
};

// ─── Page-type detection helpers ─────────────────────────────────────────────

// Vendor category slugs (from code's VENDOR_CATEGORY_SLUGS set)
const VENDOR_SLUGS = new Set([
    'photography', 'photographers', 'photographer', 'wedding-photographers',
    'catering', 'caterers', 'caterer', 'food-services',
    'decorators', 'decorator', 'decoration',
    'makeup-and-hair', 'makeup', 'makeup-artists', 'makeup-artist',
    'mehendi', 'mehndi', 'mehendi-artists', 'mehndi-artists', 'mehendi-artist', 'mehndi-artist',
    'dj', 'djs', 'disc-jockeys',
    'videography', 'videographers', 'videographer',
    'pandit', 'pandits',
    'astrologers', 'astrologer',
    'jewellery', 'jewelry', 'jewellers', 'jeweller',
    'bands', 'band', 'music-band',
    'anchor', 'anchors',
    'choreography', 'choreographers', 'choreographer',
    'sounds-led-and-lights',
    'transportation',
    'wedding-cake', 'cakes', 'cake',
    'return-gift', 'gifts', 'gift',
    'invitation-wedding-card', 'invitations', 'invitation',
    'hathi-ghoda-and-car',
    'event-planners', 'event-planner', 'planners', 'planner', 'wedding-planners', 'wedding-planner',
    'florists', 'florist',
    'tent-houses', 'tent-house',
    'magicians', 'magician',
    'entertainers', 'entertainer',
    'all-vendors', 'vendors',
]);

// Venue-type slugs (non-event, non-vendor)
const VENUE_TYPE_SLUGS = new Set([
    'banquet-halls', 'banquet-hall', 'farmhouse', 'farmhouses',
    'hotels', 'hotel', 'resorts', 'resort',
    'party-plots', 'party-plot',
    'lawn', 'lawns', 'convention-centre', 'convention-centers',
]);

// Event slugs (end with -venues or are known event keywords)
const EVENT_KEYWORDS = new Set([
    'wedding', 'birthday-party', 'engagement', 'corporate-event', 'reception',
    'sangeet-ceremony', 'garba-night', 'pool-party', 'kitty-party', 'cocktail-party',
    'baby-shower', 'anniversary-party', 'farewell-party', 'reunion-party', 'product-launch',
    'conference', 'seminar', 'award-ceremony', 'team-outing', 'ring-ceremony',
    'naming-ceremony', 'musical-concert', 'kids-birthday-party', 'holi-party',
    'freshers-party', 'first-birthday-party', 'fashion-show', 'family-function',
    'exhibition', 'corporate-party', 'cocktail-dinner', 'class-reunion',
    'childrens-party', 'business-dinner', 'bridal-shower', 'bachelor-party',
    'annual-fest', 'adventure-party', 'haldi-ceremony',
]);

function isVendorSlug(slug: string): boolean {
    return VENDOR_SLUGS.has(slug.toLowerCase());
}

function isVenueTypeSlug(slug: string): boolean {
    return VENUE_TYPE_SLUGS.has(slug.toLowerCase());
}

function isEventSlug(slug: string): boolean {
    const s = slug.toLowerCase();
    // Ends with -venues → event page
    if (s.endsWith('-venues') || s.endsWith('-venue')) return true;
    // Or is a known event keyword (without -venues suffix, e.g. "wedding")
    const stripped = s.replace(/-venues?$/, '');
    return EVENT_KEYWORDS.has(stripped);
}

// ─── Near-me slug helpers ─────────────────────────────────────────────────────

/**
 * Detects /wedding-venue-near-me style slugs.
 * Returns the category label (e.g. "Wedding Venue") or null.
 */
function parseNearMeSlug(slug: string): string | null {
    const s = slug.toLowerCase();
    if (!s.endsWith('-near-me')) return null;
    // Strip "-near-me"
    const base = s.slice(0, s.length - '-near-me'.length);
    return formatTitle(base);
}

// ─── Main generator ───────────────────────────────────────────────────────────

export const generateSEOContent = (
    baseUrl: string,
    citySlug: string,
    categorySlug?: string,
    localitySlug?: string,
    eventSlug?: string,
    isNearMe: boolean = false
): SEOData => {

    const city = formatTitle(citySlug);
    const category = categorySlug ? formatTitle(categorySlug) : "";
    const locality = localitySlug ? formatTitle(localitySlug) : "";
    const event = eventSlug ? formatTitle(eventSlug) : "";
    const cityData = citiesData.find(c => c.slug.toLowerCase() === citySlug.toLowerCase());
    const actualCityImage = cityData?.image || "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80";
    const cityContext = CITY_CONTEXT[citySlug.toLowerCase()] || "a key cultural and economic hub in Gujarat, known for its vibrant community and grand celebrations.";

    let title = "";
    let description = "";
    let h1 = "";
    let heroSubtitle = "";
    let targetKeyword = "";

    const locationName = locality ? `${locality}, ${city}` : city;

    // ── Determine page type from category slug ────────────────────────────────
    const catSlugLower = (categorySlug || "").toLowerCase();
    const isVendor = isVendorSlug(catSlugLower);
    const isVenueType = isVenueTypeSlug(catSlugLower);
    const isEvent = eventSlug ? true : isEventSlug(catSlugLower);

    // ── 1. Near Me pages (1-segment: /wedding-venue-near-me) ─────────────────
    if (isNearMe || (categorySlug && !citySlug)) {
        const nearMeLabel = parseNearMeSlug(categorySlug || "") || category;
        const stateLabel = "Gujarat"; // Near-me pages are Gujarat-level
        targetKeyword = `${nearMeLabel} Venue Near Me in ${stateLabel}`;
        title = `${nearMeLabel} Venue Near Me in ${stateLabel} | Find & Book Now - VenueConnect`;
        description = `Searching for ${nearMeLabel.toLowerCase()} venue near you in ${stateLabel}? VenueConnect shows top-rated ${nearMeLabel.toLowerCase()} spaces nearby. Compare & get instant quotes now.`;
        h1 = `Best ${nearMeLabel} Venues Near Me in ${stateLabel}`;
        heroSubtitle = `Discover top-rated ${nearMeLabel.toLowerCase()} venues closest to your location in ${stateLabel}. Verified listings with instant quotes.`;
    }
    // ── 2. Event + City Area: /ahmedabad/bopal/wedding-venues → Issue #4 ─────
    else if (localitySlug && categorySlug && isEvent) {
        targetKeyword = `${category} in ${locality}, ${city}`;
        title = `Best ${category} in ${locality}, ${city} | Book Near You - VenueConnect`;
        description = `Find the top-rated ${category.toLowerCase()} in ${locality}, ${city}. Compare halls, banquet spaces & party plots. Get free quotes & instant leads. Browse 100+ options on VenueConnect.`;
        h1 = `Best ${category} in ${locality}, ${city}`;
        heroSubtitle = `Explore verified ${category.toLowerCase()} in the ${locality} area of ${city}. Perfect for your upcoming grand celebration.`;
    }
    // ── 3. Venue + City Area: /ahmedabad/bopal/banquet-halls → Issue #6 ──────
    else if (localitySlug && categorySlug && isVenueType) {
        targetKeyword = `${category} in ${locality}, ${city}`;
        title = `Best ${category} in ${locality}, ${city} | Compare Near You - VenueConnect`;
        description = `Find top ${category.toLowerCase()} in ${locality}, ${city} for any occasion. Compare capacity, pricing & amenities. 100+ verified listings. Get free quotes on VenueConnect Gujarat.`;
        h1 = `Best ${category} in ${locality}, ${city}`;
        heroSubtitle = `Explore verified ${category.toLowerCase()} in the ${locality} area of ${city}. Perfect for your upcoming grand celebration.`;
    }
    // ── 4. Vendor + City Area: /ahmedabad/bopal/vendors/photographers → Issue #5 ─
    else if (localitySlug && categorySlug && isVendor) {
        targetKeyword = `${category} in ${locality}, ${city}`;
        title = `Top ${category} in ${locality}, ${city} | Hire Near You - VenueConnect`;
        description = `Hire top ${category.toLowerCase()} in ${locality}, ${city} for weddings, birthdays & all events. Compare portfolios, pricing & reviews. Get direct leads via WhatsApp. Book on VenueConnect.`;
        h1 = `Top ${category} in ${locality}, ${city}`;
        heroSubtitle = `Find the best ${category.toLowerCase()} closest to you in ${locality}, ${city}. Verified professionals with instant quotes.`;
    }
    // ── 5. Vendor + City Area (generic locality) ──────────────────────────────
    else if (localitySlug && categorySlug) {
        targetKeyword = `${category} in ${locality}, ${city}`;
        title = `Best ${category} in ${locality}, ${city} | Book Near You - VenueConnect`;
        description = `Find the top-rated ${category.toLowerCase()} in ${locality}, ${city}. Compare prices, read reviews & get free quotes instantly on VenueConnect.`;
        h1 = `Best ${category} in ${locality}, ${city}`;
        heroSubtitle = `Explore verified ${category.toLowerCase()} in the ${locality} area of ${city}. Perfect for your upcoming event.`;
    }
    // ── 6. Event + City: /ahmedabad/wedding-venues → Issue #1 ────────────────
    else if (categorySlug && citySlug && isEvent && !isVendor) {
        const eventLabel = category.replace(/\s+Venues?$/i, "");
        targetKeyword = `${category} in ${city}`;
        title = `Best ${category} in ${city} | Book & Compare Prices - VenueConnect`;
        description = `Find the best ${category.toLowerCase()} in ${city}. Compare wedding halls, banquet spaces & party plots. Get free quotes & instant leads. Browse 100+ options on VenueConnect.`;
        h1 = `Best ${category} in ${city}`;
        heroSubtitle = `Looking for the perfect spot for your ${eventLabel.toLowerCase()}? Discover the most loved spaces in ${city} with real user reviews.`;
    }
    // ── 7. Vendor + City: /ahmedabad/vendors/photographers → Issue #2 ────────
    else if (categorySlug && citySlug && isVendor) {
        targetKeyword = `${category} in ${city}`;
        title = `Top ${category} in ${city} | Compare & Hire - VenueConnect`;
        description = `Hire top ${category.toLowerCase()} in ${city} for weddings, birthdays & all events. Compare portfolios, pricing & reviews. Get direct leads via WhatsApp. Book on VenueConnect.`;
        h1 = `Top ${category} in ${city}`;
        heroSubtitle = `Browse the ultimate selection of ${category.toLowerCase()} across ${city}. Handpicked for quality, service excellence and price transparency.`;
    }
    // ── 8. Venue Type + City: /ahmedabad/banquet-halls → Issue #3 ────────────
    else if (categorySlug && citySlug && isVenueType) {
        targetKeyword = `${category} in ${city}`;
        title = `Best ${category} in ${city} | Compare Prices & Book - VenueConnect`;
        description = `Find top ${category.toLowerCase()} in ${city} for any occasion. Compare capacity, pricing & amenities. 100+ verified listings. Get free quotes on VenueConnect Gujarat.`;
        h1 = `Best ${category} in ${city}`;
        heroSubtitle = `Browse the ultimate selection of ${category.toLowerCase()} across ${city}. Handpicked for quality, service excellence and price transparency.`;
    }
    // ── 9. Generic Category + City (fallback) ────────────────────────────────
    else if (categorySlug && citySlug) {
        targetKeyword = `${category} in ${city}`;
        title = `Best ${category} in ${city} | Book & Compare - VenueConnect`;
        description = `Find the best ${category.toLowerCase()} in ${city}. Compare options, read verified reviews and get free quotes. Browse 100+ listings on VenueConnect Gujarat.`;
        h1 = `Best ${category} in ${city}`;
        heroSubtitle = `Browse the ultimate selection of ${category.toLowerCase()} across ${city}. Handpicked for quality, service excellence and price transparency.`;
    }
    // ── 10. City-only fallback ────────────────────────────────────────────────
    else {
        targetKeyword = city;
        title = `Best Event Venues & Vendors in ${city} | VenueConnect`;
        description = `Discover top-rated banquet halls, wedding photographers, and decorators in ${city}. Your one-stop shop for event planning in Gujarat.`;
        h1 = `Event Planning in ${city}`;
        heroSubtitle = `Connecting you with the best professionals and spaces in ${city}.`;
    }

    const premiumAreas = cityData?.localities ? cityData.localities.slice(0, 2).map(l => formatTitle(l)).join(' or ') : 'the city center';
    const introParagraph1 = `${targetKeyword} is one of the most searched terms for anyone planning a celebration in the vibrant heart of ${city}. As ${cityContext}, ${city} offers a unique blend of heritage and modernity that reflects in its event spaces. Whether you are looking for premium zones like ${premiumAreas}, VenueConnect helps you navigate the local landscape to find the perfect match for your requirements.`;

    const introParagraph2 = `When choosing ${category.toLowerCase() || 'a venue'} in ${locationName}, it's essential to consider factors like guest capacity, in-house catering quality, and whether you prefer an indoor banquet hall or an outdoor party plot. In ${city}, popular areas often book up months in advance, so we recommend comparing multiple options based on their real photos and verified user reviews to ensure your event goes exactly as planned.`;

    const introParagraph3 = `At VenueConnect, we pride ourselves on being Gujarat's most trusted platform for event planning, offering over 100+ verified listings across ${city}. Our mission is to provide price transparency and quality assurance, allowing you to get free, instant quotes from top-rated professionals. Browse our verified list below and get a free quote today.`;

    const content = `
        <div class="prose prose-slate max-w-none">
            <p>${introParagraph1}</p>
            <p>${introParagraph2}</p>
            <p>${introParagraph3}</p>
        </div>
    `;

    const faqs = [
        {
            question: `What is the average cost of ${category.toLowerCase() || 'event'} venues in ${city}?`,
            answer: `The average cost for ${category.toLowerCase() || 'venues'} in ${city} typically ranges from ₹500 to ₹2,500 per plate depending on the luxury level and included services. Seasonal variations, especially during the peak wedding months in Gujarat, can impact pricing and availability significantly.`
        },
        {
            question: `How many verified ${category.toLowerCase() || 'event'} options are on VenueConnect in ${city}?`,
            answer: `Currently, we feature over ${cityData?.venues || 45} verified ${category.toLowerCase() || 'event professionals'} in ${city}, each thoroughly vetted for quality and service excellence. We continuously update our database to ensure you have access to the newest and most trending spots in the city.`
        },
        {
            question: `What are the best areas in ${city} for ${category.toLowerCase() || 'hosting events'}?`,
            answer: `For premium celebrations in ${city}, areas like ${cityData?.localities ? cityData.localities.slice(0, 3).map(l => formatTitle(l)).join(', ') : 'the central business districts'} are highly recommended due to their accessibility and choice of luxury venues. Each locality offers a different vibe, from busy urban centers to serene outskirts.`
        },
        {
            question: `What should I look for in a ${category.toLowerCase() || 'venue'} in ${city}?`,
            answer: `Key facilities to verify include ample parking space, reliable power backup, air conditioning quality, and the flexibility of their catering policies. In a city like ${city}, checking for a venue's previous experience with similar ${category.toLowerCase()} can give you peace of mind regarding their service execution.`
        },
        {
            question: `How do I book a ${category.toLowerCase() || 'venue'} via VenueConnect?`,
            answer: `Booking is a simple three-step process: browse our verified listings, click on 'Get Free Quotes' to receive direct pricing from the owner, and then confirm your choice after comparing multiple offers. We facilitate the connection so you get the best possible direct-from-owner rates.`
        },
        {
            question: `Is it free to use VenueConnect for finding venues in ${city}?`,
            answer: `Yes, VenueConnect is completely free for users looking to find and compare venues or vendors in ${city}. We do not charge any convenience fees or commissions to the customers; our goal is simply to make event planning transparent and accessible for everyone.`
        }
    ];

    const faqSchema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    });

    const breadcrumbs = [
        { name: "Home", item: `${baseUrl}` }
    ];
    if (citySlug) breadcrumbs.push({ name: city, item: `${baseUrl}/${citySlug}` });
    if (localitySlug) breadcrumbs.push({ name: locality, item: `${baseUrl}/${citySlug}/${localitySlug}` });
    if (categorySlug) {
        let path = "";
        if (isNearMe) {
            path = `${categorySlug}-near-me`;
        } else if (localitySlug) {
            path = `${citySlug}/${localitySlug}/${isVendor ? 'vendors/' : ''}${categorySlug}`;
        } else {
            path = isVendor ? `${citySlug}/vendors/${categorySlug}` : `${citySlug}/${categorySlug}`;
        }
        breadcrumbs.push({ name: category, item: `${baseUrl}/${path}` });
    }

    const breadcrumbSchema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": crumb.name,
            "item": crumb.item
        }))
    });

    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `VenueConnect — ${h1}`,
        "description": description,
        "url": `${baseUrl}/${categorySlug ? categorySlug + '-in-' + citySlug : citySlug}`,
        "telephone": "+91-9586500686",
        "priceRange": "₹–₹₹₹",
        "areaServed": {
            "@type": "City",
            "name": city,
            "addressRegion": "Gujarat",
            "addressCountry": "IN"
        },
        "serviceType": targetKeyword
    };

    const webPageSchema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": `${baseUrl}/${categorySlug ? categorySlug + '-in-' + citySlug : citySlug}`,
        "inLanguage": "en-IN",
        "isPartOf": { "@type": "WebSite", "name": "VenueConnect", "url": "https://venueconnect.in" }
    });

    return {
        title,
        description,
        h1,
        heroSubtitle,
        content,
        faqSchema,
        cityImage: actualCityImage,
        breadcrumbs,
        introParagraph1,
        introParagraph2,
        introParagraph3,
        faqs,
        breadcrumbSchema,
        localBusinessSchema,
        webPageSchema
    };
};
