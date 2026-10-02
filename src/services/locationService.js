const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to format place name cleanly from address object
function formatPlaceName(address, displayName) {
  if (!address) {
    if (displayName) {
      const parts = displayName.split(',').map((s) => s.trim());
      return parts.slice(0, 2).join(', ');
    }
    return 'Unknown Location';
  }

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.municipality ||
    address.county ||
    address.district;
  const state = address.state || address.state_district;
  const country = address.country;

  const parts = [];
  if (city) {
    parts.push(city);
    if (state && state !== city) parts.push(state);
  } else if (state) {
    parts.push(state);
    if (country) parts.push(country);
  } else if (displayName) {
    const tokens = displayName.split(',').map((s) => s.trim());
    return tokens.slice(0, 2).join(', ');
  }

  return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
}

/**
 * Convert latitude and longitude to a human-readable place name
 */
export async function reverseGeocode(lat, lng) {
  if (lat === undefined || lng === undefined || isNaN(Number(lat)) || isNaN(Number(lng))) {
    throw new Error('Invalid coordinates for reverse geocoding');
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  // 1. Try Backend API
  try {
    const res = await fetch(`${base}/location/reverse-geocode?lat=${latitude}&lng=${longitude}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.placeName) {
        return {
          latitude,
          longitude,
          placeName: json.placeName,
          fullAddress: json.fullAddress || json.placeName
        };
      }
    }
  } catch (err) {
    console.warn('Backend reverse geocoding unavailable, falling back to direct OpenStreetMap Nominatim API:', err.message);
  }

  // 2. Direct OpenStreetMap Nominatim Fallback
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) throw new Error('Nominatim reverse geocoding failed');
    const data = await response.json();
    const placeName = formatPlaceName(data.address, data.display_name);

    return {
      latitude,
      longitude,
      placeName,
      fullAddress: data.display_name || placeName
    };
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return {
      latitude,
      longitude,
      placeName: 'Location name unavailable',
      fullAddress: 'Location name unavailable'
    };
  }
}

/**
 * Geocode a manually entered place name or address into coordinates
 */
export async function geocodeManualLocation(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Please enter a valid location, city, area, or address.');
  }

  const cleanQuery = query.trim();

  // 1. Try Backend API
  try {
    const res = await fetch(`${base}/location/geocode?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.latitude && json.longitude) {
        return {
          latitude: Number(json.latitude),
          longitude: Number(json.longitude),
          placeName: json.placeName || cleanQuery,
          fullAddress: json.fullAddress || cleanQuery
        };
      }
    } else if (res.status === 404) {
      throw new Error("We couldn't find that location. Please try another city, area, or address.");
    }
  } catch (err) {
    if (err.message.includes("couldn't find that location")) throw err;
    console.warn('Backend geocoding unavailable, falling back to direct OpenStreetMap Nominatim API:', err.message);
  }

  // 2. Direct OpenStreetMap Nominatim Fallback
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) throw new Error('Geocoding service error');
    const results = await response.json();

    if (!Array.isArray(results) || results.length === 0) {
      throw new Error("We couldn't find that location. Please try another city, area, or address.");
    }

    const first = results[0];
    const latitude = Number(first.lat);
    const longitude = Number(first.lon);
    const placeName = formatPlaceName(first.address, first.display_name);

    return {
      latitude,
      longitude,
      placeName: placeName !== 'Unknown Location' ? placeName : cleanQuery,
      fullAddress: first.display_name || placeName
    };
  } catch (err) {
    throw err;
  }
}
