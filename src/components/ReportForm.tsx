// src/components/ReportForm.tsx
'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { MapPin, UploadCloud, Send } from 'lucide-react';

// Define the structure of our form data
interface FormData {
    latitude: number | null;
    longitude: number | null;
    hazard_type: string;
    description: string;
    image_file: File | null;
}

export function ReportForm() {
    const [formData, setFormData] = useState<FormData>({
        latitude: null,
        longitude: null,
        hazard_type: '',
        description: '',
        image_file: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLocationFetch = () => {
        setIsFetchingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({ ...prev, latitude: position.coords.latitude, longitude: position.coords.longitude }));
                    toast.success('Location captured successfully!');
                    setIsFetchingLocation(false);
                },
                (error) => {
                    console.error("Geolocation Error:", error);
                    toast.error('Could not get location. Please enable location services.');
                    setIsFetchingLocation(false);
                }
            );
        } else {
            toast.error('Geolocation is not supported by this browser.');
            setIsFetchingLocation(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!formData.latitude || !formData.longitude) {
            return toast.error('Please capture your location first.');
        }
        if (!formData.hazard_type) {
            return toast.error('Please select a hazard type.');
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting report...');

        try {
            const imageUrl = '';
            // Note: Full image upload logic to Supabase Storage would go here.
            
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    hazard_type: formData.hazard_type,
                    description: formData.description,
                    image_url: imageUrl,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit report');
            }

            toast.success('Hazard report submitted successfully!', { id: toastId });
            setFormData({ latitude: null, longitude: null, hazard_type: '', description: '', image_file: null });
            if(fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(`Submission failed: ${errorMessage}`, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" richColors />
            <Card className="w-full max-w-lg mx-auto shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Report Ocean Hazard</CardTitle>
                    <CardDescription className="text-center">Your report helps create a safer coast for everyone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* --- Location --- */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Your Location</Label>
                            <Button type="button" variant="outline" className="w-full" onClick={handleLocationFetch} disabled={isFetchingLocation}>
                                <MapPin className="mr-2 h-4 w-4" />
                                {isFetchingLocation ? 'Fetching...' : (formData.latitude ? 'Location Captured!' : 'Capture GPS Location')}
                            </Button>
                            {formData.latitude && (
                                <p className="text-xs text-muted-foreground text-center">
                                    Lat: {formData.latitude.toFixed(4)}, Lon: {formData.longitude?.toFixed(4)}
                                </p>
                            )}
                        </div>
                        
                        {/* --- Hazard Type --- */}
                        <div className="space-y-2">
                            <Label htmlFor="hazard-type">Type of Hazard</Label>
                            <Select onValueChange={(value: string) => setFormData(prev => ({...prev, hazard_type: value}))} value={formData.hazard_type}>
                                <SelectTrigger id="hazard-type">
                                    <SelectValue placeholder="Select a hazard..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high-waves">High Waves / Swell Surge</SelectItem>
                                    <SelectItem value="tsunami-sighting">Tsunami Sighting</SelectItem>
                                    {/* FIX: Corrected the closing tag from </unselectitem> to </SelectItem> */}
                                    <SelectItem value="coastal-flooding">Coastal Flooding</SelectItem>
                                    <SelectItem value="coastal-erosion">Coastal Erosion / Damage</SelectItem>
                                    <SelectItem value="unusual-tide">Unusual Tide / Sea Behaviour</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* --- Description --- */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" placeholder="e.g., Water has entered the fish market near the jetty." value={formData.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({...prev, description: e.target.value}))}/>
                        </div>

                        {/* --- Image Upload --- */}
                        <div className="space-y-2">
                            <Label htmlFor="image">Upload Photo/Video (Optional)</Label>
                             <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formData.image_file?.name || "PNG, JPG, MP4 (MAX. 10MB)"}</p>
                                    </div>
                                    <Input id="dropzone-file" type="file" className="hidden" ref={fileInputRef} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, image_file: e.target.files ? e.target.files[0] : null }))}/>
                                </label>
                            </div> 
                        </div>

                        {/* --- Submit Button --- */}
                        <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}