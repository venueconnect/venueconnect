'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Phone, Mail, Calendar, Building, User } from "lucide-react";
import { format } from "date-fns";

const slugifyCity = (city?: string | null): string => {
    return (city || "").trim().toLowerCase().replace(/\s+/g, "-");
};

export default function LeadsTab() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const venueIds = Array.from(new Set(data.map((l: any) => l.listing_id))).filter(Boolean);
            if (venueIds.length > 0) {
                const [venuesRes, vendorsRes] = await Promise.all([
                    supabase.from('venues').select('id, name, slug, city, selected_plan, leads_used, leads_quota').in('id', venueIds),
                    supabase.from('vendors').select('id, name, slug, city, selected_plan, leads_used, leads_quota').in('id', venueIds)
                ]);

                const infoMap = new Map();
                venuesRes.data?.forEach((v: any) => infoMap.set(v.id, { ...v, type: 'venue' }));
                vendorsRes.data?.forEach((v: any) => infoMap.set(v.id, { ...v, type: 'vendor' }));

                const enrichedLeads = data.map((l: any) => {
                    const info = infoMap.get(l.listing_id) || {};
                    return {
                        ...l,
                        venue_name: info.name || 'Unknown Listing',
                        selected_plan: info.selected_plan || 'Starter',
                        leads_used: info.leads_used || 0,
                        leads_quota: info.leads_quota || 50,
                        listing_type: info.type,
                        slug: info.slug,
                        city: info.city
                    };
                });
                setLeads(enrichedLeads);
            } else {
                setLeads(data || []);
            }
        } catch (error: any) {
            toast.error("Failed to fetch leads");
            console.error("Fetch Leads Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (lead: any) => {
        try {
            // 1. Approve the lead
            const cleanEmail = lead.customer_email.replace('PENDING_ADMIN_', '');
            const { error: leadErr } = await supabase
                .from('leads')
                .update({ customer_email: cleanEmail })
                .eq('id', lead.id);

            if (leadErr) throw leadErr;

            // 2. Increment lead count for the listing
            if (lead.listing_id) {
                const { error: rpcError } = await supabase.rpc('increment_leads', { 
                    l_id: lead.listing_id, 
                    l_type: lead.listing_type || 'venue' 
                });
                if (rpcError) console.error("Quota update error:", rpcError);
            }

            toast.success("Lead approved and sent to venue owner");
            
            // Refresh leads to show updated stats
            fetchLeads();
        } catch (error) {
            console.error("Approval error:", error);
            toast.error("Approval failed");
        }
    };

    const handleReject = async (leadId: string) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: 'rejected' })
                .eq('id', leadId);

            if (error) throw error;
            toast.success("Lead rejected");
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'rejected' } : l));
        } catch (error) {
            toast.error("Rejection failed");
        }
    };

    if (loading) return <div className="p-20 text-center">Loading leads...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Lead Management</h2>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {leads.filter(l => l.customer_email?.startsWith('PENDING_ADMIN_')).length} Pending Approval
                </Badge>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Customer</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Target Listing</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Plan / Quota</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Event Details</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead: any) => (
                            <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-slate-900 flex items-center gap-2">
                                            <User size={14} className="text-slate-400" /> {lead.customer_name}
                                        </span>
                                        <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                                            <span className="flex items-center gap-1.5"><Phone size={12} /> {lead.customer_phone}</span>
                                            <span className="flex items-center gap-1.5"><Mail size={12} /> {lead.customer_email.replace('PENDING_ADMIN_', '')}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                            <Building size={14} className="text-primary shrink-0" />
                                            {lead.slug && lead.city ? (
                                                <Link 
                                                    href={`/${lead.listing_type || 'venue'}s/${slugifyCity(lead.city)}/${lead.slug}`}
                                                    target="_blank"
                                                    className="hover:text-primary hover:underline transition-colors truncate max-w-[150px]"
                                                >
                                                    {lead.venue_name}
                                                </Link>
                                            ) : (
                                                <span className="truncate max-w-[150px]">{lead.venue_name}</span>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="w-fit text-[9px] h-4 px-1.5 font-bold uppercase opacity-60">
                                            {lead.listing_type || 'Listing'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1.5">
                                        <Badge 
                                            className={`w-fit text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                                                lead.selected_plan?.toLowerCase() === 'premium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                lead.selected_plan?.toLowerCase() === 'growth' ? 'bg-green-100 text-green-700 border-green-200' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            {lead.selected_plan?.toUpperCase() || 'STARTER'}
                                        </Badge>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                                <span>Used: {lead.leads_used}</span>
                                                <span className="text-primary">Left: {Math.max(0, (lead.leads_quota || 0) - (lead.leads_used || 0))}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-primary h-full transition-all" 
                                                    style={{ width: `${Math.min(100, ((lead.leads_used || 0) / (lead.leads_quota || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-xs text-slate-600">
                                        <span className="flex items-center gap-1.5 font-bold">
                                            <Calendar size={12} /> {lead.event_date ? format(new Date(lead.event_date), 'MMM dd, yyyy') : 'TBD'}
                                        </span>
                                        <p className="line-clamp-2 max-w-xs italic text-slate-400">
                                            {lead.message}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-lg ${
                                            lead.customer_email.startsWith('PENDING_ADMIN_') ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            lead.status === 'new' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}
                                    >
                                        {lead.customer_email.startsWith('PENDING_ADMIN_') ? 'Pending Admin' : lead.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {lead.customer_email.startsWith('PENDING_ADMIN_') && (
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleApprove(lead)}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 w-9 p-0"
                                            >
                                                <Check size={18} />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleReject(lead.id)}
                                                className="text-red-500 border-red-100 hover:bg-red-50 rounded-xl h-9 w-9 p-0"
                                            >
                                                <X size={18} />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
