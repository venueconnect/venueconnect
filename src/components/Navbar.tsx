"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User, Search, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { gujaratCities } from "@/lib/cities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then((res: any) => {
      const user = res.data?.user;
      if (user) {
        setSession({ user });
        fetchUserRole(user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session?.user?.id) fetchUserRole(session.user.id);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (data) setUserRole(data.role);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Route Venues nav clicks to the venues listing page.
  // If we have a cached city, pass it as a query filter instead of navigating to /{city}.
  const navigateToVenues = async () => {
    try {
      const canonicalCities = [
        'ahmedabad', 'surat', 'vadodara', 'rajkot', 'gandhinagar', 
        'bhavnagar', 'jamnagar', 'anand', 'junagadh', 'gandhidham', 
        'navsari', 'morbi', 'bhuj', 'valsad', 'palanpur', 'dahod'
      ];

      // 1. Try to extract city from current URL path
      const pathSegments = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
      const potentialCity = pathSegments[0]?.toLowerCase();
      
      let citySlug = '';
      if (potentialCity && canonicalCities.includes(potentialCity)) {
        citySlug = potentialCity;
      } else {
        // 2. Try to get from localStorage
        const cached = typeof window !== 'undefined' ? localStorage.getItem('vc_user_city') : null;
        if (cached && canonicalCities.includes(cached.toLowerCase())) {
          citySlug = cached.toLowerCase();
        }
      }

      if (citySlug) {
        localStorage.setItem('vc_user_city', citySlug);
        router.push(`/${citySlug}/`);
        return;
      }
      
      // 3. Fallback: Geolocate
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      if (data.city && gujaratCities.some(c => c.toLowerCase() === data.city.toLowerCase())) {
        const detectedCity = data.city.toLowerCase();
        localStorage.setItem('vc_user_city', detectedCity);
        router.push(`/${detectedCity}/`);
      } else {
        router.push("/ahmedabad/");
      }
    } catch (err) {
      router.push("/ahmedabad/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-20 px-3 lg:px-6 relative">
        <Link href="/" className="hidden lg:flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/venue-connect.png"
            alt="VenueConnect"
            width={200}
            height={50}
            className="object-contain"
            priority
            style={{ height: '72px', width: 'auto' }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-[13px] font-bold text-foreground hover:text-primary transition-colors relative group uppercase tracking-wider">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
          <a href="/venues" onClick={(e) => {
            e.preventDefault();
            navigateToVenues();
          }} className="cursor-pointer text-[13px] font-bold text-foreground hover:text-primary transition-colors relative group uppercase tracking-wider">
            Venues
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </a>
          <Link 
            href="/vendors" 
            className="text-[13px] font-bold text-foreground hover:text-primary transition-colors relative group uppercase tracking-wider"
          >
            Vendors
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/cities" className="text-[13px] font-bold text-foreground hover:text-primary transition-colors relative group uppercase tracking-wider">
            Cities
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/blog" className="text-[13px] font-bold text-foreground hover:text-primary transition-colors relative group uppercase tracking-wider">
            Blog
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>

        {/* Desktop Right side */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary font-medium"
            asChild
          >
            <Link href="/list-business">List Your Business</Link>
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium border-b mb-1">
                  <div className="truncate mb-1">{session.user.user_metadata?.full_name || session.user.email}</div>
                  {userRole === 'admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">Super Admin</span>
                  )}
                  {userRole === 'owner' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Verified Lister</span>
                  )}
                </div>
                {userRole === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer text-indigo-700 font-medium">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {userRole === 'owner' && (
                  <DropdownMenuItem asChild>
                    <Link href="/owner" className="cursor-pointer text-amber-700 font-medium">Lister Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">Saved Shortlist</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md hover:shadow-lg transition-all"
              asChild
            >
          <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

         {/* ── MOBILE HEADER: Logo LEFT | WhatsApp + Hamburger RIGHT ── */}
         <div className="lg:hidden absolute inset-0 h-20 flex items-center px-3 justify-between gap-2">
            {/* Left: Logo - Bigger */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0" onClick={() => setOpen(false)}>
              <Image 
                src="/venue-connect.png" 
                alt="VenueConnect" 
                width={180} 
                height={50} 
                className="object-contain" 
                priority
                style={{ height: '64px', width: 'auto' }}
              />
            </Link>

            {/* Right: WhatsApp + Hamburger */}
            <div className="flex items-center gap-1">
              {/* WhatsApp - On right */}
              <a
                href="https://wa.me/919586500686"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full transition-colors shadow-md text-[11px] font-bold"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>WhatsApp</span>
              </a>

              {/* Hamburger Menu */}
              <button
                className="p-1.5 hover:bg-primary/5 rounded-lg transition-colors flex-shrink-0"
                onClick={() => setOpen(!open)}
                aria-label="Toggle Menu"
              >
                {open ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
              </button>
            </div>
         </div>
      </div>

      {/* Improved Mobile Menu Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 top-20 z-40 bg-white/95 backdrop-blur-md overflow-y-auto">
          <div className="container py-8 px-6 space-y-6">
            <nav className="space-y-1">
              <Link href="/" className="flex items-center justify-between text-lg font-bold py-4 border-b border-slate-100 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                Home <ChevronRight size={18} className="text-slate-300" />
              </Link>
              <a href="/venues" className="flex items-center justify-between text-lg font-bold py-4 border-b border-slate-100 hover:text-primary transition-colors" onClick={(e) => {
                e.preventDefault();
                navigateToVenues();
                setOpen(false);
              }}>
                Venues <ChevronRight size={18} className="text-slate-300" />
              </a>
              <Link href="/vendors" className="flex items-center justify-between text-lg font-bold py-4 border-b border-slate-100 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                Vendors <ChevronRight size={18} className="text-slate-300" />
              </Link>
              <Link href="/cities" className="flex items-center justify-between text-lg font-bold py-4 border-b border-slate-100 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                Cities <ChevronRight size={18} className="text-slate-300" />
              </Link>
              <Link href="/blog" className="flex items-center justify-between text-lg font-bold py-4 border-b border-slate-100 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                Blog <ChevronRight size={18} className="text-slate-300" />
              </Link>
              <Link href="/faqs" className="flex items-center justify-between text-lg font-bold py-4 border-b border-slate-100 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                FAQs <ChevronRight size={18} className="text-slate-300" />
              </Link>
              <Link href="/list-business" className="flex items-center justify-between text-lg font-bold py-4 border-b border-slate-100 text-primary transition-colors underline decoration-2 underline-offset-8" onClick={() => setOpen(false)}>
                List Your Business <ChevronRight size={18} />
              </Link>
            </nav>

            <div className="pt-6">
              {session ? (
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 truncate">
                        {session.user.user_metadata?.full_name || session.user.email}
                      </p>
                      {userRole === 'admin' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">Super Admin</span>
                      )}
                      {userRole === 'owner' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">Verified Lister</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {userRole === 'admin' && (
                      <Link href="/admin" className="block w-full py-3 px-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-center" onClick={() => setOpen(false)}>Admin Dashboard</Link>
                    )}
                    {userRole === 'owner' && (
                      <Link href="/owner" className="block w-full py-3 px-4 bg-amber-50 text-amber-700 rounded-xl font-bold text-center" onClick={() => setOpen(false)}>Lister Dashboard</Link>
                    )}
                    <Link href="/profile" className="block w-full py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-center" onClick={() => setOpen(false)}>My Profile</Link>
                    <Link href="/profile" className="block w-full py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-center" onClick={() => setOpen(false)}>Saved Shortlist</Link>
                    <Button
                      variant="destructive"
                      className="w-full py-6 rounded-xl font-bold text-base mt-2"
                      onClick={() => {
                        handleSignOut();
                        setOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="lg" className="w-full py-8 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" asChild onClick={() => setOpen(false)}>
                  <Link href="/login">Login / Sign Up</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
