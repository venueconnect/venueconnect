import Link from "next/link";
import { Metadata } from "next";
import { GUJARAT_CITIES, VENUE_TYPES, VENDOR_TYPES } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Sitemap | VenueConnect",
    description: "Browse all pages on VenueConnect — venues, vendors, cities, and more across Gujarat.",
    alternates: {
        canonical: "https://venueconnect.in/html-sitemap/",
    },
};

export default function HTMLSitemapPage() {
    const cityLinks = GUJARAT_CITIES.map(city => ({
        label: city,
        href: `/${city.toLowerCase().replace(/\s+/g, '-')}/`
    }));

    const venueTypeLinks = VENUE_TYPES.map(type => ({
        label: type,
        href: `/${type.toLowerCase().replace(/\s+/g, '-')}-near-me/`
    }));

    const vendorTypeLinks = VENDOR_TYPES.map(type => ({
        label: type,
        href: `/${type.toLowerCase().replace(/\s+/g, '-')}-near-me/`
    }));

    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="container px-4 max-w-5xl mx-auto">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Sitemap</h1>
                <p className="text-muted-foreground mb-12 text-lg">
                    Browse all pages on VenueConnect to find exactly what you&apos;re looking for.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* Main Pages */}
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4 border-b-2 border-primary pb-2">
                            Main Pages
                        </h2>
                        <ul className="space-y-2">
                            {[
                                { label: "Home", href: "/" },
                                { label: "About Us", href: "/about/" },
                                { label: "Contact Us", href: "/contact/" },
                                { label: "Blog", href: "/blog/" },
                                { label: "FAQs", href: "/faqs/" },
                                { label: "Get a Quote", href: "/get-quote/" },
                                { label: "Share Feedback", href: "/feedback/" },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* List Your Business */}
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4 border-b-2 border-primary pb-2">
                            List Your Business
                        </h2>
                        <ul className="space-y-2">
                            {[
                                { label: "List a Venue", href: "/list-venue/" },
                                { label: "List a Vendor", href: "/list-vendor/" },
                                { label: "List a Business", href: "/list-business/" },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4 border-b-2 border-primary pb-2">
                            Legal
                        </h2>
                        <ul className="space-y-2">
                            {[
                                { label: "Privacy Policy", href: "/privacy/" },
                                { label: "Terms & Conditions", href: "/terms/" },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cities */}
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4 border-b-2 border-primary pb-2">
                            Cities
                        </h2>
                        <ul className="space-y-2">
                            {cityLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                        Venues in {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Venue Types */}
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4 border-b-2 border-primary pb-2">
                            Venue Types
                        </h2>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/venues/" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                    All Venues
                                </Link>
                            </li>
                            {venueTypeLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Vendor Types */}
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-4 border-b-2 border-primary pb-2">
                            Vendor Types
                        </h2>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/vendors/" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                    All Vendors
                                </Link>
                            </li>
                            {vendorTypeLinks.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
