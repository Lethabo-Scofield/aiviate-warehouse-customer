import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [-26.2041, 28.0473];

const formatStreetAddress = (address) => {
  const streetParts = [
    address.house_number,
    address.road || address.pedestrian || address.footway || address.cycleway,
    address.suburb || address.neighbourhood
  ].filter(Boolean);

  if (streetParts.length > 0) {
    return streetParts.join(' ');
  }

  return address.display_name || '';
};

const extractLocationFields = (result) => {
  const address = result?.address || {};
  const city = address.city || address.town || address.village || address.county || '';
  const zip = address.postcode || '';
  const streetAddress = formatStreetAddress({ ...address, display_name: result?.display_name });

  return {
    address: streetAddress,
    city,
    zip,
    latitude: Number(result?.lat ?? DEFAULT_CENTER[0]),
    longitude: Number(result?.lon ?? DEFAULT_CENTER[1]),
    displayAddress: result?.display_name || [streetAddress, city, zip].filter(Boolean).join(', ')
  };
};

const MapEvents = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    }
  });

  return null;
};

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
};

const AddressPicker = ({ value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState(value?.displayAddress || value?.address || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (value?.displayAddress) {
      setSearchQuery(value.displayAddress);
    }
  }, [value?.displayAddress]);

  const center = useMemo(() => {
    const latitude = Number(value?.latitude);
    const longitude = Number(value?.longitude);

    if (Number.isFinite(latitude) && Number.isFinite(longitude) && latitude !== 0 && longitude !== 0) {
      return [latitude, longitude];
    }

    return DEFAULT_CENTER;
  }, [value?.latitude, value?.longitude]);

  const updateFromResult = (result) => {
    const nextValue = extractLocationFields(result);
    setError('');
    setSearchQuery(nextValue.displayAddress || nextValue.address);
    onChange(nextValue);
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      setError('Enter an address or place name to search on the map.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(searchQuery.trim())}`
      );

      if (!response.ok) {
        throw new Error('Map search failed.');
      }

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        throw new Error('No map result found for that address.');
      }

      updateFromResult(results[0]);
    } catch (searchError) {
      setError(searchError.message || 'Unable to search this address right now.');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Map reverse lookup failed.');
      }

      const result = await response.json();
      updateFromResult(result);
    } catch (lookupError) {
      setError(lookupError.message || 'Unable to read that map location right now.');
      onChange({
        ...value,
        latitude,
        longitude
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search a street, suburb, or place on the map"
          className="input-field flex-1"
        />
        <button
          type="button"
          onClick={searchLocation}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Find on map'}
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-64 w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={center} />
          <MapEvents onSelect={reverseGeocode} />
          <CircleMarker center={center} radius={10} pathOptions={{ color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 0.8 }} />
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500">Click anywhere on the map to fill the street address automatically, then adjust the text fields if needed.</p>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
    </div>
  );
};

export default AddressPicker;