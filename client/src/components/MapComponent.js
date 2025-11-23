import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import axios from "../axiosConfig";

// Define marker icons
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  shadowUrl: markerShadow,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34],
  shadowSize: [45, 45],
});

function MapComponent({
  rooms = [],
  latitude,
  longitude,
  showMarker,
  onLocationChange,
  isAddingRoom,
  selectedRoomId,
}) {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({});

  // Default map center and zoom
  const defaultCenter = [28.209587, 83.985564];
  const defaultZoom = 10;

  // Determine mode based on rooms prop
  const isListingMode = Array.isArray(rooms) && rooms.length > 0;

  const [markerPosition, setMarkerPosition] = useState({
    lat: latitude || defaultCenter[0],
    lng: longitude || defaultCenter[1],
  });

  // Set map center and zoom based on mode or available data
  let mapCenter = defaultCenter;
  let zoom = defaultZoom;

  if (isListingMode && rooms[0]?.latitude && rooms[0]?.longitude) {
    mapCenter = [Number(rooms[0].latitude), Number(rooms[0].longitude)];
  } else if (!isListingMode) {
    mapCenter = [markerPosition.lat, markerPosition.lng];
    zoom = latitude && longitude ? 18 : defaultZoom;
  }

  // Component for interactive location selection
  function LocationSelector() {
    useMapEvents({
      click(e) {
        if (isAddingRoom) {
          const { lat, lng } = e.latlng;
          setMarkerPosition({ lat, lng });
          if (onLocationChange) onLocationChange(lat, lng);
        }
      },
    });
    return null;
  }

  // Fetch ratings for all rooms in listing mode
  useEffect(() => {
    const fetchAllRatings = async () => {
      const newRatings = {};
      await Promise.all(
        rooms.map(async (room) => {
          try {
            const res = await axios.get(`/api/rooms/${room._id}/average-rating`);
            newRatings[room._id] = res.data.averageRating || 0;
          } catch (error) {
            console.error(`Failed to fetch rating for room ${room._id}`, error);
            newRatings[room._id] = 0;
          }
        })
      );
      setRatings(newRatings);
    };

    if (isListingMode && rooms.length > 0) {
      fetchAllRatings();
    }
  }, [rooms, isListingMode]);

  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: "100%", height: "500px" }}
        worldCopyJump={false}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        minZoom={2}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19.5}
          noWrap={true}
          bounds={[[-90, -180], [90, 180]]}
        />

        {isListingMode ? (
          // Listing Mode: display markers for each room
          rooms.map((room) => {
            if (!room.latitude || !room.longitude) return null;

            const iconToUse = room._id === selectedRoomId ? selectedIcon : defaultIcon;
            const roomRating = ratings[room._id] || 0;

            return (
              <Marker
                key={room._id}
                position={[Number(room.latitude), Number(room.longitude)]}
                icon={iconToUse}
                eventHandlers={{
                  mouseover: (e) => e.target.openPopup(),
                  mouseout: (e) => e.target.closePopup(),
                  click: () => {
                    navigate(`/details/${room._id}/undefined/undefined`);
                  },
                }}
              >
                <Popup autoClose={false} closeOnClick={false} minWidth={200} maxWidth={300}>
                  <div className="popup-map-rooms">
                   <div>
  {room.imageUrls[0]?.startsWith("http") ? (
  <img src={room.imageUrls[0]} alt={room.name} />
) : (
  <img
    src={`${process.env.REACT_APP_API_URL}${room.imageUrls[0].startsWith('/') ? '' : '/'}${room.imageUrls[0]}`}
    alt={room.name}
  />
)}


  <div className="room-review-overlay-map">
    {roomRating > 0 ? (
      <>
        <div
          className="single-star-map"
          style={{
            position: 'relative',
            display: 'inline-block',
            fontSize: '24px',
            lineHeight: 1,
          }}
        >
          <div style={{ color: '#ddd' }}>★</div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              width: `${(roomRating / 5) * 100}%`,
              color: '#FFD700',
            }}
          >
            ★
          </div>
        </div>
        <span className="room-rating-text-map">{roomRating.toFixed(1)}</span>
      </>
    ) : (
      <span className="room-rating-text-map">No review</span>
    )}
  </div>
</div>

                    <div className="popup-map-rooms-right">
                      <h4>{room.name}</h4>
                      <p  className={room.roomStatus === "Booked Today" ? "status-red" : "status-green"}>
                        {room.roomStatus}
                      </p>
                      <p>
                        Room Type:{" "}
                        {room.roomtype === 'hotelRoom'
                          ? 'Hotel Room'
                          : room.roomtype === 'flat'
                          ? 'Flat'
                          : 'Room'}
                      </p>
                      <p>
                        Price: Rs.{room.price}{" "}
                        {room.roomtype === 'hotelRoom' ? 'per day' : 'per month'}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })
        ) : (
          // Interactive mode: enable location selection
          <>
            {isAddingRoom && <LocationSelector />}
            {showMarker && (
              <Marker position={markerPosition} icon={defaultIcon}>
                <Popup>This is the selected location</Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
