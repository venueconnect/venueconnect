"use client";

import { Building2, Home, TreePine, Hotel, Waves, UtensilsCrossed, Users2, Building, Coffee } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCity } from "@/hooks/useCity";

const venueTypes = [
  { icon: Building2, name: "Banquet Halls",      count: "2,400+", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80" },
  { icon: Home,      name: "Party Plots",         count: "1,800+", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80" },
  { icon: TreePine,  name: "Farmhouses",          count: "950+",   image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80" },
  { icon: Hotel,     name: "Hotels",              count: "1,200+", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80" },
  { icon: Waves,     name: "Resorts",             count: "680+",   image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80" },
  { icon: UtensilsCrossed, name: "Restaurants",  count: "1,500+", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80" },
  { icon: Users2,    name: "Clubs",               count: "420+",   image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80" },
  { icon: Building,  name: "Convention Centers",  count: "340+",   image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80" },
  { icon: Coffee,    name: "Cafes",               count: "120+",   image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80" },
];

const CARD = "w-[130px] h-[130px] flex-shrink-0 relative rounded-xl overflow-hidden block";

const VenueTypesBrowse = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const supabase = createClient();
  const city = useCity();

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase.from('venues').select('type');
      if (data) {
        const c: Record<string, number> = {};
        data.forEach((v: any) => {
          const t = v.type || 'Other';
          c[t] = (c[t] || 0) + 1;
        });
        setCounts(c);
      }
    };
    fetchCounts();
  }, []);

  const getCount = (name: string) => {
    // Mapping UI name to DB type
    const mapping: Record<string, string[]> = {
      "Banquet Halls": ["Banquet Hall"],
      "Party Plots": ["Party Plot", "Lawn"],
      "Farmhouses": ["Farmhouse"],
      "Hotels": ["Hotel"],
      "Resorts": ["Resort"],
      "Restaurants": ["Restaurant"],
      "Clubs": ["Club", "Boutique Venue"],
      "Convention Centers": ["Convention Center", "Convention Centre"],
      "Cafes": ["Cafe"]
    };
    const dbTypes = mapping[name] || [name];
    const total = dbTypes.reduce((acc: number, t: string) => acc + (counts[t] || 0), 0);
    return total > 0 ? `${total}+` : "10+";
  };

  const getSlug = (name: string) => {
    if (name === "Convention Centers") return "convention-centers";
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <section className="py-4 md:py-6 bg-white">
      <div className="md:container">
        <div className="text-center mb-3 md:mb-6 px-4 md:px-0">
          <div className="flex items-center justify-center gap-3 mb-2 md:mb-4">
            <div className="h-px w-8 md:w-12 bg-primary/30" />
            <span className="text-[9px] md:text-[10.5px] font-semibold tracking-[2px] md:tracking-[3px] uppercase text-primary">Venue Categories</span>
            <div className="h-px w-8 md:w-12 bg-primary/30" />
          </div>
          <h2 className="font-display text-2xl md:text-5xl font-semibold text-foreground">
            Browse by <em className="italic text-primary">Venue Type</em>
          </h2>
        </div>

        {/* MOBILE: flush-left single-row scroll, uniform 130×130 */}
        <div className="md:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pl-4 pr-4" style={{ width: "max-content" }}>
            {venueTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Link key={type.name} href={`/${getSlug(type.name)}-near-me/`} className={CARD}>
                  <img src={type.image} alt={type.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                    <Icon className="w-6 h-6 text-white mb-1" />
                    <h3 className="font-black text-white text-[9px] uppercase tracking-tight leading-tight">{type.name}</h3>
                    <p className="text-white/70 text-[7px] font-bold uppercase mt-0.5">{getCount(type.name)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {venueTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Link key={type.name} href={`/${getSlug(type.name)}-near-me/`}
                className="group relative h-48 rounded-xl overflow-hidden cursor-pointer block">
                <img src={type.image} alt={type.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-primary/95 group-hover:via-primary/70 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <Icon className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-white text-base mb-1 uppercase tracking-tight">{type.name}</h3>
                  <p className="text-white/70 text-sm font-bold uppercase tracking-widest">{getCount(type.name)} venues</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VenueTypesBrowse;
