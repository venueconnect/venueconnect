"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { citiesData } from "@/lib/citiesData";
import DistrictCitySelect from "@/components/DistrictCitySelect";
import PricingPackages from "@/components/PricingPackages";
import { Check, Loader2, ArrowLeft, Building2, MapPin, Users, IndianRupee, Info, Clock, Utensils, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MultiImageUpload from "@/components/MultiImageUpload";

export default function ListVenuePage() {
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser() as any;
            if (!user) {
                toast.error("Please login first to list your business");
                router.push('/login?next=/list-venue');
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
        area: "",
        address: "",
        venueType: "Banquet Hall",
        minCapacity: "",
        maxCapacity: "",
        foodType: "both", // 'veg', 'non-veg', 'both'
        vegPrice: "",
        nonVegPrice: "",
        roomsCount: "",
        spaceInfo: {
            party_halls: 0,
            banquet_halls: 0,
            rooms: 0,
            outdoor_lawn: 0
        },
        occasions: [] as string[],
        decorationInfo: {
            description: "Decoration starts from 5000/- onwards",
            policy: "Decorations should be chosen only from our Panel"
        },
        liquorInfo: {
            served: "No",
            permitted: "No"
        },
        djInfo: {
            available: "No",
            starting_price: 5000
        },
        cateringPolicy: "Inhouse catering only. Outside caterers not allowed",
        bookingPolicy: "25% advance. Balance on day of event before commencement.",
        termsConditions: "No arms & ammunition allowed. Dress code - smart attire. Any Breakage by customer will be charged.",
        cancellationPolicy: "Non-refundable if cancelled within 15 days of event.",
        parkingDetails: {
            count: 0,
            valet: false
        },
        description: "",
        amenities: [] as string[],
        cuisines: [] as string[],
        images: [] as string[]
    });

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const generateAutoSummary = (data: typeof formData) => {
        const pricingText = (data.vegPrice || data.nonVegPrice) ? ` starting at ₹${data.vegPrice || data.nonVegPrice}` : '';
        return `${data.businessName} is a premier ${data.venueType} located in ${data.area}, ${data.city}. With a capacity ranging from ${data.minCapacity} to ${data.maxCapacity} guests, it's perfect for ${data.occasions.slice(0, 3).join(', ')}. We offer ${data.foodType === 'both' ? 'both Veg and Non-Veg' : data.foodType === 'veg' ? 'Veg-only' : 'Non-Veg'} catering${pricingText}. Facilities include ${data.amenities.slice(0, 5).join(', ')}. Our policy follows ${data.cateringPolicy}.`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity) 
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleCuisineToggle = (cuisine: string) => {
        setFormData(prev => ({
            ...prev,
            cuisines: prev.cuisines.includes(cuisine) 
                ? prev.cuisines.filter(c => c !== cuisine)
                : [...prev.cuisines, cuisine]
        }));
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
            // 1. Send data to Webhook (Google Sheets + Email)
            const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
            if (webhookUrl) {
                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'Comprehensive Venue Application',
                            ...finalData
                        })
                    });
                } catch (webhookErr) {
                    console.error("Webhook failed:", webhookErr);
                }
            }

            // 2. Insert to Supabase venue_applications
            const { data: { user } } = await (supabase.auth.getUser() as any);
            
            if (!user) {
                toast.error("Please login first to list your business");
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
                area: formData.area,
                venue_type: formData.venueType,
                min_capacity: parseInt(formData.minCapacity) || 0,
                max_capacity: parseInt(formData.maxCapacity) || 0,
                food_type: formData.foodType,
                veg_price_per_plate: parseInt(formData.vegPrice) || 0,
                nonveg_price_per_plate: parseInt(formData.nonVegPrice) || 0,
                rooms_count: parseInt(formData.roomsCount) || 0,
                space_info: formData.spaceInfo,
                occasions: formData.occasions,
                decoration_info: formData.decorationInfo,
                liquor_info: formData.liquorInfo,
                dj_info: formData.djInfo,
                catering_policy: formData.cateringPolicy,
                booking_policy: formData.bookingPolicy,
                terms_conditions: formData.termsConditions,
                cancellation_policy: formData.cancellationPolicy,
                parking_details: formData.parkingDetails,
                description: formData.description || generateAutoSummary(formData),
                amenities: formData.amenities,
                cuisines: formData.cuisines,
                images: formData.images,
                selected_plan: pkg,
                status: 'pending'
            }]);

            if (supabaseErr) throw supabaseErr;

            setIsSubmitted(true);
            toast.success("Application submitted successfully!");
            
            setTimeout(() => {
                router.push('/');
            }, 5000);

        } catch (err: any) {
            toast.error("Submission failed: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all placeholder:text-gray-400";
    const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-grow py-12 px-4 flex justify-center items-start pt-20">
                {isSubmitted ? (
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Received!</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            Thank you for listing your venue with us. Our team will verify your details and get back to you within 24-48 hours.
                        </p>
                        <Button onClick={() => router.push('/')} className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-lg">
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
                                        step === s ? "bg-red-600 text-white shadow-lg shadow-red-200 scale-110" : 
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
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 uppercase tracking-tight">Add Contact Information</h2>
                                        <div className="w-20 h-1 bg-red-600 mx-auto rounded-full"></div>
                                        <p className="text-slate-500 mt-4 text-sm font-medium">Business notifications and leads will be sent to this contact.</p>
                                    </div>

                                    <form onSubmit={handleStep1Submit} className="space-y-6 max-w-xl mx-auto">
                                        <div className="space-y-4">
                                            <div>
                                                <label className={labelCls}>Contact Person Name *</label>
                                                <input 
                                                    type="text" 
                                                    name="contactName" 
                                                    value={formData.contactName} 
                                                    onChange={handleChange} 
                                                    placeholder="e.g. Rahul Sharma" 
                                                    className={inputCls} 
                                                    required 
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className={labelCls}>Mobile Number *</label>
                                                <div className="flex bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 overflow-hidden transition-all">
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
                                                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                Continue to Business Details
                                            </Button>
                                            <p className="text-[10px] text-center text-slate-400 mt-4 px-4">
                                                By proceeding, you agree to VenueConnect's Terms & Privacy Policy and consent to receive updates.
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Step 2: Detailed Business Info */}
                            {step === 2 && (
                                <div className="p-8 md:p-12 animate-in slide-in-from-bottom duration-500">
                                    <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Business Details</h2>
                                            <p className="text-slate-500 text-sm mt-1">Provide comprehensive information to attract more clients.</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100">
                                            <ShieldCheck className="w-4 h-4" /> Verified Lead
                                        </div>
                                    </div>

                                    <form onSubmit={handleDetailsSubmit} className="space-y-12">
                                        
                                        {/* General Information */}
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Building2 className="w-5 h-5 text-red-600"/> General Information</h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelCls}>Venue / Business Name *</label>
                                                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. Royal Grand Palace" className={inputCls} required />
                                                </div>

                                                <div>
                                                    <label className={labelCls}>Venue Type *</label>
                                                    <select name="venueType" value={formData.venueType} onChange={handleChange} className={inputCls} required>
                                                        <option value="Banquet Hall">Banquet Hall</option>
                                                        <option value="Hotel">Hotel</option>
                                                        <option value="Marriage Garden">Marriage Garden</option>
                                                        <option value="Resort">Resort</option>
                                                        <option value="Farmhouse">Farmhouse</option>
                                                        <option value="Convention Center">Convention Center</option>
                                                        <option value="Rooftop">Rooftop</option>
                                                        <option value="Cafe">Cafe</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelCls}>District & City *</label>
                                                    <DistrictCitySelect 
                                                        onSelect={(val) => setFormData(prev => ({ ...prev, city: val }))}
                                                        initialValue={formData.city}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelCls}>City Area *</label>
                                                    <select 
                                                        name="area" 
                                                        value={formData.area} 
                                                        onChange={handleChange} 
                                                        className={inputCls} 
                                                        required
                                                    >
                                                        <option value="">Select Area...</option>
                                                        {(citiesData.find(c => {
                                                            const cityPart = formData.city?.split(" - ")[1] || formData.city;
                                                            return c.name.toLowerCase() === cityPart?.toLowerCase();
                                                        })?.localities || []).map(loc => (
                                                            <option key={loc} value={loc}>{loc}</option>
                                                        ))}
                                                        {/* Fallback for manual entry if city not found */}
                                                        {formData.area && !(citiesData.find(c => c.name.toLowerCase() === (formData.city?.split(" - ")[1] || formData.city)?.toLowerCase())?.localities?.includes(formData.area)) && (
                                                            <option value={formData.area}>{formData.area}</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelCls}>Full Address *</label>
                                                <textarea 
                                                    name="address" 
                                                    value={formData.address} 
                                                    onChange={handleChange} 
                                                    placeholder="Building No, Street name, Near Landmark, Pincode" 
                                                    className={`${inputCls} h-24 resize-none`} 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        {/* Capacity & Space Management */}
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Users className="w-5 h-5 text-red-600"/> Capacity & Space Availability</h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className={labelCls}>Overall Guest Capacity *</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input type="number" name="minCapacity" value={formData.minCapacity} onChange={handleChange} placeholder="Min" className={inputCls} required />
                                                        <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} placeholder="Max" className={inputCls} required />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className={labelCls}>Space Type Quantities</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black uppercase text-slate-400">Banquet Halls</span>
                                                            <input type="number" value={formData.spaceInfo.banquet_halls} onChange={(e) => setFormData(prev => ({ ...prev, spaceInfo: { ...prev.spaceInfo, banquet_halls: parseInt(e.target.value) || 0 } }))} className={inputCls} />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black uppercase text-slate-400">Party Halls</span>
                                                            <input type="number" value={formData.spaceInfo.party_halls} onChange={(e) => setFormData(prev => ({ ...prev, spaceInfo: { ...prev.spaceInfo, party_halls: parseInt(e.target.value) || 0 } }))} className={inputCls} />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black uppercase text-slate-400">Outdoor Lawn</span>
                                                            <input type="number" value={formData.spaceInfo.outdoor_lawn} onChange={(e) => setFormData(prev => ({ ...prev, spaceInfo: { ...prev.spaceInfo, outdoor_lawn: parseInt(e.target.value) || 0 } }))} className={inputCls} />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black uppercase text-slate-400">Guest Rooms</span>
                                                            <input type="number" value={formData.spaceInfo.rooms} onChange={(e) => setFormData(prev => ({ ...prev, spaceInfo: { ...prev.spaceInfo, rooms: parseInt(e.target.value) || 0 }, roomsCount: e.target.value }))} className={inputCls} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Catering & Food Selection */}
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Utensils className="w-5 h-5 text-red-600"/> Catering & Food Options</h3>
                                            
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className={labelCls}>Food Availability *</label>
                                                    <select name="foodType" value={formData.foodType} onChange={handleChange} className={inputCls} required>
                                                        <option value="both">Veg & Non-Veg Both</option>
                                                        <option value="veg">Veg Only</option>
                                                        <option value="non-veg">Non-Veg Only</option>
                                                    </select>
                                                </div>
                                                {(formData.foodType === 'veg' || formData.foodType === 'both') && (
                                                    <div>
                                                        <label className={labelCls}>Veg Plate Price (Optional)</label>
                                                        <input type="number" name="vegPrice" value={formData.vegPrice} onChange={handleChange} placeholder="₹ Per Plate" className={inputCls} />
                                                    </div>
                                                )}
                                                {(formData.foodType === 'non-veg' || formData.foodType === 'both') && (
                                                    <div>
                                                        <label className={labelCls}>Non-Veg Plate Price (Optional)</label>
                                                        <input type="number" name="nonVegPrice" value={formData.nonVegPrice} onChange={handleChange} placeholder="₹ Per Plate" className={inputCls} />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelCls}>Catering Policy *</label>
                                                <select 
                                                    name="cateringPolicy" 
                                                    value={formData.cateringPolicy} 
                                                    onChange={handleChange} 
                                                    className={inputCls} 
                                                    required
                                                >
                                                    <option value="">Select Policy...</option>
                                                    <option value="In-house catering only">In-house catering only</option>
                                                    <option value="Outside catering allowed">Outside catering allowed</option>
                                                    <option value="Both In-house & Outside allowed">Both In-house & Outside allowed</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Occasions Support */}
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                                            <h3 className="text-xl font-bold text-slate-900">Good for which occasions?</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {["Wedding", "Engagement", "Reception", "Birthday", "Corporate Event", "Anniversary", "Cocktail Party", "Baby Shower"].map(occ => (
                                                    <button 
                                                        key={occ} type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, occasions: prev.occasions.includes(occ) ? prev.occasions.filter(o => o !== occ) : [...prev.occasions, occ] }))}
                                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${formData.occasions.includes(occ) ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                                                    >
                                                        {occ}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Detailed Policies & Information */}
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Info className="w-5 h-5 text-red-600"/> More Information & Policies</h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className={labelCls}>Decoration Description</label>
                                                    <input type="text" value={formData.decorationInfo.description} onChange={(e) => setFormData(prev => ({ ...prev, decorationInfo: { ...prev.decorationInfo, description: e.target.value } }))} className={inputCls} />
                                                    <label className={labelCls}>Decoration Policy</label>
                                                    <input type="text" value={formData.decorationInfo.policy} onChange={(e) => setFormData(prev => ({ ...prev, decorationInfo: { ...prev.decorationInfo, policy: e.target.value } }))} className={inputCls} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className={labelCls}>Liquor Served</label>
                                                            <select value={formData.liquorInfo.served} onChange={(e) => setFormData(prev => ({ ...prev, liquorInfo: { ...prev.liquorInfo, served: e.target.value } }))} className={inputCls}>
                                                                <option value="Yes">Yes</option>
                                                                <option value="No">No</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>Outside Liquor Allowed</label>
                                                            <select value={formData.liquorInfo.permitted} onChange={(e) => setFormData(prev => ({ ...prev, liquorInfo: { ...prev.liquorInfo, permitted: e.target.value } }))} className={inputCls}>
                                                                <option value="Yes">Yes</option>
                                                                <option value="No">No</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className={labelCls}>DJ Availability & Price</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <select value={formData.djInfo.available} onChange={(e) => setFormData(prev => ({ ...prev, djInfo: { ...prev.djInfo, available: e.target.value } }))} className={inputCls}>
                                                            <option value="Yes">Available</option>
                                                            <option value="No">Not Available</option>
                                                        </select>
                                                        <input type="number" value={formData.djInfo.starting_price} onChange={(e) => setFormData(prev => ({ ...prev, djInfo: { ...prev.djInfo, starting_price: parseInt(e.target.value) || 0 } }))} className={inputCls} placeholder="Price" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={labelCls}>Booking Policy</label>
                                                    <input type="text" value={formData.bookingPolicy} onChange={(e) => setFormData(prev => ({ ...prev, bookingPolicy: e.target.value }))} className={inputCls} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelCls}>Terms & Conditions</label>
                                                <textarea value={formData.termsConditions} onChange={(e) => setFormData(prev => ({ ...prev, termsConditions: e.target.value }))} className={`${inputCls} h-20`} />
                                            </div>
                                        </div>

                                        {/* Amenities & Parking */}
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900"><ShieldCheck className="w-5 h-5 text-red-600"/> Amenities & Parking</h3>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {["Air Conditioned", "Free WiFi", "Parking Space", "Valet Parking", "Power Backup", "Changing Rooms", "Lift", "Live Music"].map((item) => (
                                                    <label key={item} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                        formData.amenities.includes(item) ? "bg-red-50 border-red-500 text-red-700 font-semibold" : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                                                    }`}>
                                                        <input type="checkbox" className="hidden" checked={formData.amenities.includes(item)} onChange={() => handleAmenityToggle(item)} />
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${formData.amenities.includes(item) ? "bg-red-600 border-red-600" : "bg-white border-slate-300"}`}>
                                                            {formData.amenities.includes(item) && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                                        </div>
                                                        <span className="text-xs">{item}</span>
                                                    </label>
                                                ))}
                                            </div>

                                            {formData.amenities.includes("Parking Space") && (
                                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 grid md:grid-cols-2 gap-6 animate-in slide-in-from-top duration-300">
                                                    <div>
                                                        <label className={labelCls}>How many vehicles can be parked?</label>
                                                        <input type="number" value={formData.parkingDetails.count} onChange={(e) => setFormData(prev => ({ ...prev, parkingDetails: { ...prev.parkingDetails, count: parseInt(e.target.value) || 0 } }))} className={inputCls} />
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <input type="checkbox" id="valet_opt" checked={formData.parkingDetails.valet} onChange={(e) => setFormData(prev => ({ ...prev, parkingDetails: { ...prev.parkingDetails, valet: e.target.checked }, amenities: e.target.checked ? [...prev.amenities, "Valet Parking"] : prev.amenities }))} className="w-5 h-5 accent-red-600" />
                                                        <label htmlFor="valet_opt" className="text-sm font-bold text-slate-700">Valet Parking Available?</label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Photos & Summary */}
                                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900"><ImageIcon className="w-5 h-5 text-red-600"/> Venue Gallery / Photos</h3>
                                            <MultiImageUpload 
                                                onImagesChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))} 
                                                maxImages={15} 
                                            />
                                            
                                            <div>
                                                <label className={labelCls}>Business Description (Optional - will be auto-generated if left blank)</label>
                                                <textarea 
                                                    name="description" 
                                                    value={formData.description} 
                                                    onChange={handleChange} 
                                                    placeholder="Describe your venue..." 
                                                    className={`${inputCls} h-32`} 
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-8 flex flex-col sm:flex-row gap-4">
                                            <button type="button" onClick={() => setStep(1)} className="w-full sm:w-1/3 h-14 bg-slate-100 text-slate-700 font-bold rounded-xl transition-all">Back</button>
                                            <button type="submit" className="w-full sm:w-2/3 h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-2">Choose Package</button>
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
                                        <span className="text-sm font-bold text-slate-500">Back to Business Details</span>
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
