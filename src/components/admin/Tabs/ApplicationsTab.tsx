'use client';

import { useState, useEffect } from "react";
import { 
  Check, 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Filter, 
  CheckSquare, 
  Square, 
  Clock, 
  Briefcase, 
  Eye, 
  Search,
  RefreshCw,
  IndianRupee,
  Users2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ApplicationsTab() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'venue' | 'vendor'>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchApplications();
  }, [typeFilter, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/applications?status=${statusFilter}&type=${typeFilter}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load applications");
      setApplications(data.applications || []);
      setSelectedIds([]);
    } catch (error: any) {
      console.error("Applications fetch error:", error);
      toast.error(error.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: any) => {
    const toastId = toast.loading(`Approving ${app.business_name}...`);
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id })
      });
      const data = await res.json();
      if (res.ok) {
        toast.dismiss(toastId);
        toast.success(`${app.business_name} is now LIVE!`);
        fetchApplications();
      } else {
        toast.dismiss(toastId);
        const fullMessage = data.details ? `${data.error}: ${data.details}` : (data.error || "Approval failed");
        throw new Error(fullMessage);
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Launching ${selectedIds.length} listings live...`);
    
    let successCount = 0;
    for (const id of selectedIds) {
        try {
            const res = await fetch('/api/admin/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: id })
            });
            if (res.ok) successCount++;
        } catch (e) {}
    }

    toast.dismiss(toastId);
    toast.success(`Successfully launched ${successCount} businesses!`);
    fetchApplications();
  };

  const handleReject = async (appId: string) => {
    if (!confirm("Are you sure you want to reject this application?")) return;
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status: 'rejected' })
      });
      if (!res.ok) throw new Error("Failed to reject application");
      toast.success("Application marked as rejected.");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || "Rejection failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = applications.filter(app => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      app.business_name?.toLowerCase().includes(q) ||
      app.city?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.phone_number?.toLowerCase().includes(q) ||
      app.venue_type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
          <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mb-1">Application Queue</h1>
              <p className="text-slate-400 font-medium text-sm">Review incoming vendor registrations & venue listing requests.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={fetchApplications} 
                variant="outline" 
                className="h-11 px-4 rounded-xl text-xs font-bold gap-2"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </Button>
              <select 
                className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
              >
                  <option value="all">Type: ALL</option>
                  <option value="venue">Type: VENUES</option>
                  <option value="vendor">Type: VENDORS</option>
              </select>

              <select 
                className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                  <option value="pending">Status: PENDING</option>
                  <option value="approved">Status: APPROVED</option>
                  <option value="rejected">Status: REJECTED</option>
                  <option value="all">Status: ALL</option>
              </select>
          </div>
      </div>

      {/* Search & Batch Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search by name, city, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
          </div>

          {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-500">{selectedIds.length} selected</span>
                  <Button 
                    onClick={handleBatchApprove} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl h-10 px-5"
                  >
                    Batch Approve ({selectedIds.length})
                  </Button>
              </div>
          )}
      </div>

      {/* Applications List */}
      {loading ? (
          <div className="space-y-4">
              {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse h-32" />
              ))}
          </div>
      ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4">
                  <Building2 size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">No Applications Found</h3>
              <p className="text-sm text-slate-400 font-medium">There are currently no {statusFilter !== 'all' ? statusFilter : ''} applications matching your filters.</p>
          </div>
      ) : (
          <div className="space-y-4">
              {filtered.map((app) => {
                  const isExpanded = expandedId === app.id;
                  const isSelected = selectedIds.includes(app.id);
                  const isVendor = app.venue_type === 'vendor';

                  return (
                      <div 
                        key={app.id} 
                        className={`bg-white rounded-2xl border transition-all ${
                            isSelected ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'border-slate-100 shadow-sm hover:shadow-md'
                        }`}
                      >
                          <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                  {/* Checkbox */}
                                  {app.status === 'pending' && (
                                      <button 
                                        onClick={() => toggleSelect(app.id)}
                                        className="mt-1 text-slate-300 hover:text-primary transition-colors"
                                      >
                                          {isSelected ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} />}
                                      </button>
                                  )}

                                  {/* Icon / Image */}
                                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                      {app.image_url || app.images?.[0] ? (
                                          <img src={app.image_url || app.images?.[0]} alt="" className="w-full h-full object-cover" />
                                      ) : isVendor ? (
                                          <Briefcase className="text-purple-500" size={24} />
                                      ) : (
                                          <Building2 className="text-blue-500" size={24} />
                                      )}
                                  </div>

                                  {/* Info */}
                                  <div>
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                          <h3 className="text-base font-black text-slate-900">{app.business_name}</h3>
                                          <Badge className={isVendor ? "bg-purple-50 text-purple-600 border-none text-[10px]" : "bg-blue-50 text-blue-600 border-none text-[10px]"}>
                                              {isVendor ? `Vendor (${app.vendor_category || 'Service'})` : `Venue (${app.venue_type || 'Hall'})`}
                                          </Badge>
                                          <Badge className={
                                              app.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-none text-[10px]" :
                                              app.status === 'rejected' ? "bg-rose-50 text-rose-600 border-none text-[10px]" :
                                              "bg-amber-50 text-amber-600 border-none text-[10px]"
                                          }>
                                              {app.status.toUpperCase()}
                                          </Badge>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                                          <span className="flex items-center gap-1"><MapPin size={12} /> {app.city || 'Gujarat'}</span>
                                          {app.phone_number && <span className="flex items-center gap-1"><Phone size={12} /> {app.phone_number}</span>}
                                          {app.email && <span className="flex items-center gap-1"><Mail size={12} /> {app.email}</span>}
                                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(app.created_at).toLocaleDateString()}</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 self-end md:self-center">
                                  <Button 
                                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs font-bold gap-1 rounded-xl h-9"
                                  >
                                      {isExpanded ? <>Less <ChevronUp size={14} /></> : <>Details <ChevronDown size={14} /></>}
                                  </Button>

                                  {app.status === 'pending' && (
                                      <>
                                          <Button 
                                            onClick={() => handleReject(app.id)}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs font-bold text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl h-9"
                                          >
                                              Reject
                                          </Button>
                                          <Button 
                                            onClick={() => handleApprove(app)}
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl h-9 gap-1 shadow-md shadow-emerald-600/20"
                                          >
                                              <Check size={14} /> Approve & Launch
                                          </Button>
                                      </>
                                  )}
                              </div>
                          </div>

                          {/* Expanded Details Panel */}
                          {isExpanded && (
                              <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-4 rounded-b-2xl animate-in fade-in-0 duration-200">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                      <div>
                                          <p className="font-black text-slate-400 uppercase tracking-wider mb-1">Full Address / Location</p>
                                          <p className="font-bold text-slate-800">{app.address || app.area || app.location || 'N/A'}</p>
                                      </div>
                                      <div>
                                          <p className="font-black text-slate-400 uppercase tracking-wider mb-1">Pricing Information</p>
                                          <p className="font-bold text-slate-800">
                                              ₹{app.starting_price || app.veg_price_per_plate || app.price_per_plate || 'Contact'} 
                                              {app.price_per_plate ? ' / plate' : ' starting'}
                                          </p>
                                      </div>
                                      <div>
                                          <p className="font-black text-slate-400 uppercase tracking-wider mb-1">Capacity / Food Policy</p>
                                          <p className="font-bold text-slate-800">
                                              {app.guest_capacity ? `${app.guest_capacity} Guests` : ''} 
                                              {app.food_type ? ` • ${app.food_type}` : ''}
                                          </p>
                                      </div>
                                  </div>

                                  {app.description && (
                                      <div>
                                          <p className="font-black text-slate-400 uppercase tracking-wider mb-1 text-xs">Business Description</p>
                                          <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                                              {app.description}
                                          </p>
                                      </div>
                                  )}

                                  {/* Images Gallery */}
                                  {(app.images?.length > 0 || app.image_url) && (
                                      <div>
                                          <p className="font-black text-slate-400 uppercase tracking-wider mb-2 text-xs">Uploaded Photos ({(app.images || [app.image_url]).length})</p>
                                          <div className="flex flex-wrap gap-3">
                                              {(app.images || [app.image_url]).map((img: string, idx: number) => (
                                                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group relative block">
                                                      <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                          <Eye size={14} />
                                                      </div>
                                                  </a>
                                              ))}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
}
