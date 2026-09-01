import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
        const status = searchParams.get('status') || 'pending';
        const type = searchParams.get('type') || 'all';

        const supabase = getAdminSupabase();
        let query = supabase
            .from('venue_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        if (type !== 'all') {
            if (type === 'venue') {
                query = query.neq('venue_type', 'vendor');
            } else if (type === 'vendor') {
                query = query.eq('venue_type', 'vendor');
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching applications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ applications: data || [] });
    } catch (error: any) {
        console.error('Applications API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { applicationId, status } = body;

        if (!applicationId || !status) {
            return NextResponse.json({ error: 'Missing applicationId or status' }, { status: 400 });
        }

        const supabase = getAdminSupabase();
        const { data, error } = await supabase
            .from('venue_applications')
            .update({ status })
            .eq('id', applicationId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, application: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
