'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { MapPin, UploadCloud, Send, Camera, Video, FileText, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { offlineManager, setupOfflineSync } from '@/lib/offline';

interface FormData {
  latitude: number | null;
  longitude: number | null;
  hazard_type: string;
  description: string;
  image_file: File | null;
  video_file: File | null;
  severity: number;
  language: string;
}

export function EnhancedReportForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    latitude: null,
    longitude: null,
    hazard_type: '',
    description: '',
    image_file: null,
    video_file: null,
    severity: 1,
    language: 'en',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' },
  ];

  const handleLocationFetch = () => {
    setIsFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({ 
            ...prev, 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
          }));
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'image') {
        setFormData(prev => ({ ...prev, image_file: file, video_file: null }));
      } else {
        setFormData(prev => ({ ...prev, video_file: file, image_file: null }));
      }
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
    const toastId = toast.loading(isOffline ? 'Saving offline...' : 'Submitting report...');

    try {
      let imageUrl = '';
      let videoUrl = '';

      // Upload media files if present and online
      if (!isOffline) {
        if (formData.image_file) {
          const formData_upload = new FormData();
          formData_upload.append('file', formData.image_file);
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData_upload,
          });
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        }

        if (formData.video_file) {
          const formData_upload = new FormData();
          formData_upload.append('file', formData.video_file);
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData_upload,
          });
          const uploadData = await uploadResponse.json();
          videoUrl = uploadData.url;
        }
      }

      const reportData = {
        latitude: formData.latitude,
        longitude: formData.longitude,
        hazard_type: formData.hazard_type,
        description: formData.description,
        image_url: imageUrl,
        video_url: videoUrl,
        severity: formData.severity,
        language: formData.language,
        user_id: user?.id,
      };

      if (isOffline) {
        // Save to offline storage
        await offlineManager.saveReport(reportData);
        toast.success('Report saved offline. Will sync when connected!', { id: toastId });
      } else {
        // Submit online
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit report');
        }

        toast.success('Hazard report submitted successfully!', { id: toastId });
      }

      setFormData({ 
        latitude: null, 
        longitude: null, 
        hazard_type: '', 
        description: '', 
        image_file: null,
        video_file: null,
        severity: 1,
        language: 'en',
      });
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
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Globe className="h-6 w-6" />
            Report Ocean Hazard
          </CardTitle>
          <CardDescription className="text-center">
            Your report helps create a safer coast for everyone. Available in multiple languages.
          </CardDescription>
          {isOffline && (
            <Badge variant="outline" className="mx-auto w-fit">
              Offline Mode - Will sync when connected
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="language">Language / भाषा</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({...prev, language: value}))}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
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
            
            {/* Hazard Type */}
            <div className="space-y-2">
              <Label htmlFor="hazard-type">Type of Hazard</Label>
              <Select onValueChange={(value: string) => setFormData(prev => ({...prev, hazard_type: value}))} value={formData.hazard_type}>
                <SelectTrigger id="hazard-type">
                  <SelectValue placeholder="Select a hazard..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-waves">High Waves / Swell Surge</SelectItem>
                  <SelectItem value="tsunami-sighting">Tsunami Sighting</SelectItem>
                  <SelectItem value="coastal-flooding">Coastal Flooding</SelectItem>
                  <SelectItem value="coastal-erosion">Coastal Erosion / Damage</SelectItem>
                  <SelectItem value="unusual-tide">Unusual Tide / Sea Behaviour</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level: {formData.severity}/10</Label>
              <Input
                id="severity"
                type="range"
                min="1"
                max="10"
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({...prev, severity: parseInt(e.target.value)}))}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="e.g., Water has entered the fish market near the jetty." 
                value={formData.description} 
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({...prev, description: e.target.value}))}
                rows={3}
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
              <Label>Upload Media (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photo
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {formData.image_file?.name || "PNG, JPG (MAX. 10MB)"}
                        </p>
                      </div>
                      <Input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'image')}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-upload" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {formData.video_file?.name || "MP4 (MAX. 50MB)"}
                        </p>
                      </div>
                      <Input 
                        id="video-upload" 
                        type="file" 
                        accept="video/*"
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 'video')}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
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
