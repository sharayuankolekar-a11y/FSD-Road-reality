const express = require("express");
const router = express.Router();

// Simple in-memory cache to reduce external Nominatim requests
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour TTL

// Helper to format place name from address details
function formatPlaceNameFromAddress(address, displayName) {
  if (!address) {
    if (displayName) {
      const parts = displayName.split(",").map(s => s.trim());
      return parts.slice(0, 2).join(", ");
    }
    return "Unknown Location";
  }

  const locality = address.road || address.neighbourhood || address.suburb || address.quarter;
  const city = address.city || address.town || address.village || address.municipality || address.county || address.district;
  const state = address.state || address.state_district;
  const country = address.country;

  const parts = [];
  if (locality && city) {
    parts.push(city);
    if (state && state !== city) parts.push(state);
  } else if (city) {
    parts.push(city);
    if (state && state !== city) parts.push(state);
  } else if (state) {
    parts.push(state);
    if (country) parts.push(country);
  } else if (displayName) {
    const tokens = displayName.split(",").map(s => s.trim());
    return tokens.slice(0, 2).join(", ");
  }

  return parts.length > 0 ? parts.join(", ") : "Unknown Location";
}

/*
  REVERSE GEOCODING
  GET /api/location/reverse-geocode?lat=12.8834&lng=74.8397
*/
router.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat) and longitude (lng) parameters are required"
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude numbers"
      });
    }

    // Round coordinates for cache key
    const cacheKey = `rev_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json({ success: true, ...cached.data });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RoadRealityApp/1.0 (contact@roadreality.app)",
        "Accept-Language": "en"
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding HTTP error ${response.status}`);
    }

    const data = await response.json();
    const placeName = formatPlaceNameFromAddress(data.address, data.display_name);

    const resultData = {
      latitude,
      longitude,
      placeName,
      fullAddress: data.display_name || placeName,
      addressDetails: data.address || {}
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: resultData });

    res.json({
      success: true,
      ...resultData
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error.message);
    res.status(500).json({
      success: false,
      message: "Reverse geocoding service unavailable"
    });
  }
});

/*
  FORWARD GEOCODING (Manual place search)
  GET /api/location/geocode?q=Mangaluru
*/
router.get("/geocode", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query (q) parameter is required"
      });
    }

    const query = q.trim();
    const cacheKey = `geo_${query.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json({ success: true, ...cached.data });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RoadRealityApp/1.0 (contact@roadreality.app)",
        "Accept-Language": "en"
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding HTTP error ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "We couldn't find that location. Please try another city, area, or address."
      });
    }

    const first = results[0];
    const latitude = Number(first.lat);
    const longitude = Number(first.lon);
    const placeName = formatPlaceNameFromAddress(first.address, first.display_name);

    const resultData = {
      latitude,
      longitude,
      placeName,
      fullAddress: first.display_name || placeName,
      addressDetails: first.address || {}
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: resultData });

    res.json({
      success: true,
      ...resultData
    });
  } catch (error) {
    console.error("Forward geocoding error:", error.message);
    res.status(500).json({
      success: false,
      message: "Geocoding service unavailable"
    });
  }
});

module.exports = router;
