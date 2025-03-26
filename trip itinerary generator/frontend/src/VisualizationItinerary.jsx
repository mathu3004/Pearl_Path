import React from "react";
import { useLocation } from "react-router-dom";

const VisualizationItinerary = () => {
  const location = useLocation();
  const formData = location.state?.formData;
  return (
    <div>
      <h2>Itinerary Visualization</h2>
      {formData ? (
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      ) : (
        <p>No itinerary data available.</p>
      )}
    </div>
  );
};

export default VisualizationItinerary;
