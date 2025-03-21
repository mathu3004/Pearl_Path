// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TravelItineraryGenerator from './TravelItineraryGenerator';
import Visual from './Visual';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TravelItineraryGenerator />} />  
                <Route path="/Visual" element={<Visual />} />
            </Routes>
        </Router>
    );
};

export default App;