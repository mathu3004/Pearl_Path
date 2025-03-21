export const fetchCoordinates = async (placeName) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&addressdetails=1&limit=1`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          name: placeName
        };
      } else {
        console.warn(`⚠ No coordinates found for: ${placeName}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching location for: ${placeName}`, error);
      return null;
    }
  };  