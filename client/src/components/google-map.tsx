import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";
import type { BusinessSummary, BusinessWithDetails } from "@shared/schema";

interface GoogleMapProps {
  businesses?: BusinessSummary[] | BusinessWithDetails[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
  selectedBusinessId?: string;
  onBusinessSelect?: (businessId: string) => void;
}

// Default center (New York City)
const DEFAULT_CENTER = { lat: 40.7589, lng: -73.9851 };

export default function GoogleMap({
  businesses = [],
  center = DEFAULT_CENTER,
  zoom = 13,
  height = "400px",
  className = "",
  selectedBusinessId,
  onBusinessSelect,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch API key from backend
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        
        if (!config.googleMapsApiKey) {
          console.error('Google Maps API key not found');
          setIsLoading(false);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
          setIsLoading(false);
        };
        
        script.onerror = () => {
          console.error('Failed to load Google Maps API');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setIsLoading(false);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    mapInstanceRef.current = map;
  }, [isLoaded, center, zoom]);

  // Update markers when businesses change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    businesses.forEach(business => {
      if (!business.latitude || !business.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: business.latitude, lng: business.longitude },
        map: mapInstanceRef.current,
        title: business.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${selectedBusinessId === business.id ? '#ef4444' : '#3b82f6'}" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16),
        }
      });

      // Add click handler
      marker.addListener('click', () => {
        if (onBusinessSelect) {
          onBusinessSelect(business.id);
        }
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${business.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${business.category.name}</p>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${business.address}</p>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #f59e0b;">★</span>
                <span style="font-size: 14px;">${Number(business.averageRating).toFixed(1)} (${business.reviewCount} reviews)</span>
              </div>
            </div>
          `
        });
        
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      
      if (markersRef.current.length === 1) {
        mapInstanceRef.current.setCenter(bounds.getCenter());
        mapInstanceRef.current.setZoom(15);
      } else {
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [businesses, isLoaded, selectedBusinessId, onBusinessSelect]);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Unable to load map</p>
          <p className="text-xs text-muted-foreground mt-1">Please check your internet connection</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height }}
      data-testid="google-map"
    />
  );
}