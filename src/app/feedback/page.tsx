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
import { Phone, Mail, Star, Loader2, Sparkles } from "lucide-react";

export default function FeedbackPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
            if (!url) {
                throw new Error("Submission service is not configured.");
            }

            await fetch(url, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "Customer Feedback",
                    name: name.trim(),
                    email,
                    rating,
                    message,
                    timestamp: new Date().toISOString()
                })
            });

            toast.success("Thank you! Your feedback has been submitted.");
            setName("");
            setEmail("");
            setRating(5);
            setMessage("");
        } catch (err: any) {
            toast.error("Failed to submit feedback: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PageHeader
                title="Share Feedback"
                subtitle="Help us improve. Share your thoughts, experiences, or report issues."
            />

            <main className="flex-grow container py-16 max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Direct Contact & Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Sparkles className="text-primary w-6 h-6" /> We Value Your Input
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                At VenueConnect, we are constantly working to build the best venue discovery and event planning experience in Gujarat. Your suggestions, ratings, and reviews help us grow and serve you better.
                            </p>
                        </div>

                        <div className="space-y-6 pt-4">
                            <h3 className="text-lg font-bold text-slate-800">Need Immediate Help?</h3>
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-base font-semibold text-slate-900">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    Call Direct Assistance
                                </div>
                                <a href="tel:+919586500686" className="text-muted-foreground pl-13 hover:text-primary transition-colors font-medium">
                                    +91 9586500686
                                </a>
                                <p className="text-muted-foreground text-xs pl-13">Available Mon - Sat, 9am - 7pm</p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-base font-semibold text-slate-900">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    Email Support
                                </div>
                                <a href="mailto:info@venueconnect.in" className="text-muted-foreground pl-13 hover:text-primary transition-colors font-medium">
                                    info@venueconnect.in
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Send Your Review</h3>
                        
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-semibold">Full Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="Your Name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                    className="rounded-xl border-slate-200 h-11 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-semibold">Email Address</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="yourname@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                    className="rounded-xl border-slate-200 h-11 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold">Rating</Label>
                                <div className="flex items-center gap-1.5 my-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                            aria-label={`Rate ${star} Stars`}
                                        >
                                            <Star 
                                                className={`w-8 h-8 ${
                                                    star <= (hoverRating || rating) 
                                                        ? 'fill-amber-400 text-amber-400' 
                                                        : 'text-slate-200'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className="font-semibold">Your Feedback</Label>
                                <Textarea 
                                    id="message" 
                                    placeholder="Tell us what you liked, or where we can improve..." 
                                    rows={5} 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required 
                                    className="resize-none rounded-xl border-slate-200 focus:ring-primary/20"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold flex items-center justify-center gap-2 h-12 rounded-xl border-none shadow-md shadow-primary/20" 
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    "Submit Feedback"
                                )}
                            </Button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
