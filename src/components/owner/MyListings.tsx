import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Building, 
    MapPin, 
    Eye, 
    Edit, 
    Store, 
    ExternalLink, 
    X as CloseIcon,
    Check, 
    CheckCircle2, 
    IndianRupee, 
    Users, 
    Utensils, 
    Info, 
    ShieldCheck, 
    Image as ImageIcon,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import MyApplications from "./MyApplications";
import MultiImageUpload from "@/components/MultiImageUpload";
import DistrictCitySelect from "@/components/DistrictCitySelect";
import { citiesData } from "@/lib/citiesData";

export default function MyListings() {
    const [venues, setVenues] = useState<Record<string, any>[]>([]);
    const [vendors, setVendors] = useState<Record<string, any>[]>([]);
    const [activeSubTab, setActiveSubTab] = useState<'venues' | 'vendors'>('venues');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const { data: { user } } = await (supabase.auth.getUser() as any);
            if (!user) return;

            const [venuesRes, vendorsRes] = await Promise.all([
                supabase.from('venues').select('*').eq('owner_id', user.id),
                supabase.from('vendors').select('*').eq('owner_id', user.id)
            ]);

            setVenues(venuesRes.data || []);
            setVendors(vendorsRes.data || []);
        } catch (error) {
            toast.error("Failed to load listings");
        } finally {
            setLoading(false);
        }
    };
    const handleEditSave = async (updatedData: any) => {
        const item = editingData;
        // Sensitive fields that still require Admin approval
        const sensitiveFields = ['name', 'selected_plan', 'business_phone', 'contact_person', 'mobile', 'business_email'];
        
        const changes: any = {};
        const criticalChanges: any = {};
        
        Object.keys(updatedData).forEach(key => {
            if (key === 'listingType') return; // Skip our internal type field
            if (JSON.stringify(updatedData[key]) !== JSON.stringify(item[key])) {
                if (sensitiveFields.includes(key)) {
                    criticalChanges[key] = updatedData[key];
                } else {
                    changes[key] = updatedData[key];
                }
            }
        });

        try {
            const table = updatedData.listingType === 'vendor' ? 'vendors' : 'venues';

            // 1. Instant update for non-critical fields
            if (Object.keys(changes).length > 0) {
                const { error } = await supabase.from(table).update(changes).eq('id', item.id);
                if (error) throw error;
            }

            // 2. Request approval for sensitive fields (Contact info & Plan)
            if (Object.keys(criticalChanges).length > 0) {
                const requests = Object.keys(criticalChanges).map(field => ({
                    listing_id: item.id,
                    listing_type: updatedData.listingType,
                    field_name: field,
                    old_value: String(item[field] || ''),
                    new_value: String(criticalChanges[field] || ''),
                    status: 'pending'
                }));
                const { error } = await supabase.from('edit_requests').insert(requests);
                if (error) throw error;
                toast.success("Changes sent for Admin approval");
            } else if (Object.keys(changes).length > 0) {
                toast.success("Saved successfully");
            }
            
            setIsEditing(false);
            fetchListings();
        } catch (err: any) {
            toast.error("Update failed: " + err.message);
        }
    };

    if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>;

    const currentListings = activeSubTab === 'venues' ? venues : vendors;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">My Listings</h2>
                    <p className="text-sm text-slate-500">View and update your active profiles.</p>
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    <button onClick={() => setActiveSubTab('venues')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeSubTab === 'venues' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Venues ({venues.length})</button>
                    <button onClick={() => setActiveSubTab('vendors')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeSubTab === 'vendors' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Vendors ({vendors.length})</button>
                </div>
                <Link href="/list-venue"><Button className="bg-red-600 hover:bg-red-700">Add New Listing</Button></Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentListings.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-center">
                        <p className="text-slate-400 font-medium">No {activeSubTab} found.</p>
                    </div>
                ) : (
                    currentListings.map((item) => (
                        <ListingCard 
                            key={item.id} 
                            data={item} 
                            type={activeSubTab === 'venues' ? 'venue' : 'vendor'} 
                            onEdit={() => { 
                                setEditingData({ ...item, listingType: activeSubTab === 'venues' ? 'venue' : 'vendor' }); 
                                setIsEditing(true); 
                            }} 
                        />
                    ))
                )}
            </div>

            {isEditing && (
                <EditListingModal 
                    data={editingData} 
                    onClose={() => setIsEditing(false)} 
                    onSave={handleEditSave} 
                />
            )}
        </div>
    );
}

function ListingCard({ data, type, onEdit }: { data: any, type: 'venue'|'vendor', onEdit: () => void }) {
    const name = data.name;
    const city = data.city;
    const id = data.id;
    const rating = data.rating;
    const images = data.images || [];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300">
            <div className="h-44 bg-slate-100 relative overflow-hidden">
                {images.length > 0 ? (
                    <img src={images[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        <Building className="w-10 h-10" />
                    </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-full text-slate-700 shadow-sm border border-white/20">
                        {type}
                    </span>
                    {!data.is_approved && (
                        <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                            Pending
                        </span>
                    )}
                </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{name}</h4>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> {city || 'Location N/A'}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Rating</span>
                        <span className="font-bold text-slate-900">{rating || 'New'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                        <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Active Plan</span>
                        <Badge className={`font-black text-[9px] px-2 py-0.5 rounded-lg border ${
                            data.selected_plan?.toLowerCase() === 'premium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            data.selected_plan?.toLowerCase() === 'growth' ? 'bg-green-100 text-green-700 border-green-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                            {data.selected_plan?.toUpperCase() || 'STARTER'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                <Button onClick={onEdit} variant="outline" size="sm" className="flex-1 bg-white border-slate-200 hover:bg-slate-50 gap-2 font-bold text-slate-600">
                    <Edit className="w-4 h-4" /> Edit
                </Button>
                <Link href={`/${type}s/${data.slug || id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-white border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/20 gap-2 font-bold text-slate-600">
                        <Eye className="w-4 h-4" /> View
                    </Button>
                </Link>
            </div>
        </div>
    );
}

function EditListingModal({ data, onClose, onSave }: { data: any, onClose: () => void, onSave: (d: any) => void }) {
    const [formData, setFormData] = useState({ 
        ...data,
        space_info: data.space_info || { party_halls: 0, banquet_halls: 0, rooms: 0, outdoor_lawn: 0 },
        decoration_info: data.decoration_info || { description: "", policy: "" },
        liquor_info: data.liquor_info || { served: "No", permitted: "No" },
        dj_info: data.dj_info || { available: "No", starting_price: 0 },
        parking_details: data.parking_details || { count: 0, valet: false },
        amenities: data.amenities || [],
        occasions: data.occasions || [],
        images: data.images || []
    });

    const isVenue = formData.listingType === 'venue';

    const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";
    const labelCls = "text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2";

    const handleAmenityToggle = (item: string) => {
        setFormData((prev: any) => ({
            ...prev,
            amenities: prev.amenities.includes(item) 
                ? prev.amenities.filter((a: string) => a !== item) 
                : [...prev.amenities, item]
        }));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Edit Business Profile</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Updates for {data.name} — {isVenue ? 'Venue' : 'Vendor'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><CloseIcon className="w-6 h-6 text-slate-400" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">
                            <Building size={20} className="text-primary" /> Core Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Listing Name (Business Name)</label>
                                <input className={`${inputCls} bg-amber-50/30`} value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            {isVenue && (
                                <div>
                                    <label className={labelCls}>Venue Type</label>
                                    <select className={inputCls} value={formData.venue_type || 'Banquet Hall'} onChange={(e) => setFormData({...formData, venue_type: e.target.value})}>
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
                            )}
                        </div>
                    </div>
                    
                    {/* Location Section */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">
                            <MapPin size={20} className="text-primary" /> Location Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>District & City *</label>
                                <DistrictCitySelect 
                                    onSelect={(val) => setFormData((prev: any) => ({ ...prev, city: val, area: "" }))}
                                    initialValue={formData.city}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>City Area *</label>
                                <select 
                                    className={inputCls} 
                                    value={formData.area || ""} 
                                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                                    required
                                >
                                    <option value="">Select Area...</option>
                                    {(citiesData.find(c => {
                                        const cityPart = formData.city?.split(" - ")[1] || formData.city;
                                        return c.name.toLowerCase() === cityPart?.toLowerCase();
                                    })?.localities || []).map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                    {/* Fallback if city not in our data or no localities */}
                                    {formData.area && !(citiesData.find(c => {
                                        const cityPart = formData.city?.split(" - ")[1] || formData.city;
                                        return c.name.toLowerCase() === cityPart?.toLowerCase();
                                    })?.localities?.includes(formData.area)) && (
                                        <option value={formData.area}>{formData.area}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Full Address *</label>
                            <textarea 
                                className={`${inputCls} min-h-[80px]`} 
                                value={formData.address || ""} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Street, Building, Landmark..."
                            />
                        </div>
                    </div>

                    {/* Capacity & Pricing (Venues Only) */}
                    {isVenue && (
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">
                                <Users size={20} className="text-primary" /> Capacity & Pricing
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelCls}>Guest Capacity (Min-Max)</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Min" className={inputCls} value={formData.min_capacity || 0} onChange={(e) => setFormData({...formData, min_capacity: parseInt(e.target.value) || 0})} />
                                        <input type="number" placeholder="Max" className={inputCls} value={formData.max_capacity || 0} onChange={(e) => setFormData({...formData, max_capacity: parseInt(e.target.value) || 0})} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Veg Plate Price</label>
                                    <div className="relative">
                                        <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="number" className={`${inputCls} pl-10`} value={formData.veg_price_per_plate || 0} onChange={(e) => setFormData({...formData, veg_price_per_plate: parseInt(e.target.value) || 0})} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Non-Veg Plate Price</label>
                                    <div className="relative">
                                        <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="number" className={`${inputCls} pl-10`} value={formData.nonveg_price_per_plate || 0} onChange={(e) => setFormData({...formData, nonveg_price_per_plate: parseInt(e.target.value) || 0})} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className={labelCls}>Banquet Halls</label>
                                    <input type="number" className={inputCls} value={formData.space_info.banquet_halls || 0} onChange={(e) => setFormData({...formData, space_info: {...formData.space_info, banquet_halls: parseInt(e.target.value) || 0}})} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelCls}>Party Halls</label>
                                    <input type="number" className={inputCls} value={formData.space_info.party_halls || 0} onChange={(e) => setFormData({...formData, space_info: {...formData.space_info, party_halls: parseInt(e.target.value) || 0}})} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelCls}>Outdoor Lawns</label>
                                    <input type="number" className={inputCls} value={formData.space_info.outdoor_lawn || 0} onChange={(e) => setFormData({...formData, space_info: {...formData.space_info, outdoor_lawn: parseInt(e.target.value) || 0}})} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelCls}>Guest Rooms</label>
                                    <input type="number" className={inputCls} value={formData.space_info.rooms || 0} onChange={(e) => setFormData({...formData, space_info: {...formData.space_info, rooms: parseInt(e.target.value) || 0}, rooms_count: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">
                            <Info size={20} className="text-primary" /> Description & Summary
                        </h4>
                        <textarea 
                            className="w-full min-h-[150px] border border-slate-200 rounded-2xl px-4 py-4 text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed font-medium" 
                            value={formData.description || ""} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe your business, USP, and special offers..."
                        />
                    </div>

                    {/* Amenities Multi-select */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">
                            <ShieldCheck size={20} className="text-primary" /> Amenities & Facilities
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Air Conditioned", "Free WiFi", "Parking Space", "Valet Parking", "Power Backup", "Changing Rooms", "Lift", "Live Music", "DJ Available", "Alcohol Allowed"].map((item) => (
                                <button 
                                    key={item}
                                    type="button"
                                    onClick={() => handleAmenityToggle(item)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-[11px] font-bold ${
                                        formData.amenities.includes(item) ? "bg-primary/5 border-primary text-primary" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                    }`}
                                >
                                    {formData.amenities.includes(item) ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Policy Settings (Venues Only) */}
                    {isVenue && (
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">
                                <ShieldCheck size={20} className="text-primary" /> Policies & Rules
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelCls}>Catering Policy *</label>
                                    <select 
                                        className={inputCls} 
                                        value={formData.catering_policy || ""} 
                                        onChange={(e) => setFormData({...formData, catering_policy: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Policy...</option>
                                        <option value="In-house catering only">In-house catering only</option>
                                        <option value="Outside catering allowed">Outside catering allowed</option>
                                        <option value="Both In-house & Outside allowed">Both In-house & Outside allowed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Booking Policy</label>
                                    <input className={inputCls} value={formData.booking_policy || ""} onChange={(e) => setFormData({...formData, booking_policy: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelCls}>Cancellation Policy</label>
                                    <input className={inputCls} value={formData.cancellation_policy || ""} onChange={(e) => setFormData({...formData, cancellation_policy: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelCls}>Parking Count</label>
                                    <input type="number" className={inputCls} value={formData.parking_details.count} onChange={(e) => setFormData({...formData, parking_details: {...formData.parking_details, count: parseInt(e.target.value) || 0}})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Photos */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">
                            <ImageIcon size={20} className="text-primary" /> Manage Photos
                        </h4>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                            <MultiImageUpload 
                                onImagesChange={(urls) => setFormData((prev: any) => ({ ...prev, images: urls }))} 
                                maxImages={15} 
                                initialImages={formData.images}
                            />
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">
                            <Sparkles size={20} className="text-amber-500" /> Subscription Plan
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Starter', 'Growth', 'Premium'].map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => setFormData({...formData, selected_plan: p})}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                        formData.selected_plan === p ? "border-amber-500 bg-amber-50" : "border-slate-100 hover:border-slate-200"
                                    }`}
                                >
                                    <p className="text-xs font-black uppercase text-slate-400 mb-1">Plan</p>
                                    <p className="font-bold text-slate-900">{p}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="p-8 border-t border-slate-100 flex gap-4 bg-white">
                    <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-slate-500" onClick={onClose}>Discard Changes</Button>
                    <Button className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl transition-all active:scale-95" onClick={() => onSave(formData)}>Update Profile Now</Button>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
