import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const getAdminSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgjoyxhcmqcsnmhwbkgi.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createSupabaseAdmin(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sourceFilter = searchParams.get('source') || 'all'; // 'all', 'requirements', 'listings', 'contact'
        const statusFilter = searchParams.get('status') || 'all';

        const supabase = getAdminSupabase();

        // 1. Fetch from 'leads' table
        let leadsQuery = supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
            leadsQuery = leadsQuery.eq('status', statusFilter);
        }

        const { data: rawLeads, error: leadsError } = await leadsQuery;
        if (leadsError) {
            console.error("Error fetching leads:", leadsError);
        }

        // 2. Fetch from 'user_requirements' table (Homepage Wizard Submissions)
        const { data: userReqs, error: reqsError } = await supabase
            .from('user_requirements')
            .select('*')
            .order('created_at', { ascending: false });

        if (reqsError) {
            console.error("Error fetching user_requirements:", reqsError);
        }

        // 3. Enrich listing leads with venue/vendor info
        const venueIds = Array.from(new Set((rawLeads || []).map((l: any) => l.listing_id))).filter(Boolean);
        const infoMap = new Map();

        if (venueIds.length > 0) {
            const [venuesRes, vendorsRes] = await Promise.all([
                supabase.from('venues').select('id, name, slug, city, selected_plan, leads_used, leads_quota').in('id', venueIds),
                supabase.from('vendors').select('id, name, slug, city, selected_plan, leads_used, leads_quota').in('id', venueIds)
            ]);

            venuesRes.data?.forEach((v: any) => infoMap.set(v.id, { ...v, type: 'venue' }));
            vendorsRes.data?.forEach((v: any) => infoMap.set(v.id, { ...v, type: 'vendor' }));
        }

        // 4. Format direct leads
        const formattedDirectLeads = (rawLeads || []).map((l: any) => {
            const info = infoMap.get(l.listing_id) || {};
            const isPlatform = !l.listing_id || l.listing_type === 'platform' || l.listing_type === 'general';
            const isContact = l.listing_type === 'contact';
            
            return {
                id: l.id,
                created_at: l.created_at,
                source: isContact ? 'contact' : isPlatform ? 'requirement' : 'listing',
                customer_name: l.customer_name || 'Anonymous User',
                customer_email: (l.customer_email || '').replace('PENDING_ADMIN_', ''),
                is_pending_approval: (l.customer_email || '').startsWith('PENDING_ADMIN_'),
                customer_phone: l.customer_phone || l.customer_mobile || 'N/A',
                event_date: l.event_date || null,
                message: l.message || '',
                status: l.status || 'new',
                listing_id: l.listing_id,
                listing_name: info.name || (isContact ? 'Contact Us Form' : isPlatform ? 'Homepage Requirement' : 'Direct Enquiry'),
                listing_type: info.type || l.listing_type || 'venue',
                city: info.city || null,
                selected_plan: info.selected_plan || 'Starter',
                leads_used: info.leads_used || 0,
                leads_quota: info.leads_quota || 50
            };
        });

        // 5. Format user_requirements (avoid duplicates if already present in leads table with same phone & date)
        const existingPhones = new Set(formattedDirectLeads.map((l: any) => `${l.customer_phone}_${l.created_at?.slice(0, 10)}`));

        const formattedRequirements = (userReqs || [])
            .filter((r: any) => !existingPhones.has(`${r.customer_phone}_${r.created_at?.slice(0, 10)}`))
            .map((r: any) => {
                const isContact = (r.occasion || '').startsWith('[Contact Form]');
                return {
                    id: `req_${r.id}`,
                    created_at: r.created_at,
                    source: isContact ? 'contact' : 'requirement',
                    customer_name: r.customer_name || 'Anonymous User',
                    customer_email: r.customer_email || 'N/A',
                    is_pending_approval: false,
                    customer_phone: r.customer_phone || 'N/A',
                    event_date: r.event_date || null,
                    message: isContact 
                        ? `${r.occasion} — ${r.budget_per_person || ''}` 
                        : `Occasion: ${r.occasion || 'N/A'} | City: ${r.city || 'Gujarat'} | Guests: ${r.expected_guests || 0} | Budget: ${r.budget_per_person || 'Standard'}`,
                    status: 'new',
                    listing_id: null,
                    listing_name: isContact ? 'Contact Us Form' : 'Homepage Requirement Wizard',
                    listing_type: 'platform',
                    city: r.city || 'Gujarat',
                    selected_plan: 'Platform',
                    leads_used: 0,
                    leads_quota: 0
                };
            });

        // Combine all leads and sort by creation date descending
        let allLeads = [...formattedDirectLeads, ...formattedRequirements];
        allLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Apply source filter if requested
        if (sourceFilter !== 'all') {
            allLeads = allLeads.filter(l => l.source === sourceFilter);
        }

        return NextResponse.json({ leads: allLeads, total: allLeads.length });
    } catch (error: any) {
        console.error("API /api/admin/leads error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { leadId, action, status } = body;

        if (!leadId) {
            return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
        }

        const supabase = getAdminSupabase();

        // If it's a user_requirements ID
        if (leadId.startsWith('req_')) {
            const realId = leadId.replace('req_', '');
            return NextResponse.json({ success: true, message: "Requirement acknowledged" });
        }

        // Standard lead in 'leads' table
        if (action === 'approve') {
            const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
            if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

            const cleanEmail = (lead.customer_email || '').replace('PENDING_ADMIN_', '');
            await supabase.from('leads').update({ customer_email: cleanEmail, status: 'approved' }).eq('id', leadId);

            if (lead.listing_id) {
                try {
                    await supabase.rpc('increment_leads', {
                        l_id: lead.listing_id,
                        l_type: lead.listing_type || 'venue'
                    });
                } catch (rpcErr) {
                    console.error("RPC increment error:", rpcErr);
                }
            }
            return NextResponse.json({ success: true, message: "Lead approved" });
        }

        if (status) {
            await supabase.from('leads').update({ status }).eq('id', leadId);
            return NextResponse.json({ success: true, message: "Status updated" });
        }

        return NextResponse.json({ error: "No action specified" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
