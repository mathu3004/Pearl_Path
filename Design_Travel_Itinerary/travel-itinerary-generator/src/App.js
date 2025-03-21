// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TravelItineraryGenerator from './TravelItineraryGenerator';
import TravelItinerary from './Visual';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TravelItineraryGenerator />} />  
                <Route path="/visual/:username/:name" element={<TravelItinerary />} />
                
            </Routes>
        </Router>
    );
};

export default App;