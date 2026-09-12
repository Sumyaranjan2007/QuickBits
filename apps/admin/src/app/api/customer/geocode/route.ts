import { NextRequest, NextResponse } from 'next/server';

interface GeocodeResponse {
  name: string;
  desc: string;
  fullAddress: string;
  locality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');
  const query = searchParams.get('q');

  // Handle Reverse Geocoding: lat + lng provided
  if (latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Invalid coordinates provided.' }, { status: 400 });
    }

    try {
      // 1. If Google Maps API key is configured
      const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (googleApiKey) {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
        const gRes = await fetch(googleUrl, { next: { revalidate: 3600 } });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.status === 'OK' && gData.results && gData.results.length > 0) {
            const first = gData.results[0];
            const components = first.address_components || [];
            
            let locality = '';
            let city = '';
            let state = '';
            let postalCode = '';
            let country = '';

            for (const c of components) {
              const types = c.types || [];
              if (types.includes('sublocality') || types.includes('neighborhood')) locality = c.long_name;
              if (types.includes('locality')) city = c.long_name;
              if (types.includes('administrative_area_level_1')) state = c.long_name;
              if (types.includes('postal_code')) postalCode = c.long_name;
              if (types.includes('country')) country = c.long_name;
            }

            const name = locality && city ? `${locality}, ${city}` : (locality || city || 'Current Location');
            const desc = first.formatted_address || `${name}, ${postalCode}`;

            return NextResponse.json({
              name,
              desc,
              fullAddress: first.formatted_address || desc,
              locality,
              city,
              state,
              postalCode,
              country,
              latitude: lat,
              longitude: lng,
            });
          }
        }
      }

      // 2. OpenStreetMap / Nominatim (Free, standard, high precision)
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const osmRes = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'QuickBite-Food-Delivery-App/1.0 (https://quickbite.internal)',
          'Accept-Language': 'en',
        },
        next: { revalidate: 3600 },
      });

      if (!osmRes.ok) {
        throw new Error(`Nominatim error: ${osmRes.statusText}`);
      }

      const data = await osmRes.json();
      const addr = data.address || {};

      const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village || addr.hamlet || '';
      const city = addr.city || addr.town || addr.municipality || addr.city_district || addr.county || '';
      const state = addr.state || addr.province || '';
      const postalCode = addr.postcode || '';
      const country = addr.country || '';

      let name = '';
      if (locality && city) {
        name = `${locality}, ${city}`;
      } else if (locality) {
        name = locality;
      } else if (city) {
        name = city;
      } else {
        name = 'Current Location';
      }

      const formattedParts: string[] = [];
      if (addr.house_number) formattedParts.push(addr.house_number);
      if (addr.road) formattedParts.push(addr.road);
      if (locality && locality !== addr.road) formattedParts.push(locality);
      if (city && city !== locality) formattedParts.push(city);
      if (state) formattedParts.push(state);
      if (postalCode) formattedParts.push(postalCode);

      const desc = formattedParts.length > 0 ? formattedParts.join(', ') : (data.display_name || name);
      const fullAddress = data.display_name || desc;

      const result: GeocodeResponse = {
        name,
        desc,
        fullAddress,
        locality,
        city,
        state,
        postalCode,
        country,
        latitude: lat,
        longitude: lng,
      };

      return NextResponse.json(result);
    } catch (err: any) {
      console.error('Reverse geocoding error:', err);
      return NextResponse.json({
        error: 'Failed to reverse geocode coordinates.',
        details: err?.message,
      }, { status: 500 });
    }
  }

  // Handle Forward Search: query string provided
  if (query) {
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
      const osmRes = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'QuickBite-Food-Delivery-App/1.0 (https://quickbite.internal)',
          'Accept-Language': 'en',
        },
      });

      if (!osmRes.ok) {
        throw new Error(`Search error: ${osmRes.statusText}`);
      }

      const list = await osmRes.json();
      const results = (list || []).map((item: any) => {
        const addr = item.address || {};
        const locality = addr.suburb || addr.neighbourhood || addr.road || addr.village || '';
        const city = addr.city || addr.town || addr.municipality || addr.county || '';
        const state = addr.state || '';
        const postalCode = addr.postcode || '';

        const name = locality && city ? `${locality}, ${city}` : (locality || city || item.display_name?.split(',')[0] || 'Selected Location');

        return {
          id: `srch-${item.place_id || Math.random()}`,
          name,
          desc: item.display_name || name,
          fullAddress: item.display_name || name,
          locality,
          city,
          state,
          postalCode,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        };
      });

      return NextResponse.json({ results });
    } catch (err: any) {
      console.error('Address search error:', err);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Please provide either lat & lng or query string q.' }, { status: 400 });
}
