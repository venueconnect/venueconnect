'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
    Check, X, Phone, Mail, Calendar, Building, User, 
    Search, RefreshCw, Filter, Sparkles, MessageSquare, MapPin,
    Trash2, ChevronDown, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { format } from "date-fns";

export default function LeadsTab() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sourceFilter, setSourceFilter] = useState<'all' | 'requirement' | 'listing' | 'contact'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'new' | 'contacted' | 'approved' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
    }, [sourceFilter, statusFilter]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/leads?source=${sourceFilter}&status=${statusFilter}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch leads");
            setLeads(data.leads || []);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch leads");
            console.error("Fetch Leads Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        try {
            setUpdatingId(leadId);
            // Optimistic update
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

            const res = await fetch('/api/admin/leads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, status: newStatus })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Status changed to ${newStatus.toUpperCase()}`);
            } else {
                toast.error(data.error || "Failed to update status");
                fetchLeads();
            }
        } catch (e: any) {
            toast.error("Status update error");
            fetchLeads();
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (leadId: string, customerName: string) => {
        if (!confirm(`Are you sure you want to permanently delete lead for "${customerName}"?`)) return;
        try {
            const res = await fetch(`/api/admin/leads?id=${leadId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Lead removed successfully");
                setLeads(prev => prev.filter(l => l.id !== leadId));
            } else {
                toast.error("Failed to delete lead");
            }
        } catch (e) {
            toast.error("Delete error");
        }
    };

    const filtered = leads.filter(l => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            l.customer_name?.toLowerCase().includes(q) ||
            l.customer_phone?.toLowerCase().includes(q) ||
            l.customer_email?.toLowerCase().includes(q) ||
            l.listing_name?.toLowerCase().includes(q) ||
            l.message?.toLowerCase().includes(q) ||
            l.city?.toLowerCase().includes(q)
        );
    });

    const pendingCount = leads.filter(l => l.status === 'pending').length;

    // Helper for Status Badge Styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 text-amber-800 border-amber-300 focus:ring-amber-400';
            case 'new':
                return 'bg-blue-100 text-blue-800 border-blue-300 focus:ring-blue-400';
            case 'contacted':
                return 'bg-purple-100 text-purple-800 border-purple-300 focus:ring-purple-400';
            case 'approved':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300 focus:ring-emerald-400';
            case 'rejected':
                return 'bg-rose-100 text-rose-800 border-rose-300 focus:ring-rose-400';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-300 focus:ring-slate-400';
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                        Lead Management
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                        Track, assign and update status for all customer requirements, quotes, and inquiries.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={fetchLeads} 
                        variant="outline" 
                        size="sm"
                        className="rounded-xl text-xs font-bold gap-1.5 h-10"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                    </Button>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs px-3 py-1 font-black uppercase tracking-wider">
                        {pendingCount} Pending Review
                    </Badge>
                </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-4">
                {/* Row 1: Source & Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Source:</span>
                        {[
                            { label: 'All Sources', val: 'all' },
                            { label: 'Homepage Forms', val: 'requirement' },
                            { label: 'Direct Listings', val: 'listing' },
                            { label: 'Contact Messages', val: 'contact' }
                        ].map(f => (
                            <button
                                key={f.val}
                                onClick={() => setSourceFilter(f.val as any)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                    sourceFilter === f.val 
                                        ? 'bg-slate-900 text-white shadow-md' 
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                            type="text"
                            placeholder="Search customer, phone, city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* Row 2: Status Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Status:</span>
                    {[
                        { label: 'All Statuses', val: 'all', badge: 'bg-slate-100 text-slate-600' },
                        { label: 'Pending Approval', val: 'pending', badge: 'bg-amber-100 text-amber-800' },
                        { label: 'New', val: 'new', badge: 'bg-blue-100 text-blue-800' },
                        { label: 'Contacted', val: 'contacted', badge: 'bg-purple-100 text-purple-800' },
                        { label: 'Approved', val: 'approved', badge: 'bg-emerald-100 text-emerald-800' },
                        { label: 'Rejected', val: 'rejected', badge: 'bg-rose-100 text-rose-800' }
                    ].map(st => (
                        <button
                            key={st.val}
                            onClick={() => setStatusFilter(st.val as any)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                                statusFilter === st.val
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center text-slate-400 font-medium">Loading leads...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3">
                            <MessageSquare size={24} />
                        </div>
                        <h4 className="text-base font-black text-slate-800 mb-1">No Leads Found</h4>
                        <p className="text-xs text-slate-400">No leads match your selected filters.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50/70">
                            <TableRow>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Target Listing / Source</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Plan / Quota</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Event Details & Message</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Change Status</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Quick Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((lead: any) => (
                                <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                    {/* Customer Info */}
                                    <TableCell className="align-top py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                                                <User size={13} className="text-slate-400" /> {lead.customer_name}
                                            </span>
                                            <div className="flex flex-col gap-0.5 text-xs text-slate-500 font-medium">
                                                <a href={`tel:${lead.customer_phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                                    <Phone size={11} /> {lead.customer_phone}
                                                </a>
                                                {lead.customer_email && lead.customer_email !== 'N/A' && (
                                                    <a href={`mailto:${lead.customer_email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                                        <Mail size={11} /> {lead.customer_email}
                                                    </a>
                                                )}
                                                <span className="text-[10px] text-slate-400 mt-1">
                                                    {lead.created_at ? format(new Date(lead.created_at), 'MMM dd, yyyy • hh:mm a') : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Target Listing / Source */}
                                    <TableCell className="align-top py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs sm:text-sm">
                                                {lead.source === 'requirement' ? (
                                                    <Sparkles size={14} className="text-amber-500 shrink-0" />
                                                ) : lead.source === 'contact' ? (
                                                    <MessageSquare size={14} className="text-blue-500 shrink-0" />
                                                ) : (
                                                    <Building size={14} className="text-primary shrink-0" />
                                                )}
                                                <span className="truncate max-w-[200px]">{lead.listing_name}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <Badge 
                                                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border-none ${
                                                        lead.source === 'requirement' ? 'bg-amber-100 text-amber-800' :
                                                        lead.source === 'contact' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {lead.source === 'requirement' ? 'Homepage Form' :
                                                     lead.source === 'contact' ? 'Contact Form' : 'Direct Listing'}
                                                </Badge>
                                                {lead.city && (
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                                                        <MapPin size={10} /> {lead.city}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Plan / Quota */}
                                    <TableCell className="align-top py-4">
                                        {lead.source === 'listing' ? (
                                            <div className="flex flex-col gap-1.5 max-w-[140px]">
                                                <Badge 
                                                    className={`w-fit text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                                                        lead.selected_plan?.toLowerCase() === 'premium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                        lead.selected_plan?.toLowerCase() === 'growth' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}
                                                >
                                                    {lead.selected_plan?.toUpperCase() || 'STARTER'}
                                                </Badge>
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                                    <span>Used: {lead.leads_used}</span>
                                                    <span className="text-primary">Left: {Math.max(0, (lead.leads_quota || 0) - (lead.leads_used || 0))}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Badge className="bg-slate-100 text-slate-600 border-none text-[9px] uppercase font-bold">
                                                Platform Lead
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* Event Details & Message */}
                                    <TableCell className="align-top py-4">
                                        <div className="flex flex-col gap-1 text-xs text-slate-600 max-w-xs sm:max-w-md">
                                            {lead.event_date && (
                                                <span className="flex items-center gap-1.5 font-black text-slate-800">
                                                    <Calendar size={12} className="text-primary" /> 
                                                    Event: {format(new Date(lead.event_date), 'MMM dd, yyyy')}
                                                </span>
                                            )}
                                            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                                                {lead.message || 'No additional details provided.'}
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Interactive Status Selector (Proper for ALL rows) */}
                                    <TableCell className="align-top py-4">
                                        <div className="relative inline-block w-40">
                                            <select
                                                value={lead.status}
                                                disabled={updatingId === lead.id}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                className={`w-full appearance-none text-[11px] font-black uppercase tracking-wider py-1.5 pl-3 pr-7 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 transition-all shadow-sm ${getStatusStyle(lead.status)}`}
                                            >
                                                <option value="pending">🟡 Pending</option>
                                                <option value="new">🔵 New</option>
                                                <option value="contacted">🟣 Contacted</option>
                                                <option value="approved">🟢 Approved</option>
                                                <option value="rejected">🔴 Rejected</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                <ChevronDown size={13} />
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Unified Quick Actions */}
                                    <TableCell className="align-top py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                            {lead.status !== 'approved' && (
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleStatusChange(lead.id, 'approved')}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-8 px-2.5 text-xs font-bold gap-1 shadow-sm"
                                                    title="Approve & Send to Lister"
                                                >
                                                    <Check size={13} /> Approve
                                                </Button>
                                            )}

                                            {lead.status !== 'contacted' && lead.status !== 'approved' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(lead.id, 'contacted')}
                                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl h-8 px-2.5 text-xs font-bold gap-1"
                                                    title="Mark Contacted"
                                                >
                                                    <Phone size={11} /> Contacted
                                                </Button>
                                            )}

                                            {lead.status !== 'rejected' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(lead.id, 'rejected')}
                                                    className="text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl h-8 px-2 text-xs font-bold"
                                                    title="Reject Lead"
                                                >
                                                    <X size={13} />
                                                </Button>
                                            )}

                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => handleDelete(lead.id, lead.customer_name)}
                                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-8 w-8 p-0"
                                                title="Permanently Delete Lead"
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
