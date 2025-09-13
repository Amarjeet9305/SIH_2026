// src/app/api/analyze-social/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const AI_MODEL = "mistralai/mistral-7b-instruct:free";

async function analyzePostWithAI(postContent: string): Promise<{ is_relevant: boolean; sentiment: string }> {
    const prompt = `
        You are a social media analyst for a disaster management agency. Analyze the following social media post to determine if it is relevant to an ocean hazard and what its sentiment is.
        Post: "${postContent}"

        Your response MUST be a valid JSON object in the following format, and nothing else:
        {
          "is_relevant": boolean, // true if the post is about a real ocean hazard (tsunami, flood, high waves, etc.), false if it is spam, an ad, or irrelevant.
          "sentiment": "string" // "Positive", "Negative", or "Neutral".
        }
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            })
        });
        if (!response.ok) throw new Error(`OpenRouter API failed: ${response.statusText}`);
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("Error analyzing post with AI:", error);
        return { is_relevant: false, sentiment: 'Neutral' }; // Default on failure
    }
}

export async function GET() {
    try {
        // 1. Fetch posts that haven't been analyzed yet
        const { data: posts, error: fetchError } = await supabase
            .from('social_posts')
            .select('*')
            .eq('ai_analysis_complete', false)
            .limit(5);

        if (fetchError) throw fetchError;
        if (!posts || posts.length === 0) {
            return NextResponse.json({ message: "No new posts to analyze." });
        }

        // 2. Analyze each post and prepare updates
        const updatePromises = posts.map(async (post) => {
            const analysis = await analyzePostWithAI(post.post_content);
            return supabase
                .from('social_posts')
                .update({
                    is_relevant: analysis.is_relevant,
                    sentiment: analysis.sentiment,
                    ai_analysis_complete: true
                })
                .eq('id', post.id);
        });

        // 3. Execute all updates
        await Promise.all(updatePromises);

        return NextResponse.json({ message: `Successfully analyzed ${posts.length} posts.` });
    } catch (error: unknown) { // FIX: Changed 'any' to 'unknown' for type safety.
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}