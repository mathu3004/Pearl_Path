// src/App.js
//<Route path="/" element={<TravelItineraryGenerator />} />  
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
            <Route path="/" element={<ModifyRequest />} /> {/* ✅ Set as default landing page */}
                <Route path="/modifyrequest/:username" element={<ModifyRequest />} />
                <Route path="/generateItinerary" element={<TravelItineraryGenerator />} />
  
                <Route path="/visual/:username/:name" element={<TravelItinerary />} />
                <Route path="/modify/:username/:name" element={<Modify />} />
            </Routes>
        </Router>
    );
};

export default App;