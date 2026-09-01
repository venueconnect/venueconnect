import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const getAdminSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgjoyxhcmqcsnmhwbkgi.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createSupabaseAdmin(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
};

export async function GET() {
  const supabase = getAdminSupabase();

  try {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Total Venues
    const { count: totalVenues } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true });

    // 2. Total Vendors
    const { count: totalVendors } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });

    // 3. Pending Applications
    const { count: pendingApplications } = await supabase
      .from('venue_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 4. New This Week (Venues + Vendors)
    const { count: newVenues } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastWeek);
    
    const { count: newVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastWeek);

    // 5. Recent Activity (Last 10 status changes or submissions)
    const { data: activity } = await supabase
        .from('venue_applications')
        .select('id, business_name, status, created_at, venue_type')
        .order('created_at', { ascending: false })
        .limit(10);

    return NextResponse.json({
      totalVenues: totalVenues || 0,
      totalVendors: totalVendors || 0,
      pendingApplications: pendingApplications || 0,
      newThisWeek: (newVenues || 0) + (newVendors || 0),
      recentActivity: activity || []
    });
  } catch (error: any) {
    console.error('Stats route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
