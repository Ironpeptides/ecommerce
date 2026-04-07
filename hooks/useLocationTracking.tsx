"use client";

import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

interface LocationData {
  country: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  timestamp: number;

  // Precise location from Geolocation API (if available)
  preciseLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string; // Requires reverse geocoding
  };
}

/**
 * Safely retrieves location data from localStorage, checking for expiry.
 * This function now includes a check to ensure it only runs in the browser environment.
 */
const getStoredLocation = (): LocationData | null => {
  // 🔑 FIX: Check if localStorage is defined (i.e., if we are in the browser)
  if (typeof window === "undefined") {
    return null;
  }

  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);

  if (!storedData) return null;

  try {
    const parsedData = JSON.parse(storedData);
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsedData.timestamp > expiryTime;

    return isExpired ? null : parsedData;
  } catch (e) {
    console.error("Error parsing stored location data:", e);
    return null;
  }
};

// Reverse geocode coordinates to get street address
const reverseGeocode = async (
  lat: number,
  lon: number
): Promise<string | undefined> => {
  try {
    // Using Nominatim (OpenStreetMap) - free but rate limited
    // For production, consider Google Maps Geocoding API or similar
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "YourEcommerceApp/1.0", // Required by Nominatim
        },
      }
    );

    const data = await response.json();
    return data.display_name;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return undefined;
  }
};

const useLocationTracking = () => {
  // 🔑 CHANGE: Initialize to null. The actual data fetch happens in useEffect.
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get IP-based location
  const getIpLocation = async () => {
    try {
      const res = await fetch("http://ip-api.com/json/");
      const data = await res.json();

      const newLocation: LocationData = {
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        regionName: data.regionName,
        city: data.city,
        zip: data.zip,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        timestamp: Date.now(),
      };

      setLocation(newLocation);
      
      // 🔑 FIX: Ensure setItem is only called in the client environment
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
      }

      return newLocation;
    } catch (err) {
      console.error("Failed to get IP location:", err);
      setError("Failed to get location from IP");
      return null;
    }
  };

  // Get precise GPS location (requires user permission)
  const getPreciseLocation = async (baseLocation: LocationData) => {
    // Ensure this is only run in the browser
    if (typeof window === "undefined" || !navigator.geolocation) {
      console.log("Geolocation not supported or environment not browser.");
      return baseLocation;
    }

    return new Promise<LocationData>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Optionally get street address via reverse geocoding
          const address = await reverseGeocode(latitude, longitude);

          const updatedLocation: LocationData = {
            ...baseLocation,
            preciseLocation: {
              latitude,
              longitude,
              accuracy,
              address,
            },
            timestamp: Date.now(),
          };

          setLocation(updatedLocation);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              LOCATION_STORAGE_KEY,
              JSON.stringify(updatedLocation)
            );
          }
          resolve(updatedLocation);
        },
        (err) => {
          console.log("User denied location or error:", err.message);
          resolve(baseLocation); // Fall back to IP location
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Request precise location (call this on user action, e.g., button click)
  const requestPreciseLocation = async () => {
    if (!location) return;

    setLoading(true);
    await getPreciseLocation(location);
    setLoading(false);
  };

  /**
   * 🔑 FIX: Move initial data loading into useEffect to run only on the client.
   */
  useEffect(() => {
    // 1. Check for stored location
    const stored = getStoredLocation();

    if (stored) {
      // If valid stored location exists, use it and stop
      setLocation(stored);
      return;
    }

    // 2. If no stored location, fetch IP location
    const fetchLocation = async () => {
      setLoading(true);
      await getIpLocation();
      setLoading(false);
    };

    fetchLocation();
  }, []);

  
  return {
    location,
    loading,
    error,
    requestPreciseLocation, // Call this when user wants to share precise location
  };
};

export default useLocationTracking;