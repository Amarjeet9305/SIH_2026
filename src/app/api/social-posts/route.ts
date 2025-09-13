// src/app/api/social-posts/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('social_posts')
            .select('*')
            .eq('ai_analysis_complete', true)
            .eq('is_relevant', true)
            .order('post_timestamp', { ascending: false })
            .limit(20); // Get the 20 most recent relevant posts

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}