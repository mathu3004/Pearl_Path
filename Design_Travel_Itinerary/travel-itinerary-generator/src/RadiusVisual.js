//Visual.js
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Layout from './components/Layout';
import axios from "axios";
import MapComponent from "./RadiusMapComponent";
import { FaHotel, FaUtensils, FaMapMarkerAlt, FaTrain, FaStar} from "react-icons/fa";
import "./TravelItineraryRadius.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from './components/Header';
import Footer from './components/Footer';

const TravelItinerary = () => {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const scrollRefs = useRef([]);
  const itineraryRef = useRef();

  const { username, name } = useParams();
  const location = useLocation();
  const mode = location.pathname.includes("/visual-radius") ? "radius" : "normal";
  const lowerUsername = username ? username.toLowerCase() : null;
  const lowerName = name ? name.toLowerCase() : null;

  const handleExportPDF = async () => {
    const element = itineraryRef.current;
    if (!element) return;
  
    const hiddenElements = document.querySelectorAll(".hide-on-export");
    hiddenElements.forEach((el) => (el.style.display = "none")); //  hide buttons
  
    try {
      const canvas = await html2canvas(element, {
        scrollY: -window.scrollY,
        useCORS: true,
        backgroundColor: null,
      });
  
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
  
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${itineraries.name}_itinerary.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      hiddenElements.forEach((el) => (el.style.display = "")); 
    }
  };

  const handleSaveItinerary = async () => {
    try {
      const response = await axios.post("http://localhost:5003/api/save-itinerary", {
        username: lowerUsername,
        name: lowerName
      });
  
      if (response.status === 201) {
        alert(" Itinerary saved to favorites!");
      } else {
        alert(" Could not save itinerary.");
      }
    } catch (error) {
      console.error("Error saving itinerary:", error);
      alert(" Failed to save itinerary. Check console.");
    }
  };  
 
  useEffect(() => {
    if (!lowerUsername || !lowerName) {
      console.warn("Username or name missing from URL params");
      return;
    }    

    const fetchItinerary = async (retries = 5) => {
      try {
          console.log("Fetching itinerary for:", lowerUsername, lowerName);
          const isRadiusMode = mode === "radius";
          const port = isRadiusMode ? 5003 : 5001;
          const route = isRadiusMode ? "itineraries" : "itinerary";
          const url = `http://localhost:${port}/api/${route}/${lowerUsername}/${lowerName}`;

          console.log("Fetching from URL:", url);
          const response = await axios.get(url);

          console.log("API Response:", response.data);  // Debugging log
  
          if (!response.data || !response.data.itinerary) {
              console.error("No valid itinerary data received.");
              throw new Error("Itinerary data not ready.");
          } else {
              setItineraries(response.data);  // Store object, not array
              console.log("Stored itinerary:", response.data);
          }
      } catch (error) {
          console.error("Error fetching itinerary:", error);
          if (retries > 0) {
            console.log(`Retrying... (${6 - retries}/5)`);
            setTimeout(() => fetchItinerary(retries - 1), 500); // wait 2 seconds and try again
          } else {
            console.error("Itinerary generation timeout.");
          }
      } finally {
          console.log("Setting loading to false");
          setLoading(false);
      }
  };  
        fetchItinerary();
      }, [lowerUsername, lowerName, mode]);

      useEffect(() => {
        const loadCoordinates = async () => {
          if (!itineraries?.itinerary) return;
      
          const extractedLocations = [];
      
          Object.values(itineraries.itinerary).forEach(day => {
            if (day?.Hotel?.latitude && day?.Hotel?.longitude) {
              extractedLocations.push({
                lat: day.Hotel.latitude,
                lng: day.Hotel.longitude,
                name: day.Hotel.name
              });
            }
      
            Object.values(day?.Restaurants || {}).forEach(rest => {
              if (rest.latitude && rest.longitude) {
                extractedLocations.push({
                  lat: rest.latitude,
                  lng: rest.longitude,
                  name: rest.name
                });
              }
            });
      
            day?.Attractions?.forEach(att => {
              if (att.latitude && att.longitude) {
                extractedLocations.push({
                  lat: att.latitude,
                  lng: att.longitude,
                  name: att.name
                });
              }
            });
          });
      
          setLocations(extractedLocations);
        };
      
        loadCoordinates();
      }, [itineraries]);      
      

if (loading) {
  return <p>Loading itineraries...</p>;
}

if (!itineraries || !itineraries.itinerary) {
  return <p>No itinerary found.</p>;
}

return (
  <div className='main'>
    <div>
       
      <div className="pagecontainers"
        ref={itineraryRef} style={{
          backgroundImage: 'url("https://i0.wp.com/www.tourbooking.lk/wp-content/uploads/2023/03/merlin_148552275_74c0d250-949c-46e0-b8a1-e6d499e992cf-superJumbo-edited.jpg?fit=2048%2C1151&ssl=1")',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '200vh'
        }}>
          <Header /> 
        <div className="mainlayout">
          <div className="itinerarycard">
          <h2 className="itinerarytitle">Itineraries for {username}</h2>
          {itineraries?.name && (
  <h2 className="itinerarysubtitle">{itineraries.name.toUpperCase()}'s Itinerary</h2>
)}

          {Object.entries(itineraries.itinerary).map(([dayKey, details], index) => {
              const dayNumberMatch = dayKey.match(/Day (\d+)/);
              const dayNumber = dayNumberMatch ? dayNumberMatch[1] : index + 1;
              const location = dayKey.split(" - ")[0];

              const orderedItems = [
                { type: "Hotel", data: details?.Hotel },
                { type: "Restaurant", data: details?.Restaurants?.breakfast, label: "Breakfast" },
                { type: "Attraction", data: details?.Attractions?.[0] },
                { type: "Attraction", data: details?.Attractions?.[1] },
                { type: "Restaurant", data: details?.Restaurants?.lunch, label: "Lunch" },
                { type: "Attraction", data: details?.Attractions?.[2] },
                { type: "Attraction", data: details?.Attractions?.[3] },
                { type: "Restaurant", data: details?.Restaurants?.dinner, label: "Dinner" },
              ];              

              return (
                <div key={dayKey}>
                  <h3 className="itinerarysubtitle">Day {dayNumber}: {location}</h3>
                  <ul className="itinerarylist">
                    {orderedItems.map((item, i) => {
                      if (!item.data) return null;
                      const icon = item.type === "Hotel" ? <FaHotel className="activityicon" />
                        : item.type === "Restaurant" ? <FaUtensils className="activityicon" />
                        : <FaMapMarkerAlt className="activityicon" />;
                                     
                      // Identify if this is the active one
                      const isActive =
                        activeLocation &&
                        `${item.data.latitude}-${item.data.longitude}` === `${activeLocation?.lat}-${activeLocation?.lng}`;

                        const refIndex = `${dayKey}-${i}`;
                        scrollRefs.current[refIndex] = React.createRef();

                      return (
                        <li
                          key={i}
                          ef={scrollRefs.current[refIndex]}
                          className="itineraryitem"
                          style={{
                            backgroundColor: isActive ? "#c4f1eb" : "",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            if (item.data.weburl) {
                              window.open(item.data.weburl, "_blank");
                            }
                            const newLocation = {
                              lat: item.data.latitude,
                              lng: item.data.longitude,
                              name: item.data.name
                            };
                            setActiveLocation(newLocation);
                            setSelectedLocation(newLocation);
                            setTimeout(() => {
                              scrollRefs.current[refIndex]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }, 100);
                          }}
                        >
                          <div className="activityheader">
                            {icon}
                            <span className="activitytype">{item.label || item.type}:</span> {item.data.name}
                          </div>
                          <div className="activitysecond-row">
                            <div className="activitylocation"><FaMapMarkerAlt /> <span>{(item.data.city || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                            </div>
                            <div className="activityrating"><FaStar /> <span>{item.data.rating}/5</span></div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        {/* Ensure map loads dynamically after data */}
        <div className="mapcontainer">
        <MapComponent
  locations={locations}
  activeLocation={activeLocation}
  selectedLocation={selectedLocation}
  transportModesPerDay={itineraries.itinerary}
/>

        </div>
      </div>
      <div className="buttoncontainer hide-on-export">
        <button className="button" onClick={() => navigate(`/modify-radius/${lowerUsername}/${lowerName}`)}>Edit</button>
        <button className="button" onClick={handleSaveItinerary}>Save Itinerary</button>
        <button className="button" onClick={handleExportPDF}>Export</button>
      </div>
      <Layout></Layout>
    <p className="thankyou-message"><FaTrain /> Thank You! Enjoy Your Trip!</p>
    </div> <Footer />
        </div>  
        </div>
  );
 
};

export default TravelItinerary;