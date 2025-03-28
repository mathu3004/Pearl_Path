// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RadiusTravelItineraryGenerator from './RadiusTravelItineraryGenerator';
import RadiusTravelItinerary from './RadiusVisual';
import RadiusModify from './RadiusModify';
import RadiusModifyRequest from './RadiusModifyRequest';
import TravelItineraryGenerator from './TravelItineraryGenerator';
import VisualizationItinerary from './VisualizationItinerary';
import ModifyItinerary from './ModifyItinerary'; 
import ItinerarySelection from './ItinerarySelection'; 

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ItinerarySelection />} />
                <Route path="/radius-mode" element={<RadiusTravelItineraryGenerator />} />
                <Route path="/no-radius-mode" element={<TravelItineraryGenerator />} />
                <Route path="/visual-radius/:username/:name" element={<RadiusTravelItinerary />} />
                <Route path="/visual/:username/:itinerary_name" element={<VisualizationItinerary />} />
                <Route path="/modify-radius/:username/:name" element={<RadiusModify />} />
                <Route path="/modify-request/:username" element={<RadiusModifyRequest />} /> 
                <Route path="/modify/:username/:itinerary_name" element={<ModifyItinerary />} /> 
            </Routes>
        </Router>
    );
};

export default App;