'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
// FIX: Removed unused 'TileLayer' import
import { MapContainer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet.markercluster';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Report {
    id: string;
    latitude: number;
    longitude: number;
    hazard_type: string;
    description: string;
    created_at: string;
    severity_score: number | null;
}

const getHazardIcon = (hazardType: string, severity: number | null) => {
    let emoji = '❓';
    let colorHex = '#9ca3af';
    let animationTag = '';
    let animationStyleAttribute = '';
    switch (hazardType) {
        case 'tsunami-sighting': emoji = '🚨'; colorHex = '#ef4444'; break;
        case 'high-waves': emoji = '🌊'; colorHex = '#3b82f6'; break;
        case 'coastal-flooding': emoji = '💧'; colorHex = '#22d3ee'; break;
        case 'coastal-erosion': emoji = '🚧'; colorHex = '#f59e0b'; break;
        case 'unusual-tide': emoji = '⚠️'; colorHex = '#f97316'; break;
        default: emoji = '📢'; break;
    }
    if (severity && severity > 7) {
        animationTag = `<style>@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }</style>`;
        animationStyleAttribute = `style="animation: pulse 1.5s ease-in-out infinite;"`;
    }
    const svgString = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.4)" /></filter>${animationTag}</defs><circle cx="20" cy="20" r="16" fill="${colorHex}" filter="url(#shadow)" ${animationStyleAttribute} /><text x="50%" y="50%" font-size="22" dominant-baseline="central" text-anchor="middle" dy=".1em">${emoji}</text></svg>`;
    const iconUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
};

function MarkerClusterController({ reports }: { reports: Report[] }) {
    const map = useMap();
    const clusterLayerRef = useRef<L.MarkerClusterGroup | null>(null);
    useEffect(() => {
        if (clusterLayerRef.current) {
            map.removeLayer(clusterLayerRef.current);
        }
        if (reports.length === 0) return;
        const markers = L.markerClusterGroup();
        reports.forEach(report => {
            const icon = getHazardIcon(report.hazard_type, report.severity_score);
            const marker = L.marker([report.latitude, report.longitude], { icon });
            const popupContent = `<div class="font-sans"><h3 class="font-bold text-md capitalize">${report.hazard_type.replace(/-/g, ' ')}</h3>${report.severity_score ? `<p class="text-sm font-bold">Severity: ${report.severity_score}/10</p>` : ''}<p class="text-sm my-1">${report.description || "No description provided."}</p><p class="text-xs text-gray-500">Reported at: ${new Date(report.created_at).toLocaleString()}</p></div>`;
            marker.bindPopup(popupContent);
            markers.addLayer(marker);
        });
        map.addLayer(markers);
        clusterLayerRef.current = markers;
        return () => {
            if (clusterLayerRef.current) {
                map.removeLayer(clusterLayerRef.current);
            }
        };
    }, [map, reports]);
    return null;
}

function HeatmapController({ points }: { points: L.LatLngExpression[] }) {
    const map = useMap();
    const heatLayerRef = useRef<L.HeatLayer | null>(null);
    useEffect(() => {
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }
        if (points.length > 0) {
            const pointsWithIntensity = points.map(p => [...(p as [number, number]), 1]) as L.HeatLatLngTuple[];
            
            // FIX: Added eslint-disable comment to allow the 'any' type cast here.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            heatLayerRef.current = (L as any).heatLayer(pointsWithIntensity, {
                radius: 25, blur: 15, maxZoom: 18,
                gradient: { 0.4: 'yellow', 0.8: 'orange', 1.0: 'red' }
            }).addTo(map);
        }
        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [map, points]);
    return null;
}

function LayersController() {
    const map = useMap();
    useEffect(() => {
        const baseLayers = {
            "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }),
            "Satellite View": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' }),
            "Dark Mode": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' })
        };
        baseLayers["Street Map"].addTo(map);
        const control = L.control.layers(baseLayers, undefined, { position: 'topright' }).addTo(map);
        return () => {
            map.removeControl(control);
        };
    }, [map]);
    return null;
}

export default function DashboardMap() {
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hazardFilter, setHazardFilter] = useState<string>('all');
    const [severityFilter, setSeverityFilter] = useState<number[]>([1]);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const filterPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('/api/reports');
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();
                setAllReports(data);
            } catch (err) { setError(err instanceof Error ? err.message : 'An unknown error'); } 
            finally { setLoading(false); }
        };
        fetchReports();
        const interval = setInterval(fetchReports, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (filterPanelRef.current) {
            L.DomEvent.disableClickPropagation(filterPanelRef.current);
        }
    }, []);

    const filteredReports = useMemo(() => {
        return allReports.filter(report => {
            const hazardMatch = hazardFilter === 'all' || report.hazard_type === hazardFilter;
            const severityMatch = !report.severity_score || report.severity_score >= severityFilter[0];
            return hazardMatch && severityMatch;
        });
    }, [allReports, hazardFilter, severityFilter]);

    if (loading) return <div className="flex items-center justify-center h-full">Loading map data...</div>;
    if (error) return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;

    return (
        <div className="relative h-full w-full bg-gray-100">
            <Button variant="secondary" size="icon" onClick={() => setIsPanelOpen(!isPanelOpen)} className="absolute top-4 left-4 z-[5000] shadow-lg">
                <Filter className="h-4 w-4" />
            </Button>

            <Card ref={filterPanelRef} className={`absolute top-4 left-4 z-[4999] w-72 shadow-lg bg-white/80 backdrop-blur-sm transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-14' : '-translate-x-full'}`}>
                <CardHeader>
                    <CardTitle>INCOIS Hazard Dashboard</CardTitle>
                    <CardDescription>Filter & View Options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="hazard-filter">Hazard Type</Label>
                        <Select value={hazardFilter} onValueChange={setHazardFilter}>
                            <SelectTrigger id="hazard-filter"><SelectValue placeholder="Select Hazard Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="tsunami-sighting">Tsunami Sighting</SelectItem>
                                <SelectItem value="high-waves">High Waves</SelectItem>
                                <SelectItem value="coastal-flooding">Coastal Flooding</SelectItem>
                                <SelectItem value="coastal-erosion">Coastal Erosion</SelectItem>
                                <SelectItem value="unusual-tide">Unusual Tide</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Minimum Severity: {severityFilter[0]}</Label>
                        <Slider min={1} max={10} step={1} value={severityFilter} onValueChange={setSeverityFilter} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <Label htmlFor="heatmap-toggle" className="font-medium">Show Heatmap</Label>
                        <Switch id="heatmap-toggle" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                    </div>
                </CardContent>
            </Card>

            <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <LayersController />
                {showHeatmap 
                    ? <HeatmapController points={filteredReports.map(r => [r.latitude, r.longitude])} />
                    : <MarkerClusterController reports={filteredReports} />
                }
            </MapContainer>
        </div>
    );
}