'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { SocialFeed } from '@/components/SocialFeed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, LogOut, User, Settings, Bell, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { ssr: false });

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: string;
    read: boolean;
}

export default function DashboardPage() {
    const [isFeedOpen, setIsFeedOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(false); // Start with false to avoid hydration mismatch
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    // Initialize sample notifications
    useEffect(() => {
        const sampleNotifications: Notification[] = [
            {
                id: '1',
                title: 'New Hazard Report',
                message: 'High wave alert reported in Mumbai coastal area',
                type: 'warning',
                timestamp: new Date().toISOString(),
                read: false
            },
            {
                id: '2',
                title: 'System Update',
                message: 'Platform updated with new multilingual support',
                type: 'info',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                read: false
            },
            {
                id: '3',
                title: 'Data Sync Complete',
                message: 'Offline reports successfully synchronized',
                type: 'success',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                read: true
            },
            {
                id: '4',
                title: 'API Maintenance',
                message: 'Scheduled maintenance completed successfully',
                type: 'info',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                read: true
            }
        ];
        
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.read).length);
    }, []);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Monitor online status
    useEffect(() => {
        if (!isClient) return;
        
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        
        // Set initial online status
        setIsOffline(!navigator.onLine);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isClient]);

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
                        {isClient && isOffline && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Offline Mode
                            </Badge>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <Badge 
                                            variant="destructive" 
                                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80" align="end">
                                <div className="flex items-center justify-between p-2">
                                    <h3 className="font-semibold">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={markAllAsRead}
                                            className="text-xs"
                                        >
                                            Mark all read
                                        </Button>
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-muted-foreground">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <DropdownMenuItem 
                                                key={notification.id}
                                                className="p-3 cursor-pointer"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className="flex items-start space-x-3 w-full">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(notification.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
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