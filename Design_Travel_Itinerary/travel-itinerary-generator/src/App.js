import React, { useState } from 'react';

const TravelItineraryGenerator = () => {
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        peopleCount: '',
        duration: '',
        budget: '',
        cuisines: '',
        dietaryRestrictions: '',
        activities: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Travel Itinerary Generator</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="destination"
                    placeholder="Destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="peopleCount"
                    placeholder="People Count"
                    value={formData.peopleCount}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="duration"
                    placeholder="Duration (days)"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="budget"
                    placeholder="Budget ($)"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="cuisines"
                    placeholder="Preferred Cuisines"
                    value={formData.cuisines}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="dietaryRestrictions"
                    placeholder="Dietary Restrictions"
                    value={formData.dietaryRestrictions}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="activities"
                    placeholder="Activities"
                    value={formData.activities}
                    onChange={handleChange}
                />
                <button type="submit">Generate Itinerary</button>
            </form>
        </div>
    );
};

export default TravelItineraryGenerator;