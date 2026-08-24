"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Mail, Phone, Instagram, Facebook, Twitter, Linkedin,
  MessageCircle, ArrowUp, ChevronDown
} from "lucide-react";

/* ── Accordion Section ── */
const Accordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3 text-left">
        <span className="text-xs font-black text-white uppercase tracking-wide">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
};

const Footer = () => {
  const [venueHref, setVenueHref] = useState("/venues");

  useEffect(() => {
    const canonicalCities = [
      'ahmedabad', 'surat', 'vadodara', 'rajkot', 'gandhinagar', 
      'bhavnagar', 'jamnagar', 'anand', 'junagadh', 'gandhidham', 
      'navsari', 'morbi', 'bhuj', 'valsad', 'palanpur', 'dahod'
    ];

    const pathSegments = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
    const potentialCity = pathSegments[0]?.toLowerCase();
    
    let citySlug = '';
    if (potentialCity && canonicalCities.includes(potentialCity)) {
      citySlug = potentialCity;
    } else {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('vc_user_city') : null;
      if (cached && canonicalCities.includes(cached.toLowerCase())) {
        citySlug = cached.toLowerCase();
      }
    }
    
    if (citySlug) {
      setVenueHref(`/${citySlug}/`);
    } else {
      setVenueHref("/ahmedabad/");
    }
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#333333] text-white font-sans relative">

      {/* ════════════════ MOBILE FOOTER ════════════════ */}
      <div className="md:hidden px-4 pt-7 pb-0">

        {/* Logo */}
        <Link href="/" className="block mb-3">
          <Image src="/logo.webp" alt="VenueConnect" width={200} height={60} className="object-contain" style={{ height: '60px', width: 'auto' }} />
        </Link>
        <p className="text-slate-400 text-[11px] leading-relaxed mb-4 font-medium">
          Gujarat&apos;s most loved Event Planning platform — venues, vendors, photographers, decorators and more.{" "}
          <Link href="/about" className="text-primary font-bold">More</Link>
        </p>

        {/* Subscribe */}
        <div className="mb-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5">Subscribe for Event Ideas</p>
          <div className="flex">
            <input type="email" placeholder="Your E-mail"
              className="flex-1 bg-white px-3 py-2 text-slate-900 focus:outline-none font-bold text-xs rounded-l" suppressHydrationWarning />
            <button className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-[9px] tracking-wider px-3 py-2 rounded-r transition-colors" suppressHydrationWarning>
              Go
            </button>
          </div>
        </div>

        {/* Socials */}
        <div className="flex items-center gap-4 mb-5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Follow</span>
          {[
            { Icon: Facebook, href: "https://www.facebook.com/venueconnect.in/" },
            { Icon: Instagram, href: "https://www.instagram.com/venueconnect.in/" },
            { Icon: Twitter, href: "#" },
            { Icon: Linkedin, href: "#" }
          ].map(({ Icon, href }, i) => (
            <a key={i} href={href} target={href !== "#" ? "_blank" : undefined} rel={href !== "#" ? "noopener noreferrer" : undefined} className="text-slate-400 hover:text-white transition-colors">
              <Icon size={17} />
            </a>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-1.5 mb-4">
          <a href="tel:+919586500686" className="flex items-center gap-2 text-xs font-bold hover:text-primary transition-colors">
            <Phone size={13} className="text-white fill-white" />+91 9586500686
          </a>
          <a href="mailto:info@venueconnect.in" className="flex items-center gap-2 text-xs font-bold hover:text-primary transition-colors">
            <Mail size={13} className="text-white fill-white" />info@venueconnect.in
          </a>
        </div>

        {/* Quick nav button row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "Venues / Vendors", href: venueHref },
            { label: "List Business",    href: "/list-business" },
            { label: "Refer & Earn",     href: "/refer-earn" },
            { label: "Home",             href: "/" },
            { label: "About",            href: "/about" },
            { label: "Contact",          href: "/contact" },
          ].map((btn) => (
            <Link key={btn.label} href={btn.href}
              className="px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-white/80 hover:bg-primary hover:border-primary hover:text-white transition-all">
              {btn.label}
            </Link>
          ))}
        </div>

        {/* Accordion sections */}
        <div className="mb-3">
          <Accordion title="Event Planning Services">
            <div className="flex flex-col gap-1.5 pt-1">
              {[
                { l: "All Event Vendors",  h: "/vendors/" },
                { l: "Caterers",  h: "/ahmedabad/vendors/caterers/" },
                { l: "Wedding Planning",   h: "/wedding-planning" },
                { l: "Event Planning",     h: "/event-planning" },
                { l: "Birthday Planning",  h: "/birthday-planning" },
                { l: "Party Supplies",     h: "/party-supplies" },
              ].map(({ l, h }) => (
                <Link key={h} href={h} className="text-[11px] text-slate-400 hover:text-white transition-colors font-medium">{l}</Link>
              ))}
            </div>
          </Accordion>

          <Accordion title="Discover">
            <div className="flex flex-col gap-1.5 pt-1">
              {[
                { l: "Wedding Venues Ahmedabad",    h: "/ahmedabad/wedding-venue" },
                { l: "Banquet Halls Surat",         h: "/surat/banquet-hall" },
                { l: "Farmhouses Vadodara",         h: "/vadodara/farmhouse" },
                { l: "Birthday Venues Rajkot",      h: "/rajkot/birthday-party-venue" },
                { l: "Corporate Venues Gandhinagar", h: "/gandhinagar/corporate-event-venue" },
                { l: "Browse All Cities",           h: "/cities" },
              ].map(({ l, h }) => (
                <Link key={h} href={h} className="text-[11px] text-slate-400 hover:text-white transition-colors font-medium">{l}</Link>
              ))}
            </div>
          </Accordion>

          <Accordion title="Company">
            <div className="flex flex-col gap-1.5 pt-1">
              {[
                { l: "About VenueConnect",          h: "/about" },
                { l: "Why List With Us",            h: "/list-business" },
                { l: "Real Events",                 h: "/real-events" },
                { l: "Blog / Articles",             h: "/blog" },
                { l: "Share Feedback",              h: "/feedback" },
                { l: "Book Online",                 h: "/book-online" },
              ].map(({ l, h }) => (
                <Link key={h} href={h} className="text-[11px] text-slate-400 hover:text-white transition-colors font-medium">{l}</Link>
              ))}
            </div>
          </Accordion>

          <Accordion title="Legal">
            <div className="flex flex-col gap-1.5 pt-1">
              {[
                { l: "Privacy Policy",     h: "/privacy" },
                { l: "Terms & Conditions", h: "/terms" },
                { l: "Sitemap",            h: "/sitemap" },
              ].map(({ l, h }) => (
                <Link key={h} href={h} className="text-[11px] text-slate-400 hover:text-white transition-colors font-medium">{l}</Link>
              ))}
            </div>
          </Accordion>
        </div>

        {/* Mobile thin copyright bar - touching bottom */}
        <div className="mt-8 py-4 border-t border-white/5 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">© 2026 VenueConnect. All rights reserved.</p>
        </div>
      </div>

      {/* ════════════════ DESKTOP FOOTER (unchanged) ════════════════ */}
      <div className="hidden md:block container mx-auto px-6 lg:px-12 pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-black mb-4 tracking-tight">Event Planning Services</h4>
              <div className="flex flex-wrap text-[13px] gap-x-1.5 gap-y-0.5 text-slate-300 font-medium leading-relaxed">
                <Link href="/vendors/" className="hover:text-white transition-colors">All Event Vendors</Link><span>|</span>
                <Link href="/ahmedabad/vendors/caterers/" className="hover:text-white transition-colors">Caterers</Link><span>|</span>
                <Link href="/wedding-planning" className="hover:text-white transition-colors">Wedding Planning</Link><span>|</span>
                <Link href="/event-planning" className="hover:text-white transition-colors">Event Planning</Link><span>|</span>
                <Link href="/birthday-planning" className="hover:text-white transition-colors">Birthday Planning</Link><span>|</span>
                <Link href="/party-supplies" className="hover:text-white transition-colors">Party Supplies</Link>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-black mb-4 tracking-tight">More</h4>
              <div className="flex flex-wrap text-[13px] gap-x-1.5 gap-y-0.5 text-slate-400 font-medium leading-relaxed">
                <Link href="/real-events" className="hover:text-white transition-colors">Real Events</Link><span>|</span>
                <Link href="/photos" className="hover:text-white transition-colors">Photos</Link><span>|</span>
                <Link href="/blog" className="hover:text-white transition-colors">Articles</Link><span>|</span>
                <Link href="/about" className="hover:text-white transition-colors">Company Overview</Link><span>|</span>
                <Link href="/book-online" className="hover:text-white transition-colors">Book Online</Link><span>|</span>
                <Link href="/list-business" className="hover:text-white transition-colors">Why List With VenueConnect</Link><span>|</span>
                <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link><span>|</span>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link><span>|</span>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link><span>|</span>
                <Link href="/feedback" className="hover:text-white transition-colors">Share Your Feedback</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-black mb-4 tracking-tight">Contact Info</h4>
              <div className="flex flex-col gap-3">
                <a href="tel:+919586500686" className="flex items-center gap-2 text-base font-bold hover:text-primary transition-colors">
                  <Phone size={18} className="text-white fill-white" />+91 9586500686
                </a>
                <a href="mailto:info@venueconnect.in" className="flex items-center gap-2 text-base font-bold hover:text-primary transition-colors">
                  <Mail size={18} className="text-white fill-white" />info@venueconnect.in
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Link href="/"><Image src="/logo.webp" alt="VenueConnect" width={280} height={72} className="object-contain" style={{ height: '72px', width: 'auto' }} /></Link>
              <p className="text-slate-300 text-[13px] leading-relaxed max-w-xl font-medium">
                VenueConnect is Gujarat&apos;s most loved Event Planning platform!
                <Link href="/about" className="text-primary font-bold ml-1 hover:underline">More about VenueConnect</Link>
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">Subscribe For Event Ideas and Offers</p>
              <div className="flex max-w-sm">
                <input type="email" placeholder="Your E-mail" className="flex-1 bg-white px-4 py-2.5 text-slate-900 focus:outline-none font-bold text-sm" suppressHydrationWarning />
                <button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-6 py-2.5 transition-colors text-sm" suppressHydrationWarning>Subscribe</button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Stay Connected</span>
              <div className="flex items-center gap-4">
                {[
                  { Icon: Facebook, href: "https://www.facebook.com/venueconnect.in/" },
                  { Icon: Instagram, href: "https://www.instagram.com/venueconnect.in/" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Linkedin, href: "#" }
                ].map(({ Icon, href }, i) => (
                  <a key={i} href={href} target={href !== "#" ? "_blank" : undefined} rel={href !== "#" ? "noopener noreferrer" : undefined} className="text-slate-400 hover:text-white transition-colors">
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-x-10 gap-y-4 text-[13px] font-black uppercase tracking-widest">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About us</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          <Link href={venueHref} className="hover:text-primary transition-colors">Find A Venue | Vendor</Link>
          <Link href="/list-business" className="hover:text-primary transition-colors">List A Venue | Vendor</Link>
          <Link href="/refer-earn" className="hover:text-primary transition-colors">Refer &amp; Earn</Link>
        </div>
      </div>

      {/* Desktop copyright bar */}
      <div className="hidden md:block bg-[#222222] py-4">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">© 2026 VenueConnect. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>,</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>,</span>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center justify-center gap-1">
          <div className="text-slate-400 hover:text-primary transition-colors">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Home</span>
        </Link>
        <Link href={venueHref} className="flex flex-col items-center justify-center gap-1">
          <div className="text-slate-400 hover:text-primary transition-colors">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Venues</span>
        </Link>
        <Link href="/vendors" className="flex flex-col items-center justify-center gap-1">
          <div className="text-slate-400 hover:text-primary transition-colors">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Vendors</span>
        </Link>
        <a href="https://wa.me/919586500686" target="_blank" className="flex flex-col items-center justify-center gap-1">
          <div className="text-[#25D366]">
            <MessageCircle size={22} className="fill-[#25D366] text-white" />
          </div>
          <span className="text-[10px] font-black uppercase text-[#25D366] tracking-tighter">WhatsApp</span>
        </a>
      </div>

      {/* Floating Buttons — Hidden on mobile as we have sticky nav */}
      <button onClick={scrollToTop} className="hidden md:flex fixed bottom-24 right-6 w-10 h-10 bg-[#FF5722] hover:bg-[#e64a19] text-white items-center justify-center rounded shadow-lg transition-all z-50" suppressHydrationWarning>
        <ArrowUp size={24} />
      </button>
      <a href="https://wa.me/919586500686" target="_blank"
        className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl items-center justify-center hover:scale-110 transition-transform z-50">
        <MessageCircle size={32} className="fill-white text-[#25D366]" />
      </a>
    </footer>
  );
};

export default Footer;
