"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import PricingPackages from "@/components/PricingPackages";
import DistrictCitySelect from "@/components/DistrictCitySelect";
import { citiesData } from "@/lib/citiesData";
import { Check, Loader2, ArrowLeft, Store, MapPin, IndianRupee, Info, ShieldCheck, Tag, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MultiImageUpload from "@/components/MultiImageUpload";

export default function ListVendorPage() {
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser() as any;
            if (!user) {
                toast.error("Please login first to register as a vendor");
                router.push('/login?next=/list-vendor');
            } else {
                setAuthLoading(false);
            }
        };
        checkUser();
    }, [router, supabase.auth]);

    const [formData, setFormData] = useState({
        // Step 1: Basic info
        contactName: "",
        mobile: "",
        
        // Step 3: Detailed info
        businessName: "",
        city: "",
        address: "",
        vendorCategory: "Photographers",
        startingPrice: "",
        description: "",
        images: [] as string[]
    });

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3);
    };

    const handleFinalSubmit = async (pkg: string) => {
        setIsSubmitting(true);
        const finalData = { ...formData, selectedPackage: pkg };

        try {
            // 1. Webhook
            const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
            if (webhookUrl) {
                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'Comprehensive Vendor Application',
                            ...finalData
                        })
                    });
                } catch (webhookErr) {
                    console.error("Webhook failed:", webhookErr);
                }
            }

            // 2. Supabase
            const { data: { user } } = await (supabase.auth.getUser() as any);

            if (!user) {
                toast.error("Please login first to register as a vendor");
                router.push('/login');
                return;
            }

            const { error: supabaseErr } = await supabase.from('venue_applications').insert([{
                user_id: user.id,
                business_email: user.email,
                business_name: formData.businessName,
                contact_person: formData.contactName,
                business_phone: formData.mobile,
                address: formData.address,
                city: formData.city,
                venue_type: 'vendor',
                vendor_category: formData.vendorCategory,
                veg_price_per_plate: parseInt(formData.startingPrice) || 0, // Reuse field for starting price
                description: formData.description + `\n\nSelected Package: ${pkg}`,
                images: formData.images, // Now correctly passing image URLs
                status: 'pending'
            }]);

            if (supabaseErr) throw supabaseErr;

            setIsSubmitted(true);
            toast.success("Vendor application submitted successfully!");
            
            setTimeout(() => {
                router.push('/');
            }, 5000);

        } catch (err: any) {
            toast.error("Submission failed: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white transition-all placeholder:text-gray-400";
    const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

    const vendorCategories = [
        "Accessories", "Anchor", "Astrologers", "Bridal Outfits", "Caterers",
        "Choreography", "Cooking Classes", "Fireworks", "Decorators",
        "Detective Services", "DJs", "Grooms Outfits", "Gym",
        "Hathi Ghoda and Car", "Honeymoon Planning", "Invitations",
        "Jaan Stay", "Jewellery", "Makeup Artists", "Mehndi Artists",
        "Bands Musicians", "Pandit", "Photographers", "Return Gift",
        "Sounds LED Lights", "Transport Services", "Venues", 
        "Videographers", "Wedding Cakes", "Wedding Artists"
    ];

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-grow py-12 px-4 flex justify-center items-start pt-20">
                {isSubmitted ? (
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-purple-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Received!</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            Thank you for listing your services. Our team will verify your business and get back to you within 24-48 hours.
                        </p>
                        <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-12 rounded-lg">
                            Back to Home
                        </Button>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl">
                        {/* Progress Stepper */}
                        <div className="mb-10 flex justify-center">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                        step === s ? "bg-purple-600 text-white shadow-lg shadow-purple-200 scale-110" : 
                                        step > s ? "bg-green-500 text-white" : "bg-white text-slate-300 border-2 border-slate-200"
                                    }`}>
                                        {step > s ? <Check className="w-5 h-5" /> : s}
                                    </div>
                                    {s < 3 && <div className={`w-12 h-0.5 mx-2 rounded-full transition-all duration-300 ${step > s ? "bg-green-500" : "bg-slate-200"}`}></div>}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            
                            {/* Step 1: Basic Contact */}
                            {step === 1 && (
                                <div className="p-8 md:p-12 animate-in slide-in-from-right duration-300">
                                    <div className="text-center mb-10">
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 uppercase tracking-tight font-display">Vendor Registration</h2>
                                        <div className="w-20 h-1 bg-purple-600 mx-auto rounded-full"></div>
                                        <p className="text-slate-500 mt-4 text-sm font-medium">Connect with clients looking for your expertise.</p>
                                    </div>

                                    <form onSubmit={handleStep1Submit} className="space-y-6 max-w-xl mx-auto">
                                        <div className="space-y-4">
                                            <div>
                                                <label className={labelCls}>Vendor / Owner Name *</label>
                                                <input 
                                                    type="text" 
                                                    name="contactName" 
                                                    value={formData.contactName} 
                                                    onChange={handleChange} 
                                                    placeholder="e.g. Amit Patel" 
                                                    className={inputCls} 
                                                    required 
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className={labelCls}>Mobile Number *</label>
                                                <div className="flex bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-600 overflow-hidden transition-all">
                                                    <div className="flex items-center px-4 bg-slate-50 border-r border-gray-200 text-slate-500 text-sm font-bold">
                                                        +91
                                                    </div>
                                                    <input 
                                                        type="tel" 
                                                        name="mobile" 
                                                        value={formData.mobile} 
                                                        onChange={handleChange} 
                                                        placeholder="Enter 10 digit mobile number" 
                                                        className="w-full px-4 py-3 text-slate-700 focus:outline-none placeholder:text-gray-400 bg-transparent" 
                                                        required 
                                                        pattern="[0-9]{10}"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <Button 
                                                type="submit" 
                                                className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                Continue to Service Details
                                            </Button>
                                            <p className="text-[10px] text-center text-slate-400 mt-4 px-4">
                                                By proceeding, you agree to VenueConnect's Terms & Privacy Policy.
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Step 2: Service Details */}
                            {step === 2 && (
                                <div className="p-8 md:p-12 animate-in slide-in-from-bottom duration-500">
                                    <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-display">Service Information</h2>
                                            <p className="text-slate-500 text-sm mt-1">Tell us more about your business to get better leads.</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100">
                                            <ShieldCheck className="w-4 h-4" /> Trusted Vendor
                                        </div>
                                    </div>

                                    <form onSubmit={handleDetailsSubmit} className="space-y-10">
                                        
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800"><Store className="w-5 h-5 text-purple-600"/> Business Profile</h3>
                                                
                                                <div>
                                                    <label className={labelCls}>Service / Studio Name *</label>
                                                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. Patel Photographics" className={inputCls} required />
                                                </div>

                                                <div>
                                                    <label className={labelCls}>Vendor Category *</label>
                                                    <select name="vendorCategory" value={formData.vendorCategory} onChange={handleChange} className={inputCls} required>
                                                        {vendorCategories.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={labelCls}>District & Base City *</label>
                                                    <DistrictCitySelect 
                                                        onSelect={(val) => setFormData({ ...formData, city: val })}
                                                        initialValue={formData.city}
                                                    />
                                                    <input type="hidden" name="city" value={formData.city} required />
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800"><MapPin className="w-5 h-5 text-purple-600"/> Business Address</h3>
                                                
                                                <div>
                                                    <label className={labelCls}>Full Address *</label>
                                                    <textarea 
                                                        name="address" 
                                                        value={formData.address} 
                                                        onChange={handleChange} 
                                                        placeholder="Studio location, Shop No, Landmark" 
                                                        className={`${inputCls} h-[135px] resize-none`} 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-slate-100" />

                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800"><IndianRupee className="w-5 h-5 text-purple-600"/> Pricing</h3>
                                                <div>
                                                    <label className={labelCls}>Starting Price (₹) *</label>
                                                    <div className="relative">
                                                        <input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleChange} placeholder="e.g. 15000" className={`${inputCls} pl-10`} required />
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 mt-2 italic px-1">
                                                        * This will be displayed as "Starting from ₹..."
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800"><ImageIcon className="w-5 h-5 text-purple-600"/> Portfolio / Work Photos</h3>
                                                <MultiImageUpload 
                                                    onImagesChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))} 
                                                    maxImages={6} 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className={labelCls}>About Your Services / Highlights</label>
                                            <textarea 
                                                name="description" 
                                                value={formData.description} 
                                                onChange={handleChange} 
                                                placeholder="Experience, specialties, unique selling points..." 
                                                className={`${inputCls} h-32`} 
                                            />
                                        </div>

                                        <div className="pt-8 flex flex-col sm:flex-row gap-4">
                                            <button 
                                                type="button" 
                                                onClick={() => setStep(1)}
                                                className="w-full sm:w-1/3 h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                                            >
                                                Edit Contact Info
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="w-full sm:w-2/3 h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-xl shadow-xl shadow-purple-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                Choose Package
                                            </button>
                                        </div>

                                    </form>
                                </div>
                            )}

                            {/* Step 3: Package Selection */}
                            {step === 3 && (
                                <div className="p-4 md:p-8 animate-in zoom-in duration-500">
                                    <div className="mb-6 flex items-center">
                                        <button onClick={() => setStep(2)} className="p-2 hover:bg-slate-100 rounded-full transition-colors mr-2">
                                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                                        </button>
                                        <span className="text-sm font-bold text-slate-500">Back to Service Details</span>
                                    </div>
                                    <div className="text-center mb-10">
                                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Select your plan</h2>
                                        <p className="text-slate-500 mt-2">Get verified leads and manage your venues efficiently.</p>
                                    </div>
                                    <PricingPackages onSelect={handleFinalSubmit} isLoading={isSubmitting} />
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
