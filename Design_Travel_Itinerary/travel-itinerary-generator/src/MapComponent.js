import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom green icon
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default black icon (customized)
const blackIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to center map on selected location
const FlyToLocation = ({ activeLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (activeLocation) {
      const targetLatLng = L.latLng(activeLocation.lat, activeLocation.lng);

      // First jump to the location
      map.setView(targetLatLng, 14, { animate: true });

      // Then immediately pan left by 150px (to shift marker toward the card)
      setTimeout(() => {
        map.panBy([-150, 0]); // shift the map view 150px to the left
      }, 600); // wait for initial animation
    }
  }, [activeLocation, map]);

  return null;
};

const MapComponent = ({ locations, activeLocation }) => {
  return (
    <MapContainer
      center={[7.8731, 80.7718]}
      zoom={7}
      style={{ height: "100%", width: "100%", borderRadius: "15px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {locations.map((loc, i) => {
        const isActive =
          activeLocation &&
          `${loc.lat}-${loc.lng}` === `${activeLocation.lat}-${activeLocation.lng}`;

        return (
          <Marker
            key={i}
            position={[loc.lat, loc.lng]}
            icon={isActive ? greenIcon : blackIcon}
          >
            <Popup>{loc.name}</Popup>
          </Marker>
        );
      })}

      <FlyToLocation activeLocation={activeLocation} />
    </MapContainer>
  );
};

export default MapComponent;