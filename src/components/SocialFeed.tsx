// src/components/SocialFeed.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SocialPost {
    id: string;
    username: string;
    post_content: string;
    location_tag: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    post_timestamp: string;
}

const sentimentColor = {
    Positive: 'bg-green-500',
    Negative: 'bg-red-500',
    Neutral: 'bg-gray-500',
};

export function SocialFeed() {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/social-posts');
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch social posts:", error);
                // Add sample data for testing if API fails
                setPosts([
                    {
                        id: '1',
                        username: 'DeepSeaDave78',
                        post_content: 'The tide in Mumbai seems unusually low today, is this normal? #Ocean #Mumbai',
                        location_tag: 'Mumbai',
                        sentiment: 'Neutral',
                        post_timestamp: new Date().toISOString()
                    },
                    {
                        id: '2',
                        username: 'CityReporter73',
                        post_content: 'The tide in Visakhapatnam seems unusually low today, is this normal? #Ocean #Visakhapatnam',
                        location_tag: 'Visakhapatnam',
                        sentiment: 'Neutral',
                        post_timestamp: new Date(Date.now() - 300000).toISOString()
                    },
                    {
                        id: '3',
                        username: 'CoastalWatch23',
                        post_content: 'Reports of #CoastalFlooding in the low-lying areas of Mumbai. Is anyone else experiencing this?',
                        location_tag: 'Mumbai',
                        sentiment: 'Negative',
                        post_timestamp: new Date(Date.now() - 600000).toISOString()
                    },
                    {
                        id: '4',
                        username: 'MarineLife30',
                        post_content: 'Reports of #CoastalFlooding in the low-lying areas of Chennai. Stay safe everyone!',
                        location_tag: 'Chennai',
                        sentiment: 'Negative',
                        post_timestamp: new Date(Date.now() - 900000).toISOString()
                    },
                    {
                        id: '5',
                        username: 'OceanGuardian45',
                        post_content: 'Beautiful sunset at Goa beach today. No unusual activity detected. #Goa #BeachSafety',
                        location_tag: 'Goa',
                        sentiment: 'Positive',
                        post_timestamp: new Date(Date.now() - 1200000).toISOString()
                    },
                    {
                        id: '6',
                        username: 'TideWatcher12',
                        post_content: 'High tide warning for Kochi area. Please avoid coastal roads during peak hours.',
                        location_tag: 'Kochi',
                        sentiment: 'Negative',
                        post_timestamp: new Date(Date.now() - 1500000).toISOString()
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        const interval = setInterval(fetchPosts, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="p-4 border-b bg-white">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    Live Social Media Feed
                </h2>
                <p className="text-sm text-muted-foreground">Real-time hazard reports and social media activity</p>
            </div>
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-muted-foreground">Loading feed...</p>
                            </div>
                        )}
                        {!loading && posts.length === 0 && (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-muted-foreground">No posts available</p>
                            </div>
                        )}
                        {posts.map((post) => (
                            <div key={post.id} className="p-4 rounded-lg border bg-card text-card-foreground hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <p className="font-bold">@{post.username}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(post.post_timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">{post.location_tag}</Badge>
                                        <span className={`w-3 h-3 rounded-full ${sentimentColor[post.sentiment]}`} title={`Sentiment: ${post.sentiment}`}></span>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed">{post.post_content}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}