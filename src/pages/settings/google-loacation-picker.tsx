// src/components/settings/GoogleLocationPicker.tsx — FULL REPLACEMENT
// Added: polygon mode — click to add points, drag to adjust, connects into
// a shaded boundary instead of a fixed-radius circle.

import { useCallback, useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  Polygon,
  Autocomplete,
  useLoadScript,
} from "@react-google-maps/api";
import {
  Loader2,
  Eye,
  EyeOff,
  Search,
  Circle as CircleIcon,
  Hexagon,
  Undo2,
  Trash2,
} from "lucide-react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES: "places"[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "360px",
  borderRadius: "12px",
};
const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 };

export type GeoPoint = { lat: number; lng: number };
export type GeofenceType = "CIRCLE" | "POLYGON";

interface Props {
  geofenceType: GeofenceType;
  onGeofenceTypeChange: (type: GeofenceType) => void;
  // Circle mode
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (lat: number, lng: number) => void;
  // Polygon mode
  polygonPoints: GeoPoint[];
  onPolygonPointsChange: (points: GeoPoint[]) => void;
}

export default function GoogleLocationPicker({
  geofenceType,
  onGeofenceTypeChange,
  latitude,
  longitude,
  radiusMeters,
  onLocationChange,
  polygonPoints,
  onPolygonPointsChange,
}: Props) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [showStreetView, setShowStreetView] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const hasCirclePosition = latitude != null && longitude != null;
  const center = hasCirclePosition
    ? { lat: latitude!, lng: longitude! }
    : (polygonPoints[0] ?? DEFAULT_CENTER);

  useEffect(() => {
    const svCenter = hasCirclePosition
      ? { lat: latitude!, lng: longitude! }
      : polygonPoints[0];
    if (!showStreetView || !svCenter || !isLoaded || !streetViewRef.current)
      return;

    if (!panoramaRef.current) {
      panoramaRef.current = new google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: svCenter,
          addressControl: false,
          fullscreenControl: false,
          linksControl: true,
          panControl: true,
        },
      );
    } else {
      panoramaRef.current.setPosition(svCenter);
    }
  }, [
    showStreetView,
    hasCirclePosition,
    isLoaded,
    latitude,
    longitude,
    polygonPoints,
  ]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (geofenceType === "CIRCLE") {
        onLocationChange(lat, lng);
      } else {
        // Polygon mode — each click adds a new vertex
        onPolygonPointsChange([...polygonPoints, { lat, lng }]);
      }
    },
    [geofenceType, onLocationChange, onPolygonPointsChange, polygonPoints],
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      onLocationChange(e.latLng.lat(), e.latLng.lng());
    },
    [onLocationChange],
  );

  const handlePolygonPointDrag = useCallback(
    (index: number, e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const updated = [...polygonPoints];
      updated[index] = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      onPolygonPointsChange(updated);
    },
    [polygonPoints, onPolygonPointsChange],
  );

  const undoLastPoint = () => onPolygonPointsChange(polygonPoints.slice(0, -1));
  const clearPolygon = () => onPolygonPointsChange([]);

  const handleAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete,
  ) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    if (geofenceType === "CIRCLE") {
      onLocationChange(lat, lng);
    } else {
      onPolygonPointsChange([...polygonPoints, { lat, lng }]);
    }

    setSearchValue(place.formatted_address || place.name || "");
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(17);
  };

  if (loadError) {
    return (
      <div className="h-80 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-sm text-red-600 px-4 text-center">
        Failed to load Google Maps. Check your API key and enabled APIs.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-80 rounded-xl bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Mode toggle ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => onGeofenceTypeChange("CIRCLE")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            geofenceType === "CIRCLE"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500"
          }`}
        >
          <CircleIcon className="w-3.5 h-3.5" /> Circle (pin + radius)
        </button>
        <button
          type="button"
          onClick={() => onGeofenceTypeChange("POLYGON")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            geofenceType === "POLYGON"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500"
          }`}
        >
          <Hexagon className="w-3.5 h-3.5" /> Custom area (mark points)
        </button>
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <Autocomplete
        onLoad={handleAutocompleteLoad}
        onPlaceChanged={handlePlaceChanged}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for your hotel name or address…"
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Autocomplete>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-500">
          {geofenceType === "CIRCLE"
            ? "Click the map or drag the pin to fine-tune the location"
            : `Click the map to mark each corner of your attendance area (${polygonPoints.length} point${polygonPoints.length === 1 ? "" : "s"} marked, 3+ needed)`}
        </p>
        <div className="flex items-center gap-3">
          {geofenceType === "POLYGON" && polygonPoints.length > 0 && (
            <>
              <button
                type="button"
                onClick={undoLastPoint}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
              <button
                type="button"
                onClick={clearPolygon}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </>
          )}
          {(hasCirclePosition || polygonPoints.length > 0) && (
            <button
              type="button"
              onClick={() => setShowStreetView((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {showStreetView ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              {showStreetView ? "Hide Street View" : "Show Street View"}
            </button>
          )}
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={hasCirclePosition || polygonPoints.length ? 17 : 12}
        onClick={handleMapClick}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {geofenceType === "CIRCLE" && hasCirclePosition && (
          <>
            <Marker
              position={center}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
            <Circle
              center={center}
              radius={radiusMeters}
              options={{
                fillColor: "#2563eb",
                fillOpacity: 0.12,
                strokeColor: "#2563eb",
                strokeWeight: 2,
                clickable: false,
              }}
            />
          </>
        )}

        {geofenceType === "POLYGON" && (
          <>
            {polygonPoints.map((pt, i) => (
              <Marker
                key={i}
                position={pt}
                draggable
                label={{
                  text: String(i + 1),
                  color: "white",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
                onDragEnd={(e) => handlePolygonPointDrag(i, e)}
              />
            ))}
            {polygonPoints.length >= 3 && (
              <Polygon
                paths={polygonPoints}
                options={{
                  fillColor: "#2563eb",
                  fillOpacity: 0.15,
                  strokeColor: "#2563eb",
                  strokeWeight: 2,
                  clickable: false,
                }}
              />
            )}
          </>
        )}
      </GoogleMap>

      {showStreetView && (hasCirclePosition || polygonPoints.length > 0) && (
        <div
          ref={streetViewRef}
          className="rounded-xl overflow-hidden border border-slate-200"
          style={{ width: "100%", height: "320px" }}
        />
      )}
    </div>
  );
}
