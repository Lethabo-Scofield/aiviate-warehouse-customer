import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

const DEFAULT_CENTER = [-26.2041, 28.0473]; // Johannesburg as default warehouse center

const formatStreetAddress = (address) => {
  const streetParts = [
    address.house_number,
    address.road || address.pedestrian || address.footway || address.cycleway,
    address.suburb || address.neighbourhood
  ].filter(Boolean);
  if (streetParts.length > 0) return streetParts.join(' ');
  return address.display_name || '';
};

const extractLocationFields = (result) => {
  const address = result?.address || {};
  const city = address.city || address.town || address.village || address.county || '';
  const zip = address.postcode || '';
  const streetAddress = formatStreetAddress({ ...address, display_name: result?.display_name });
  return {
    address: streetAddress,
    city, zip,
    latitude: Number(result?.lat ?? DEFAULT_CENTER[0]),
    longitude: Number(result?.lon ?? DEFAULT_CENTER[1]),
    displayAddress: result?.display_name || [streetAddress, city, zip].filter(Boolean).join(', ')
  };
};

const MapEvents = ({ onSelect }) => {
  useMapEvents({
    click(event) { onSelect(event.latlng.lat, event.latlng.lng); }
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

  useEffect(() => {
    if (value?.displayAddress) setSearchQuery(value.displayAddress);
  }, [value?.displayAddress]);

  const center = useMemo(() => {
    const lat = Number(value?.latitude);
    const lon = Number(value?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0) return [lat, lon];
    return DEFAULT_CENTER;
  }, [value?.latitude, value?.longitude]);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(searchQuery.trim())}`);
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        const nextValue = extractLocationFields(results[0]);
        setSearchQuery(nextValue.displayAddress || nextValue.address);
        onChange(nextValue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lon}`);
      const result = await response.json();
      const nextValue = extractLocationFields(result);
      setSearchQuery(nextValue.displayAddress || nextValue.address);
      onChange(nextValue);
    } catch (err) {
      onChange({ ...value, latitude: lat, longitude: lon });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search map location"
            className="input-field py-2 pr-10"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
          />
          {loading && <i className="fas fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>}
        </div>
        <button type="button" onClick={searchLocation} disabled={loading} className="btn-outline py-2 px-3 shrink-0">
          <FaMapMarkerAlt className="text-gray-500" />
        </button>
      </div>
      
      <div className="border border-gray-300 rounded overflow-hidden h-48 relative z-0">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterMap center={center} />
          <MapEvents onSelect={reverseGeocode} />
          <CircleMarker center={center} radius={8} pathOptions={{ color: '#166534', fillColor: '#22c55e', fillOpacity: 0.8 }} />
        </MapContainer>
      </div>
    </div>
  );
};

export default AddressPicker;