"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    MapPin, Search, Star, ArrowRight, ChevronRight, ChevronLeft, CheckCircle2, 
    Sparkles, Building, Store, Building2, Phone, 
    Info, IndianRupee, Users2, Globe2, 
    ShieldCheck, ArrowLeft, Heart, Utensils, Camera, Palette, Music, Quote
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GUJARAT_CITIES, VENDOR_TYPES } from "@/lib/constants";
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
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [startIndex, setStartIndex] = useState(0);
    const isMobile = mounted && typeof window !== 'undefined' && window.innerWidth < 768;
    const visibleCount = isMobile ? 1 : 3;

    const next = () => {
        setStartIndex((prev) => (prev + 1) % REVIEWS.length);
    };

    const prev = () => {
        setStartIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
    };

    const displayReviews = [...REVIEWS, ...REVIEWS].slice(startIndex, startIndex + visibleCount);

    return (
        <div className="relative px-2 md:px-12 group/revnav">
            <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all z-20 border border-slate-100 md:-left-4">
                <ChevronLeft size={24} />
            </button>

            <div className="flex overflow-hidden md:grid md:grid-cols-3 gap-3 md:gap-8 pb-4">
                {displayReviews.map((r, i) => (
                    <div key={i} className="min-w-full md:min-w-0 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 group flex flex-col items-center justify-center min-h-[280px] md:min-h-[360px] w-full px-4">
                        <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2 md:mb-4">{r.name}</h3>
                        <p className="text-slate-600 font-medium text-center mb-6 md:mb-8 leading-relaxed opacity-90 text-xs md:text-sm px-1">"{r.text}"</p>
                        <div className="flex gap-1.5 text-amber-500 mb-6 md:mb-8">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} className={i < r.rating ? "fill-current" : "text-slate-200"} />
                            ))}
                        </div>
                        <p className="text-sm md:text-lg font-black text-primary uppercase tracking-tight">{r.title}</p>
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

const DEFAULT_V_IMG = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80";

const HIRE_SERVICES = [
    { title: "Mehndi Artists", img: "https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?w=600&q=80", path: "mehndi-artists" },
    { title: "Caterers", img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80", path: "caterers" },
    { title: "DJs", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80", path: "djs" },
    { title: "Decorators", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80", path: "decorators" },
    { title: "Photographers", img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", path: "photographers" },
    { title: "Makeup Artists", img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80", path: "makeup-artists" },
];

function VendorsContent() {
    const router = useRouter();
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchCity, setSearchCity] = useState("Ahmedabad");
    const [searchCategory, setSearchCategory] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const [pricingGuides, setPricingGuides] = useState<any[]>([
        { title: "Photographer Prices", price: "Calculating...", img: CATEGORY_ICONS['Photographers'] || DEFAULT_V_IMG, path: "photographers" },
        { title: "Caterer Prices", price: "Calculating...", img: CATEGORY_ICONS['Caterers'] || DEFAULT_V_IMG, path: "caterers" },
        { title: "Makeup Artist Prices", price: "Calculating...", img: CATEGORY_ICONS['Makeup Artists'] || DEFAULT_V_IMG, path: "makeup-artists" },
        { title: "Mehndi Artist Prices", price: "Calculating...", img: CATEGORY_ICONS['Mehndi Artists'] || DEFAULT_V_IMG, path: "mehndi-artists" }
    ]);
    const supabase = createClient();

    const blogs = [
        { title: "Event Lighting Ideas That Completely...", text: "Lighting is one of the most powerful yet oft...", date: "Friday Mar 27, 2026", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80", slug: "event-lighting-ideas" },
        { title: "How Couples Are Blending Festiviti...", text: "Indian weddings have always been grand, vibr...", date: "Tuesday Apr 14, 2026", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80", slug: "blending-festivities" },
        { title: "Modern Wedding Rituals That Are Rep...", text: "Weddings have always been a reflection of cu...", date: "Thursday Apr 09, 2026", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80", slug: "modern-wedding-rituals" },
        { title: "Bollywood Bridal Lehengas That Defi...", text: "When it comes to Indian weddings, Bollywood h...", date: "Saturday Apr 04, 2026", img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80", slug: "bollywood-bridal-lehengas" },
        { title: "Top 10 Birthday Party Ideas for Kids", text: "Planning a kids birthday can be effortless w...", date: "Monday Mar 30, 2026", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80", slug: "top-10-birthday-party-ideas" },
        { title: "Perfect Corporate Venue Guide 2026", text: "Discover how to impress your clients with th...", date: "Wednesday Apr 22, 2026", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80", slug: "perfect-corporate-venue-guide" }
    ];

    useEffect(() => {
        const fetchTopVendors = async () => {
            try {
                const { data } = await supabase.from("vendors")
                    .select("*")
                    .eq('is_approved', true)
                    .order('rating', { ascending: false })
                    .limit(10);
                setVendors(data || []);
            } finally { setLoading(false); }
        };
        fetchTopVendors();
    }, [supabase]);

    // Fetch pricing data by category
    useEffect(() => {
        const fetchPricingData = async () => {
            try {
                const categories = [
                    { name: 'Photographers', label: '/day', defaultPrice: 25000 },
                    { name: 'Caterers', label: '/plate', usePerPlate: true, defaultPrice: 500 },
                    { name: 'Makeup Artists', label: '/person', defaultPrice: 5000 },
                    { name: 'Mehndi Artists', label: '/person', defaultPrice: 8000 }
                ];
                const pricingData = [];

                for (const cat of categories) {
                    const { data } = await supabase.from("vendors")
                        .select("starting_price, price_per_plate")
                        .ilike('category', cat.name)
                        .eq('is_approved', true)
                        .limit(100);

                    let avgPrice = cat.defaultPrice;

                    if (data && data.length > 0) {
                        let validPrices = [];
                        
                        if (cat.usePerPlate) {
                            validPrices = data
                                .map((v: any) => {
                                    if (!v.price_per_plate) return null;
                                    const num = typeof v.price_per_plate === 'string' 
                                        ? parseInt(v.price_per_plate.replace(/[^0-9]/g, '')) 
                                        : v.price_per_plate;
                                    return num > 0 ? num : null;
                                })
                                .filter((v: any) => v !== null);
                        } else {
                            validPrices = data
                                .map((v: any) => {
                                    if (!v.starting_price) return null;
                                    const num = typeof v.starting_price === 'string' 
                                        ? parseInt(v.starting_price.replace(/[^0-9]/g, '')) 
                                        : v.starting_price;
                                    return num > 0 ? num : null;
                                })
                                .filter((v: any) => v !== null);
                        }

                        if (validPrices.length > 0) {
                            avgPrice = Math.round(validPrices.reduce((a: any, b: any) => a + b, 0) / validPrices.length);
                        }
                    }

                    pricingData.push({
                        title: `${cat.name} Prices`,
                        price: `Rs.${avgPrice.toLocaleString()}${cat.label}`,
                        img: CATEGORY_ICONS[cat.name] || DEFAULT_V_IMG,
                        path: cat.name.toLowerCase().replace(/[\s/]+/g, '-')
                    });
                }

                setPricingGuides(pricingData);
            } catch (error) {
                console.error('Error fetching pricing:', error);
            }
        };
        fetchPricingData();
    }, [supabase]);

    // True Circular Infinite Engine (Forward Only) for Categories and Blogs
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

    const [hireIndex, setHireIndex] = useState(0);
    const [hireAnimating, setHireAnimating] = useState(true);

    const [showAllCities, setShowAllCities] = useState(false);

    const ALL_CITIES = ["Delhi", "Faridabad", "Ghaziabad", "Gurgaon", "Noida", "Jaipur", "Mumbai", "Pune", "Chandigarh", "Ahmedabad", "Chennai", "Hyderabad", "Kolkata", "Udaipur", "Bangalore", "Nagpur", "Goa", "Agra", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Vapi", "Anand", "Nadiad", "Indore", "Bhopal", "Lucknow", "Kanpur", "Patna"];

    const PRIORITY_CATEGORIES = Object.keys(CATEGORY_ICONS);
    const displayCategories = [...PRIORITY_CATEGORIES, ...PRIORITY_CATEGORIES];

    useEffect(() => {
        if (catIndex >= Object.keys(CATEGORY_ICONS).length) {
            const jumpTimer = setTimeout(() => {
                setCatAnimating(false);
                setCatIndex(0);
            }, 1000);
            return () => clearTimeout(jumpTimer);
        } else {
            setCatAnimating(true);
        }
    }, [catIndex]);

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

    useEffect(() => {
        const interval = setInterval(() => {
            setHireIndex(prev => prev + 1);
        }, 5000);
        return () => clearInterval(interval);
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

    const handleSearch = () => {
        const citySlug = searchCity.toLowerCase().trim().replace(/\s+/g, '-');
        const categorySlug = searchCategory.toLowerCase().trim().replace(/[\s/]+/g, '-');
        if (citySlug && categorySlug) router.push(`/${citySlug}/vendors/${categorySlug}`);
        else if (citySlug) router.push(`/${citySlug}/vendors`);
        else if (categorySlug) router.push(`/ahmedabad/vendors/${categorySlug}`);
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navScroll = (id: string, dir: number) => {
        const el = document.getElementById(id);
        if (el) el.scrollBy({ left: dir * 300, behavior: 'smooth' });
    };

    const getCity = () => {
        const raw = searchCity || (typeof window !== 'undefined' ? localStorage.getItem('vc_user_city') : null) || 'ahmedabad';
        return raw.toLowerCase().trim().replace(/[\s/]+/g, '-');
    };

    return (
        <main className="min-h-screen bg-white font-sans text-slate-900">
            
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
                            <span className="text-white">Vendors</span>
                        </nav>
                        
                        <div className="max-w-3xl mb-6 md:mb-10 text-white">
                            <h1 className="text-2xl md:text-5xl font-black text-white uppercase tracking-[4px] md:tracking-[8px] leading-[1.2]">
                                Book Best Event<br/><span className="text-primary italic tracking-[2px]">Professionals</span>
                            </h1>
                        </div>
                        
                        {/* Compact Search Bar (Desktop) | Single Line Bar (Mobile) */}
                        <div className="bg-white md:bg-white/10 backdrop-blur-xl rounded-full shadow-2xl flex flex-row items-center overflow-hidden w-full max-w-4xl border-2 md:border-4 border-white/10 group/searchbox transition-all duration-500 hover:border-white/20 h-11 md:h-16 px-1">
                            <div className="flex-[8] flex items-center px-4 md:px-6 h-full border-r border-slate-100 md:border-white/10">
                                <Search className="text-slate-400 md:text-white/60 w-4 h-4 md:w-5 md:h-5 mr-3 md:mr-4 shrink-0" />
                                <select 
                                    value={searchCategory}
                                    onChange={(e) => setSearchCategory(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 md:text-white font-bold text-[11px] md:text-sm appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-slate-900">Search Professionals...</option>
                                    {VENDOR_TYPES.map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                                </select>
                            </div>
                            <button onClick={handleSearch} className="flex-[2] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] md:text-xs h-9 md:h-full px-4 md:px-8 transition-all rounded-full md:rounded-none">
                                Go
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
                            style={{ transform: `translateX(-${catIndex * (mounted && window.innerWidth < 768 ? 130 : 160)}px)` }} 
                        >
                            {displayCategories.map((name, idx) => (
                                <Link 
                                    key={`${name}-${idx}`} 
                                    href={mounted ? `/${getCity()}/vendors/${name.toLowerCase().replace(/[\s/]+/g, '-')}/` : '#'} 
                                    className="flex-shrink-0 flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                                        <img src={CATEGORY_ICONS[name] || DEFAULT_V_IMG} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={name}/>
                                    </div>
                                    <span className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">{name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TRENDING NOW */}
            <section className="py-14 bg-white">
                <div className="max-w-[1800px] mx-auto px-10 md:px-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Trending Now</h2>
                    </div>
                     <div className="flex overflow-x-auto pb-6 no-scrollbar snap-x gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8">
                         {[
                             { title: "Bridal Wear near me", img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80", path: "bridal-wear" },
                             { title: "Mehndi Artists near me", img: "https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?w=600&q=80", path: "mehndi-artists" },
                             { title: "Groom Wear near me", img: "https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?w=600&q=80", path: "groom-wear" },
                             { title: "Decorators near me", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80", path: "decorators" }
                         ].map((s, i) => (
                              <Link key={i} href={mounted ? `/${getCity()}/vendors/${s.path}/` : '#'} className="min-w-[calc(85%-1rem)] md:min-w-0 snap-start group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center pb-8 border-b-4 border-b-transparent hover:border-b-primary">
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
                <section className="py-10 md:py-16 bg-slate-50">
                    <div className="max-w-[1800px] mx-auto px-10 md:px-20">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-black text-slate-950 tracking-tight uppercase">Top Rated Professionals</h2>
                                <p className="text-primary font-bold tracking-widest text-xs uppercase mt-2">Verified & Highly Recommended in Gujarat</p>
                            </div>
                            <Link href="/ahmedabad/vendors/" className="px-8 py-3 bg-white border-2 border-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg">
                                View Full Directory
                            </Link>
                        </div>
                        
                        {/* MOBILE: Single Line Horizontal Scroll */}
                        <div className="md:hidden flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x px-1">
                            {vendors.map((v, i) => (
                                <Link 
                                    key={`v-m-${v.id || i}`} 
                                    href={`/${v.city?.toLowerCase() || 'ahmedabad'}/vendors/${v.slug}/`} 
                                    className="min-w-[280px] snap-start group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg flex flex-col"
                                >
                                    <div className="relative h-44 overflow-hidden">
                                        <img 
                                            src={getListingImage(v)} 
                                            className="w-full h-full object-cover" 
                                            alt={v.name}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80';
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] font-black">{v.rating || '4.8'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-black text-slate-950 truncate">{v.name}</h3>
                                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-3">
                                            <MapPin size={12}/> {v.area || v.city}
                                        </p>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                            <span className="text-xs font-black text-slate-900">₹{v.starting_price || '15,000'}</span>
                                            <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded">{v.vendor_type}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* DESKTOP GRID */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-6">
                            {vendors.map((v, i) => (
                                <Link 
                                    key={v.id || i} 
                                    href={`/${v.city?.toLowerCase() || 'ahmedabad'}/vendors/${v.slug}/`} 
                                    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-2"
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
                                        {v.is_verified && (
                                            <div className="absolute top-3 left-3 bg-primary text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                <CheckCircle2 size={10} />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-grow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-black text-slate-950 truncate max-w-[70%]">{v.name}</h3>
                                            <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded">{v.vendor_type || 'Professional'}</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-4">
                                            <MapPin size={12}/> {v.area || v.city || 'Ahmedabad'}
                                        </p>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-50 group/btn">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Starting from</span>
                                                <span className="text-sm font-black text-slate-900 saturate-150">₹{v.starting_price || '15,000'}</span>
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
            <section className="py-10 md:py-16 bg-white border-t border-slate-50">
                <div className="max-w-[1800px] mx-auto px-6 md:px-20 text-center">
                    <div className="mb-8 md:mb-12">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Pricing Guides</h2>
                        <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest">Click any service to view market package tiers, deliverables & cost breakdown</p>
                    </div>
                     <div className="flex overflow-x-auto pb-6 no-scrollbar snap-x gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8">
                         {(pricingGuides.length > 0 ? pricingGuides : [
                             { title: "Photographer Prices", price: "Rs.25,000/day", img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", path: "photographers" },
                             { title: "Caterer Prices", price: "Rs.500/plate", img: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80", path: "caterers" },
                             { title: "Makeup Artist Prices", price: "Rs.5,000/person", img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80", path: "makeup-artists" },
                             { title: "Mehndi Artist Prices", price: "Rs.8,000/person", img: "https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?w=600&q=80", path: "mehndi-artists" }
                         ]).map((p, i) => (
                             <PricingGuideModal
                                 key={i}
                                 categoryKey={p.path}
                                 citySlug={getCity()}
                                 trigger={
                                     <div className="min-w-[70%] md:min-w-0 snap-start bg-white rounded-xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group cursor-pointer hover:shadow-2xl transition-all duration-500 border-b-4 border-b-transparent hover:border-b-primary h-full text-left">
                                         <div className="w-full h-40 md:h-48 overflow-hidden relative">
                                             <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title}/>
                                             <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full opacity-90 group-hover:bg-[#EF3E36] transition-colors">
                                                 View Guide
                                             </div>
                                         </div>
                                         <div className="py-3 px-4 bg-white flex-grow text-left">
                                             <h3 className="text-[11px] md:text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
                                         </div>
                                         <div className="bg-[#EF3E36] py-2 md:py-3 text-center">
                                             <span className="text-white font-black text-[10px] md:text-sm">{p.price}</span>
                                         </div>
                                     </div>
                                 }
                             />
                         ))}
                     </div>
                </div>
            </section>

            {/* 5. POPULAR SEARCH (Rectangular High-Density Bars) */}
            <section className="py-14 bg-white">
                <div className="max-w-[1800px] mx-auto px-10 md:px-20 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight">Popular Search</h2>
                    {/* Popular Search Grid — Adjusted for 2x2 Mobile View */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { title: 'Photographers', slug: 'photographers' },
                            { title: 'Makeup Artists', slug: 'makeup-artists' },
                            { title: 'Decorators', slug: 'decorators' },
                            { title: 'DJs', slug: 'djs' }
                        ].map((s, i) => (
                             <Link key={i} href={`/${getCity()}/vendors/${s.slug}/`} className="aspect-[2.5/1] md:aspect-auto md:h-16 flex items-center justify-center bg-white rounded-xl md:rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.2)] border border-slate-50 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] hover:border-primary/20 transition-all duration-300 px-4 md:px-6 group">
                                 <span className="font-black text-slate-800 uppercase tracking-tight text-[11px] md:text-sm text-center group-hover:text-primary transition-colors line-clamp-1">{s.title} in {getCity()}</span>
                             </Link>
                         ))}
                    </div>
                </div>
            </section>

            {/* 7. EVENT PLANNING INSPIRATION SECTION (Steady & Symmetrical) */}
            <section className="bg-white py-10 md:py-16 border-t border-slate-50 relative">
                <div className="max-w-[1800px] mx-auto text-center px-10 md:px-20">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">Event Planning Inspiration & Ideas</h2>
                        <p className="text-[#EF3E36] font-bold text-base md:text-lg tracking-tight uppercase tracking-widest">Get inspired with the latest event trends and party ideas</p>
                    </div>

                    <div className="relative group/carousel mx-auto">
                        {/* Navigation Arrows - Perfectly Balanced */}
                        <button 
                            onClick={() => setCurrentIndex(prev => (prev - 1 + (blogs.length - 4)) % (blogs.length - 4))}
                            className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 z-30 w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <button 
                            onClick={() => setCurrentIndex(prev => (prev + 1) % (blogs.length - 4))}
                            className="absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 z-30 w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                        >
                            <ChevronRight size={24} />
                        </button>                        {/* Carousel Container - Balanced Spacing */}
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


            {/* 8. HOW IT WORKS — Compact & Elegant on Mobile */}
            <section className="py-12 md:py-16 bg-slate-50 relative overflow-hidden">
                <div className="max-w-[1800px] mx-auto px-6 md:px-20">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight">How VenueConnect Works</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        {/* Process Column */}
                        <div className="relative space-y-6 md:space-y-8">
                            {/* Connecting Curly Line (Mobile & Desktop) */}
                            <div className="absolute left-[24px] md:left-[32px] top-10 bottom-10 z-0 opacity-20 pointer-events-none">
                                <svg className="h-full w-4 md:w-6 overflow-visible" viewBox="0 0 20 400" fill="none" preserveAspectRatio="none">
                                    <path d="M10 0C10 50 0 50 0 100C0 150 20 150 20 200C20 250 0 250 0 300C0 350 10 350 10 400" stroke="#EF3E36" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 6"/>
                                </svg>
                            </div>

                            {[
                                { stepTitle: "What you need ?", num: "1", text: "Answer a few questions about your event services.", bg: "bg-rose-50", icon: <Sparkles className="text-rose-400 w-5 h-5 md:w-6 md:h-6" /> },
                                { stepTitle: "Get free quotes", num: "2", text: "Receive up to 5 curated introductions within hours.", bg: "bg-sky-50", icon: <Users2 className="text-sky-400 w-5 h-5 md:w-6 md:h-6" /> },
                                { stepTitle: "Hire the right one", num: "3", text: "Compare, review and hire the perfect professional.", bg: "bg-rose-50", icon: <Star className="text-rose-400 w-5 h-5 md:w-6 md:h-6" /> }
                            ].map((s, i) => (
                                <div key={i} className={`relative z-10 p-4 md:p-6 rounded-2xl md:rounded-[2rem] ${s.bg} border border-white shadow-xl flex items-start gap-4 md:gap-6 hover:-translate-y-1 transition-all duration-500 group`}>
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.25rem] bg-white shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        {s.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm md:text-lg font-black text-slate-900 mb-1 uppercase tracking-tight flex items-baseline gap-2">
                                            <span className="text-xl md:text-3xl text-primary/80 font-black">{s.num}.</span> {s.stepTitle}
                                        </h3>
                                        <p className="text-[11px] md:text-sm text-slate-500 font-bold leading-relaxed">{s.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Visual Column — Hidden on very small screens or smaller header */}
                        <div className="relative hidden md:block">
                            <div className="aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-6 border-white">
                                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=80" className="w-full h-full object-cover" alt="Indian Event Planning Collaboration"/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. VENDOR PARTNER CTA BAR (High-Conversion) */}
            <section className="bg-primary py-8 px-10 md:px-20">
                <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-white text-center md:text-left">
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight mb-1 md:mb-1">Are you Professional?</h2>
                        <p className="text-[10px] md:text-base font-bold opacity-90">Grow your business & reach more clients!</p>
                    </div>
                    <Link href="/list-business" className="bg-white text-primary px-6 md:px-10 py-3 md:py-4 rounded-full font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-slate-100 hover:scale-105 transition-all shadow-2xl">
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
            <section className="py-10 md:py-16 bg-slate-50 relative overflow-hidden text-center">
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
                    {/* MOBILE Dropdown Way */}
                    <div className="md:hidden pt-4 pb-2">
                        <select 
                            onChange={(e) => window.location.href = `/vendors/${e.target.value.toLowerCase()}`}
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-black uppercase tracking-widest text-xs appearance-none shadow-sm"
                            value={getCity()}
                        >
                            <option value="">Select City</option>
                            {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Vapi', 'Anand', 'Nadiad'].map(city => (
                                <option key={city} value={city.toLowerCase()}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="hidden md:flex relative -mx-12 flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 mb-8 mt-10 px-2">
                        {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Vapi', 'Anand', 'Nadiad'].map((city, i) => (
                            <Link key={city} href={`/vendors/${city.toLowerCase()}`} className={`text-[15px] font-black transition-all ${i === 0 ? 'text-black border-b-4 border-primary pb-3 -mb-[26px]' : 'text-slate-950 hover:text-black'}`}>
                                {city}
                            </Link>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-1 mb-12">
                        {[
                            ['Photographers', 'Caterers', 'Decorators', 'Makeup Artists'],
                            ['Choreographers', 'DJs', 'Wedding Planners', 'Event Planners'],
                            ['Bridal Wear', 'Jewellers', 'Invitation Cards', 'Mehndi Artists'],
                            ['Groom Wear', 'Florists', 'Cake Shops', 'Bands']
                        ].map((list, colIdx) => (
                            <div key={colIdx} className="space-y-1">
                                {list.map(item => (
                                    <Link key={item} href={mounted ? `/${getCity()}/vendors/${item.toLowerCase().replace(/[\s/]+/g, '-')}/` : '#'} className="block text-[12px] md:text-[14px] font-bold text-slate-500 hover:text-black transition-all leading-relaxed">{item}</Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function VendorsPage() {
    return (<Suspense fallback={<div className="py-40 text-center font-black animate-pulse text-primary tracking-[10px]">Harmonizing Portals...</div>}><VendorsContent /></Suspense>);
}
