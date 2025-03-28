// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TravelItineraryGenerator from './RadiusTravelItineraryGenerator';
import TravelItinerary from './RadiusVisual';
import Modify from './RadiusModify';
import ModifyRequest from './RadiusModifyRequest';

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