import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MapComponent from './RadiusMapComponent';
import './TravelItineraryRadius.css';
import Header from './components/Header';
import Footer from './components/Footer';


// === 2. Main Component: RadiusModify ===
const RadiusModify = () => {
  const { username, name } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);       // Main itinerary
  const [alternatives, setAlternatives] = useState({});   // Alternatives per day

  // === 3. Fetch Itinerary and Alternatives on Mount ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const isRadiusMode = window.location.pathname.includes("/modify-radius");
        const port = isRadiusMode ? 5003 : 5001;
        const basePath = isRadiusMode ? "itineraries" : "itinerary";
        const url = `http://localhost:${port}/api/${basePath}/${username}/${name}`;
        const response = await axios.get(url);
        const data = response.data;
        setItinerary(data);

         // Build alternative hotels, restaurants, and attractions for each day
        const fetchedAlternatives = {};
        for (const [dayKey, day] of Object.entries(data.itinerary)) {
          const parsedHotels = (day["Alternative Hotels"] || []).map((item) => {
            if (typeof item === 'object') return item;
            try {
              return JSON.parse(item.replace(/'/g, '"'));
            } catch (e) {
              console.warn('Failed to parse alternative hotel:', item);
              return null;
            }
          }).filter(Boolean);

          fetchedAlternatives[dayKey] = {
            Hotels: [day.Hotel, ...parsedHotels],
            Restaurants: day["Alternative Restaurants"] || {},
            Attractions: day["Alternative Attractions"] || []
          };
        }

        setAlternatives(fetchedAlternatives);
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      }
    };

    fetchData();
  }, [username, name]);

  // === 4. Replace Handler (Hotel, Restaurant, Attraction) ===
  const handleReplace = (dayKey, type, indexOrKey, newItem) => {
    const updated = { ...itinerary };
    const updatedAlts = { ...alternatives };
    const dayData = updated.itinerary[dayKey];
    const altData = updatedAlts[dayKey];
  
    //  Swap Hotels
    if (type === 'Hotel') {
      const currentHotel = dayData.Hotel;
  
      // Replace current with selected
      dayData.Hotel = newItem;
  
      // Update alternatives: swap currentHotel into alt list, remove newItem
      dayData['Alternative Hotels'] = (dayData['Alternative Hotels'] || []).map(h =>
        h.name === newItem.name ? currentHotel : h
      );
  
      // Also update alternatives state to re-render the button list immediately
      altData.Hotels = [dayData.Hotel, ...(dayData['Alternative Hotels'] || [])];
    }
  
    // Swap Restaurants
    else if (type === 'Restaurants') {
      const currentRest = dayData.Restaurants[indexOrKey];
      dayData.Restaurants[indexOrKey] = newItem;
  
      const altList = (dayData['Alternative Restaurants']?.[indexOrKey] || []).map(r =>
        r.name === newItem.name ? currentRest : r
      );
  
      dayData['Alternative Restaurants'] = {
        ...(dayData['Alternative Restaurants'] || {}),
        [indexOrKey]: altList
      };
  
      // Sync with alternatives state
      altData.Restaurants[indexOrKey] = altList;
    }
  
    // Swap Attractions
    else if (type === 'Attractions') {
      const currentAtt = dayData.Attractions[indexOrKey];
      dayData.Attractions[indexOrKey] = newItem;

      // Safely update the correct alternatives group
      const altList = (dayData['Alternative Attractions']?.[currentAtt.name] || []).map(a =>
        a.name === newItem.name ? currentAtt : a
      );

      // Reassign updated alternatives
      dayData['Alternative Attractions'][newItem.name] = altList;
      delete dayData['Alternative Attractions'][currentAtt.name];

      // Sync with state
      altData.Attractions = dayData['Alternative Attractions'];
    }
  
    updated.itinerary[dayKey] = dayData;
    updatedAlts[dayKey] = altData;
  
    setItinerary(updated);
    setAlternatives(updatedAlts);
  };  
  
  // === 5. Remove an Item from the Itinerary ===
  const handleRemove = (dayKey, type, indexOrKey) => {
    const updated = { ...itinerary };
    if (type === 'Hotel') updated.itinerary[dayKey].Hotel = null;
    else if (type === 'Restaurants') delete updated.itinerary[dayKey][type][indexOrKey];
    else updated.itinerary[dayKey][type].splice(indexOrKey, 1);
    setItinerary(updated);
  };  

  // === 6. Save the Updated Itinerary ===
  const handleSave = async () => {
    try {
      await axios.post(`http://localhost:5003/api/save-edited-itinerary`, {
        username: itinerary.username,
        name: itinerary.name,
        itinerary: itinerary.itinerary
      });
      
      alert('Itinerary updated!');
      navigate(`/visual-radius/${username}/${name}`);
    } catch (error) {
      console.error('Error saving edited itinerary:', error);
    }
  };

  // === 7. Show loading if itinerary not yet loaded ===
  if (!itinerary) return <div>Loading...</div>;

  // === 8. Render the Modify Page ===
  return (
    <div className='main'>
    <div className="full-pagecontainer" id="radius-modify">
      <Header />
      <div className="editpage-wrapper">
        {/* === Left Scrollable Panel === */}
        <div className="editleft-scrollable">
          <h2 className='TitleModify'>Modify {username.toUpperCase()}'s {name.toUpperCase()} Itinerary</h2>
          {Object.entries(itinerary.itinerary).map(([dayKey, day]) => (
            <div key={dayKey} className="editday">
              <h3 className='SubTitleModify'>{dayKey}</h3>

              {/* === Hotel Section === */}
              <div>
                <h4>Hotel</h4>
                {day.Hotel ? (
                  <div className="edititem">
                    <span>{day.Hotel.name}</span>
                  </div>
                ) : <p>No hotel selected</p>}
                <div className="altrow">
                {alternatives[dayKey]?.Hotels?.slice(1, 4).map((alt, idx) => (
                  <button key={idx} className="replacebtn" onClick={() => handleReplace(dayKey, 'Hotel', null, alt)}>
                    Replace with: {alt.name}
                  </button>
                  ))}
              </div>
              </div>

              {/* === Restaurants Section === */}
              <div>
                <h4>Restaurants</h4>
                {Object.entries(day.Restaurants || {}).map(([meal, rest], idx) => (
                  <div key={idx} className="edititem">
                    <span>{meal.toUpperCase()}: {rest.name}</span>
                    <button className="removebtn" onClick={() => handleRemove(dayKey, 'Restaurants', meal)}>Remove</button>
                    <div className="altrow">
                    {(alternatives[dayKey]?.Restaurants?.[meal] || []).slice(0, 3).map((alt, aIdx) => (
                      <button key={aIdx} className="replacebtn" onClick={() => handleReplace(dayKey, 'Restaurants', meal, alt)}>
                        Replace {meal} with: {alt.name}
                      </button>
                    ))}
                  </div>
                  </div>
                ))}
              </div>

              {/* === Attractions Section === */}
              <div>
                <h4>Attractions</h4>
                {day.Attractions?.map((att, idx) => (
                <div key={idx} className="edititem">
                  <span>{att.name}</span>
                  <button className="removebtn" onClick={() => handleRemove(dayKey, 'Attractions', idx)}>Remove</button>
                  <div className="altrow">
                    {(alternatives[dayKey]?.Attractions?.[att.name] || []).map((alt, aIdx) => (
                      <button key={aIdx} className="replacebtn" onClick={() => handleReplace(dayKey, 'Attractions', idx, alt)}>
                        Replace with: {alt.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              </div>
            </div>
          ))}
        </div>
  
  {/* === Right Map Panel === */}
        <div className="editmap">
  <MapComponent
    locations={
      Object.values(itinerary.itinerary).flatMap((day) => {
        const locs = [];
    
        if (day.Hotel && day.Hotel.latitude && day.Hotel.longitude) {
          locs.push({ ...day.Hotel, lat: day.Hotel.latitude, lng: day.Hotel.longitude });
        }
    
        Object.values(day.Restaurants || {}).forEach((rest) => {
          if (rest && rest.latitude && rest.longitude) {
            locs.push({ ...rest, lat: rest.latitude, lng: rest.longitude });
          }
        });
    
        (day.Attractions || []).forEach((att) => {
          if (att && att.latitude && att.longitude) {
            locs.push({ ...att, lat: att.latitude, lng: att.longitude });
          }
        });
    
        return locs;
      })
    }
    
    activeLocation={null}
    transportModesPerDay={itinerary.itinerary}
  />
</div>


      </div>
       {/* === Save Button === */}
      <button className="savebutton" onClick={handleSave}>Save Changes</button>

      <Layout>
    </Layout>
      <Footer />
    </div>
    </div>
  );
};

export default RadiusModify;
