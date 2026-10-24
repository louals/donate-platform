"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Button } from "@/components/ui/button";
import { X, Navigation, CheckCircle2, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";

// Fix for default marker icon in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTYgNDhDMTYgNDggMzIgMjguOCAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI4LjggMTYgNDggMTYgNDhaIiBmaWxsPSIjMzA5MDUxIi8+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iOCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

// Algeria Bounds
const ALGERIA_BOUNDS: L.LatLngBoundsExpression = [
  [18.9, -8.7], // Southwest
  [37.1, 12.0], // Northeast
];

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

// Component to handle map clicks and update marker position
function MapClickHandler({
  position,
  setPosition,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      // Check if click is within Algeria
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (lat >= 18.9 && lat <= 37.1 && lng >= -8.7 && lng <= 12.0) {
        setPosition([lat, lng]);
      } else {
        // Option to show a toast or just ignore
        // toast.error("Veuillez sélectionner un lieu en Algérie");
      }
    },
  });

  return <Marker position={position} icon={greenIcon} />;
}

// Component to recenter map when position changes
function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onClose,
  onLocationSelect,
}: LocationPickerProps) {
  const { t } = useLanguage();
  // Default to Algiers if no coordinates
  const defaultPos: [number, number] =
    latitude && longitude ? [latitude, longitude] : [36.7538, 3.0588];
  const [position, setPosition] = useState<[number, number]>(defaultPos);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Reverse geocode to get address when position changes
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&addressdetails=1`
        );
        const data = await response.json();

        // Ensure it's in Algeria
        if (data.address && data.address.country_code !== "dz") {
          setAddress(t.createPost.locationPicker.unknownAddress);
          return;
        }

        setAddress(
          data.display_name || t.createPost.locationPicker.unknownAddress
        );
      } catch (error) {
        console.error("Error fetching address:", error);
        setAddress(t.createPost.locationPicker.unknownAddress);
      }
    };

    fetchAddress();
  }, [position, t]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Only update if in Algeria
        if (lat >= 18.9 && lat <= 37.1 && lng >= -8.7 && lng <= 12.0) {
          setPosition([lat, lng]);
        } else {
          toast.error("Votre position actuelle est en dehors de l'Algérie");
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  };

  const handleConfirm = () => {
    onLocationSelect(position[0], position[1], address);
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-300">
      <div className="animate-in slide-in-from-bottom-4 w-full max-w-4xl overflow-hidden rounded-3xl border-2 border-emerald-100 bg-white shadow-2xl duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#22854d] via-[#309051] to-[#50a55f] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-2xl font-bold">
                {t.createPost.locationPicker.title}
              </h2>
              <p className="text-sm text-white/80">
                {t.createPost.locationPicker.subtitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[400px] bg-slate-100">
          <MapContainer
            center={position}
            zoom={13}
            className="h-full w-full"
            zoomControl={false}
            maxBounds={ALGERIA_BOUNDS}
            minZoom={5}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler position={position} setPosition={setPosition} />
            <MapRecenter position={position} />
          </MapContainer>

          {/* Floating controls */}
          <div className="absolute top-4 right-4 z-[1000]">
            <Button
              onClick={getCurrentLocation}
              disabled={loading}
              className="h-12 w-12 rounded-full border-2 border-emerald-200 bg-white p-0 text-[#309051] shadow-lg hover:bg-emerald-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Navigation size={20} />
              )}
            </Button>
          </div>
        </div>

        {/* Address display and actions */}
        <div className="space-y-4 p-6">
          <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4">
            <p className="mb-1 text-xs font-semibold tracking-wider text-slate-600 uppercase">
              {t.createPost.locationPicker.selectedAddress}
            </p>
            <p className="text-sm leading-relaxed font-medium text-slate-800">
              {address}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12 flex-1 rounded-full border-2 border-emerald-200 hover:bg-emerald-50"
            >
              {t.createPost.locationPicker.cancel}
            </Button>
            <Button
              onClick={handleConfirm}
              className="h-12 flex-1 rounded-full bg-gradient-to-r from-[#22854d] via-[#309051] to-[#50a55f] transition-all hover:shadow-lg hover:shadow-emerald-500/30"
              disabled={
                !address ||
                address === t.createPost.locationPicker.unknownAddress
              }
            >
              <CheckCircle2 size={18} className="mr-2" />
              {t.createPost.locationPicker.confirm}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
