'use client';

import { useState, useEffect } from "react";
import { Phone, Calendar, Users, Mail, User, CheckCircle2, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { OCCASIONS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";

interface VendorEnquiryFormProps {
    vendor: any;
}

export default function VendorEnquiryForm({ vendor }: VendorEnquiryFormProps) {
    const [loading, setLoading] = useState(false);
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
        name: "",
        mobile: "",
        email: "",
        needVenue: false,
        sendWhatsApp: true,
        shareSimilar: true
    });

    const supabase = createClient();

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.occasion || !formData.date || !formData.name || !formData.mobile) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            const messageParts = [
                `Occasion: ${formData.occasion}`,
                `Need Venue: ${formData.needVenue ? 'Yes' : 'No'}`,
                `WhatsApp Updates: ${formData.sendWhatsApp ? 'Enabled' : 'Disabled'}`,
                `Similar Vendors: ${formData.shareSimilar ? 'Yes' : 'No'}`
            ];

            const { error } = await supabase.from('leads').insert([
                {
                    listing_id: vendor.id,
                    listing_type: 'vendor',
                    owner_id: vendor.owner_id || null,
                    customer_name: formData.name,
                    customer_email: `PENDING_ADMIN_${formData.email || 'no-email@venueconnect.com'}`,
                    customer_phone: formData.mobile,
                    message: messageParts.join(' | '),
                    event_date: formData.date,
                    status: 'new'
                }
            ]);

            if (error) throw error;

            toast.success("Quote Request Sent!", {
                description: "We've sent your request to the admin for verification.",
            });

            // Reset form
            setFormData({
                occasion: "",
                date: "",
                name: "",
                mobile: "",
                email: "",
                needVenue: false,
                sendWhatsApp: true,
                shareSimilar: true
            });
        } catch (error: any) {
            console.error("Submission error details:", error);
            toast.error("Failed to send enquiry. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight">
                Get <span className="text-primary italic">Best Quote</span>
            </h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-6">Direct from {vendor.name}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Full Name*</label>
                    <div className="relative">
                        <Input 
                            placeholder="e.g. Rahul Sharma" 
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="h-12 rounded-xl border-slate-200 pl-10" 
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                </div>

                {/* Contact Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number*</label>
                        <div className="relative">
                            <Input 
                                placeholder="98765 43210" 
                                value={formData.mobile}
                                onChange={(e) => handleInputChange('mobile', e.target.value)}
                                className="h-12 rounded-xl border-slate-200 pl-12" 
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">+91</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email ID</label>
                        <div className="relative">
                            <Input 
                                type="email"
                                placeholder="rahul@example.com" 
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="h-12 rounded-xl border-slate-200 pl-10" 
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>
                </div>

                {/* Event Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Occasion*</label>
                        <Select onValueChange={(v) => handleInputChange('occasion', v)} value={formData.occasion}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                <SelectValue placeholder="Occasion" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {Object.entries(OCCASIONS).map(([category, items]) => (
                                    <SelectGroup key={category}>
                                        <SelectLabel className="text-primary font-black text-[10px] uppercase tracking-widest px-2 py-1.5">{category}</SelectLabel>
                                        {items.map(occ => (
                                            <SelectItem key={occ} value={occ} className="text-sm font-medium">{occ}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 py-2">
                    <div className="flex items-start gap-3">
                        <Checkbox 
                            id="needVenue" 
                            checked={formData.needVenue} 
                            onCheckedChange={(checked) => handleInputChange('needVenue', checked)}
                            className="mt-1 rounded-md border-slate-300 data-[state=checked]:bg-primary"
                        />
                        <label htmlFor="needVenue" className="text-xs font-bold text-slate-600 leading-tight cursor-pointer">
                            Need a venue too?
                        </label>
                    </div>
                    <div className="flex items-start gap-3">
                        <Checkbox 
                            id="sendWhatsApp" 
                            checked={formData.sendWhatsApp} 
                            onCheckedChange={(checked) => handleInputChange('sendWhatsApp', checked)}
                            className="mt-1 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                        <label htmlFor="sendWhatsApp" className="text-xs font-bold text-slate-600 leading-tight cursor-pointer">
                            Send me vendor details on WhatsApp.
                        </label>
                    </div>
                    <div className="flex items-start gap-3">
                        <Checkbox 
                            id="shareSimilar" 
                            checked={formData.shareSimilar} 
                            onCheckedChange={(checked) => handleInputChange('shareSimilar', checked)}
                            className="mt-1 rounded-md border-slate-300 data-[state=checked]:bg-primary"
                        />
                        <label htmlFor="shareSimilar" className="text-xs font-bold text-slate-600 leading-tight cursor-pointer">
                            Share proposals from similar vendors for my event.
                        </label>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/25 transition-all active:scale-95"
                >
                    {loading ? "Processing..." : "Get a Quote"}
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group/call cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover/call:rotate-12 transition-transform">
                            <Phone size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Direct Help</p>
                            <h4 className="text-sm font-black text-slate-900">Arrange a call</h4>
                        </div>
                    </div>
                    <a href={`tel:${vendor.phone_number || '+919586500686'}`} className="text-xs font-black text-primary uppercase tracking-widest">Call Now</a>
                </div>
            </div>
        </div>
    );
}
