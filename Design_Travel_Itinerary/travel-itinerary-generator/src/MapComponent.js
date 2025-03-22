import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for missing marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// 🔍 This component handles map panning and zooming
const FlyToLocation = ({ activeLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (activeLocation) {
      map.flyTo([activeLocation.lat, activeLocation.lng], 14, {
        duration: 1.5,
      });
    }
  }, [activeLocation, map]);

  return null;
};

const MapComponent = ({ locations, activeLocation }) => {
  return (
    <MapContainer
      center={[7.8731, 80.7718]} // Default center (Sri Lanka)
      zoom={7}
      style={{ height: "100%", width: "100%", borderRadius: "15px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {locations.map((loc, i) => (
        <Marker key={i} position={[loc.lat, loc.lng]}>
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}

      <FlyToLocation activeLocation={activeLocation} />
    </MapContainer>
  );
};

export default MapComponent;
