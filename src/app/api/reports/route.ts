// src/app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { analyzeReport } from '@/lib/ai';

// GET: Fetch all reports (REVISED AND FIXED)
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        // **FIX**: Instead of throwing the error, handle it directly.
        // This guarantees a response is always returned.
        if (error) {
            console.error('Supabase fetch error:', error.message);
            return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e) {
        // This catch block handles other unexpected server errors.
        const errorMessage = e instanceof Error ? e.message : 'An unexpected server error occurred';
        console.error('GET /api/reports general error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


// POST: Create a new report AND trigger AI analysis (Unchanged)
export async function POST(request: Request) {
    let reportId = '';
    try {
        const body = await request.json();
        const { latitude, longitude, hazard_type, description, image_url, video_url, severity, language, user_id } = body;

        if (!latitude || !longitude || !hazard_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: newReport, error: insertError } = await supabase
            .from('reports')
            .insert([{ 
                latitude, 
                longitude, 
                hazard_type, 
                description, 
                image_url,
                severity_score: severity || 1,
                status: 'pending'
            }])
            .select('id, description')
            .single();

        if (insertError) throw insertError;

        reportId = newReport.id;

        (async () => {
            try {
                const aiResult = await analyzeReport(newReport.description);
                if (aiResult.is_valid_hazard) {
                    const { error: updateError } = await supabase
                        .from('reports')
                        .update({ 
                            severity_score: aiResult.severity_score,
                            ai_reasoning: aiResult.reasoning,
                            status: 'verified'
                        })
                        .eq('id', reportId);

                    if (updateError) {
                        console.error(`Failed to update report ${reportId} with AI data:`, updateError.message);
                    }
                } else {
                     await supabase.from('reports').update({ status: 'rejected' }).eq('id', reportId);
                }
            } catch (aiError) {
                console.error(`Background AI analysis failed for report ${reportId}:`, aiError);
            }
        })();

        return NextResponse.json(newReport, { status: 201 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('POST /api/reports Error:', errorMessage);
        return NextResponse.json({ error: `Failed to create report: ${errorMessage}` }, { status: 500 });
    }
}