"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
    X, Sparkles, CheckCircle2, TrendingUp, HelpCircle, 
    ArrowRight, MapPin, IndianRupee, ShieldCheck, 
    Camera, Utensils, Palette, Sparkle, Music, Flower2, CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PricingGuideData {
    id: string;
    title: string;
    categoryName: string;
    categorySlug: string;
    startingPrice: string;
    priceUnit: string;
    coverImg: string;
    summary: string;
    packages: {
        name: string;
        tag?: string;
        price: string;
        bestFor: string;
        deliverables: string[];
    }[];
    costFactors: {
        title: string;
        desc: string;
    }[];
    cityAverages: {
        city: string;
        startPrice: string;
        avgPrice: string;
    }[];
    proTips: string[];
}

export const PRICING_GUIDE_CATALOG: Record<string, PricingGuideData> = {
    "photographers": {
        id: "photographers",
        title: "Photographer & Cinematography Pricing Guide",
        categoryName: "Photographers",
        categorySlug: "photographers",
        startingPrice: "₹15,000",
        priceUnit: "per day / shoot",
        coverImg: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1000&q=80",
        summary: "Photography pricing varies based on crew size, candid vs traditional coverage, 4K drone cinematography, and premium album binding.",
        packages: [
            {
                name: "Essential Package",
                price: "₹15,000 – ₹25,000",
                bestFor: "Single-day functions, Intimate ceremonies & Haldi / Mehendi",
                deliverables: [
                    "1 Traditional Photographer + 1 Traditional Videographer",
                    "150-250 High-Resolution Edited Digital Photos",
                    "Full Event Video (60-90 Mins HD)",
                    "Digital Delivery via Cloud Link in 10-15 Days"
                ]
            },
            {
                name: "Standard Candid Package",
                tag: "Most Popular",
                price: "₹40,000 – ₹70,000",
                bestFor: "Full Wedding & Grand Reception coverage",
                deliverables: [
                    "1 Senior Candid Photographer + 1 Traditional Photographer",
                    "1 Cinematic Videographer (Gimbal + Prime lenses)",
                    "350+ Retouched Master Photos + 3-4 Min Cinematic Highlight Teaser",
                    "1 Premium Hardcover Photobook (35-40 sheets / 150 photos)"
                ]
            },
            {
                name: "Luxury Cinematic & Drone",
                tag: "Premium",
                price: "₹90,000 – ₹1,80,000+",
                bestFor: "Multi-day Grand Celebrations & Destination Weddings",
                deliverables: [
                    "Full Multi-Cam Production Crew (4-6 Photographers & Cinematographers)",
                    "Licensed 4K Drone Aerial Shoots",
                    "Pre-Wedding Concept Video Shoot Included",
                    "Same-Day Edit / 60-Sec Reel for Social Media",
                    "2 Luxury Leatherette/Velvet Boxed Photo Albums"
                ]
            }
        ],
        costFactors: [
            { title: "Candid vs Traditional", desc: "Candid photographers use fast prime lenses and high-end color grading, costing 40-60% more than traditional staging." },
            { title: "Drone & Aerial Coverage", desc: "Adds ₹10,000 - ₹25,000 depending on flight permits and multi-angle drone setups." },
            { title: "Album Printing & Finishing", desc: "Lustre, metallic, or velvet flush-mount photo albums cost ₹6,000 - ₹20,000 per copy." },
            { title: "Pre-Wedding Sessions", desc: "Standalone outdoor pre-wedding shoots range between ₹20,000 to ₹50,000 per session." }
        ],
        cityAverages: [
            { city: "Ahmedabad", startPrice: "₹20,000", avgPrice: "₹50,000" },
            { city: "Surat", startPrice: "₹25,000", avgPrice: "₹55,000" },
            { city: "Vadodara", startPrice: "₹18,000", avgPrice: "₹45,000" },
            { city: "Rajkot", startPrice: "₹18,000", avgPrice: "₹42,000" }
        ],
        proTips: [
            "Book top photographers at least 3–6 months in advance for peak winter wedding dates.",
            "Always ask to see an entire delivered wedding gallery rather than just Instagram highlights.",
            "Confirm the delivery timeline for raw vs edited photos and printed albums in the service agreement."
        ]
    },
    "caterers": {
        id: "caterers",
        title: "Catering & Live Food Counters Pricing Guide",
        categoryName: "Caterers",
        categorySlug: "caterers",
        startingPrice: "₹450",
        priceUnit: "per plate / person",
        coverImg: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1000&q=80",
        summary: "Catering costs depend on the number of courses, pure Jain/Swaminarayan requirements, live specialty stalls (Chaat, Mexican, Italian), and dessert spreads.",
        packages: [
            {
                name: "Standard Veg Feast",
                price: "₹450 – ₹650 / plate",
                bestFor: "Engagements, Kitty parties, Birthday celebrations (50–300 guests)",
                deliverables: [
                    "2 Welcome Mocktails + 2 Hot Starters",
                    "2 Paneer & Seasonal Veg Curries + Dal Makhani / Gujarati Dal",
                    "Assorted Indian Breads (Naan, Roti, Paratha)",
                    "Jeera Rice / Veg Pulao + 1 Sweet Dessert (Gulab Jamun / Ice Cream)"
                ]
            },
            {
                name: "Grand Multi-Cuisine Veg",
                tag: "Most Popular",
                price: "₹750 – ₹1,200 / plate",
                bestFor: "Traditional Weddings, Receptions & Sangeet Nights",
                deliverables: [
                    "3 Welcome Drinks + 4 Live Starters (Tandoor, Crispy Corn, Spring Rolls)",
                    "2 Live Interactive Food Counters (Delhi Chaat, Wood-fired Pizza / Pasta)",
                    "3 Main Curries + Signature Dal Tadka / Kadhi",
                    "2 Traditional Sweets (Mohanthal / Basundi) + Artisanal Gelato Bar",
                    "Uniformed Service Staff, Chafing Dishes & Bone China Crockery"
                ]
            },
            {
                name: "Royal Destination & Non-Veg / Live BBQ",
                tag: "Premium",
                price: "₹1,300 – ₹2,200+ / plate",
                bestFor: "Luxury Destination Weddings & High-Profile Receptions",
                deliverables: [
                    "Extensive Global Stations (Pan-Asian, Lebanese Mezze, Sushi, Live Teppanyaki)",
                    "Premium Mutton, Chicken & Seafood Delicacies (where non-veg is opted)",
                    "Exotic Dessert Studio (Waffle Station, Nitro Paan, Turkish Baklava)",
                    "Dedicated Event Captain, Bartending Mixologists & Five-Star Table Setup"
                ]
            }
        ],
        costFactors: [
            { title: "Live Counter Customization", desc: "Each live interactive station (Chaat, Pasta, Dosa, Tacos) adds ₹60 - ₹150 per head." },
            { title: "Exotic Ingredients & Import Items", desc: "Dry fruits, artisanal cheese, imported berries, and truffle oil increase per-plate rates." },
            { title: "Staffing & Crockery Grade", desc: "Premium ceramic/crystal dinnerware and one steward per 15 guests adds ₹80 - ₹120 per plate." },
            { title: "Pure Jain / Swaminarayan Prep", desc: "Dedicated root-vegetable-free kitchens require specialized handling with no extra surcharge on VenueConnect." }
        ],
        cityAverages: [
            { city: "Ahmedabad", startPrice: "₹450 / plate", avgPrice: "₹750 / plate" },
            { city: "Surat", startPrice: "₹500 / plate", avgPrice: "₹850 / plate" },
            { city: "Vadodara", startPrice: "₹400 / plate", avgPrice: "₹700 / plate" },
            { city: "Rajkot", startPrice: "₹400 / plate", avgPrice: "₹650 / plate" }
        ],
        proTips: [
            "Schedule a food tasting session with 4-5 menu choices before finalizing the contract.",
            "Lock in an exact minimum guarantee (MG) guest count with a 10% buffer for unexpected walk-ins.",
            "Ask if welcome drinks, packaged water bottles, and clean-up services are included in the per-plate quote."
        ]
    },
    "makeup-artists": {
        id: "makeup-artists",
        title: "Bridal & Party Makeup Artists Pricing Guide",
        categoryName: "Makeup Artists",
        categorySlug: "makeup-artists",
        startingPrice: "₹4,000",
        priceUnit: "per person / session",
        coverImg: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1000&q=80",
        summary: "Makeup artist rates vary between Party HD makeup, Airbrush techniques, international cosmetic brands (MAC, Huda, Dior), and luxury bridal draping packages.",
        packages: [
            {
                name: "Party & Engagement Makeup",
                price: "₹4,000 – ₹8,000",
                bestFor: "Engagement, Sangeet, Bridesmaids, Family & Party Guests",
                deliverables: [
                    "HD Makeup application using premium cosmetic brands (MAC, Bobbi Brown)",
                    "Hairstyling (Curls, Updos, Braids)",
                    "Basic Saree / Dupatta Draping",
                    "Eyelashes and basic touch-up kit"
                ]
            },
            {
                name: "Signature HD Bridal Package",
                tag: "Most Popular",
                price: "₹12,000 – ₹22,000",
                bestFor: "Traditional & Contemporary Wedding Ceremony",
                deliverables: [
                    "High-Definition Camera-Ready Waterproof Bridal Makeup",
                    "Advanced Hair Styling (Floral accessories, Hair extensions included)",
                    "Intricate Bridal Dupatta Setting, Lehenga & Jewellery Draping",
                    "Premium Mink Lashes, Lens application & Mini Emergency Touchup Kit"
                ]
            },
            {
                name: "Luxury Airbrush Bridal Studio",
                tag: "Premium",
                price: "₹25,000 – ₹45,000+",
                bestFor: "Grand Weddings, Celebrity Styles & Multi-Look Functions",
                deliverables: [
                    "Silicone-based Longwear Airbrush Makeup (16+ Hours Sweatproof)",
                    "Skin Prep & Hydrating Facial Treatment prior to makeup",
                    "Two distinct looks (e.g., Day Wedding + Evening Reception)",
                    "On-venue Artist Assistance throughout the ceremony"
                ]
            }
        ],
        costFactors: [
            { title: "Airbrush vs HD Makeup", desc: "Airbrush makeup creates a flawless micro-droplet air spray finish, typically costing 30-50% more than manual HD application." },
            { title: "Venue / Destination Travel", desc: "Outstation weddings or early-morning venue travel charges range from ₹3,000 to ₹10,000 plus cab/stay." },
            { title: "Hair Extensions & Real Flowers", desc: "Real baby's breath, orchids, and clip-in human hair extensions add ₹1,500 - ₹4,000." },
            { title: "Paid Trial Sessions", desc: "Full face bridal trial sessions range between ₹2,500 and ₹5,000 (often adjusted against the final booking)." }
        ],
        cityAverages: [
            { city: "Ahmedabad", startPrice: "₹4,500", avgPrice: "₹15,000" },
            { city: "Surat", startPrice: "₹5,000", avgPrice: "₹16,500" },
            { city: "Vadodara", startPrice: "₹4,000", avgPrice: "₹13,500" },
            { city: "Rajkot", startPrice: "₹3,500", avgPrice: "₹12,000" }
        ],
        proTips: [
            "Opt for a trial session 3–4 weeks prior to test compatibility with your skin tone and bridal lehenga shade.",
            "Ensure your venue green room has adequate white daylight-temperature lighting for seamless makeup.",
            "Confirm if makeup for the mother-of-the-bride and sisters is included or discounted in package deals."
        ]
    },
    "mehndi-artists": {
        id: "mehndi-artists",
        title: "Bridal & Guest Mehndi Artists Pricing Guide",
        categoryName: "Mehndi Artists",
        categorySlug: "mehndi-artists",
        startingPrice: "₹150",
        priceUnit: "per hand / bridal package",
        coverImg: "https://images.unsplash.com/photo-1610173827002-62c0f1f05d04?w=1000&q=80",
        summary: "Mehndi pricing depends on the intricacy of patterns, customized portrait/love-story motifs, 100% chemical-free organic henna, and speed of application for guest crowds.",
        packages: [
            {
                name: "Guest & Family Mehndi",
                price: "₹150 – ₹350 / hand",
                bestFor: "Mehendi parties, Sangeet guests, Haldi events (20–100 guests)",
                deliverables: [
                    "Fast Arabic, Floral, or Traditional Bel patterns",
                    "Palm or wrist-length coverage per person (3-5 mins per hand)",
                    "1-2 Assistant Artists ensuring speedy service for all attendees",
                    "100% Pure Organic Herbal Henna Cones"
                ]
            },
            {
                name: "Traditional Full Bridal Mehndi",
                tag: "Most Popular",
                price: "₹5,000 – ₹9,000",
                bestFor: "Full Bridal Arms (Elbow length) & Feet (Ankle length)",
                deliverables: [
                    "Dense Rajasthani / Marwari / Mandala intricate design",
                    "Elbow-length arms coverage (front and back)",
                    "Mid-calf / ankle intricate feet design",
                    "Eucalyptus and clove oil dark-stain aftercare kit included"
                ]
            },
            {
                name: "Custom Portrait & Storytelling Bridal",
                tag: "Premium",
                price: "₹11,000 – ₹20,000+",
                bestFor: "Bespoke Bridal Narrative, Proposal Figures & Monuments",
                deliverables: [
                    "Hyper-realistic Bride & Groom Portrait Artwork",
                    "Customized Love Story timeline, Wedding Hashtags & Vows motifs",
                    "Full arm (to shoulders) and knees-length feet coverage",
                    "Senior Master Artist exclusive 6-8 hour dedicated session"
                ]
            }
        ],
        costFactors: [
            { title: "Custom Portrait Carvings", desc: "Handcrafted portrait drawings of bride/groom or wedding ceremonies add ₹2,000 - ₹5,000." },
            { title: "Design Density & Length", desc: "Denser Marwari jaali work and shoulder-length designs require 6-8 hours compared to 2-3 hours for Arabic style." },
            { title: "Number of Assistant Artists", desc: "Booking a team of 3-5 artists for large guest gatherings ranges from ₹6,000 to ₹15,000 per hour." },
            { title: "Organic Stain Quality", desc: "Chemical-free triple-filtered henna cones with essential oils ensure safe, rich mahogany stains." }
        ],
        cityAverages: [
            { city: "Ahmedabad", startPrice: "₹150 / hand", avgPrice: "₹6,500 (Bridal)" },
            { city: "Surat", startPrice: "₹200 / hand", avgPrice: "₹7,500 (Bridal)" },
            { city: "Vadodara", startPrice: "₹150 / hand", avgPrice: "₹5,500 (Bridal)" },
            { city: "Rajkot", startPrice: "₹150 / hand", avgPrice: "₹5,000 (Bridal)" }
        ],
        proTips: [
            "Apply Mehndi 48 hours prior to your wedding day to achieve the deepest natural dark maroon color on the ceremony day.",
            "Avoid washing hands with soap or water for at least 10-12 hours after scraping off the dried henna crust.",
            "Apply a warm mixture of lemon juice, sugar, and mustard oil/clove smoke for maximum pigment absorption."
        ]
    }
};

interface PricingGuideModalProps {
    categoryKey: string;
    citySlug?: string;
    trigger?: React.ReactNode;
}

export default function PricingGuideModal({ categoryKey, citySlug = "ahmedabad", trigger }: PricingGuideModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Normalize category key
    const normalizedKey = categoryKey.toLowerCase().replace(/[\s/]+/g, '-');
    const guideData = PRICING_GUIDE_CATALOG[normalizedKey] || PRICING_GUIDE_CATALOG["photographers"];
    const displayCity = (citySlug || "ahmedabad").charAt(0).toUpperCase() + (citySlug || "ahmedabad").slice(1);

    const openModal = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <>
            <div onClick={openModal} className="cursor-pointer">
                {trigger}
            </div>

            {mounted && isOpen && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in-0 duration-200"
                    onClick={closeModal}
                >
                    <div 
                        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 1. MODAL HEADER & HERO BANNER */}
                        <div className="relative h-44 sm:h-56 shrink-0 overflow-hidden bg-slate-900">
                            <img 
                                src={guideData.coverImg} 
                                alt={guideData.title}
                                className="w-full h-full object-cover opacity-40 scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                            
                            {/* Close Button */}
                            <button 
                                onClick={closeModal}
                                className="absolute top-3 right-3 sm:top-5 sm:right-5 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all z-20 border border-white/20"
                                aria-label="Close modal"
                            >
                                <X size={18} />
                            </button>

                            {/* Header Info */}
                            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 text-white z-10">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EF3E36] text-white text-[10px] sm:text-xs font-black uppercase tracking-widest mb-2 shadow-lg">
                                    <Sparkles size={12} /> Pricing Guide & Market Rates
                                </div>
                                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight">
                                    {guideData.title}
                                </h2>
                                <p className="text-[11px] sm:text-sm text-slate-200 font-medium mt-1">
                                    Typical Rates in {displayCity} & across Gujarat: <span className="font-black text-[#EF3E36] bg-white/90 px-2 py-0.5 rounded-md ml-1 text-slate-900">{guideData.startingPrice} {guideData.priceUnit}</span>
                                </p>
                            </div>
                        </div>

                        {/* 2. MODAL BODY (Scrollable) */}
                        <div className="overflow-y-auto p-4 sm:p-8 space-y-8 no-scrollbar">
                            
                            {/* Summary Text */}
                            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {guideData.summary}
                            </p>

                            {/* 3. ESTIMATED PACKAGE TIERS */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#EF3E36] flex items-center justify-center">
                                        <TrendingUp size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-900">Standard Package Tiers & Deliverables</h3>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">What you get for each budget range</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {guideData.packages.map((pkg, idx) => (
                                        <div 
                                            key={idx}
                                            className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                                                pkg.tag === "Most Popular" 
                                                    ? "bg-red-50/40 border-[#EF3E36] shadow-lg shadow-red-500/5 ring-1 ring-[#EF3E36]" 
                                                    : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                                            }`}
                                        >
                                            {pkg.tag && (
                                                <span className={`absolute -top-2.5 right-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm ${
                                                    pkg.tag === "Most Popular" ? "bg-[#EF3E36] text-white" : "bg-slate-900 text-white"
                                                }`}>
                                                    {pkg.tag}
                                                </span>
                                            )}
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 mb-1">{pkg.name}</h4>
                                                <p className="text-lg font-black text-[#EF3E36] mb-2">{pkg.price}</p>
                                                <p className="text-[11px] font-medium text-slate-500 mb-4 pb-3 border-b border-slate-100">
                                                    <strong className="text-slate-700">Best for:</strong> {pkg.bestFor}
                                                </p>
                                                <ul className="space-y-2 text-[11px] font-medium text-slate-600 mb-4">
                                                    {pkg.deliverables.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. KEY COST FACTORS */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                                        <HelpCircle size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-900">What Factors Affect The Price?</h3>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Key elements impacting final quotes</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {guideData.costFactors.map((factor, idx) => (
                                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#EF3E36] shrink-0 mt-1.5" />
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">{factor.title}</h4>
                                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">{factor.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 5. CITY-WISE PRICE COMPARISON */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-slate-900">City-wise Price Insights in Gujarat</h3>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Average pricing variations by market</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {guideData.cityAverages.map((cityData, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
                                            <p className="text-xs font-black text-slate-900">{cityData.city}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Starting</p>
                                            <p className="text-xs font-black text-slate-700">{cityData.startPrice}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Average</p>
                                            <p className="text-xs font-black text-[#EF3E36]">{cityData.avgPrice}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 6. PRO TIPS */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-900">
                                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-amber-600" /> VenueConnect Expert Booking Tips
                                </h4>
                                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                                    {guideData.proTips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-amber-600 font-bold">•</span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>

                        {/* 7. MODAL FOOTER ACTIONS */}
                        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                            <div className="text-center sm:text-left">
                                <p className="text-xs font-black text-slate-900">Ready to find verified {guideData.categoryName.toLowerCase()}?</p>
                                <p className="text-[11px] text-slate-500 font-medium">Compare quotes and check verified portfolio photos.</p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button 
                                    onClick={closeModal}
                                    variant="outline"
                                    className="w-1/2 sm:w-auto text-xs font-bold"
                                >
                                    Close
                                </Button>
                                <Link 
                                    href={`/${citySlug.toLowerCase()}/vendors/${guideData.categorySlug}/`}
                                    className="w-1/2 sm:w-auto px-5 py-2.5 bg-[#EF3E36] hover:bg-[#D9362F] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/20 text-center flex items-center justify-center gap-1.5 transition-all"
                                    onClick={closeModal}
                                >
                                    Browse Vendors <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
