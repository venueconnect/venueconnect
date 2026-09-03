'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
    Check, X, Phone, Mail, Calendar, Building, User, 
    Search, RefreshCw, Filter, Sparkles, MessageSquare, MapPin 
} from "lucide-react";
import { format } from "date-fns";

export default function LeadsTab() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sourceFilter, setSourceFilter] = useState<'all' | 'requirement' | 'listing' | 'contact'>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchLeads();
    }, [sourceFilter]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/leads?source=${sourceFilter}`);
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

    const handleApprove = async (lead: any) => {
        const toastId = toast.loading("Approving lead...");
        try {
            const res = await fetch('/api/admin/leads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: lead.id, action: 'approve' })
            });
            const data = await res.json();
            if (res.ok) {
                toast.dismiss(toastId);
                toast.success("Lead approved and unlocked for lister!");
                fetchLeads();
            } else {
                toast.dismiss(toastId);
                throw new Error(data.error || "Approval failed");
            }
        } catch (error: any) {
            toast.dismiss(toastId);
            toast.error(error.message);
        }
    };

    const handleStatusChange = async (leadId: string, status: string) => {
        try {
            const res = await fetch('/api/admin/leads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, status })
            });
            if (res.ok) {
                toast.success(`Lead marked as ${status}`);
                fetchLeads();
            } else {
                toast.error("Failed to update status");
            }
        } catch (e) {
            toast.error("Status update error");
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

    const pendingCount = leads.filter(l => l.is_pending_approval).length;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-display">
                        Lead Management
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                        Incoming customer requirements, quote requests, and contact messages.
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
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-bold">
                        {pendingCount} Pending Approval
                    </Badge>
                </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
                    {[
                        { label: 'All Leads', val: 'all' },
                        { label: 'Homepage Requirements', val: 'requirement' },
                        { label: 'Listing Enquiries', val: 'listing' },
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
                        placeholder="Search name, phone, city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
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
                        <p className="text-xs text-slate-400">Try adjusting your search or source filters.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Target Listing / Source</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Plan / Quota</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Event Details & Message</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
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
                                            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 whitespace-pre-wrap">
                                                {lead.message || 'No additional details provided.'}
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="align-top py-4">
                                        <Badge 
                                            className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-lg border-none ${
                                                lead.is_pending_approval ? 'bg-amber-100 text-amber-800' :
                                                lead.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                                lead.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                                'bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {lead.is_pending_approval ? 'Pending Approval' : lead.status}
                                        </Badge>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="align-top py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {lead.is_pending_approval && (
                                                <>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleApprove(lead)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-8 px-2.5 text-xs font-bold gap-1"
                                                        title="Approve & Send to Lister"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(lead.id, 'rejected')}
                                                        className="text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl h-8 px-2 text-xs"
                                                        title="Reject Lead"
                                                    >
                                                        <X size={14} />
                                                    </Button>
                                                </>
                                            )}
                                            {!lead.is_pending_approval && lead.status !== 'contacted' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(lead.id, 'contacted')}
                                                    className="text-xs font-bold rounded-xl h-8 px-2.5 text-slate-600 hover:bg-slate-50"
                                                >
                                                    Mark Contacted
                                                </Button>
                                            )}
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
