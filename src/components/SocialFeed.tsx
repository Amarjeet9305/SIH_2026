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
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        const interval = setInterval(fetchPosts, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="h-full w-full flex flex-col shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    Live Social Media Feed
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0">
                <ScrollArea className="h-full p-6">
                    {loading && <p>Loading feed...</p>}
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div key={post.id} className="p-4 rounded-lg border bg-card text-card-foreground">
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
                                <p className="text-sm">{post.post_content}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}