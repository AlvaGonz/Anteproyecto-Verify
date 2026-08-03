import React, { useRef, useState, useEffect } from "react";
import { Move, ChevronUp, ChevronLeft, ChevronRight, ChevronDown, Plus, Minus, Maximize, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const MiniMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng]).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  const panMap = (dx: number, dy: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panBy([dx, dy]);
    }
  };

  const changeZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  const toggleFullscreen = () => {
    if (mapContainerRef.current) {
      if (!document.fullscreenElement) {
        mapContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={mapContainerRef} className="relative w-full h-full overflow-hidden group bg-slate-100">
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Map Controls */}
      <div className="absolute right-4 bottom-4 z-10 flex gap-2">
        {!showControls ? (
          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="w-8 h-8 bg-white/90 backdrop-blur rounded shadow-md flex items-center justify-center hover:bg-white transition-colors"
            title="Mostrar controles del mapa"
          >
            <Move size={18} className="text-slate-700" />
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            {/* Directional Pad */}
            <div className="relative w-[72px] h-[72px]">
              <button type="button" onClick={() => panMap(0, -50)} className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-transform">
                <ChevronUp size={16} className="text-slate-700" />
              </button>
              <button type="button" onClick={() => panMap(-50, 0)} className="absolute top-1/2 left-0 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-transform">
                <ChevronLeft size={16} className="text-slate-700" />
              </button>
              <button type="button" onClick={() => panMap(50, 0)} className="absolute top-1/2 right-0 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-transform">
                <ChevronRight size={16} className="text-slate-700" />
              </button>
              <button type="button" onClick={() => panMap(0, 50)} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-transform">
                <ChevronDown size={16} className="text-slate-700" />
              </button>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1.5 justify-center ml-1">
              <button type="button" onClick={() => changeZoom(1)} className="w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-transform">
                <Plus size={16} className="text-slate-700" />
              </button>
              <button type="button" onClick={() => changeZoom(-1)} className="w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-transform">
                <Minus size={16} className="text-slate-700" />
              </button>
              <button type="button" onClick={toggleFullscreen} className="w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-transform mt-0.5">
                <Maximize size={14} className="text-slate-700" />
              </button>
            </div>

            {/* Close Controls Button */}
            <button
              type="button"
              onClick={() => setShowControls(false)}
              className="absolute -top-3 -right-3 w-6 h-6 bg-[#E63946] text-white rounded-full shadow-md flex items-center justify-center hover:bg-red-700 transition-colors z-20"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
