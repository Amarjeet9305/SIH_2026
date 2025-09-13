'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { SocialFeed } from '@/components/SocialFeed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, LogOut, User, Settings, Bell, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { ssr: false });

export default function DashboardPage() {
    const [isFeedOpen, setIsFeedOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    // Monitor online status
    useState(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    });

    return (
        <main className="h-screen w-screen relative overflow-hidden bg-gray-50">
            {/* Enhanced Header */}
            <header className="absolute top-0 left-0 right-0 z-[6000] bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-6 w-6 text-blue-600" />
                            <h1 className="text-lg font-semibold">INCOIS Dashboard</h1>
                        </div>
                        {isOffline && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Offline Mode
                            </Badge>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                            <Bell className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="ghost" size="icon" onClick={() => setIsFeedOpen(!isFeedOpen)}>
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar_url} />
                                        <AvatarFallback>
                                            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="font-medium">{user?.full_name || 'User'}</p>
                                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Map Container */}
            <div className="h-full w-full pt-16">
                <DashboardMap />
            </div>
            
            {/* Enhanced Social Feed Panel */}
            <div className={`absolute top-16 right-0 h-[calc(100vh-4rem)] w-[400px] z-[5000] bg-white/95 backdrop-blur-sm border-l shadow-2xl transition-transform duration-300 ease-in-out ${isFeedOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Live Social Feed
                        </h2>
                        <p className="text-sm text-muted-foreground">Real-time hazard reports and social media activity</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <SocialFeed />
                    </div>
                </div>
            </div>
        </main>
    );
}