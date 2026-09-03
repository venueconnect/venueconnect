"use client";

import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Send to Google Sheets
            const url = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
            if (url) {
                try {
                    await fetch(url, {
                        method: "POST",
                        mode: "no-cors",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            type: "General Contact Inquiry",
                            name: `${firstName} ${lastName}`.trim(),
                            email,
                            subject,
                            message,
                            timestamp: new Date().toISOString()
                        })
                    });
                } catch (sheetErr) {
                    console.error("Sheet error:", sheetErr);
                }
            }

            // 2. Save to Supabase leads table so it appears in Admin Panel Leads
            try {
                await supabase.from('leads').insert([{
                    listing_id: null,
                    listing_type: 'contact',
                    customer_name: `${firstName} ${lastName}`.trim(),
                    customer_email: email,
                    customer_phone: 'N/A',
                    message: `[Contact Form] Subject: ${subject} | Message: ${message}`,
                    status: 'new'
                }]);
            } catch (dbErr) {
                console.error("Supabase contact lead error:", dbErr);
            }

            toast.success("Thank you! Your message has been sent successfully.");
            setFirstName("");
            setLastName("");
            setEmail("");
            setSubject("");
            setMessage("");
        } catch (err: any) {
            toast.error("Failed to send message: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PageHeader
                title="Contact Us"
                subtitle="We're here to help you plan your perfect event."
            />

            <main className="flex-grow container py-16 max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Contact Details */}
                    <div>
                        <h2 className="text-3xl font-display font-semibold mb-6">Get in Touch</h2>
                        <p className="text-muted-foreground mb-10">
                            Have a question about a venue, need help with your booking, or want to list your space on our platform? Our team is ready to assist you.
                        </p>

                        <div className="space-y-8">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-lg font-medium">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    Call Us
                                </div>
                                <a href="tel:+919586500686" className="text-muted-foreground pl-13 hover:text-primary transition-colors">+91 9586500686</a>
                                <p className="text-muted-foreground text-sm pl-13">Mon - Sat, 9am - 7pm</p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-lg font-medium">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    Email Us
                                </div>
                                <a href="mailto:info@venueconnect.in" className="text-muted-foreground pl-13 hover:text-primary transition-colors">info@venueconnect.in</a>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-lg font-medium">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    Headquarters
                                </div>
                                <p className="text-muted-foreground pl-13">
                                    101, Titanium City Center,<br />
                                    100 Feet Anand Nagar Rd, Prahlad Nagar,<br />
                                    Ahmedabad, Gujarat 380015
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                        <h3 className="text-2xl font-display font-semibold mb-6">Send a Message</h3>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input 
                                        id="firstName" 
                                        placeholder="John" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input 
                                        id="lastName" 
                                        placeholder="Doe" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input 
                                    id="subject" 
                                    placeholder="How can we help?" 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea 
                                    id="message" 
                                    placeholder="Include as much detail as possible..." 
                                    rows={5} 
                                    className="resize-none" 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold flex items-center justify-center gap-2" 
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Sending Message...
                                    </>
                                ) : (
                                    "Send Message"
                                )}
                            </Button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
