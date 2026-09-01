'use client';
import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { MapPin, Star, ArrowRight, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Building, Store, Building2, Phone, MessageCircle, Info, IndianRupee, Users2, Globe2, ShieldCheck, ArrowLeft, Search, Crown, Eye, Heart, Navigation } from 'lucide-react';

const REVIEWS = [
  { name: "Amarya", text: "We recently hosted our child's first birthday with the help of VenueConnect and it was a very memorable...", title: "Wonderful Experience !", rating: 5 },
  { name: "Siddharth", text: "Found the perfect photographer for my sister's wedding. The process was smooth and the quality was top-notch.", title: "Extremely Professional", rating: 5 },
  { name: "Meera", text: "Great experience booking my pre-wedding shoot. The vendor was very cooperative and understanding.", title: "Saved my day!", rating: 5 },
  { name: "Rahul J.", text: "The team helped us find a venue on extremely short notice. Truly appreciate the quick support and verified list.", title: "Fast & Reliable", rating: 5 },
  { name: "Pooja P.", text: "A one stop solution for all my event needs. Managed to hire a decorator and caterer within hours.", title: "Highly Recommended", rating: 5 },
  { name: "Ankit", text: "Transparency in pricing is what I liked the most. No hidden costs, just honest professional service.", title: "Best in class", rating: 5 },
  { name: "Ishaan", text: "Managed our corporate retreat perfectly. The quality of vendors listed here is premium.", title: "Excellent Service", rating: 5 },
  { name: "Divya", text: "Loved the personal touch and guidance. They really care about making your event special.", title: "Truly Memorable", rating: 5 }
];

const ReviewCarousel = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    
    const [revStartIndex, setRevStartIndex] = useState(0);
    // Use a stable visible count for hydration, then adjust after mount
    const visibleCount = !mounted ? 3 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3);

    const next = () => {
        setRevStartIndex((prev) => (prev + 1) % REVIEWS.length);
    };

    const prev = () => {
        setRevStartIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
    };

    const displayReviews = [...REVIEWS, ...REVIEWS].slice(revStartIndex, revStartIndex + visibleCount);

    return (
        <div className="relative px-12 group/revnav">
            <button suppressHydrationWarning onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all z-20 border border-slate-100 md:-left-4">
                <ChevronLeft size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {displayReviews.map((r, i) => (
                    <div key={i} className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center justify-center min-h-[300px] md:min-h-[360px] w-full">
                        <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2 md:mb-4">{r.name}</h3>
                        <p className="text-slate-600 font-medium text-center mb-6 md:mb-8 leading-relaxed opacity-90 text-sm md:text-sm px-2">"{r.text}"</p>
                        <div className="flex gap-1.5 text-amber-500 mb-6 md:mb-8">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} className={i < r.rating ? "fill-current" : "text-slate-200"} />
                            ))}
                        </div>
                        <p className="text-base md:text-lg font-black text-primary uppercase tracking-tight">{r.title}</p>
                    </div>
                ))}
            </div>

            <button suppressHydrationWarning onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all z-20 border border-slate-100 md:-right-4">
                <ChevronRight size={24} />
            </button>
        </div>
    );
};
import { Button } from '@/components/ui/button';
import ListingFilter from '@/components/ListingFilter';
import OmniSearchBar from '@/components/listing/OmniSearchBar';
import { VENUE_TYPES, VENDOR_TYPES, GUJARAT_CITIES, OCCASIONS as OCCASIONS_DATA, EVENT_SUGGESTIONS } from "@/lib/constants";
import { citiesData } from "@/lib/citiesData";
import { getListingImage, getVarietyFallback } from "@/lib/imageUtils";
import GetQuoteModal from '@/components/GetQuoteModal';

function unslugify(slug: string) {
    if (!slug) return '';
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
import { buildListingSlug } from '@/lib/seo/slugify';

const blogs = [
    { title: "Event Lighting Ideas That Completely...", text: "Lighting is one of the most powerful yet oft...", date: "Friday Mar 27, 2026", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80", slug: "event-lighting-ideas" },
    { title: "How Couples Are Blending Festiviti...", text: "Indian weddings have always been grand, vibr...", date: "Tuesday Apr 14, 2026", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80", slug: "blending-festivities" },
    { title: "Modern Wedding Rituals That Are Rep...", text: "Weddings have always been a reflection of cu...", date: "Thursday Apr 09, 2026", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80", slug: "modern-wedding-rituals" },
    { title: "Bollywood Bridal Lehengas That Defi...", text: "When it comes to Indian weddings, Bollywood h...", date: "Saturday Apr 04, 2026", img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80", slug: "bollywood-bridal-lehengas" },
    { title: "Top 10 Birthday Party Ideas for Kids", text: "Planning a kids birthday can be effortless w...", date: "Monday Mar 30, 2026", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80", slug: "top-10-birthday-party-ideas" },
    { title: "Perfect Corporate Venue Guide 2026", text: "Discover how to impress your clients with th...", date: "Wednesday Apr 22, 2026", img: "https://images.unsplash.com/photo-1505373877841-825f7d46678?auto=format&fit=crop&w=800&q=80", slug: "perfect-corporate-venue-guide" }
];

export default function SEOCollectionView({ seoPage, seoData, venues, vendors, categorySlug, citySlug, areaSlug, spaceType, foodType, isVendorContext: forcedVendor, isNearMe, rawSlug, sParams }: any) {
  const [showMoreText, setShowMoreText] = useState(false);
  const [showMoreAreas, setShowMoreAreas] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const { matchedCategory, matchedType } = (() => {
      if (!categorySlug) return { matchedCategory: '', matchedType: '' };
      const compareSlug = categorySlug.toLowerCase().replace('-venues', '').replace('-venue', '');
      
      // Check Vendors
      const vendorMatch = VENDOR_TYPES.find(v => v.toLowerCase().replace(/[\s']+/g, '-').replace(/\//g, '-') === compareSlug);
      if (vendorMatch) return { matchedCategory: vendorMatch, matchedType: 'vendor' };
      
      // Check Venue Types
      const venueMatch = VENUE_TYPES.find(v => v.toLowerCase().replace(/[\s']+/g, '-').replace(/\//g, '-') === compareSlug);
      if (venueMatch) return { matchedCategory: venueMatch, matchedType: 'venue' };

      // Check Occasions
      for (const [group, list] of Object.entries(OCCASIONS_DATA)) {
          const match = list.find(o => o.toLowerCase().replace(/[\s\(\)]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === compareSlug);
          if (match) return { matchedCategory: match, matchedType: 'occasion' };
      }
      
      return { matchedCategory: '', matchedType: '' };
  })();

  const [searchCategory, setSearchCategory] = useState(matchedCategory);
  const [searchCity, setSearchCity] = useState(citySlug === 'all' ? 'All Cities' : (citySlug ? unslugify(citySlug) : ''));
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    const timer = setInterval(() => {
        setIsAnimating(true);
        setCurrentIndex(prev => (prev + 1) % blogs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [blogs.length, autoPlay]);

  const VENDOR_SLUGS = VENDOR_TYPES.map((v: any) => v.toLowerCase().replace(/[\s']+/g, '-').replace(/\//g, '-'));
  const isVendorContext = forcedVendor || categorySlug === 'vendors' || categorySlug === 'all-vendors' || VENDOR_SLUGS.includes(categorySlug?.toLowerCase());

  const handleSearch = () => {
      const city = searchCity.toLowerCase();
      // Handle the 'All Vendors' case properly
      const category = (!searchCategory || searchCategory === 'All Vendors' || searchCategory === 'Search Venues...')
          ? (isVendorContext ? 'vendors' : 'venues')
          : searchCategory.toLowerCase().replace(/[\s']+/g, '-').replace(/\//g, '-');
      
      const isAllCities = searchCity === 'All Cities';

      // Check if we should maintain the Near Me URL
      const normalizedCategorySlug = categorySlug?.toLowerCase().replace('-venues', '').replace('-venue', '');
      const normalizedCategory = category.replace('-venues', '').replace('-venue', '');

      if (isNearMe && (city === 'gujarat' || city === 'all-cities') && normalizedCategory === normalizedCategorySlug) {
          window.location.href = `/${rawSlug}/`;
          return;
      }

      const isOccasion = EVENT_SUGGESTIONS.includes(searchCategory);
      let finalCategory = category;
      if (isOccasion && !finalCategory.endsWith('-venues') && !finalCategory.endsWith('-venue')) {
          finalCategory += '-venues';
      }

      if (isVendorContext) {
          if (isAllCities) {
              window.location.href = (finalCategory === 'vendors') ? '/all-vendors/' : `/${finalCategory}/`;
          } else {
              // Maintain area if city hasn't changed and we have an area slug
              if (areaSlug && city === citySlug?.toLowerCase()) {
                  window.location.href = `/${city}/${areaSlug}/vendors/${finalCategory}/`;
              } else {
                  window.location.href = `/${city}/vendors/${finalCategory}/`;
              }
          }
      } else {
          // Venues search logic
          if (isAllCities) {
              window.location.href = `/${finalCategory === 'venues' ? 'all-venues' : finalCategory}/`;
          } else {
              // Maintain area if city hasn't changed and we have an area slug
              if (areaSlug && city === citySlug?.toLowerCase()) {
                  window.location.href = `/${city}/${areaSlug}/${finalCategory === 'venues' ? 'venues' : finalCategory}/`;
              } else {
                  window.location.href = `/${city}/${finalCategory === 'venues' ? 'venues' : finalCategory}/`;
              }
          }
      }
  };

  // Priority logic for display
  const listingsToDisplay = isVendorContext ? vendors : venues;

  const allListings = listingsToDisplay;
  
  const attributeLabel = spaceType ? unslugify(spaceType) : (foodType ? unslugify(foodType) : unslugify(categorySlug));
  const locationLabel = (isNearMe && citySlug === 'gujarat') ? 'Near Me in Gujarat' : (isNearMe ? 'Near Me' : (areaSlug ? `${unslugify(areaSlug)}, ${unslugify(citySlug)}` : unslugify(citySlug)));

  const OCCASIONS = ['Wedding', 'Engagement', 'Birthday Party', 'Corporate Event', 'Anniversary', 'Pre-Wedding', 'Pool Party', 'Kitty Party'];

  return (
    <main className="min-h-screen bg-white">
      {/* 1. HERO HEADER (Ultra-Premium Standardized Shell) */}
      <section className="relative h-[240px] md:h-[320px] flex items-center overflow-hidden bg-slate-900">
          {/* Background Photo + Cinematic Overlay */}
          <div className="absolute inset-0 z-0">
              <img 
                src={isVendorContext 
                    ? "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80" 
                    : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80"} 
                className="w-full h-full object-cover opacity-40 scale-105" 
                alt="Venues Background" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
          </div>

          <div className="max-w-[1800px] mx-auto px-4 md:px-20 relative z-10 w-full text-center md:text-left">
              <div className="flex flex-col items-center md:items-start w-full">
                  <nav className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[3px] md:tracking-[4px] text-primary/80 mb-3 md:mb-6 justify-center md:justify-start">
                      <Link href="/" className="hover:text-white transition-colors">Home</Link>
                      <ChevronRight size={8} className="text-white/20" />
                      <Link href={`/${citySlug}${isVendorContext ? '/vendors' : ''}`} className="hover:text-white transition-colors">{unslugify(citySlug)}</Link>
                      {areaSlug && (
                        <>
                            <ChevronRight size={8} className="text-white/20" />
                            <Link href={`/${citySlug}${isVendorContext ? '/vendors' : ''}/${areaSlug}`} className="hover:text-white transition-colors">{unslugify(areaSlug)}</Link>
                        </>
                      )}
                      {isVendorContext && categorySlug !== 'vendors' && (
                        <>
                            <ChevronRight size={8} className="text-white/20" />
                            <Link href={`/${citySlug}/vendors`} className="hover:text-white transition-colors">Vendors</Link>
                        </>
                      )}
                      {(spaceType || foodType || categorySlug !== 'venues') && (
                        <>
                            <ChevronRight size={8} className="text-white/20" />
                            <span className="text-white">{attributeLabel}</span>
                        </>
                      )}
                  </nav>
                  
                  {/* Content Constrained to be narrower than search bar */}
                  <div className="max-w-6xl mb-3 md:mb-10">
                      <h1 className="text-xl md:text-5xl font-black text-white uppercase tracking-[3px] md:tracking-[4px] leading-tight md:leading-[1.2] text-center md:text-left break-words">
                        {seoData?.h1Tag || (seoPage?.custom_content as any)?.h1Tag || (seoPage?.custom_content as any)?.h1_tag ? (
                          seoData?.h1Tag || (seoPage?.custom_content as any)?.h1Tag || (seoPage?.custom_content as any)?.h1_tag
                        ) : isVendorContext
                           ? <>Top <span className="text-primary italic tracking-[1px] md:tracking-[2px]">{attributeLabel}</span> {isNearMe ? '' : 'in '}{locationLabel}</>
                           : <>Best <span className="text-primary italic tracking-[1px] md:tracking-[2px]">{attributeLabel}</span> {isNearMe ? '' : 'in '}{locationLabel}</>}
                      </h1>
                  </div>

                  {/* Interactive Omni Search Bar */}
                  <OmniSearchBar 
                      initialCity={citySlug === 'all' ? 'All Cities' : unslugify(citySlug)}
                      isVendorContext={isVendorContext}
                  />
              </div>
          </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      {mounted && (
        <ListingFilter 
            type={isVendorContext ? 'vendors' : 'venues'} 
            initialCity={unslugify(citySlug)}
            initialOccasion={matchedType === 'occasion' ? matchedCategory : ''}
            initialType={matchedType === 'venue' || matchedType === 'vendor' ? matchedCategory : ''}
            initialRegion={areaSlug ? unslugify(areaSlug) : ''}
            isNearMe={isNearMe}
            rawSlug={rawSlug}
        />
      )}
      
      <section className="max-w-[1800px] mx-auto px-4 md:px-20 py-10 md:py-16">
          <div className="flex flex-col gap-6 md:gap-12">
              {/* LISTINGS */}
              <div className="w-full">
                  <div className="flex items-center justify-between mb-5 md:mb-12 pb-4 md:pb-6 border-b border-slate-100">
                      <h2 className="text-xl md:text-3xl font-black text-slate-900 lowercase first-letter:uppercase">{isVendorContext ? `Best ${attributeLabel}` : `Recommended Venues in ${locationLabel}`}</h2>
                      <div className="hidden md:flex gap-2 text-xs font-bold text-slate-400">
                          <span>Sort by:</span>
                          <span className="text-primary hover:underline cursor-pointer">Default</span>
                      </div>
                  </div>

                   {/* LISTING CARDS — uniform 2-col mobile grid with fixed aspect ratio image */}
                   <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
                       {listingsToDisplay.map((listing: any, i: number) => {
                           const finalSlug = buildListingSlug(listing?.slug || listing?.name || listing?.id, listing?.area || listing?.location);
                           const baseCity = isNearMe ? (listing?.city || citySlug || 'ahmedabad').toLowerCase() : (citySlug || 'ahmedabad').toLowerCase();
                           const detailHref = `/${baseCity}${isVendorContext ? '/vendors' : ''}/${finalSlug || listing?.id || ''}`;
                           return (
                           <div key={listing?.id || i} className="bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-3xl transition-all duration-500 group flex flex-col hover:-translate-y-2 relative">
                               {/* Entire card is a link EXCEPT the Get Quote button */}
                               <Link href={detailHref} className="flex flex-col flex-grow">
                                   {/* IMAGE PREVIEW — fixed aspect ratio for consistency */}
                                   <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0">
                                       <img
                                         src={getListingImage(listing)}
                                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                         alt={listing?.name || 'Listing'}
                                         onError={(e) => {
                                           const target = e.target as HTMLImageElement;
                                           target.src = getVarietyFallback(listing?.name || '');
                                         }}
                                       />

                                       <button suppressHydrationWarning className="absolute top-2 right-2 md:top-4 md:right-4 z-10 w-7 h-7 md:w-10 md:h-10 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all" onClick={e => e.preventDefault()}>
                                           <Heart size={14} className="md:w-5 md:h-5" />
                                       </button>

                                       <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 flex items-center justify-between">
                                           {(listing.max_capacity || listing.capacity) && (
                                               <div className="flex items-center gap-1 md:gap-2 bg-black/50 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-white">
                                                   <Users2 size={10} className="opacity-80 md:w-3.5 md:h-3.5"/>
                                                   <span className="text-[9px] md:text-[12px] font-bold">{listing.min_capacity || 0}-{listing.max_capacity || listing.capacity}</span>
                                               </div>
                                           )}
                                       </div>
                                   </div>

                                   {/* CONTENT SECTION */}
                                   <div className="p-3 md:p-6 flex flex-col flex-grow">
                                       <div className="flex items-start justify-between mb-2 md:mb-4 gap-1 md:gap-4">
                                           <div className="flex-grow min-w-0">
                                               <h3 className="text-[12px] md:text-[18px] font-black text-slate-950 leading-tight mb-1 md:mb-2 line-clamp-2">{listing.name}</h3>
                                               <p className="text-[10px] md:text-[13px] font-bold text-slate-400 flex items-center gap-0.5 md:gap-1 truncate">
                                                   <MapPin size={10} className="shrink-0 md:w-3.5 md:h-3.5"/> <span className="truncate">{listing.location || listing.area || listing.city}</span>
                                               </p>
                                           </div>
                                           <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
                                               <Star size={11} className="fill-yellow-400 text-yellow-400 md:w-4 md:h-4" />
                                               <span className="text-[10px] md:text-[14px] font-black text-slate-900">{listing.rating || '4.8'}</span>
                                           </div>
                                       </div>

                                       <div className="hidden md:grid grid-cols-1 gap-y-4 pt-4 border-t border-slate-50">
                                           <div className="flex items-center gap-3">
                                               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                                   <Building size={16} className="text-slate-400"/>
                                               </div>
                                               <span className="text-[13px] font-bold text-slate-600 truncate">{listing.category || listing.type || listing.vendor_type}</span>
                                           </div>
                                       </div>

                                       {/* Mobile compact bottom */}
                                       <div className="md:hidden mt-2 pt-2 border-t border-slate-50">
                                           <p className="text-[10px] font-bold text-slate-400 truncate">{listing.category || listing.type || listing.vendor_type}</p>
                                       </div>
                                   </div>
                               </Link>

                               {/* GET QUOTE — outside link, intercepts click */}
                               <div className="px-3 md:px-6 pb-3 md:pb-6 mt-auto" onClick={e => { e.stopPropagation(); e.preventDefault(); }}>
                                   <GetQuoteModal
                                       businessName={listing.name}
                                       listingId={listing.id}
                                       listingType={isVendorContext ? 'vendor' : 'venue'}
                                       ownerId={listing.owner_id}
                                       citySlug={citySlug}
                                       imageUrl={getListingImage(listing)}
                                       location={listing.location || listing.area || listing.city}
                                       triggerButton={
                                           <button className="w-full bg-[#EF3E36] text-white h-8 md:h-11 rounded-lg md:rounded-xl font-black text-[9px] md:text-[12px] uppercase tracking-wide md:tracking-widest hover:bg-[#D9362F] transition-all transform active:scale-95 shadow-md shadow-primary/20">
                                               Get Quote
                                           </button>
                                       }
                                   />
                               </div>
                           </div>
                           );
                       })}
                   </div>

                   {allListings.length === 0 && (
                       <div className="text-center py-16 md:py-32 bg-slate-50/50 rounded-3xl md:rounded-[5rem] border-2 border-dashed border-slate-200">
                          <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-slate-300 mx-auto mb-4 md:mb-6" />
                          <p className="text-xl md:text-2xl font-black text-slate-900 mb-2">No listings found</p>
                          <p className="text-sm text-slate-500 font-medium">Try broadening your search or checking nearby areas.</p>
                       </div>
                   )}

                   {/* OMNI-DISCOVERY: Cross-Section for Vendors on Venue Pages */}
                   {!isVendorContext && vendors.length > 0 && (
                       <div className="mt-8 md:mt-24">
                          <div className="flex items-center justify-between mb-5 md:mb-12 pb-4 md:pb-6 border-b border-slate-100">
                             <div>
                               <h2 className="text-lg md:text-3xl font-black text-slate-900 lowercase first-letter:uppercase mb-1 md:mb-2">Recommended Vendors in {locationLabel}</h2>
                               <div className="h-0.5 md:h-1 w-14 md:w-20 bg-primary" />
                             </div>
                             <Link href={`/${citySlug}/vendors`} className="text-primary font-black uppercase tracking-widest text-[10px] md:text-xs hover:underline shrink-0">View All →</Link>
                          </div>
                           {/* uniform 2-col vendor cards — square image aspect ratio */}
                           <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                             {vendors.slice(0, 4).map((v: any, i: number) => (
                                <Link key={`v-${i}`} href={`/${citySlug}/vendors/${v.slug}`} className="group bg-white p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                                   <div className="relative w-full aspect-square rounded-xl md:rounded-[2rem] overflow-hidden mb-3 md:mb-6">
                                      <img 
                                        src={getListingImage(v)} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        alt={v.name} 
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = getVarietyFallback(v.name);
                                        }}
                                      />
                                   </div>
                                   <h4 className="text-[11px] md:text-sm font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{v.name}</h4>
                                   <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5 md:mt-1">{v.vendor_type}</p>
                                </Link>
                             ))}
                          </div>
                       </div>
                   )}
              </div>
          </div>
      </section>

      <section className="bg-white py-10 md:py-16 px-4 md:px-20">
          <div className="max-w-[1800px] mx-auto">
               {!isVendorContext && (
                 <div className="mb-5 md:mb-12">
                   <h2 className="text-xl md:text-3xl font-black text-slate-900 lowercase first-letter:uppercase">Top rated {isVendorContext ? attributeLabel : 'venues'} in {locationLabel}</h2>
                   <div className="w-12 md:w-16 h-0.5 md:h-1 bg-primary mt-1.5 md:mt-2 rounded-full" />
                 </div>
               )}
               {/* MOBILE: Single Line Horizontal Scroll (Only 2 items) */}
               {!isVendorContext && (
                 <div className="md:hidden grid grid-cols-2 gap-3 pb-4">
                     {allListings.slice(0, 2).map((v: any) => {
                         const finalSlug = buildListingSlug(v.slug, v.area || v.location);
                         return (
                         <Link key={`top-m-${v.id}`} href={`/${citySlug}${isVendorContext ? '/vendors' : ''}/${finalSlug}`} 
                               className="group bg-slate-50/50 rounded-xl p-2 border border-slate-100 hover:bg-white transition-all duration-500">
                             <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-2">
                                 <img 
                                   src={getListingImage(v)} 
                                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                   alt={v.name} 
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.src = getVarietyFallback(v.name);
                                   }}
                                 />
                                 <div className="absolute top-1 right-1 bg-white/95 px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                                     <Star size={8} className="fill-yellow-400 text-yellow-400" />
                                     <span className="text-[9px] font-black">{v.rating || '4.8'}</span>
                                 </div>
                             </div>
                             <h4 className="text-[10px] font-black text-slate-900 line-clamp-1">{v.name}</h4>
                             <p className="text-[8px] text-slate-400 font-bold flex items-center gap-1 mt-0.5 mb-1">
                                 <MapPin size={8} /> <span className="truncate">{v.location || v.city}</span>
                             </p>
                             <p className="text-[10px] font-black text-slate-900">₹{v.veg_price_per_plate || v.starting_price || '750'}</p>
                         </Link>
                         );
                     })}
                 </div>
               )}

               {/* DESKTOP GRID */}
               {!isVendorContext && (
                 <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                     {allListings.slice(0, 4).map((v: any, idx: number) => {
                         const finalSlug = buildListingSlug(v?.slug || v?.name || v?.id, v?.area || v?.location);
                         return (
                         <Link key={`top-${v?.id || idx}`} href={`/${citySlug}${isVendorContext ? '/vendors' : ''}/${finalSlug || v?.id || ''}`} className="group bg-slate-50/50 rounded-2xl md:rounded-[2.5rem] p-3 md:p-6 border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all duration-500">
                             <div className="relative w-full aspect-[4/3] rounded-xl md:rounded-[2rem] overflow-hidden mb-2.5 md:mb-6">
                                 
                                  <img 
                                    src={getListingImage(v)} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt={v?.name || 'Listing'} 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = getVarietyFallback(v?.name || '');
                                    }}
                                  />
                                 <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/95 px-1.5 py-0.5 md:px-3 md:py-1 rounded-full flex items-center gap-0.5 md:gap-1 shadow-lg">
                                     <Star size={9} className="fill-yellow-400 text-yellow-400 md:w-3 md:h-3" />
                                     <span className="text-[9px] md:text-xs font-black">{v?.rating || '4.8'}</span>
                                 </div>
                             </div>
                             <h4 className="text-[11px] md:text-lg font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{v?.name}</h4>
                             <p className="text-[9px] md:text-sm text-slate-400 font-bold flex items-center gap-0.5 md:gap-1 mt-0.5 md:mt-2 mb-1.5 md:mb-4"><MapPin size={9} className="md:w-3.5 md:h-3.5 shrink-0"/> <span className="truncate">{v?.location || v?.city}</span></p>
                             <p className="text-[10px] md:text-base font-black text-slate-900">₹{v?.veg_price_per_plate || v?.starting_price || '750'} <span className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest">/ plate</span></p>
                         </Link>
                         );
                     })}
                 </div>
               )}
          </div>
      </section>

      {/* 3. QUICK COMPARE & ENQUIRY SIDEBAR (Restored Symmetry) */}
      <section className="bg-slate-50 py-10 md:py-16">
          <div className="max-w-[1800px] mx-auto px-4 md:px-20">
              {/* Heading Pinned Symmetrically Above */}
              <div className="mb-5 md:mb-10">
                 <h2 className="text-xl md:text-3xl font-black text-slate-900 mb-1.5 md:mb-2 lowercase first-letter:uppercase">{isVendorContext ? `Professional services in ${locationLabel} with starting prices` : `Party places & event venues in ${locationLabel} with starting prices`}</h2>
                 <div className="w-14 md:w-20 h-0.5 md:h-1 bg-primary rounded-full" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 items-start">
                  
                  {/* Left: Comparison Table */}
                  <div className="lg:col-span-8">
                        <div className="rounded-xl md:rounded-[2.5rem] border border-slate-200/60 shadow-xl bg-white overflow-hidden">
                        <div className="bg-slate-900 text-white text-[8px] md:text-[10px] font-black uppercase tracking-[1.5px] md:tracking-[3px] flex items-center">
                            <div className="px-3 md:px-8 py-2 md:py-5 flex-[5]">{isVendorContext ? 'Professional Name' : 'Venue Name'}</div>
                            <div className="px-1 md:px-8 py-2 md:py-5 flex-[3] text-center">{isVendorContext ? 'Category' : 'Capacity'}</div>
                            <div className="px-3 md:px-8 py-2 md:py-5 flex-[3] text-right">Price</div>
                        </div>
                        {/* Scrollable Container */}
                        <div className="max-h-[300px] md:max-h-[500px] overflow-y-auto no-scrollbar scroll-smooth">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-slate-100">
                                    {(isVendorContext ? vendors : venues).slice(0, 15).map((v: any) => (
                                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group flex items-center">
                                            <td className="px-3 md:px-8 py-2 md:py-5 flex-[5] font-bold text-slate-900 group-hover:text-primary transition-colors text-[10px] md:text-sm line-clamp-1">{v.name}</td>
                                            <td className="px-1 md:px-8 py-2 md:py-5 flex-[3] text-slate-500 font-bold text-center text-[9px] md:text-xs">{isVendorContext ? (v.category || 'Expert') : `${v.min_capacity || 50}-${v.max_capacity || 1000}`}</td>
                                            <td className="px-3 md:px-8 py-2 md:py-5 flex-[3] text-right font-black text-slate-900 text-[10px] md:text-sm">₹{v.veg_price_per_plate || v.starting_price || '600'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                      </div>
                  </div>

                  {/* Right: Enquiry Box */}
                  <div id="enquiry-form" className="lg:col-span-4 sticky top-28 transition-all scroll-mt-32">
                      <div className="bg-[#fdf2f1] p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-primary/10 text-slate-900">
                          <h3 className="text-base md:text-xl font-black mb-3 md:mb-6 text-slate-900">Get Expert's Callback</h3>
                          {inquirySent ? (
                            <div className="bg-primary/10 border border-primary/30 p-6 rounded-2xl text-center">
                                <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
                                <p className="font-bold">Inquiry Sent!</p>
                                <p className="text-xs text-slate-900/50 mt-2">Our expert will call you shortly.</p>
                            </div>
                          ) : (
                            <form className="space-y-1.5 md:space-y-4" onSubmit={(e) => { e.preventDefault(); setInquirySent(true); }}>
                                <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                                    <select 
                                        className="w-full h-10 md:h-14 bg-white border border-slate-200 rounded-lg md:rounded-2xl px-3 text-[10px] md:text-sm focus:ring-2 focus:ring-primary appearance-none"
                                        suppressHydrationWarning
                                    >
                                        <option>Occasion</option>
                                        {OCCASIONS.map((o: any) => <option key={o}>{o}</option>)}
                                    </select>
                                    <input 
                                        required 
                                        type="date" 
                                        className="w-full h-10 md:h-14 bg-white border border-slate-200 rounded-lg md:rounded-2xl px-3 text-[10px] md:text-sm" 
                                        suppressHydrationWarning
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                                    <input 
                                        type="number" 
                                        placeholder="No. of Guests" 
                                        className="w-full h-10 md:h-14 bg-white border border-slate-200 rounded-lg md:rounded-2xl px-3 text-[10px] md:text-sm focus:ring-2 focus:ring-primary" 
                                        suppressHydrationWarning
                                    />
                                    <select 
                                        className="w-full h-10 md:h-14 bg-white border border-slate-200 rounded-lg md:rounded-2xl px-3 text-[10px] md:text-sm appearance-none focus:ring-2 focus:ring-primary"
                                        suppressHydrationWarning
                                    >
                                        <option>Budget Range</option>
                                        <option>Below 500</option>
                                        <option>500-1000</option>
                                        <option>1000-1500</option>
                                        <option>Above 1500</option>
                                    </select>
                                </div>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="Full Name" 
                                    className="w-full h-10 md:h-14 bg-white border border-slate-200 rounded-lg md:rounded-2xl px-4 md:px-6 text-[10px] md:text-sm focus:ring-2 focus:ring-primary" 
                                    suppressHydrationWarning
                                />
                                <input 
                                    required 
                                    type="tel" 
                                    placeholder="Mobile Number" 
                                    className="w-full h-10 md:h-14 bg-white border border-slate-200 rounded-lg md:rounded-2xl px-4 md:px-6 text-[10px] md:text-sm focus:ring-2 focus:ring-primary" 
                                    suppressHydrationWarning
                                />
                                <button 
                                    type="submit" 
                                    className="w-full h-11 md:h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-lg md:rounded-2xl shadow-lg shadow-primary/20 transform active:scale-95 transition-all uppercase tracking-widest text-[10px] md:text-[12px]"
                                    suppressHydrationWarning
                                >
                                    Get Quotes Now
                                </button>
                            </form>
                          )}
                          <p className="mt-6 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">50k+ Happy Families</p>
                      </div>
                  </div>
              </div>

               {/* Service Banners Trio — Optimized for Mobile */}
               <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-10">
                   {[
                     { title: 'Need a Caterer?', desc: 'Best Food Experts', gradient: 'from-sky-50 to-blue-100', text: 'text-blue-600', link: '/get-quote' },
                     { title: 'Looking for a Venue?', desc: 'Premium Locations', gradient: 'from-amber-50 to-orange-100', text: 'text-orange-600', link: '/get-quote' },
                     { title: 'Birthday Planner?', desc: 'Birthday Specialists', gradient: 'from-pink-50 to-rose-100', text: 'text-rose-600', link: '/get-quote' }
                   ].map((s, i) => (
                     <Link 
                         key={s.title} 
                         href={s.link}
                         className={`h-[120px] md:h-[160px] w-full p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-gradient-to-br ${s.gradient} border border-white/50 group hover:shadow-xl transition-all relative overflow-hidden cursor-pointer block transform active:scale-95`}
                     >
                         <div className="relative z-10">
                             <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Services</p>
                             <h4 className={`text-lg md:text-xl font-black ${s.text} mb-1 md:mb-2 leading-tight`}>{s.title}</h4>
                             <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-900 underline underline-offset-4 decoration-slate-300 group-hover:decoration-primary transition-all">Browse Now <ArrowRight size={12}/></span>
                         </div>
                         <div className="absolute -bottom-4 -right-4 p-5 md:p-8 text-slate-900/5 group-hover:scale-110 transition-transform">
                             <Sparkles size={60} className="md:w-16 md:h-16" />
                         </div>
                     </Link>
                   ))}
               </div>
          </div>
      </section>

      {/* 4. HAVE A SPACE BANNER */}
      <section className="bg-[#1e293b] py-4 md:py-6 mb-0 mt-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 px-4">
              <h2 className="text-lg md:text-3xl font-medium text-white italic" style={{ fontFamily: 'serif' }}>{isVendorContext ? 'Have a Business?' : 'Have a Space?'}</h2>
              <Link href="/list-business">
                <Button suppressHydrationWarning className="bg-white hover:bg-slate-100 text-[#1e293b] font-black px-6 md:px-8 h-9 md:h-12 rounded-xl text-xs md:text-sm transition-all border-none">
                    List Your Business
                </Button>
              </Link>
          </div>
      </section>

      {/* 5 & 6. COMBINED SEO CONTENT & AREAS SECTION (High Density) */}
      <section className="bg-white py-10 md:py-16 px-4 md:px-6">
          <div className="max-w-[1800px] mx-auto px-0 md:px-20">
              {/* City Description Part */}
              <div className="text-sm md:text-base">
                  <div className="text-slate-600 leading-relaxed space-y-4">
                    <p className="font-medium">
                        {locationLabel} stands as a beacon of history and modernity. With its strategic location and state-of-the-art infrastructure, the city has evolved into a premier destination for events and celebrations, drawing visitors from every corner of the nation. As a result, {locationLabel} has earned its reputation as a vibrant celebration destination and a sought-after wedding locale.
                    </p>
                    <p className="font-medium">
                        Whether you're planning a corporate gathering, a social soirée, or the wedding of a lifetime, {locationLabel}'s blend of heritage and modernity provides the perfect backdrop for every occasion. With its cosmopolitan charm and unmatched hospitality, {locationLabel} invites you to revel in the magic of your special moments amidst its bustling streets and iconic landmarks.
                    </p>
                    <p className="font-medium">
                        Planning an event in {locationLabel}-NCR? VenueConnect offers the largest selection of {isVendorContext ? 'vendors' : 'venues'}, from budget-friendly choices to luxurious {isVendorContext ? 'services' : 'wedding resorts'}. Simply share your requirements and let our experts find the perfect match for you.
                    </p>
                  </div>
                  <div className="h-px bg-slate-100 w-full mt-10 mb-2" />
              </div>

              {/* Linked Areas Part — HIDDEN ON MOBILE */}
               <div className="hidden md:block mt-12 pt-0 border-t-0">
                 <h3 className="text-base md:text-lg font-black text-slate-900 mb-6 uppercase tracking-wider">More Popular Party Places in {locationLabel}</h3>
                 <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-3 text-sm md:text-base overflow-hidden transition-all duration-300 ${showMoreAreas ? 'max-h-none' : 'max-h-[160px]'}`}>
                       {(
                           citiesData.find((c: any) => c.slug === citySlug?.toLowerCase())?.localities?.map((l: string) => unslugify(l)) || 
                           ['City Center', 'Main Market', 'Commercial Hub', 'Residential Zone']
                       ).map(area => (
                           <Link key={area} href={`/${citySlug}/${area.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`} className="font-bold text-slate-400 hover:text-primary transition-colors block pb-1">
                               Best Venues in {area}
                           </Link>
                       ))}
                   </div>
                   <div className="text-right -mt-4">
                       <button suppressHydrationWarning onClick={() => setShowMoreAreas(!showMoreAreas)} className="text-primary font-black hover:underline text-sm bg-white pl-4">
                           {showMoreAreas ? 'Show Less' : 'Show More'}
                       </button>
                   </div>
               </div>
          </div>
      </section>

      {/* CLIENT TESTIMONIALS (High-Density Compact) */}
      <section className="bg-slate-50 py-10 md:py-16 px-4 md:px-6 relative overflow-hidden text-center">
          <div className="max-w-[1700px] mx-auto px-2 md:px-20">
              <div className="mb-6 md:mb-14">
                    <h2 className="text-lg md:text-3xl font-black text-slate-900 tracking-tight">What our clients have to say..</h2>
              </div>
              
              <ReviewCarousel />
          </div>
      </section>



      {/* EVENT PLANNING INSPIRATION SECTION (Steady & Symmetrical) */}
      <section className="bg-white py-10 md:py-16 border-t border-slate-50 relative">
          <div className="max-w-[1800px] mx-auto text-center px-4 md:px-20">
              <div className="mb-6 md:mb-16">
                  <h2 className="text-lg md:text-4xl font-black text-slate-800 mb-2 md:mb-4 tracking-tight">Event Planning Inspiration & Ideas</h2>
                  <p className="text-[#EF3E36] font-bold text-xs md:text-lg tracking-tight">Get inspired with the latest event trends and party ideas</p>
              </div>

              <div className="relative group/carousel mx-auto">
                  {/* Navigation Arrows - Perfectly Balanced */}
                  <button 
                       suppressHydrationWarning
                       onClick={() => { setAutoPlay(false); setIsAnimating(true); setCurrentIndex(prev => (prev - 1 + blogs.length) % blogs.length); }}
                       className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-30 w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                   >
                       <ArrowLeft size={24} />
                   </button>
                   <button 
                       suppressHydrationWarning
                       onClick={() => { setAutoPlay(false); setIsAnimating(true); setCurrentIndex(prev => (prev + 1) % blogs.length); }}
                       className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-30 w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                   >
                       <ChevronRight size={24} />
                   </button>

                  {/* Carousel Container - Balanced Spacing */}
                  <div className="overflow-hidden px-1">
                          <div 
                              className={`flex gap-3 md:gap-5 ${isAnimating ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'}`}
                              style={{ transform: `translateX(-${currentIndex * (mounted && window.innerWidth < 768 ? 85 : 20)}%)` }}
                          >
                               {/* Double the list for seamless forward loop */}
                               {[...blogs, ...blogs].map((blog, idx) => (
                                    <Link 
                                        key={idx} 
                                        href={`/blog/${blog.slug}`} 
                                        className="min-w-[80%] md:min-w-[45%] lg:min-w-[20%] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group border-b-4 border-b-transparent hover:border-b-primary text-left"
                                    >
                                        <div className="relative h-40 md:h-44 overflow-hidden">
                                            <img src={blog.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                        </div>
                                        <div className="p-4 md:p-5 flex-grow flex flex-col justify-between min-h-[140px] md:min-h-[150px]">
                                            <div>
                                                <h4 className="text-sm md:text-[16px] font-black text-slate-950 group-hover:text-primary transition-colors leading-tight mb-2 md:mb-3 line-clamp-2">{blog.title}</h4>
                                                <p className="text-[12px] md:text-[14px] text-slate-800 font-bold line-clamp-2 leading-relaxed mb-3 md:mb-4">{blog.text}</p>
                                            </div>
                                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto border-t border-slate-50 pt-3 md:pt-4">
                                                {blog.date}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                          </div>
                  </div>
              </div>
          </div>
      </section>

      {/* 7. TWO-ROW TRUST & GROWTH SECTION — Hidden on Mobile */}
      <section className="hidden md:block bg-white py-12 px-6 border-t border-slate-100">
          <div className="max-w-[1800px] mx-auto px-20 space-y-24">
              {/* Row 1: Fastest Growing */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-5 grid grid-cols-4 gap-4">
                      {[
                        { label: "Venues", val: "300+", icon: <Building className="text-purple-500 w-6 h-6" /> },
                        { label: "Happy Users", val: "50k+", icon: <Users2 className="text-rose-400 w-6 h-6" /> },
                        { label: "Cities", val: "12+", icon: <Globe2 className="text-amber-500 w-6 h-6" /> },
                        { label: "Vendors", val: "150+", icon: <Store className="text-blue-500 w-6 h-6" /> }
                      ].map((s, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-50 flex flex-col items-center text-center space-y-3 min-h-[140px] justify-center">
                            <div className="w-10 h-10 flex items-center justify-center">{s.icon}</div>
                            <div>
                                <p className="text-lg font-black text-slate-900">{s.val}</p>
                                <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-tighter">{s.label}</p>
                            </div>
                        </div>
                      ))}
                  </div>
                  <div className="lg:col-span-7">
                      <h2 className="text-2xl font-black text-slate-900 mb-6 lowercase first-letter:uppercase">Fastest Growing Venue and Vendor Booking MarketPlace</h2>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">Since our launch in 2026, we have built a wonderful ecosystem of venues, vendors, event planners and people who love throwing parties and hosting memorable events. We have had an exciting journey as a bootstrapped company and built a trusted platform for good ethics, business and experience. Our mission is Making Happy Occasions Happier!</p>
                  </div>
              </div>
          </div>
      </section>

      {/* 7. UNIFIED HIGH-DENSITY DIRECTORY (Equalized Spacing) */}
      <section className="bg-white pt-6 md:pt-12 pb-4 border-t border-slate-100">
          <div className="max-w-[1080px] mx-auto px-4 md:px-6">
              {/* City Tabs Row — horizontal scroll on mobile */}
              {/* City Selection Directory — Dropdown on Mobile */}
              <div className="md:hidden pt-4 pb-2">
                  <select 
                      onChange={(e) => window.location.href = `/${e.target.value.toLowerCase()}`}
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-black uppercase tracking-widest text-xs appearance-none"
                      value={citySlug}
                  >
                      {GUJARAT_CITIES.map(city => (
                          <option key={city} value={city.toLowerCase()}>{city}</option>
                      ))}
                  </select>
              </div>

              <div className="hidden md:flex items-center gap-4 md:gap-0 md:flex-wrap md:justify-between border-b border-slate-200 pb-3 mb-6 md:mb-8 mt-4 md:mt-10 overflow-x-auto no-scrollbar">
                  {GUJARAT_CITIES.map((city, i) => (
                      <Link key={city} href={`/${city.toLowerCase()}`} className={`text-[11px] md:text-[15px] font-black transition-all whitespace-nowrap ${city.toLowerCase() === citySlug.toLowerCase() ? 'text-black border-b-2 md:border-b-4 border-primary pb-2 md:pb-3 md:-mb-[26px]' : 'text-slate-950 hover:text-black'}`}>
                          {city}
                      </Link>
                  ))}
              </div>

              {/* 4-Column Dense Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-12 gap-y-1 mb-6 md:mb-8">
                  {(isVendorContext ? [
                      ['Photographers', 'Caterers', 'Decorators', 'Makeup Artists'],
                      ['Choreographers', 'DJs', 'Wedding Planners', 'Event Planners'],
                      ['Bridal Wear', 'Jewellers', 'Invitation Cards', 'Mehndi Artists'],
                      ['Groom Wear', 'Florists', 'Cake Shops', 'Bands']
                  ] : [
                      ['Banquet Hall', 'Party Plot', 'Lawn', 'Resort'],
                      ['Weddings', 'Birthdays', 'Corporate Event', 'Social Mixer'],
                      ['Caterers', 'Decorators', 'Photographers', 'Mehndi Artists'],
                      ['Engagement', 'Reception', 'Cocktail Party', 'Anniversary']
                  ]).map((list, colIdx) => (
                      <div key={colIdx} className="space-y-0.5 md:space-y-1">
                          {list.map(item => (
                              <Link key={item} href={`/${citySlug}${isVendorContext ? '/vendors' : ''}/${item.toLowerCase().replace(/\s+/g, '-')}/`} className="block text-[11px] md:text-[14px] font-bold text-slate-500 hover:text-black transition-all leading-relaxed">
                                {item} {isVendorContext ? '' : `in ${locationLabel}`}
                              </Link>
                          ))}
                      </div>
                  ))}
              </div>
          </div>
      </section>
    </main>
  );
}
