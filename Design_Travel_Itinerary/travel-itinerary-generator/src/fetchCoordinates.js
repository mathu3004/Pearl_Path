export const fetchCoordinates = async (placeName) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&addressdetails=1&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        name: placeName
      };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching coordinates:", err);
    return null;
  }
};