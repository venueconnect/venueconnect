"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
    Heart, Building2, Store, MapPin, Star, Users2, 
    Trash2, ArrowRight, Sparkles, Phone, ShieldCheck, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getListingImage, getVarietyFallback } from "@/lib/imageUtils";
import { buildListingSlug } from "@/lib/seo/slugify";
import GetQuoteModal from "@/components/GetQuoteModal";

export default function ShortlistPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [savedVenues, setSavedVenues] = useState<any[]>([]);
    const [savedVendors, setSavedVendors] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'venues' | 'vendors'>('all');

    useEffect(() => {
        fetchShortlist();
    }, []);

    const fetchShortlist = async () => {
        try {
            setLoading(true);
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                toast.info("Please login to view your saved shortlist");
                router.push('/login?next=/shortlist');
                return;
            }

            setUser(authUser);

            // 1. Fetch user favorites
            const { data: favorites, error: favErr } = await supabase
                .from('user_favorites')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false });

            if (favErr) throw favErr;

            const venueIds = favorites?.filter((f: any) => f.listing_type === 'venue').map((f: any) => f.listing_id) || [];
            const vendorIds = favorites?.filter((f: any) => f.listing_type === 'vendor').map((f: any) => f.listing_id) || [];

            // 2. Fetch venue details
            let venuesData: any[] = [];
            if (venueIds.length > 0) {
                const { data: venues } = await supabase
                    .from('venues')
                    .select('*')
                    .in('id', venueIds);
                venuesData = venues || [];
            }

            // 3. Fetch vendor details
            let vendorsData: any[] = [];
            if (vendorIds.length > 0) {
                const { data: vendors } = await supabase
                    .from('vendors')
                    .select('*')
                    .in('id', vendorIds);
                vendorsData = vendors || [];
            }

            setSavedVenues(venuesData);
            setSavedVendors(vendorsData);
        } catch (error: any) {
            console.error("Error loading shortlist:", error);
            toast.error("Failed to load your shortlist");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (listingId: string, type: 'venue' | 'vendor') => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('listing_id', listingId)
                .eq('listing_type', type);

            if (error) throw error;

            if (type === 'venue') {
                setSavedVenues(prev => prev.filter(v => v.id !== listingId));
            } else {
                setSavedVendors(prev => prev.filter(v => v.id !== listingId));
            }
            toast.success("Removed from your shortlist");
        } catch (err: any) {
            toast.error("Failed to remove item");
        }
    };

    const totalCount = savedVenues.length + savedVendors.length;

    const displayedItems = (() => {
        if (activeFilter === 'venues') return savedVenues.map(v => ({ ...v, _type: 'venue' }));
        if (activeFilter === 'vendors') return savedVendors.map(v => ({ ...v, _type: 'vendor' }));
        return [
            ...savedVenues.map(v => ({ ...v, _type: 'venue' })),
            ...savedVendors.map(v => ({ ...v, _type: 'vendor' }))
        ];
    })();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
                {/* Header Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-wider mb-3">
                            <Heart size={14} className="fill-current" /> My Saved Shortlist
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mb-2">
                            Saved Venues & Vendors
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
                            Compare your favorite event spaces and verified service professionals, request custom packages, and plan your celebration seamlessly.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/profile">
                            <Button variant="outline" className="rounded-2xl text-xs font-bold h-11 px-5">
                                Account Settings
                            </Button>
                        </Link>
                        <Link href="/venues">
                            <Button className="bg-[#EF3E36] hover:bg-[#D9362F] text-white rounded-2xl text-xs font-black uppercase tracking-wider h-11 px-6 shadow-md shadow-red-500/20">
                                Explore More <ArrowRight size={14} className="ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeFilter === 'all'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            All ({totalCount})
                        </button>
                        <button
                            onClick={() => setActiveFilter('venues')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeFilter === 'venues'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Venues ({savedVenues.length})
                        </button>
                        <button
                            onClick={() => setActiveFilter('vendors')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeFilter === 'vendors'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Vendors ({savedVendors.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm animate-pulse h-96" />
                        ))}
                    </div>
                ) : displayedItems.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 md:p-20 text-center shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Heart size={36} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 font-display">
                            Your Shortlist is Empty
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto mb-8">
                            Browse Gujarat’s top banquet halls, party plots, photographers, and caterers, and click the heart icon on any card to save them here.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link href="/venues">
                                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider h-12 px-6">
                                    Browse Venues
                                </Button>
                            </Link>
                            <Link href="/vendors">
                                <Button variant="outline" className="rounded-2xl text-xs font-black uppercase tracking-wider h-12 px-6">
                                    Browse Vendors
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {displayedItems.map((item: any) => {
                            const isVenue = item._type === 'venue';
                            const finalSlug = buildListingSlug(item.slug || item.id, item.area || item.location);
                            const citySlug = (item.city || 'ahmedabad').toLowerCase().replace(/\s+/g, '-');
                            const detailHref = `/${citySlug}${isVenue ? '' : '/vendors'}/${finalSlug}`;

                            return (
                                <div 
                                    key={`${item._type}-${item.id}`}
                                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                                >
                                    {/* Image */}
                                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                                        <img 
                                            src={getListingImage(item)}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = getVarietyFallback(item.name);
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                                        {/* Remove Button */}
                                        <button 
                                            onClick={() => handleRemove(item.id, item._type)}
                                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-rose-500 flex items-center justify-center transition-all shadow-md z-10"
                                            title="Remove from shortlist"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {/* Category Badge */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <Badge className="bg-black/60 backdrop-blur-md text-white border-none text-[10px] font-black uppercase tracking-wider">
                                                {isVenue ? (item.type || item.venue_type || 'Venue') : (item.category || item.vendor_type || 'Vendor')}
                                            </Badge>
                                        </div>

                                        {/* Bottom Overlay Info */}
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold z-10">
                                            <span className="flex items-center gap-1">
                                                <Star size={13} className="fill-amber-400 text-amber-400" />
                                                {item.rating || '4.8'} ({item.reviews || 0})
                                            </span>
                                            {(item.max_capacity || item.capacity) && (
                                                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                                                    <Users2 size={12} />
                                                    {item.min_capacity || 0}-{item.max_capacity || item.capacity}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between gap-4">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                <MapPin size={12} className="shrink-0 text-slate-400" />
                                                <span className="truncate">{item.location || item.area || item.city}</span>
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-baseline justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</span>
                                                <span className="text-sm font-black text-slate-900">
                                                    ₹{(item.veg_price_per_plate || item.starting_price || 'Consult').toLocaleString()}
                                                    {item.veg_price_per_plate ? <span className="text-[10px] text-slate-400 font-normal"> / plate</span> : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <Link 
                                                href={detailHref} 
                                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl text-center transition-colors flex items-center justify-center gap-1"
                                            >
                                                Details
                                            </Link>
                                            <GetQuoteModal 
                                                businessName={item.name}
                                                listingId={item.id}
                                                listingType={item._type}
                                                ownerId={item.owner_id}
                                                citySlug={citySlug}
                                                imageUrl={getListingImage(item)}
                                                location={item.location || item.area || item.city}
                                                triggerButton={
                                                    <button className="w-full py-2.5 bg-[#EF3E36] hover:bg-[#D9362F] text-white text-xs font-black uppercase tracking-wider rounded-xl text-center transition-colors shadow-md shadow-red-500/20">
                                                        Get Quote
                                                    </button>
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
