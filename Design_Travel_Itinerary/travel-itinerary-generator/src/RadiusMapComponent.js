import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Green marker for selected location
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Black marker for normal points
const blackIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const sortPathByProximity = (points) => {
  if (points.length <= 2) return points;

  const sorted = [points[0]]; // Start from hotel
  const remaining = points.slice(1);

  while (remaining.length) {
    const last = sorted[sorted.length - 1];
    let nearestIndex = 0;
    let nearestDist = Infinity;

    remaining.forEach((pt, i) => {
      const dist = Math.hypot(pt[0] - last[0], pt[1] - last[1]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    });

    sorted.push(remaining.splice(nearestIndex, 1)[0]);
  }

  return sorted;
};


// Center and pan to selected location
const FlyToLocation = ({ activeLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (activeLocation) {
      const targetLatLng = L.latLng(activeLocation.lat, activeLocation.lng);
      map.setView(targetLatLng, 14, { animate: true });

      // Pan left to make space for sidebar
      setTimeout(() => {
        map.panBy([-150, 0]);
      }, 600);
    }
  }, [activeLocation, map]);

  return null;
};

// Mode to color mapping
const getColorByMode = (mode) => {
  switch (mode) {
    case "car":
      return "red";
    case "bus":
      return "blue";
    case "train":
      return "purple";
    case "bike":
      return "orange";
    case "walk":
      return "green";
    default:
      return "gray";
  }
};

const MapComponent = ({ locations, activeLocation, transportModesPerDay }) => {
  const dayPolylines = [];

  // Build route for each day
  Object.entries(transportModesPerDay || {}).forEach(([dayKey, dayData]) => {
    const path = [];
    const mode = dayData.transportationMode || "walk"; // default mode

    if (dayData?.Hotel) {
      path.push([dayData.Hotel.latitude, dayData.Hotel.longitude]);
    }

    dayData?.Attractions?.forEach(att => {
      if (att?.latitude && att?.longitude)
        path.push([att.latitude, att.longitude]);
    });

    const breakfast = dayData?.Restaurants?.breakfast;
    if (breakfast && breakfast.latitude && breakfast.longitude)
      path.push([breakfast.latitude, breakfast.longitude]);

    const lunch = dayData?.Restaurants?.lunch;
    if (lunch && lunch.latitude && lunch.longitude)
      path.push([lunch.latitude, lunch.longitude]);

    const dinner = dayData?.Restaurants?.dinner;
    if (dinner && dinner.latitude && dinner.longitude)
      path.push([dinner.latitude, dinner.longitude]);

    if (dayData?.Hotel) {
      // End at the same hotel (loop route)
      path.push([dayData.Hotel.latitude, dayData.Hotel.longitude]);
    }

    if (path.length > 2) {
      const optimizedPath = sortPathByProximity(path);
      optimizedPath.push(path[0]); // Return to hotel
      dayPolylines.push({
        positions: optimizedPath,
        color: getColorByMode(mode)
      });
    }
    
  });

  return (
    <MapContainer
      center={[7.8731, 80.7718]} // Center of Sri Lanka
      zoom={7}
      style={{ height: "100%", width: "100%", borderRadius: "15px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Place markers */}
      {locations.map((loc, i) => {
        const isActive = activeLocation &&
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