import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ locations }) => {
  useEffect(() => {
    console.log("📌 MapComponent Mounted - Locations:", locations);
  }, [locations]);

  return (
    <MapContainer center={[6.9271, 79.8612]} zoom={8} style={{ height: "400px", width: "100%" }}>
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, index) => (
        <Marker key={index} position={[loc.lat, loc.lng]}>
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;