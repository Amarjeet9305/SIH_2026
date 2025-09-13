// src/app/api/simulate-social/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Predefined templates and data for generating posts
const locations = ['Chennai', 'Kolkata', 'Mumbai', 'Goa', 'Visakhapatnam', 'Puri'];
const usernames = ['CoastalWatch', 'OceanAlerts', 'User123', 'MarineLife', 'DeepSeaDave', 'CityReporter'];
const templates = [
    { hazard: 'high-waves', text: "Just saw some massive waves near {location} beach! Stay safe everyone. #HighWaves" },
    { hazard: 'coastal-flooding', text: "Reports of #CoastalFlooding in the low-lying areas of {location}. Is anyone else experiencing this?" },
    { hazard: 'unusual-tide', text: "The tide in {location} seems unusually low today, is this normal? #Ocean" },
    { hazard: 'spam', text: "Check out this great new crypto! #NotARealHazard" },
    { hazard: 'tsunami-sighting', text: "Just got a tsunami alert on my phone for the {location} coast. Taking it seriously and moving inland. #Tsunami" },
    { hazard: 'spam', text: "Best vacation deals for {location}! Book now!" }
];

// FIX: Made the function generic to be fully type-safe and avoid 'any'.
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export async function GET() {
    try {
        const newPosts = [];
        for (let i = 0; i < 10; i++) {
            const template = getRandom(templates);
            const location = getRandom(locations);
            const username = getRandom(usernames);
            
            newPosts.push({
                username: `${username}${Math.floor(Math.random() * 100)}`,
                post_content: template.text.replace('{location}', location),
                location_tag: location,
                mentioned_hazard: template.hazard !== 'spam' ? template.hazard : null
            });
        }

        const { error } = await supabase.from('social_posts').insert(newPosts);
        if (error) throw error;

        return NextResponse.json({ message: `${newPosts.length} mock social media posts created successfully!` });

    } catch (error: unknown) { // FIX: Changed 'any' to 'unknown' for type safety.
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}