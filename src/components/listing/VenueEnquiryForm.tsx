'use client';

import { useState, useEffect } from "react";
import { Phone, MessageCircle, Calendar, Users, IndianRupee, Mail, CheckCircle2, MapPin, Building2, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { OCCASIONS } from "@/lib/constants";

interface VenueEnquiryFormProps {
    venue: any;
}

export default function VenueEnquiryForm({ venue }: VenueEnquiryFormProps) {
    const [loading, setLoading] = useState(false);
    const [visitDate, setVisitDate] = useState("");
    const [minDate, setMinDate] = useState("");
    
    useEffect(() => {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        setMinDate(today.toISOString().split('T')[0]);
    }, []);
    // Form States
    const [formData, setFormData] = useState({
        occasion: "",
        date: "",
        guests: "",
        budget: "",
        foodType: "Both",
        name: "",
        mobile: "",
        email: ""
    });

    const supabase = createClient();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.occasion || !formData.date || !formData.name || !formData.mobile) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.from('leads').insert([
                {
                    listing_id: venue.id,
                    listing_type: 'venue',
                    owner_id: venue.owner_id || null,
                    customer_name: formData.name,
                    customer_email: `PENDING_ADMIN_${formData.email || 'no-email@venueconnect.com'}`,
                    customer_phone: formData.mobile,
                    message: `Occasion: ${formData.occasion}, Guests: ${formData.guests}, Budget: ${formData.budget}, Food: ${formData.foodType}`,
                    event_date: formData.date,
                    status: 'new' 
                }
            ]);

            if (error) throw error;

            toast.success("Enquiry Sent!", {
                description: "Our expert will call you shortly to confirm details.",
            });

            // Reset form
            setFormData({
                occasion: "",
                date: "",
                guests: "",
                budget: "",
                foodType: "Both",
                name: "",
                mobile: "",
                email: ""
            });
        } catch (error: any) {
            console.error("Submission error details:", error);
            toast.error("Failed to send enquiry. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const allOccasions = Object.values(OCCASIONS).flat();

    return (
        <div className="space-y-6">
            {/* MAIN ENQUIRY FORM */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6 leading-tight">
                    Check Availability & <span className="text-primary italic">Best Prices</span>
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 1. Occasion */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Occasion*</label>
                        <Select onValueChange={(v) => handleInputChange('occasion', v)} value={formData.occasion}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-primary/20">
                                <SelectValue placeholder="What are you celebrating?" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                <SelectGroup>
                                    {Object.entries(OCCASIONS).map(([category, items]) => (
                                        <SelectGroup key={category}>
                                            <SelectLabel className="text-primary font-black text-[10px] uppercase tracking-widest px-2 py-1.5">{category}</SelectLabel>
                                            {items.map(occ => (
                                                <SelectItem key={occ} value={occ} className="text-sm font-medium">{occ}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* 2. Event Date */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Date*</label>
                            <div className="relative">
                                <Input 
                                    type="date" 
                                    min={minDate}
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="h-12 rounded-xl border-slate-200 pl-10"
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            </div>
                        </div>

                        {/* 3. Number of Guests */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">No. of Guests</label>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    placeholder="e.g. 200"
                                    value={formData.guests}
                                    onChange={(e) => handleInputChange('guests', e.target.value)}
                                    className="h-12 rounded-xl border-slate-200 pl-10"
                                />
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* 4. Budget Range */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Budget Range</label>
                            <Select onValueChange={(v) => handleInputChange('budget', v)} value={formData.budget}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select Budget" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Below 50k">Below ₹50,000</SelectItem>
                                    <SelectItem value="50k - 1 Lakh">₹50k - ₹1 Lakh</SelectItem>
                                    <SelectItem value="1 Lakh - 2 Lakh">₹1 Lakh - ₹2 Lakh</SelectItem>
                                    <SelectItem value="2 Lakh - 5 Lakh">₹2 Lakh - ₹5 Lakh</SelectItem>
                                    <SelectItem value="Above 5 Lakh">Above ₹5 Lakh</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 5. Food Type */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Food Preference</label>
                            <Select onValueChange={(v) => handleInputChange('foodType', v)} value={formData.foodType}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Food Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Veg Only">Veg Only</SelectItem>
                                    <SelectItem value="Non-Veg Only">Non-Veg Only</SelectItem>
                                    <SelectItem value="Both">Both (Veg & Non-Veg)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 6, 7, 8. Contact Details */}
                    <div className="space-y-3 pt-2">
                        <Input 
                            placeholder="Your Full Name*" 
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="h-12 rounded-xl border-slate-200" 
                        />
                        <div className="relative">
                            <Input 
                                placeholder="Mobile Number*" 
                                value={formData.mobile}
                                onChange={(e) => handleInputChange('mobile', e.target.value)}
                                className="h-12 rounded-xl border-slate-200 pl-10" 
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">+91</span>
                        </div>
                        <Input 
                            placeholder="Email ID (Optional)" 
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="h-12 rounded-xl border-slate-200" 
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/25 transition-all active:scale-95"
                    >
                        {loading ? "Sending..." : "Submit Enquiry"}
                    </Button>
                </form>

                {/* Call Expert Section */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <a href="tel:+919586500686" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group/call cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg group-hover/call:rotate-12 transition-transform">
                            <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Expert Consultation</p>
                            <p className="text-base font-black text-slate-900">+91 9586500686</p>
                        </div>
                    </a>
                </div>

                {/* Venue Direct Call Section */}
                <div className="mt-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                <MessageCircle size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 leading-none mb-1">Direct Venue</p>
                                <h4 className="text-sm font-bold text-slate-900">Arrange a call</h4>
                            </div>
                        </div>
                        <a 
                            href={`tel:${venue.profiles?.phone_number || '+919586500686'}`}
                            className="px-4 py-2 bg-white text-emerald-600 text-[11px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:bg-emerald-50 transition-colors border border-emerald-100"
                        >
                            Call Now
                        </a>
                    </div>
                </div>

                {/* Schedule a Visit Section */}
                <div className="mt-4 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Calendar size={14} className="text-primary" /> Schedule a Visit
                    </h4>
                    <div className="flex gap-2">
                        <Input 
                            type="date" 
                            min={minDate}
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="h-10 rounded-lg border-slate-200 text-xs" 
                        />
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                if(!visitDate) { toast.error("Please select a date"); return; }
                                toast.success("Visit Request Sent!", { description: `We have notified the venue about your visit on ${visitDate}.` });
                            }}
                            className="h-10 px-4 rounded-lg border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <ShieldCheck className="text-primary" size={16} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Secure Data</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <Clock className="text-primary" size={16} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Fast Response</span>
                </div>
            </div>
        </div>
    );
}
