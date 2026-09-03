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
        const { firstName, lastName, email, subject, message } = body;

        const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous Visitor';

        // 1. Send to Google Sheets if configured
        const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
        if (sheetUrl) {
            try {
                await fetch(sheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'General Contact Inquiry',
                        name: fullName,
                        email: email || '',
                        subject: subject || '',
                        message: message || '',
                        timestamp: new Date().toISOString()
                    })
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
                occasion: `[Contact Form] ${subject || 'General Inquiry'}`,
                city: 'Gujarat',
                budget_per_person: message || 'No message provided',
                customer_name: fullName,
                customer_email: email || 'N/A',
                customer_phone: 'N/A',
                expected_guests: 0,
                event_date: null
            }])
            .select();

        if (error) {
            console.error("Database insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, lead: data?.[0] });
    } catch (err: any) {
        console.error("Contact API error:", err);
        return NextResponse.json({ error: err.message || "Failed to submit message" }, { status: 500 });
    }
}
