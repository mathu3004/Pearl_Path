// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TravelItineraryGenerator from './TravelItineraryGenerator';
import TravelItinerary from './Visual';
import Modify from './Modify';
import ModifyRequest from './ModifyRequest';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TravelItineraryGenerator />} />  
                <Route path="/visual/:username/:name" element={<TravelItinerary />} />
                <Route path="/modify/:username/:name" element={<Modify />} />
                <Route path="/modify-request/:username" element={<ModifyRequest />} /> 
            </Routes>
        </Router>
    );
};

export default App;