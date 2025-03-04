// src/App.js
         //    
import Pearl from './Pearl'

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TravelItineraryGenerator from './TravelItineraryGenerator';
import VisualizationItinerary from './VisualizationItinerary';


const App = () => {
    return (
        <Router>
            <Routes>

            <Route path="/" element={<TravelItineraryGenerator />} />
            <Route path="/pearl" element={<Pearl />} />        
                <Route path="/visualization" element={<VisualizationItinerary />} />
            </Routes>
        </Router>
    );
};

export default App;