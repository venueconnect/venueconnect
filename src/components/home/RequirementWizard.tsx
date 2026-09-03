"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronRight, ChevronLeft, MapPin, Calendar, Users, 
    IndianRupee, Utensils, Building2, CheckCircle2, 
    Sparkles, Phone, Mail, User, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { GUJARAT_CITIES, OCCASIONS } from "@/lib/constants";

const ALL_OCCASIONS = Object.values(OCCASIONS).flat();
const BUDGETS = ['Below ₹5,000', '₹5,000 - ₹10,000', '₹10,000 - ₹20,000', '₹20,000 - ₹50,000', '₹50,000 - ₹1,00,000', 'Above ₹1,00,000'];

const supabase = createClient();

export default function RequirementWizard() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        occasion: '',
        city: '',
        budget_per_person: '',
        expected_guests: '',
        event_date: '',
        is_date_flexible: false,
        vendor_requirement: false,
        customer_name: '',
        customer_email: '',
        customer_phone: ''
    });

    useEffect(() => {
        const cached = localStorage.getItem('vc_user_city');
        if (cached) {
            setFormData(prev => ({ ...prev, city: cached.charAt(0).toUpperCase() + cached.slice(1) }));
        }
    }, []);

    const updateData = (fields: Partial<typeof formData>) => {
        if (fields.city) {
            localStorage.setItem('vc_user_city', fields.city.toLowerCase());
        }
        setFormData(prev => ({ ...prev, ...fields }));
    };

    const isStep1Valid = () => {
        return (
            formData.occasion && formData.city && 
            formData.budget_per_person && 
            formData.expected_guests && formData.event_date
        );
    };

    const isStep2Valid = () => {
        return (
            formData.customer_name && formData.customer_email && formData.customer_phone
        );
    };

    const handleNext = () => {
        if (isStep1Valid()) {
            setStep(2);
        } else {
            toast.error("Please fill all required fields");
        }
    };

    const handleFinalSubmit = async () => {
        if (!isStep2Valid()) {
            toast.error("Please fill all contact details");
            return;
        }

        setLoading(true);
        try {
            // 1. Send to Google Sheets FIRST (always saves the lead, even if DB fails)
            const sheetData = {
                ...formData,
                expected_guests: parseInt(formData.expected_guests) || 0
            };

            const GOOGLE_SHEETS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
            if (GOOGLE_SHEETS_URL) {
                try {
                    await fetch(GOOGLE_SHEETS_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify(sheetData)
                    });
                } catch (sheetError) {
                    console.error("Sheet Sync Error:", sheetError);
                }
            }

            // 2. Save to Supabase (user_requirements + leads)
            const supabaseData = {
                occasion: formData.occasion,
                city: formData.city,
                budget_per_person: formData.budget_per_person,
                expected_guests: parseInt(formData.expected_guests) || 0,
                event_date: formData.event_date,
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone
            };

            try {
                await supabase.from('user_requirements').insert([supabaseData]);
            } catch (dbError) {
                console.error("Supabase user_requirements error (non-blocking):", dbError);
            }

            try {
                await supabase.from('leads').insert([{
                    listing_id: null,
                    listing_type: 'platform',
                    customer_name: formData.customer_name,
                    customer_email: `PENDING_ADMIN_${formData.customer_email || 'no-email@venueconnect.in'}`,
                    customer_phone: formData.customer_phone,
                    event_date: formData.event_date || null,
                    message: `Occasion: ${formData.occasion} | City: ${formData.city} | Guests: ${formData.expected_guests} | Budget: ${formData.budget_per_person}`,
                    status: 'new'
                }]);
            } catch (leadsErr) {
                console.error("Supabase leads insert error (non-blocking):", leadsErr);
            }

            toast.success("Request Submitted Successfully!");
            setSubmitted(true);
        } catch (error: any) {
            toast.error("Error submitting request: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-12 text-center text-white shadow-2xl h-[520px] flex flex-col justify-center"
            >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black mb-4 uppercase tracking-wider">Submitted!</h2>
                <p className="text-white/60 text-base mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                    Thank you! Our event concierge will contact you shortly with the best options for your {formData.occasion}.
                </p>
                <Button onClick={() => window.location.reload()} className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs">
                    New Request
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl md:h-[580px] flex flex-col relative overflow-hidden"
            >
                <div className="flex items-center justify-between mb-3 md:mb-6 shrink-0">
                    <div>
                        <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">Tell us your requirement</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-x-3 md:gap-x-4 gap-y-3 md:gap-y-4">
                        {step === 1 ? (
                            <>
                                <div className="col-span-2">
                                    <SelectField label="Occasion" icon={<Sparkles />} value={formData.occasion} options={ALL_OCCASIONS} onChange={(v: string) => updateData({ occasion: v })} />
                                </div>
                                
                                <SelectField label="City" icon={<MapPin />} value={formData.city} options={GUJARAT_CITIES} onChange={(v: string) => updateData({ city: v })} />
                                <InputField label="Guests" icon={<Users />} type="number" value={formData.expected_guests} onChange={(v: string) => updateData({ expected_guests: v })} placeholder="e.g. 200" />
                                
                                <div className="col-span-2">
                                    <SelectField label="Venue Budget" icon={<IndianRupee />} value={formData.budget_per_person} options={BUDGETS} onChange={(v: string) => updateData({ budget_per_person: v })} />
                                </div>
                                
                                <div className="col-span-2">
                                    <InputField label="Event Date" icon={<Calendar />} type="date" value={formData.event_date} onChange={(v: string) => updateData({ event_date: v })} />
                                </div>

                                <div className="col-span-2 space-y-1.5 md:space-y-3 mt-1 md:mt-2">
                                    <div className="flex items-center space-x-2.5 bg-white/5 p-2 md:p-3 rounded-lg md:rounded-xl border border-white/10">
                                        <Checkbox 
                                            id="date_flexible" 
                                            checked={formData.is_date_flexible} 
                                            onCheckedChange={(checked) => updateData({ is_date_flexible: checked as boolean })}
                                            className="w-3.5 h-3.5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="date_flexible" className="text-[9px] md:text-[11px] font-bold text-white/70 cursor-pointer">
                                            Is date flexible?
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2.5 bg-white/5 p-2 md:p-3 rounded-lg md:rounded-xl border border-white/10">
                                        <Checkbox 
                                            id="vendor_req" 
                                            checked={formData.vendor_requirement} 
                                            onCheckedChange={(checked) => updateData({ vendor_requirement: checked as boolean })}
                                            className="w-3.5 h-3.5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label htmlFor="vendor_req" className="text-[9px] md:text-[11px] font-bold text-white/70 cursor-pointer">
                                            Do you require any vendor?
                                        </Label>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="col-span-2">
                                    <InputField label="Full Name" icon={<User />} value={formData.customer_name} onChange={(v: string) => updateData({ customer_name: v })} placeholder="Rahul Sharma" />
                                </div>
                                <div className="col-span-2">
                                    <InputField label="Mobile" icon={<Phone />} value={formData.customer_phone} onChange={(v: string) => updateData({ customer_phone: v })} placeholder="98765 43210" />
                                </div>
                                <div className="col-span-2">
                                    <InputField label="Email" icon={<Mail />} value={formData.customer_email} onChange={(v: string) => updateData({ customer_email: v })} placeholder="rahul@example.com" />
                                </div>

                                <div className="col-span-2">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setStep(1)}
                                        className="text-white/40 hover:text-white hover:bg-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider h-auto py-2"
                                    >
                                        <ChevronLeft className="w-3 h-3 mr-1" /> Back to details
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-3 md:mt-6 pt-3 md:pt-4 border-t border-white/5 shrink-0">
                    {step === 1 ? (
                        <Button 
                            onClick={handleNext}
                            className="w-full bg-primary hover:bg-primary/90 text-white h-11 md:h-14 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-primary/20"
                        >
                            Next <ChevronRight className="w-3.5 h-3.5 ml-1.5 md:ml-2" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleFinalSubmit}
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white h-11 md:h-14 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-primary/20"
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </Button>
                    )}
                </div>
            </motion.div>


            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(239,62,54,0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(239,62,54,0.4); }
            `}</style>
        </div>
    );
}

function SelectField({ label, icon, value, options, onChange, disabled = false }: any) {
    return (
        <div className={`space-y-1 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 pl-1">
                {icon && <span className="text-primary/60 scale-75">{icon}</span>} {label}
            </label>
            <div className="relative group">
                <select 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-9 md:h-11 bg-white/5 border border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 text-white font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white/10 transition-all appearance-none cursor-pointer text-[10px] md:text-xs"
                    suppressHydrationWarning
                >
                    <option value="" className="text-slate-900">Select {label}</option>
                    {options.map((opt: string) => (
                        <option key={opt} value={opt} className="text-slate-900">{opt}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-hover:text-white transition-colors pointer-events-none" />
            </div>
        </div>
    );
}

function InputField({ label, icon, value, onChange, type = "text", placeholder }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2 pl-1">
                {icon && <span className="text-primary/60 scale-75">{icon}</span>} {label}
            </label>
            <div className="relative group">
                <input 
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-9 md:h-11 bg-white/5 border border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 text-white font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white/10 transition-all text-[10px] md:text-xs [color-scheme:dark]"
                    suppressHydrationWarning
                />
            </div>
        </div>
    );
}
