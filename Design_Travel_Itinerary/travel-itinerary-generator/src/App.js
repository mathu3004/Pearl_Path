// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TravelItineraryGenerator from './TravelItineraryGenerator';
import VisualizationItinerary from './VisualizationItinerary';
import Pearl from './Pearl'

const App = () => {
    return (
        <Router>
            <Routes>
            <Route path="/" element={<Pearl />} />
            <Route path="/" element={<TravelItineraryGenerator />} />
                <Route path="/visualization" element={<VisualizationItinerary />} />
            </Routes>
        </Router>
    );
};

export default App;