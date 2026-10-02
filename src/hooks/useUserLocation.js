import { useState, useEffect, useCallback } from 'react';
import { reverseGeocode, geocodeManualLocation } from '../services/locationService';

const LOCATION_STORAGE_KEY = 'road_reality_manual_location';
const COORDINATE_LABEL = /^-?\d+(?:\.\d+)?°/;

export function useUserLocation(autoFetch = true) {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Older saved GPS locations used coordinates as the displayed place name.
      if (COORDINATE_LABEL.test(parsed.placeName || '')) {
        return { ...parsed, placeName: '' };
      }
      return parsed;
    } catch (_) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState(location?.isManual ? 'manual' : 'prompt');

  // Resolve old cached GPS entries that only contain a coordinate label.
  useEffect(() => {
    if (!location || location.isManual || location.placeName || !location.latitude || !location.longitude) return;

    let active = true;
    setLoading(true);
    reverseGeocode(location.latitude, location.longitude)
      .then((result) => {
        if (!active) return;
        const updatedLocation = {
          ...location,
          placeName: result.placeName || 'Location name unavailable',
          fullAddress: result.fullAddress
        };
        setLocation(updatedLocation);
        try {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(updatedLocation));
        } catch (_) {}
      })
      .catch(() => {
        if (active) setLocation({ ...location, placeName: 'Location name unavailable' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [location]);

  // Request browser geolocation and perform reverse geocoding
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser.';
      setError(errMsg);
      setPermissionState('denied');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        try {
          // Convert coordinates into a human-readable place name
          const geoRes = await reverseGeocode(lat, lng);
          const newLoc = {
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            placeName: geoRes.placeName || 'Location name unavailable',
            fullAddress: geoRes.fullAddress,
            isManual: false
          };

          setLocation(newLoc);
          setPermissionState('granted');
          try {
            localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
          } catch (_) {}
        } catch (geoErr) {
          console.warn('Reverse geocoding error:', geoErr);
          const fallbackLoc = {
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            placeName: 'Location name unavailable',
            isManual: false
          };
          setLocation(fallbackLoc);
          setPermissionState('granted');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
          setError('Location access was denied. Please enable location permission in your browser or enter your location manually.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("We couldn't determine your location. Please enter your location manually.");
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out. Please try again or enter location manually.');
        } else {
          setError(err.message || 'An error occurred while fetching your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Set manual location via place name or address search
  const setManualLocation = useCallback(async (query) => {
    setManualLoading(true);
    setError(null);
    try {
      const res = await geocodeManualLocation(query);
      const newLoc = {
        latitude: res.latitude,
        longitude: res.longitude,
        placeName: res.placeName,
        fullAddress: res.fullAddress,
        accuracy: null,
        isManual: true
      };

      setLocation(newLoc);
      setPermissionState('manual');
      try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
      } catch (_) {}
      return newLoc;
    } catch (err) {
      console.error('Manual geocoding failed:', err);
      const msg = err.message || "We couldn't find that location. Please try another city, area, or address.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setManualLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setPermissionState('prompt');
    setError(null);
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (!location?.isManual) {
          setPermissionState(result.state);
        }
        if (result.state === 'granted' && autoFetch && !location) {
          requestLocation();
        }
      }).catch(() => {
        if (autoFetch && !location) requestLocation();
      });
    } else if (autoFetch && !location) {
      requestLocation();
    }
  }, [autoFetch, requestLocation, location]);

  return {
    location,
    latitude: location?.latitude,
    longitude: location?.longitude,
    accuracy: location?.accuracy,
    placeName: location?.placeName,
    loading,
    manualLoading,
    error,
    permissionState,
    requestLocation,
    setManualLocation,
    clearLocation
  };
}
