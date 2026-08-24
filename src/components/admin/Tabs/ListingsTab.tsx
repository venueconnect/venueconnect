'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  Building2, 
  Search, 
  MapPin, 
  Star, 
  Edit3, 
  Eye, 
  EyeOff, 
  Trash2, 
  X, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { SafeImage } from "@/components/ui/SafeImage";

const ITEMS_PER_PAGE = 20;

const slugifyCity = (city?: string | null): string => {
    return (city || "").trim().toLowerCase().replace(/\s+/g, "-");
};

export default function ListingsTab() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  // Edit State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Delete State
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchListings();
  }, [page, typeFilter, cityFilter, statusFilter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let venuePromise = Promise.resolve({ data: [] as any[], count: 0 });
      let vendorPromise = Promise.resolve({ data: [] as any[], count: 0 });

      if (typeFilter === 'venue' || typeFilter === 'all') {
        let q = supabase.from('venues').select('*', { count: 'exact' });
        if (cityFilter !== 'all') q = q.eq('city', cityFilter);
        if (statusFilter !== 'all') q = q.eq('is_approved', statusFilter === 'approved');
        if (search) q = q.ilike('name', `%${search}%`);
        venuePromise = q.range(from, to).order('created_at', { ascending: false }).then((res: any) => ({
            data: (res.data || []).map((v: any) => ({ ...v, type: 'venue' })),
            count: res.count || 0
        }));
      }

      if (typeFilter === 'vendor' || typeFilter === 'all') {
        let q = supabase.from('vendors').select('*', { count: 'exact' });
        if (cityFilter !== 'all') q = q.eq('city', cityFilter);
        if (statusFilter !== 'all') q = q.eq('is_approved', statusFilter === 'approved');
        if (search) q = q.ilike('name', `%${search}%`);
        vendorPromise = q.range(from, to).order('created_at', { ascending: false }).then((res: any) => ({
            data: (res.data || []).map((v: any) => ({ ...v, type: 'vendor' })),
            count: res.count || 0
        }));
      }

      const [venueRes, vendorRes] = await Promise.all([venuePromise, vendorPromise]);
      const finalData = [...venueRes.data, ...vendorRes.data];
      const totalCount = venueRes.count + vendorRes.count;

      // Sort combined results if necessary
      setListings(finalData.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, ITEMS_PER_PAGE));
      setCount(totalCount);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = !item.is_approved;
    try {
        const res = await fetch(`/api/admin/listings/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table: item.type === 'vendor' ? 'vendors' : 'venues',
                updates: { is_approved: newStatus }
            })
        });
        if (res.ok) {
            toast.success(newStatus ? "Listing visibility: Live" : "Listing visibility: Hidden");
            fetchListings();
        }
    } catch (e) { toast.error("Update failed"); }
  };

  const handleToggleFeatured = async (item: any) => {
    const newFeatured = !item.is_featured;
    try {
        const res = await fetch(`/api/admin/listings/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table: item.type === 'vendor' ? 'vendors' : 'venues',
                updates: { is_featured: newFeatured }
            })
        });
        if (res.ok) {
            toast.success(newFeatured ? "Featured on Home!" : "Removed from Featured");
            fetchListings();
        }
    } catch (e) { toast.error("Update failed"); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
        const res = await fetch(`/api/admin/listings/${itemToDelete.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: itemToDelete.type === 'vendor' ? 'vendors' : 'venues' })
        });
        if (res.ok) {
            toast.success("Listing deleted permanently");
            setItemToDelete(null);
            fetchListings();
        }
    } catch (e) { toast.error("Delete failed"); }
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/admin/listings/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: editingItem.type === 'vendor' ? 'vendors' : 'venues',
          updates: {
             name: editingItem.name,
             city: editingItem.city,
             address: editingItem.address,
             starting_price: editingItem.starting_price || editingItem.veg_price_per_plate,
             description: editingItem.description,
             is_approved: editingItem.is_approved,
             is_featured: editingItem.is_featured
          }
        })
      });

      if (res.ok) {
        toast.success("Listing updated successfully");
        setIsSheetOpen(false);
        fetchListings();
      }
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mb-1">Listings Management</h1>
              <p className="text-slate-400 font-medium text-sm">Review, edit, and moderate all active marketplace properties.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{count} Total Listings Found</span>
          </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-grow min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Search by name..." 
                className="pl-12 h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-medium" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
              />
          </div>
          
          <select 
            className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 text-sm font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          >
              <option value="all">Listing: All Types</option>
              <option value="venue">Venues Only</option>
              <option value="vendor">Vendors Only</option>
          </select>

          <select 
            className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 text-sm font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(0); }}
          >
              <option value="all">City: All Gujarat</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Rajkot">Rajkot</option>
          </select>

          <select 
            className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 text-sm font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
              <option value="all">Status: All</option>
              <option value="approved">Live / Approved</option>
              <option value="hidden">Hidden / Pending</option>
          </select>

          <Button 
            className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all"
            onClick={() => { setPage(0); fetchListings(); }}
          >
            Apply Filters
          </Button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">Crunching data...</p>
                   </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-medium italic">No listings match your search criteria.</p>
                   </td>
                </tr>
              ) : (
                listings.map((item: any) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 shrink-0 relative">
                                <SafeImage src={item.image || item.images?.[0] || ''} alt={item.name} fill className="object-cover" />
                            </div>
                            <div>
                                {item.slug && item.city ? (
                                    <Link 
                                        href={`/${item.type}s/${slugifyCity(item.city)}/${item.slug}`}
                                        target="_blank"
                                        className="font-bold text-slate-900 hover:text-primary hover:underline transition-colors leading-tight block"
                                    >
                                        {item.name}
                                    </Link>
                                ) : (
                                    <p className="font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">{item.name}</p>
                                )}
                                <p className="text-xs text-slate-400 font-medium mt-1">ID: ...{item.id.slice(-6)}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-6">
                      <Badge variant="outline" className={`rounded-xl border shadow-sm font-bold text-[10px] px-3 py-1 ${item.type === 'vendor' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {item.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <MapPin size={14} className="text-slate-300" /> {item.city}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <Badge className={`rounded-lg border font-bold text-[9px] px-2 py-0.5 ${
                          item.selected_plan?.toLowerCase() === 'premium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          item.selected_plan?.toLowerCase() === 'growth' ? 'bg-green-100 text-green-700 border-green-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                          {item.selected_plan?.toUpperCase() || 'STARTER'}
                      </Badge>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest leading-none ${item.is_approved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${item.is_approved ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                         {item.is_approved ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                        <button 
                          onClick={() => handleToggleFeatured(item)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.is_featured ? 'bg-amber-100 text-amber-600 border border-amber-200 shadow-inner' : 'bg-slate-50 text-slate-300 hover:text-slate-400'}`}
                        >
                          <Star size={18} className={item.is_featured ? 'fill-current' : ''} />
                        </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                            onClick={() => { setEditingItem(item); setIsSheetOpen(true); }}
                        >
                            <Edit3 size={18} />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-10 h-10 rounded-xl hover:bg-slate-900/10"
                            onClick={() => handleToggleStatus(item)}
                        >
                            {item.is_approved ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-10 h-10 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => setItemToDelete(item)}
                        >
                            <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing {listings.length > 0 ? page * ITEMS_PER_PAGE + 1 : 0}-{Math.min((page + 1) * ITEMS_PER_PAGE, count)} of {count} listings
            </p>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 0} 
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-xl h-10 px-4 font-bold border-slate-200"
                >
                    <ChevronLeft size={16} className="mr-2" /> Prev
                </Button>
                <div className="flex items-center gap-1 mx-2">
                   {[...Array(Math.ceil(count / ITEMS_PER_PAGE))].map((_, i) => (
                       <button 
                         key={i} 
                         onClick={() => setPage(i)}
                         className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${page === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white border border-transparent'}`}
                       >
                           {i + 1}
                       </button>
                   )).slice(Math.max(0, page - 2), page + 3)}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={(page + 1) * ITEMS_PER_PAGE >= count} 
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-xl h-10 px-4 font-bold border-slate-200"
                >
                    Next <ChevronRight size={16} className="ml-2" />
                </Button>
            </div>
        </div>
      </div>

      {/* Edit Drawer (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
         <SheetContent className="w-full sm:max-w-xl bg-white p-0 overflow-y-auto">
            {editingItem && (
               <div className="flex flex-col h-full">
                  <SheetHeader className="p-10 bg-slate-50/50 border-b border-slate-100">
                     <SheetTitle className="text-3xl font-black font-display text-slate-900 tracking-tight">Edit Listing</SheetTitle>
                     <SheetDescription className="text-slate-500 font-medium">Update public details for <strong>{editingItem.name}</strong></SheetDescription>
                  </SheetHeader>
                  
                  <form onSubmit={handleUpdateListing} className="flex-1 p-10 space-y-8">
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                              <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Display Name</label>
                                  <Input 
                                    className="h-14 rounded-2xl bg-white border-slate-200 font-bold focus:ring-primary/20" 
                                    value={editingItem.name} 
                                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                  />
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">City</label>
                                      <Input 
                                        className="h-14 rounded-2xl bg-white border-slate-200 font-bold" 
                                        value={editingItem.city} 
                                        onChange={(e) => setEditingItem({...editingItem, city: e.target.value})}
                                      />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Price (Start)</label>
                                      <Input 
                                        type="number"
                                        className="h-14 rounded-2xl bg-white border-slate-200 font-bold" 
                                        value={editingItem.starting_price || editingItem.veg_price_per_plate || 0} 
                                        onChange={(e) => setEditingItem({...editingItem, starting_price: parseInt(e.target.value)})}
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Address</label>
                                  <Input 
                                    className="h-14 rounded-2xl bg-white border-slate-200 font-medium" 
                                    value={editingItem.address} 
                                    onChange={(e) => setEditingItem({...editingItem, address: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">About / Description</label>
                                  <textarea 
                                    className="w-full min-h-[150px] p-6 rounded-[2rem] bg-white border border-slate-200 font-light italic text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 grid grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moderation</label>
                              <div className="flex items-center gap-3">
                                  <input 
                                    type="checkbox" 
                                    id="isApproved" 
                                    className="w-5 h-5 accent-primary"
                                    checked={editingItem.is_approved}
                                    onChange={(e) => setEditingItem({...editingItem, is_approved: e.target.checked})}
                                  />
                                  <label htmlFor="isApproved" className="text-sm font-bold text-slate-700">Approve Listing</label>
                              </div>
                          </div>
                          <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visibility</label>
                              <div className="flex items-center gap-3">
                                  <input 
                                    type="checkbox" 
                                    id="isFeatured" 
                                    className="w-5 h-5 accent-primary"
                                    checked={editingItem.is_featured}
                                    onChange={(e) => setEditingItem({...editingItem, is_featured: e.target.checked})}
                                  />
                                  <label htmlFor="isFeatured" className="text-sm font-bold text-slate-700">Feature on Home</label>
                              </div>
                          </div>
                      </div>
                  </form>

                  <SheetFooter className="p-10 border-t border-slate-100 bg-white sticky bottom-0">
                      <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold text-slate-500" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                      <Button className="h-14 px-12 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20" onClick={handleUpdateListing}>Save Changes</Button>
                  </SheetFooter>
               </div>
            )}
         </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-8">
                  <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black font-display text-slate-900 mb-2">Confirm Deletion</h3>
              <p className="text-slate-500 font-medium mb-10 italic">
                  Are you sure you want to permanently delete <strong>{itemToDelete.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                  <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-slate-500" onClick={() => setItemToDelete(null)}>Cancel</Button>
                  <Button className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold" onClick={handleDelete}>Delete Anyway</Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
