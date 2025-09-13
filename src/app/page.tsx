'use client';

import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { EnhancedReportForm } from '@/components/EnhancedReportForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Shield, Users, Globe, AlertTriangle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            INCOIS Ocean Hazard Reporting Platform
          </p>
        </div>
        <AuthForm onAuthSuccess={() => window.location.reload()} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">INCOIS Platform</h1>
                <p className="text-sm text-gray-600">Ocean Hazard Reporting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden sm:flex">
                Welcome, {user.full_name || user.email}
              </Badge>
              <Link href="/dashboard">
                <Button variant="outline">
                  <Map className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Report Ocean Hazards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help protect coastal communities by reporting ocean hazards in real-time. 
              Your reports contribute to early warning systems and disaster preparedness.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multilingual Support</h3>
              <p className="text-gray-600">Report in your preferred language for better accessibility</p>
            </Card>
            <Card className="text-center p-6">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Alerts</h3>
              <p className="text-gray-600">Instant notifications and hazard mapping for quick response</p>
            </Card>
            <Card className="text-center p-6">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">Advanced NLP processing for threat assessment and verification</p>
            </Card>
          </div>

          {/* Report Form */}
          <EnhancedReportForm />
        </div>
      </section>
    </main>
  );
}