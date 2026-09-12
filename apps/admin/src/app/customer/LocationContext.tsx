'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CustomerAddress {
  id: string;
  name: string;
  tag: 'Home' | 'Work' | 'GPS' | 'Other';
  desc: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  locality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface LocationError {
  title: string;
  message: string;
  code?: number;
}

interface LocationContextType {
  selectedLocation: CustomerAddress;
  savedLocations: CustomerAddress[];
  isDetecting: boolean;
  detectionError: LocationError | null;
  detectionSuccess: boolean;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  detectLocation: () => Promise<CustomerAddress | null>;
  selectLocation: (location: CustomerAddress) => void;
  addCustomAddress: (fullAddress: string, tag?: 'Home' | 'Work' | 'Other') => CustomerAddress;
  searchAddress: (query: string) => Promise<CustomerAddress[]>;
  clearDetectionError: () => void;
}

const DEFAULT_SAVED_LOCATIONS: CustomerAddress[] = [
  {
    id: 'addr-home-default',
    name: 'Koramangala, Bengaluru',
    tag: 'Home',
    desc: '5th Block, Koramangala, Bengaluru 560095',
    fullAddress: '5th Block, Koramangala, Bengaluru 560095',
    locality: 'Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560095',
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    id: 'addr-work-default',
    name: 'Indiranagar, Bengaluru',
    tag: 'Work',
    desc: '100 Feet Road, Indiranagar, Bengaluru 560038',
    fullAddress: '100 Feet Road, Indiranagar, Bengaluru 560038',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    latitude: 12.9784,
    longitude: 77.6408,
  },
  {
    id: 'addr-other-default',
    name: 'Lavelle Road, Bengaluru',
    tag: 'Other',
    desc: 'UB City, Vittal Mallya Road, 560001',
    fullAddress: 'UB City, Vittal Mallya Road, Bengaluru 560001',
    locality: 'Lavelle Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    latitude: 12.9719,
    longitude: 77.5977,
  },
];

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [savedLocations, setSavedLocations] = useState<CustomerAddress[]>(DEFAULT_SAVED_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<CustomerAddress>(DEFAULT_SAVED_LOCATIONS[0]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<LocationError | null>(null);
  const [detectionSuccess, setDetectionSuccess] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Restore saved locations & selected location from localStorage on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedSaved = localStorage.getItem('qb_customer_saved_locations');
      if (storedSaved) {
        const parsed = JSON.parse(storedSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedLocations(parsed);
        }
      }

      const storedSelected = localStorage.getItem('qb_customer_location');
      if (storedSelected) {
        const parsed = JSON.parse(storedSelected);
        if (parsed && parsed.name) {
          setSelectedLocation(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved location from storage', e);
    }
  }, []);

  const selectLocation = useCallback((loc: CustomerAddress) => {
    setSelectedLocation(loc);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('qb_customer_location', JSON.stringify(loc));
      } catch {}
    }
  }, []);

  const clearDetectionError = useCallback(() => {
    setDetectionError(null);
  }, []);

  // Real GPS Location Detection Implementation
  const detectLocation = useCallback(async (): Promise<CustomerAddress | null> => {
    if (isDetecting) return null; // Prevent repeated duplicate triggers

    setDetectionError(null);
    setDetectionSuccess(false);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setDetectionError({
        title: 'Location not supported',
        message: 'Your browser or device does not support GPS location detection. Please select or enter your address manually.',
      });
      return null;
    }

    setIsDetecting(true);

    return new Promise((resolve) => {
      console.log('[GPS] Location request started');

      const geoSuccess = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        console.log(`[GPS] Location received: lat=${latitude}, lng=${longitude}`);

        try {
          console.log('[GPS] Reverse geocoding started...');
          // Fetch reverse geocoded address from our internal API route
          const res = await fetch(`/api/customer/geocode?lat=${latitude}&lng=${longitude}`);
          
          let addressData: any = null;
          if (res.ok) {
            addressData = await res.json();
          } else {
            // Direct client fallback to Nominatim if API route was not reachable
            const directRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            if (directRes.ok) {
              const raw = await directRes.json();
              const addr = raw.address || {};
              const locality = addr.suburb || addr.neighbourhood || addr.road || addr.village || '';
              const city = addr.city || addr.town || addr.municipality || '';
              addressData = {
                name: locality && city ? `${locality}, ${city}` : (locality || city || 'Current Location'),
                desc: raw.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                fullAddress: raw.display_name || '',
                locality,
                city,
                state: addr.state || '',
                postalCode: addr.postcode || '',
                latitude,
                longitude,
              };
            }
          }

          if (!addressData || !addressData.name) {
            throw new Error('Could not parse address from coordinates');
          }

          console.log('[GPS] Address received:', addressData.name);

          const gpsAddress: CustomerAddress = {
            id: `gps-current`,
            name: addressData.name,
            tag: 'GPS',
            desc: addressData.desc || addressData.fullAddress || `${addressData.name}`,
            fullAddress: addressData.fullAddress || addressData.desc || addressData.name,
            locality: addressData.locality,
            city: addressData.city,
            state: addressData.state,
            postalCode: addressData.postalCode,
            latitude,
            longitude,
          };

          // Save and propagate location
          selectLocation(gpsAddress);

          // Update saved locations list with new GPS location at the top
          setSavedLocations((prev) => {
            const filtered = prev.filter((item) => item.id !== 'gps-current');
            const updated = [gpsAddress, ...filtered];
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('qb_customer_saved_locations', JSON.stringify(updated));
              } catch {}
            }
            return updated;
          });

          console.log('[GPS] Location saved successfully');
          setDetectionSuccess(true);
          setIsDetecting(false);

          // Return resolved address
          resolve(gpsAddress);
        } catch (err: any) {
          console.error('[GPS] Geocoding error:', err);
          
          // Provide clean fallback with real coordinates
          const fallbackGps: CustomerAddress = {
            id: `gps-current`,
            name: `Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
            tag: 'GPS',
            desc: `Current GPS Coordinates (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
            fullAddress: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            latitude,
            longitude,
          };

          selectLocation(fallbackGps);
          setSavedLocations((prev) => [fallbackGps, ...prev.filter((i) => i.id !== 'gps-current')]);
          setDetectionSuccess(true);
          setIsDetecting(false);
          resolve(fallbackGps);
        }
      };

      const geoError = (err: GeolocationPositionError) => {
        setIsDetecting(false);
        setDetectionSuccess(false);
        console.warn(`[GPS] GeolocationPositionError (${err.code}):`, err.message);

        switch (err.code) {
          case 1: // PERMISSION_DENIED
            setDetectionError({
              title: 'Location access is required',
              message: 'Please allow location permission in your browser or device settings and try again.',
              code: 1,
            });
            break;
          case 2: // POSITION_UNAVAILABLE
            setDetectionError({
              title: 'Location services unavailable',
              message: 'GPS signal could not be acquired. Please ensure location services are enabled on your device.',
              code: 2,
            });
            break;
          case 3: // TIMEOUT
            setDetectionError({
              title: 'Unable to detect location',
              message: 'Location request timed out. Please try again or select your delivery address manually.',
              code: 3,
            });
            break;
          default:
            setDetectionError({
              title: 'Could not detect location',
              message: 'An unexpected error occurred while finding your GPS position. Please try again.',
            });
            break;
        }

        resolve(null);
      };

      // Call browser/device geolocation
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      });
    });
  }, [isDetecting, selectLocation]);

  const addCustomAddress = useCallback((fullAddress: string, tag: 'Home' | 'Work' | 'Other' = 'Other'): CustomerAddress => {
    const parts = fullAddress.split(',').map((s) => s.trim());
    const name = parts.length > 1 ? `${parts[0]}, ${parts[1]}` : parts[0];

    const newAddress: CustomerAddress = {
      id: `addr-custom-${Date.now()}`,
      name,
      tag,
      desc: fullAddress,
      fullAddress,
    };

    setSavedLocations((prev) => {
      const updated = [newAddress, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('qb_customer_saved_locations', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    selectLocation(newAddress);
    return newAddress;
  }, [selectLocation]);

  const searchAddress = useCallback(async (query: string): Promise<CustomerAddress[]> => {
    if (!query.trim() || query.length < 2) return [];

    try {
      const res = await fetch(`/api/customer/geocode?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        return (data.results || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          tag: 'Other' as const,
          desc: item.desc,
          fullAddress: item.fullAddress,
          locality: item.locality,
          city: item.city,
          state: item.state,
          postalCode: item.postalCode,
          latitude: item.latitude,
          longitude: item.longitude,
        }));
      }
    } catch (e) {
      console.warn('Address search failed:', e);
    }
    return [];
  }, []);

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        savedLocations,
        isDetecting,
        detectionError,
        detectionSuccess,
        isLocationModalOpen,
        setIsLocationModalOpen,
        detectLocation,
        selectLocation,
        addCustomAddress,
        searchAddress,
        clearDetectionError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
};
