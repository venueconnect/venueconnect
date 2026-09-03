import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const getAdminSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgjoyxhcmqcsnmhwbkgi.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createSupabaseAdmin(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            occasion,
            city,
            budget_per_person,
            expected_guests,
            event_date,
            customer_name,
            customer_email,
            customer_phone
        } = body;

        // 1. Send to Google Sheets if configured
        const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
        if (sheetUrl) {
            try {
                await fetch(sheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(body)
                });
            } catch (sheetErr) {
                console.error("Sheet sync error:", sheetErr);
            }
        }

        // 2. Save directly to Database using Service Role (Bypasses RLS)
        const supabase = getAdminSupabase();
        const { data, error } = await supabase
            .from('user_requirements')
            .insert([{
                occasion,
                city,
                budget_per_person,
                expected_guests: parseInt(expected_guests) || 0,
                event_date,
                customer_name,
                customer_email,
                customer_phone
            }])
            .select();

        if (error) {
            console.error("Database requirement insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, requirement: data?.[0] });
    } catch (err: any) {
        console.error("Requirement API error:", err);
        return NextResponse.json({ error: err.message || "Failed to submit requirement" }, { status: 500 });
    }
}
