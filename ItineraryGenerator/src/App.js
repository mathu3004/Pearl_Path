import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TravelItineraryGenerator from './TravelItineraryGenerator';
import VisualizationItinerary from './VisualizationItinerary';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TravelItineraryGenerator />} />
                <Route path="/visual/:username/:itinerary_name" element={<VisualizationItinerary />} />

            </Routes>
        </Router>
    );
};

export default App;
