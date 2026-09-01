"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MapPin, Search, Star, ArrowRight, ArrowLeft,
    Sparkles, ShieldCheck, Quote, ChevronRight, ChevronLeft,
    Users2, Globe2, Building, Store
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { VENDOR_TYPES, GUJARAT_CITIES } from "@/lib/constants";
import { getListingImage } from "@/lib/imageUtils";
import PricingGuideModal from "@/components/pricing/PricingGuideModal";

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
    const [startIndex, setStartIndex] = useState(0);
    const visibleCount = 3;

    const next = () => {
        setStartIndex((prev) => (prev + 1) % REVIEWS.length);
    };

    const prev = () => {
        setStartIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
    };

    const displayReviews = [...REVIEWS, ...REVIEWS].slice(startIndex, startIndex + visibleCount);

    return (
        <div className="relative px-12 group/revnav">
            <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all z-20 border border-slate-100 md:-left-4">
                <ChevronLeft size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {displayReviews.map((r, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center min-h-[360px]">
                        <h3 className="text-xl font-black text-slate-900 mb-4">{r.name}</h3>
                        <p className="text-slate-600 font-medium text-center mb-8 leading-relaxed opacity-90 text-sm min-h-[80px]">"{r.text}"</p>
                        <div className="flex gap-1.5 text-amber-500 mb-8">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} className={i < r.rating ? "fill-current" : "text-slate-200"} />
                            ))}
                        </div>
                        <p className="text-lg font-black text-primary uppercase tracking-tight">{r.title}</p>
                    </div>
                ))}
            </div>

            <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all z-20 border border-slate-100 md:-right-4">
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

// --- VERIFIED FALLBACK IMAGES ---
const CATEGORY_ICONS: Record<string, string> = {
    "Photographers": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80",
    "Caterers": "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80",
    "Decorators": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80",
    "Makeup Artists": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80",
    "Mehndi Artists": "https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?w=400&q=80",
    "DJs": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80",
    "Entertainers": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
    "Wedding Planners": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
    "Astrologers": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80",
};

const DEFAULT_V_IMG = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80";

function toSlug(str: string) { return str.toLowerCase().replace(/[\s/]+/g, '-'); }
function toTitle(slug: string) { return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); }

const HIRE_SERVICES = [
    { title: "Mehndi Artists", img: "https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?w=600&q=80", path: "mehndi-artists" },
    { title: "Caterers", img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80", path: "caterers" },
    { title: "DJs", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80", path: "djs" },
    { title: "Decorators", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80", path: "decorators" },
    { title: "Photographers", img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", path: "photographers" },
    { title: "Makeup Artists", img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80", path: "makeup-artists" },
];


export default function CityVendorsPage({ params }: { params: Promise<{ city: string }> }) {
    const { city: citySlug } = use(params);
    const cityName = toTitle(citySlug);
    const router = useRouter();

    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchCategory, setSearchCategory] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const supabase = createClient();

    const blogs = [
        { title: "Event Lighting Ideas That Completely...", text: "Lighting is one of the most powerful yet oft...", date: "Friday Mar 27, 2026", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80", slug: "event-lighting-ideas" },
        { title: "How Couples Are Blending Festiviti...", text: "Indian weddings have always been grand, vibr...", date: "Tuesday Apr 14, 2026", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80", slug: "blending-festivities" },
        { title: "Modern Wedding Rituals That Are Rep...", text: "Weddings have always been a reflection of cu...", date: "Thursday Apr 09, 2026", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80", slug: "modern-wedding-rituals" },
        { title: "Bollywood Bridal Lehengas That Defi...", text: "When it comes to Indian weddings, Bollywood h...", date: "Saturday Apr 04, 2026", img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80", slug: "bollywood-bridal-lehengas" },
        { title: "Top 10 Birthday Party Ideas for Kids", text: "Planning a kids birthday can be effortless w...", date: "Monday Mar 30, 2026", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80", slug: "top-10-birthday-party-ideas" },
        { title: "Perfect Corporate Venue Guide 2026", text: "Discover how to impress your clients with th...", date: "Wednesday Apr 22, 2026", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80", slug: "perfect-corporate-venue-guide" }
    ];

    // True Circular Infinite Engine (Forward Only)
    useEffect(() => {
        const timer = setInterval(() => {
            setIsAnimating(true);
            setCurrentIndex(prev => prev + 1);
            setCatIndex(prev => prev + 1);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const [catIndex, setCatIndex] = useState(0);
    const [catAnimating, setCatAnimating] = useState(true);
    
    // Hire Carousel State
    const [hireIndex, setHireIndex] = useState(0);
    const [hireAnimating, setHireAnimating] = useState(true);

    const [showAllCities, setShowAllCities] = useState(false);
    const ALL_CITIES = ["Delhi", "Faridabad", "Ghaziabad", "Gurgaon", "Noida", "Jaipur", "Mumbai", "Pune", "Chandigarh", "Ahmedabad", "Chennai", "Hyderabad", "Kolkata", "Udaipur", "Bangalore", "Nagpur", "Goa", "Agra", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Vapi", "Anand", "Nadiad", "Indore", "Bhopal", "Lucknow", "Kanpur", "Patna"];

    const PRIORITY_CATEGORIES = [
        "Photographers", "Caterers", "Decorators", "Makeup Artists",
        "Mehndi Artists", "DJ", "Entertainers", "Wedding Planners", "Astrologers"
    ];

    // Shadow Dataset for Categories
    const displayCategories = [...PRIORITY_CATEGORIES, ...PRIORITY_CATEGORIES];

    useEffect(() => {
        if (catIndex >= PRIORITY_CATEGORIES.length) {
            const jumpTimer = setTimeout(() => {
                setCatAnimating(false);
                setCatIndex(0);
            }, 1000);
            return () => clearTimeout(jumpTimer);
        } else {
            setCatAnimating(true);
        }
    }, [catIndex]);

    // Hire Infinite Logic
    useEffect(() => {
        if (hireIndex >= HIRE_SERVICES.length) {
            const jumpTimer = setTimeout(() => {
                setHireAnimating(false);
                setHireIndex(0);
            }, 1000);
            return () => clearTimeout(jumpTimer);
        } else {
            setHireAnimating(true);
        }
    }, [hireIndex]);

    // Auto Rotation for Hire
    useEffect(() => {
        const interval = setInterval(() => {
            setHireIndex(prev => prev + 1);
        }, 5000);
        return () => clearTimeout(interval);
    }, []);

    const handleCatNav = (direction: number) => {
        setCatAnimating(true);
        setCatIndex(prev => prev + direction);
    };

    // Invisible Jump Logic for "Circular Way" - Blogs
    useEffect(() => {
        if (currentIndex === blogs.length) {
            const jumpTimer = setTimeout(() => {
                setIsAnimating(false);
                setCurrentIndex(0);
            }, 1000);
            return () => clearTimeout(jumpTimer);
        }
    }, [currentIndex, blogs.length]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const { data } = await supabase
                    .from("vendors")
                    .select("*")
                    .eq('is_approved', true)
                    .ilike("city", `%${cityName}%`)
                    .order("rating", { ascending: false })
                    .limit(10);
                setVendors(data || []);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, [citySlug, cityName, supabase]);

    const handleSearch = () => {
        if (searchCategory) {
            router.push(`/${citySlug}/${toSlug(searchCategory)}`);
        }
    };

    const navScroll = (id: string, dir: number) => {
        const el = document.getElementById(id);
        if (el) el.scrollBy({ left: dir * 300, behavior: 'smooth' });
    };



    return (
        <main className="min-h-screen bg-white font-sans text-slate-900">

            {/* 4. SPECIAL BANNER (Standardized Sleek h-[460px]) */}
            {/* 1. HERO HEADER */}
            <section className="relative h-[280px] md:h-[320px] flex items-center overflow-hidden bg-slate-900">
                {/* Background Photo + Cinematic Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80" 
                        className="w-full h-full object-cover object-center opacity-40 scale-105" 
                        alt="Indian Wedding Event Background" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
                </div>

                <div className="max-w-[1800px] mx-auto px-6 md:px-20 relative z-10 w-full text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start text-white">
                        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] md:tracking-[4px] text-primary/80 mb-4 md:mb-6 justify-center md:justify-start">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight size={10} className="text-white/20" />
                            <Link href="/vendors" className="hover:text-white transition-colors">Vendors</Link>
                            <ChevronRight size={10} className="text-white/20" />
                            <span className="text-white">{cityName}</span>
                        </nav>
                        
                        {/* Content Constrained to be narrower than search bar */}
                        <div className="max-w-3xl mb-6 md:mb-10 text-white">
                            <h1 className="text-2xl md:text-5xl font-black text-white uppercase tracking-[4px] md:tracking-[8px] leading-[1.2]">
                                Professionals in <span className="text-primary italic tracking-[2px]">{cityName}</span>
                            </h1>
                        </div>
                        
                        {/* Compact Search Bar - Optimized for Mobile */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch overflow-hidden w-full max-w-4xl border border-white/20 group/searchbox transition-all duration-500 hover:border-white/40 p-1.5 md:p-0">
                            <div className="w-full md:flex-[7] flex items-center px-6 py-4 md:py-3 md:border-r md:border-white/10">
                                <Search className="text-white/60 w-4 h-4 mr-3 group-hover/searchbox:text-primary transition-colors" />
                                <select 
                                    value={searchCategory}
                                    onChange={(e) => setSearchCategory(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-white font-bold text-sm appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-slate-900 font-sans tracking-normal">Category in {cityName}</option>
                                    {VENDOR_TYPES.map(t => <option key={t} value={t} className="text-slate-900 font-sans tracking-normal">{t}</option>)}
                                </select>
                            </div>
                            <div className="w-full md:flex-[3] flex items-center px-6 py-4 md:py-0 md:border-r md:border-white/10 border-t md:border-t-0 border-white/10">
                                <MapPin className="text-white/60 w-4 h-4 mr-2" />
                                <span className="text-[11px] font-black text-white uppercase tracking-[3px]">{cityName}</span>
                            </div>
                            <button onClick={handleSearch} className="w-full md:flex-[2] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[3px] text-[10px] px-8 py-4 md:py-0 transition-all h-full min-h-[52px] rounded-xl md:rounded-none">
                                SEARCH
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. CATEGORY NAV - INFINITE ROTATION */}
            <section className="py-4 bg-white relative group border-b border-slate-50 overflow-hidden">
                <div className="max-w-[1800px] mx-auto px-6 md:px-20 relative">
                    <button onClick={() => handleCatNav(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 border border-slate-200 rounded-full flex items-center justify-center bg-white hover:bg-slate-900 hover:text-white transition-all z-10 shadow-lg"><ArrowLeft size={14}/></button>
                    <button onClick={() => handleCatNav(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 border border-slate-200 rounded-full flex items-center justify-center bg-white hover:bg-slate-900 hover:text-white transition-all z-10 shadow-lg"><ChevronRight size={14}/></button>
                    
                    <div className="overflow-hidden">
                        <div 
                            className={`flex items-start gap-4 md:gap-8 py-1 px-1 ${catAnimating ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                            style={{ transform: `translateX(-${catIndex * (typeof window !== 'undefined' && window.innerWidth < 768 ? 130 : 160)}px)` }} 
                        >
                            {displayCategories.map((name, idx) => (
                                <Link key={`${name}-${idx}`} href={`/${citySlug}/${toSlug(name)}`} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                                    <div className="w-28 h-18 md:w-32 md:h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                                        <img src={CATEGORY_ICONS[name] || DEFAULT_V_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={name}/>
                                    </div>
                                    <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">{name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TRENDING NOW */}
            <section className="py-12 bg-white">
                <div className="max-w-[1800px] mx-auto px-10 md:px-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Trending Now</h2>
                    </div>
                    <div className="flex overflow-x-auto pb-6 no-scrollbar snap-x gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8">
                        {[
                            { title: "Decorators near me", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80", path: "decorators" },
                            { title: "Mehndi Artists near me", img: "https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?w=600&q=80", path: "mehndi-artists" },
                            { title: "Photographers near me", img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", path: "photographers" },
                            { title: "Makeup Artists near me", img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80", path: "makeup-artists" }
                        ].map((s, i) => (
                            <Link key={i} href={`/${citySlug}/vendors/${s.path}`} className="min-w-[calc(85%-1rem)] md:min-w-0 snap-start group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center pb-8 border-b-4 border-b-transparent hover:border-b-primary">
                                <div className="w-full h-56 overflow-hidden mb-6">
                                    <img src={s.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.title}/>
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-slate-800 px-6 tracking-tight leading-tight group-hover:text-primary transition-colors">{s.title}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3.5 TOP RATED PROFESSIONALS (Dynamic Integrated Section) */}
            {vendors.length > 0 && (
                <section className="py-14 bg-slate-50">
                    <div className="max-w-[1800px] mx-auto px-10 md:px-20">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-black text-slate-950 tracking-tight uppercase">Top Rated Professionals in {cityName}</h2>
                                <p className="text-primary font-bold tracking-widest text-xs uppercase mt-2">Verified & Highly Recommended</p>
                            </div>
                            <Link href={`/${citySlug}/vendors`} className="px-8 py-3 bg-white border-2 border-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg">
                                View Full Directory
                            </Link>
                        </div>
                        
                        <div className="flex overflow-x-auto pb-6 no-scrollbar snap-x gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-6">
                            {vendors.map((v, i) => (
                                <Link 
                                    key={v.id || i} 
                                    href={`/${citySlug}/vendors/${v.slug}`} 
                                    className="min-w-[calc(85%-1rem)] md:min-w-0 snap-start group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-2"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img 
                                            src={getListingImage(v)} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            alt={v.name}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80';
                                            }}
                                        />
                                        <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] font-black">{v.rating || '4.8'}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-grow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-black text-slate-950 truncate max-w-[70%]">{v.name}</h3>
                                            <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded">{v.vendor_type || 'Professional'}</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-4">
                                            <MapPin size={12}/> {v.area || v.city || cityName}
                                        </p>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-50 group/btn">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Starting from</span>
                                                <span className="text-sm font-black text-slate-900 saturate-150">₹{v.starting_price || '25,000'}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white scale-0 group-hover/btn:scale-100 transition-all duration-300">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. PRICING GUIDES (Interactive Breakdown Modal) */}
            <section className="py-12 bg-white border-t border-slate-50">
                <div className="max-w-[1800px] mx-auto px-10 md:px-20 text-center">
                    <div className="mb-14">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Pricing Guides in {cityName}</h2>
                        <p className="text-slate-500 font-bold text-sm max-w-4xl mx-auto leading-relaxed">
                            Click any service to view market package tiers, deliverables, and cost breakdowns based on local event data in {cityName}.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {[
                            { title: "Photographer Prices", price: "Rs.25,000/day", img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", path: "photographers" },
                            { title: "Caterer Prices", price: "Rs.500/plate", img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80", path: "caterers" },
                            { title: "Makeup Artist Prices", price: "Rs.5,000/person", img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80", path: "makeup-artists" },
                            { title: "Mehndi Artist Prices", price: "Rs.8,000/person", img: "https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?w=400&q=80", path: "mehndi-artists" }
                        ].map((p, i) => (
                            <PricingGuideModal
                                key={i}
                                categoryKey={p.path}
                                citySlug={citySlug}
                                trigger={
                                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group cursor-pointer hover:shadow-2xl transition-all duration-500 h-full text-left">
                                        <div className="w-full h-48 overflow-hidden relative">
                                            <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title}/>
                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full opacity-90 group-hover:bg-[#EF3E36] transition-colors">
                                                View Guide
                                            </div>
                                        </div>
                                        <div className="py-4 px-4 bg-white flex-grow">
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
                                        </div>
                                        <div className="bg-[#EF3E36] py-3 text-center">
                                            <span className="text-white font-black text-sm">{p.price}</span>
                                        </div>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. POPULAR SEARCH (Rectangular High-Density Bars) */}
            <section className="py-12 bg-white">
                <div className="max-w-[1800px] mx-auto px-10 md:px-20 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight">Popular Search</h2>
                    <div className="flex overflow-x-auto pb-6 no-scrollbar snap-x gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8">
                        {[
                            { title: 'Photographers', slug: 'photographers' },
                            { title: 'Makeup Artists', slug: 'makeup-artists' },
                            { title: 'Decorators', slug: 'decorators' },
                            { title: 'DJs', slug: 'djs' }
                        ].map((s, i) => (
                             <Link key={i} href={`/${citySlug}/vendors/${s.slug}/`} className="min-w-[calc(85%-1rem)] md:min-w-0 snap-start h-16 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-slate-50 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 px-6 group">
                                 <span className="font-black text-slate-800 uppercase tracking-tight text-sm text-center group-hover:text-primary transition-colors">{s.title} in {cityName}</span>
                             </Link>
                         ))}
                    </div>
                </div>
            </section>

            {/* 6. PROFESSIONAL HIRE - INFINITE ROTATION (Pixel-Perfect Reference Match) */}
            <section className="py-12 bg-slate-50 relative overflow-hidden">
                <div className="max-w-[1800px] mx-auto px-10 md:px-20 text-center">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-14 tracking-tight">
                        10,000+ Photographers, Makeup Artists and Event Service Professionals for hire.
                    </h2>
                    
                    <div className="relative group/hire">
                        {/* Navigation Arrows */}
                        <button onClick={() => setHireIndex(prev => (prev + 1))} className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl flex items-center justify-center"><ArrowLeft size={24}/></button>
                        <button onClick={() => setHireIndex(prev => (prev + 1))} className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl flex items-center justify-center"><ChevronRight size={24}/></button>

                        <div className="overflow-hidden">
                            <div 
                                className={`flex gap-8 ${hireAnimating ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'}`}
                                style={{ transform: `translateX(-${hireIndex * (100 / 4.1)}%)` }}
                            >
                                {[...HIRE_SERVICES, ...HIRE_SERVICES].map((s, i) => (
                                    <Link key={i} href={`/${citySlug}/${s.path}`} className="min-w-[23%] bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center pb-6 border border-slate-100 shrink-0">
                                        <div className="w-full h-56 overflow-hidden mb-6">
                                            <img src={s.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.title}/>
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 px-4 uppercase tracking-tight">{s.title}</h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. LOCAL INSPIRATION SECTION (Synchronized with Venue) */}
            <section className="bg-white py-12 border-t border-slate-50 relative">
                <div className="max-w-[1800px] mx-auto text-center px-10 md:px-20">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">Planning in {cityName}</h2>
                        <p className="text-[#EF3E36] font-bold text-base md:text-lg tracking-tight">Get inspired with local trends and expert party ideas</p>
                    </div>

                    <div className="relative group/carousel mx-auto">
                        <button 
                            onClick={() => setCurrentIndex(prev => (prev - 1 + (blogs.length - 4)) % (blogs.length - 4))} 
                            className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 z-30 w-12 h-12 rounded-full border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                        >
                            <ArrowLeft size={24}/>
                        </button>
                        <button 
                            onClick={() => setCurrentIndex(prev => (prev + 1) % (blogs.length - 4))} 
                            className="absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 z-30 w-12 h-12 rounded-full border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                        >
                            <ChevronRight size={24}/>
                        </button>

                        <div className="overflow-hidden px-1">
                            <div 
                                className={`flex gap-5 ${isAnimating ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'}`} 
                                style={{ transform: `translateX(-${currentIndex * (100 / 5)}%)` }}
                            >
                                {/* Double the list for seamless forward loop */}
                                {[...blogs, ...blogs].map((blog, idx) => (
                                    <Link 
                                        key={idx} 
                                        href={`/blog/${blog.slug}`} 
                                        className="min-w-[85%] md:min-w-[45%] lg:min-w-[20%] bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group border-b-4 border-b-transparent hover:border-b-primary text-left"
                                    >
                                        <div className="relative h-44 overflow-hidden">
                                            <img src={blog.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/>
                                        </div>
                                        <div className="p-5 flex-grow flex flex-col justify-between min-h-[150px]">
                                            <div>
                                                <h4 className="text-[16px] font-black text-slate-950 group-hover:text-primary transition-colors leading-tight mb-3 line-clamp-2">{blog.title}</h4>
                                                <p className="text-[14px] text-slate-800 font-bold line-clamp-2 leading-relaxed mb-4">{blog.text}</p>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto border-t border-slate-50 pt-4">
                                                {blog.date || "Thursday Apr 09, 2026"}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* 8. CITY REVIEWS (Perfectly Equal Rhythm) */}
            {/* 8. HOW IT WORKS (Pixel-Perfect Reference Match) */}
            <section className="py-12 bg-slate-50 relative overflow-hidden">
                <div className="max-w-[1800px] mx-auto px-10 md:px-20">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">How VenueConnect Works</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        {/* Process Column */}
                        <div className="relative space-y-8">
                            {/* Connecting Line */}
                            <div className="absolute left-[32px] top-10 bottom-10 w-[2px] bg-sky-400 opacity-40 z-0 hidden md:block" />

                            {[
                                { stepTitle: "Tell us what you need", num: "1.", text: "Answer a few questions about what services you're looking for.", bg: "bg-rose-50", icon: <Sparkles className="text-rose-400" /> },
                                { stepTitle: "Get free quotes", num: "2.", text: "Within hours, you'll receive up to 5 introductions to vendors based on your specific needs.", bg: "bg-sky-50", icon: <Users2 className="text-sky-400" /> },
                                { stepTitle: "Hire the right vendor", num: "3.", text: "When you're ready, compare vendors and their reviews then hire the one that's right for you.", bg: "bg-rose-50", icon: <Star className="text-rose-400" /> }
                            ].map((s, i) => (
                                <div key={i} className={`relative z-10 p-6 rounded-[2rem] ${s.bg} border border-white shadow-xl flex items-start gap-6 hover:-translate-y-1 transition-all duration-500 group`}>
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-white shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        {s.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight flex items-baseline gap-2">
                                            <span className="text-3xl text-primary/80">{s.num}</span> {s.stepTitle}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-bold leading-relaxed">{s.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Visual Column */}
                        <div className="relative">
                            <div className="aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-6 border-white">
                                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=80" className="w-full h-full object-cover" alt="Indian Wedding Planning"/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. VENDOR PARTNER CTA BAR (High-Conversion) */}
            <section className="bg-primary py-8 px-10 md:px-20">
                <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-white text-center md:text-left">
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-1">Are you an Event Service Professional?</h2>
                        <p className="text-sm md:text-base font-bold opacity-90">Join VenueConnect Today to Grow Your Business & Reach More Clients!</p>
                    </div>
                    <Link href="/business/register" className="bg-white text-primary px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-100 hover:scale-105 transition-all shadow-2xl">
                        Sign up with us
                    </Link>
                </div>
            </section>

            {/* 10. OUR MISSION (Architectural Parity) */}
            <section className="py-12 bg-white">
                <div className="max-w-[1800px] mx-auto px-10 md:px-20 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Our Mission</h2>
                    <p className="text-xl md:text-2xl font-black text-primary mb-10 tracking-tight leading-tight">
                        At VenueConnect, our mission is - Making Happy Occasions Happier!
                    </p>
                    <div className="max-w-6xl mx-auto space-y-6 text-slate-600 font-medium text-sm md:text-base leading-relaxed text-justify md:text-center">
                        <p>
                            VenueConnect has a passionate, committed team at its helm with some sharpest, experienced brains behind it as advisors. As with any great team, VenueConnect is a good mix of sharp, intelligent, focused, hard-working team. We're young, we're enthusiastic and yes, we love hunting down the coolest venues and vendors around. We believe that even though we're so often communicating and socialising online, it's those offline social and corporate events and activities that are most important.
                        </p>
                        <p>
                            We are building a product that showcases the amazing spaces and professionals we come across and at the same time, we aim to help event organizers save time and effort when looking for their kind of venues and vendor partners. The ultimate objective is to connect the right people to the right kind of venues and professional vendors, bridging the gap and delivering value!
                        </p>
                    </div>
                </div>
            </section>
            {/* 11. CLIENT TESTIMONIALS (High-Density Compact) */}
            <section className="py-16 bg-slate-50 relative overflow-hidden text-center">
                <div className="max-w-[1700px] mx-auto px-10 md:px-20">
                    <div className="mb-14">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">What our clients have to say..</h2>
                    </div>
                    
                    <ReviewCarousel />
                </div>
            </section>

            {/* 9. UNIFIED DIRECTORY FOOTER (True Black & Edge-Anchored) */}
            <section className="bg-white pt-12 pb-4 border-t border-slate-100">
                <div className="max-w-[1080px] mx-auto px-6">
                    <div className="relative -mx-12 flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 mb-8 mt-10 px-2">
                        {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Vapi', 'Anand', 'Nadiad'].map((city, i) => (
                            <Link key={city} href={`/vendors/${city.toLowerCase()}`} className={`text-[15px] font-black transition-all ${city.toLowerCase() === citySlug.toLowerCase() ? 'text-black border-b-4 border-primary pb-3 -mb-[26px]' : 'text-slate-950 hover:text-black'}`}>
                                {city}
                            </Link>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-1 mb-12">
                        {[
                            ['Photographers', 'Caterers', 'Decorators', 'Mehndi Artists'],
                            ['Makeup Artists', 'DJs', 'Wedding Planners', 'Videographers'],
                            ['Wedding', 'Sangeet', 'Corporate Event', 'Birthday'],
                            ['Engagement', 'Reception', 'Anniversary', 'Baby Shower']
                        ].map((list, colIdx) => (
                            <div key={colIdx} className="space-y-1">
                                {list.map(item => {
                                    // First 2 cols are vendor categories, last 2 are occasion searches
                                    const isOccasion = colIdx >= 2;
                                    const href = isOccasion
                                        ? `/${citySlug}/vendors/?q=${encodeURIComponent(item)}`
                                        : `/${citySlug}/vendors/${item.toLowerCase().replace(/[\s/]+/g, '-').replace(/\s+/g, '-')}/`;
                                    return (
                                        <Link key={item} href={href} className="block text-[14px] font-bold text-slate-500 hover:text-black transition-all leading-relaxed">
                                            {item} in {cityName}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
