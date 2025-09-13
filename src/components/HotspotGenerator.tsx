'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface Report {
  id: string;
  latitude: number;
  longitude: number;
  hazard_type: string;
  severity_score: number | null;
  created_at: string;
  status: string;
}

interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  intensity: number;
  radius: number;
  reportCount: number;
  avgSeverity: number;
  hazardTypes: string[];
  lastUpdated: string;
}

interface HotspotGeneratorProps {
  reports: Report[];
  onHotspotsChange: (hotspots: Hotspot[]) => void;
}

export function HotspotGenerator({ reports, onHotspotsChange }: HotspotGeneratorProps) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate hotspots based on report density and severity
  const generateHotspots = useMemo(() => {
    return (reports: Report[]): Hotspot[] => {
      if (reports.length === 0) return [];

      const hotspots: Hotspot[] = [];
      const processedReports = new Set<string>();

      // Group reports by proximity (within 5km)
      const CLUSTER_RADIUS = 0.05; // ~5km in degrees

      reports.forEach((report) => {
        if (processedReports.has(report.id)) return;

        const nearbyReports = reports.filter((otherReport) => {
          if (otherReport.id === report.id || processedReports.has(otherReport.id)) return false;
          
          const distance = calculateDistance(
            report.latitude, report.longitude,
            otherReport.latitude, otherReport.longitude
          );
          
          return distance <= CLUSTER_RADIUS;
        });

        if (nearbyReports.length >= 2) { // Minimum 3 reports for a hotspot
          const allReports = [report, ...nearbyReports];
          allReports.forEach(r => processedReports.add(r.id));

          const avgLat = allReports.reduce((sum, r) => sum + r.latitude, 0) / allReports.length;
          const avgLon = allReports.reduce((sum, r) => sum + r.longitude, 0) / allReports.length;
          
          const severityScores = allReports
            .map(r => r.severity_score)
            .filter(score => score !== null) as number[];
          
          const avgSeverity = severityScores.length > 0 
            ? severityScores.reduce((sum, score) => sum + score, 0) / severityScores.length 
            : 1;

          const hazardTypes = [...new Set(allReports.map(r => r.hazard_type))];
          
          // Calculate intensity based on report count, severity, and recency
          const recentReports = allReports.filter(r => 
            new Date(r.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          );
          
          const intensity = Math.min(10, 
            (allReports.length * 2) + 
            (avgSeverity * 1.5) + 
            (recentReports.length * 3)
          );

          const radius = Math.max(0.01, Math.min(0.1, intensity / 20)); // Dynamic radius

          hotspots.push({
            id: `hotspot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            latitude: avgLat,
            longitude: avgLon,
            intensity: Math.round(intensity),
            radius: radius,
            reportCount: allReports.length,
            avgSeverity: Math.round(avgSeverity * 10) / 10,
            hazardTypes,
            lastUpdated: new Date().toISOString()
          });
        }
      });

      // Sort by intensity (highest first)
      return hotspots.sort((a, b) => b.intensity - a.intensity);
    };
  }, []);

  // Calculate distance between two points in degrees
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    if (reports.length > 0) {
      setIsGenerating(true);
      
      // Debounce hotspot generation
      const timeoutId = setTimeout(() => {
        const newHotspots = generateHotspots(reports);
        setHotspots(newHotspots);
        onHotspotsChange(newHotspots);
        setIsGenerating(false);
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
      setHotspots([]);
      onHotspotsChange([]);
    }
  }, [reports, generateHotspots, onHotspotsChange]);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'text-red-600 bg-red-100';
    if (intensity >= 6) return 'text-orange-600 bg-orange-100';
    if (intensity >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getIntensityIcon = (intensity: number) => {
    if (intensity >= 8) return <Flame className="h-4 w-4" />;
    if (intensity >= 6) return <AlertTriangle className="h-4 w-4" />;
    if (intensity >= 4) return <Activity className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-600" />
          Dynamic Hotspots
          {isGenerating && (
            <Badge variant="outline" className="ml-auto">
              Generating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hotspots.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {isGenerating ? 'Analyzing reports...' : 'No hotspots detected. Need more reports in the area.'}
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {hotspots.slice(0, 5).map((hotspot) => (
              <div key={hotspot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getIntensityColor(hotspot.intensity)}`}>
                    {getIntensityIcon(hotspot.intensity)}
                  </div>
                  <div>
                    <p className="font-medium">
                      Intensity: {hotspot.intensity}/10
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hotspot.reportCount} reports • Avg severity: {hotspot.avgSeverity}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {hotspot.hazardTypes.slice(0, 2).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type.replace('-', ' ')}
                        </Badge>
                      ))}
                      {hotspot.hazardTypes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{hotspot.hazardTypes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(hotspot.lastUpdated).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Radius: {(hotspot.radius * 111).toFixed(1)}km
                  </p>
                </div>
              </div>
            ))}
            {hotspots.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                +{hotspots.length - 5} more hotspots
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
