// AddYourRoom.jsx
import React, { useState, useRef } from 'react';
import axios from "../axiosConfig";
import './AdminScreen.css';
import MapComponent from './MapComponent';  // Import MapComponent for map selection

const AddYourRoom = ({ onRoomAdded, isOwnerView }) => {
    const [roomName, setRoomName] = useState('');
    const [roomtype, setRoomtype] = useState('');
    const [address, setAddress] = useState('');
    const [awayFromHighway, setAwayFromHighway] = useState('');
    const [description, setDescription] = useState('');
    const [features, setFeatures] = useState([]);
    const [newFeature, setNewFeature] = useState('');
    const [price, setPrice] = useState('');
    const [images, setImages] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    // New state variables for coordinates and map popup
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [locationOption, setLocationOption] = useState(''); // 'manual' or 'map'
    const [isMapPopupOpen, setIsMapPopupOpen] = useState(false);

    const fileInputRef = useRef(null);
    const [isAddingRoom, setIsAddingRoom] = useState(true);
   


    const handleAddFeature = () => {
        if (newFeature.trim() !== '') {
            setFeatures([...features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index) => {
        setFeatures(features.filter((_, idx) => idx !== index));
    };

    const handleAddImage = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImages((prevImages) => [...prevImages, ...files]);
        }
    };

    const handleRemoveImage = (index) => {
        setImages(images.filter((_, idx) => idx !== index));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Auto-resizing function for the description textarea
    const handleDescriptionInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
        setDescription(e.target.value);
    };

    const handleAddRoomSubmit = async (e) => {
        e.preventDefault();

        if (!roomtype) {
            alert('Please select a room type first.');
            return;
        }
        if (images.length < 4) {
            alert('Please upload at least 4 images.');
            return;
        }

        const formData = new FormData();
        formData.append('roomName', roomName);
        formData.append('roomtype', roomtype);
        formData.append('address', address);
        formData.append('awayFromHighway', awayFromHighway);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('features', JSON.stringify(features));
        images.forEach((img) => {
            formData.append('images', img);
        });
        // Append ownerId from the current user stored in localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        formData.append('ownerId', currentUser?.id);

        // Append coordinates to form data
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);

        try {
            const response = await axios.post('/api/rooms/addroom', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                setShowPopup(true);
                if (onRoomAdded) onRoomAdded();
            } else {
                alert(response.data.message || 'Failed to add room.');
            }
        } catch (error) {
            console.error('Error adding room:', error.response ? error.response.data : error.message);
            alert('Error adding room.');
        }
    };

    // Callback for when a location is selected on the map.
    const handleMapLocationSelect = (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
        setIsMapPopupOpen(false); // Close the popup after selection
    };

    return (
        <div className={`add-room-container ${isOwnerView ? 'owner-view' : 'admin-view'}`}>
            <h1>{isOwnerView ? 'List Your Room' : 'Add New Room'}</h1>
            <form className="add-room-form" onSubmit={handleAddRoomSubmit}>
                <div className="form-columns">
                    {/* Left Column */}
                    <div className="left-column">
                        <div className="input-group-roomtype">
                            <label>Room Type:</label>
                            <div className="radio-group">
                                <label className={roomtype === 'hotelRoom' ? 'active' : ''}>
                                    <input
                                        type="radio"
                                        name="roomtype"
                                        value="hotelRoom"
                                        checked={roomtype === 'hotelRoom'}
                                        onChange={(e) => setRoomtype(e.target.value)}
                                    />
                                    Hotel Room
                                </label>
                                <label className={roomtype === 'flat' ? 'active' : ''}>
                                    <input
                                        type="radio"
                                        name="roomtype"
                                        value="flat"
                                        checked={roomtype === 'flat'}
                                        onChange={(e) => setRoomtype(e.target.value)}
                                    />
                                    Flat
                                </label>
                                <label className={roomtype === 'room' ? 'active' : ''}>
                                    <input
                                        type="radio"
                                        name="roomtype"
                                        value="room"
                                        checked={roomtype === 'room'}
                                        onChange={(e) => setRoomtype(e.target.value)}
                                    />
                                    Room
                                </label>
                            </div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="roomName">Room Name:</label>
                            <input
                                type="text"
                                id="roomName"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="address">Address:</label>
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <div className="fromHighway">
                                <label htmlFor="awayFromHighway">From Highway:</label>
                                <input
                                    type="text"
                                    id="awayFromHighway"
                                    value={awayFromHighway}
                                    onChange={(e) => setAwayFromHighway(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="description">Description:</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={handleDescriptionInput}
                                required
                                style={{ overflow: 'hidden' }}
                            />
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="right-column">
                        <div className="input-group price-group">
                            <label htmlFor="price">Price:</label>
                            <div className="price-input-container">
                                <span className="currency">Rs.</span>
                                <input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                                <span className="price-type">
                                    {roomtype === 'hotelRoom' ? 'per day' : roomtype ? 'per month' : ''}
                                </span>
                            </div>
                        </div>
                        <div className="input-group">
                            <div className="input-group-features">
                                <label>Other Facilities:</label>
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Enter a feature"
                                />
                                <button type="button" onClick={handleAddFeature}>
                                    Add Facilities
                                </button>
                            </div>
                            <div className="features-list">
                                {features.map((feature, idx) => (
                                    <span key={idx} className="feature-item">
                                        {feature}
                                        <button className="remove-feature" onClick={() => handleRemoveFeature(idx)}>
                                            X
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* New Location Options */}
                        <div className="input-group">
                            <label>Set Coordinates :</label>
                            <div className="location-buttons">
                                <button
                                    type="button"
                                    onClick={() => setLocationOption('manual')}
                                >
                                    Enter Manually
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationOption('map');
                                        setIsMapPopupOpen(true);
                                    }}
                                >
                                    Choose from Map
                                </button>
                            </div>
                            {locationOption && (
                                <div className="manual-coords">
                                    <input
                                        type="text"
                                        value={latitude || ''}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="Enter Latitude"
                                    />
                                    <input
                                        type="text"
                                        value={longitude || ''}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="Enter Longitude"
                                    />
                                </div>
                            )}
                        </div>
                        {/* Map Popup */}
                        {isMapPopupOpen && (
                            <div className="map-popup">
                                <div className="map-popup-content">
                                    <button
                                        className="map-popup-close"
                                        onClick={() => setIsMapPopupOpen(false)}
                                    >
                                        Close
                                    </button>
                                    <MapComponent
                                        latitude={latitude}
                                        longitude={longitude}
                                        showMarker={true}
                                        onLocationChange={handleMapLocationSelect}
                                        isAddingRoom={isAddingRoom}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="input-group">
                            <label>Images (minimum 4):</label>
                            <div className="image-upload-container">
                                <div className="image-preview-container">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="image-wrapper">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`preview ${idx}`}
                                                className="image-preview"
                                            />
                                            <button className="delete-image" onClick={() => handleRemoveImage(idx)}>
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={triggerFileInput}>
                                    Add Images
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAddImage}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                        <div className="submit-group">
                            <button type="submit" className="add-room-button">
                                Add Room
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            {showPopup && (
                <div className="popup">
                    <p>Room added successfully!</p>
                    <button onClick={() => window.location.reload()}>Ok</button>
                </div>
            )}
        </div>
    );
};

export default AddYourRoom;
