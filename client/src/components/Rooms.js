import React, { useState, useEffect } from 'react';
import axios from "../axiosConfig";
import addressLogo from '../assets/location-dot-solid.svg';
import timeago from '../assets/clock-regular.svg';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import saveIcon from '../assets/save.png';
import savedIcon from '../assets/saved.png';

function Rooms({ room, fromdate, todate }) {

  const listingTime = new Date(room.createdAt);
  const maxLength = 140;
  const [isSaved, setIsSaved] = useState(false);
  const [avgRating, setAvgRating] = useState(0);


  useEffect(() => {
    const fetchSavedRooms = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('Stored user:', storedUser);
        if (!storedUser) return;

        const response = await axios.get(`/api/users/${storedUser.id}/savedrooms`);
        console.log('Saved rooms response:', response.data);

        if (response.data.success) {
          // Since savedRooms is already an array of strings, you can use it directly.
          const savedRoomIds = response.data.savedRooms.map(r => r.toString());
          console.log('Saved room IDs:', savedRoomIds);
          if (savedRoomIds.includes(room._id.toString())) {
            setIsSaved(true);
          } else {
            setIsSaved(false);
          }
        }
      } catch (error) {
        console.error('Error fetching saved rooms:', error);
      }
    };

    fetchSavedRooms();
  }, [room._id]);


  const handleToggleSaved = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!storedUser) {
        alert('Please log in to save rooms.');
        return;
      }

      const userId = storedUser.id || storedUser._id;

      if (!isSaved) {
        const response = await axios.patch(`/api/users/${userId}/saveroom`, { roomid: room._id });
        console.log('Save room response:', response.data);
        if (response.data.success) {
          setIsSaved(true);
        }
      } else {
        const response = await axios.patch(`/api/users/${userId}/unsaveroom`, { roomid: room._id });
        console.log('Unsave room response:', response.data);
        if (response.data.success) {
          setIsSaved(false);
        }
      }
    } catch (error) {
      console.error('Error toggling save state:', error);
    }
  };
  // for average rating
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await axios.get(`/api/rooms/${room._id}/average-rating`);
        setAvgRating(response.data.averageRating);
      } catch (error) {
        console.error('Error fetching average rating:', error);
        setAvgRating(0);
      }
    };

    fetchAverageRating();
  }, [room._id]);


  return (
    <div className='container'>
      <div className='sub-container'>
        <div className='mainImage'>
          <Link to={`/details/${room._id}/${fromdate || 'undefined'}/${todate || 'undefined'}`}>
  <img
    src={`${process.env.REACT_APP_API_URL}${room.imageUrls[0].startsWith('/') ? '' : '/'}${room.imageUrls[0]}`}
    alt={room.name}
  />
</Link>
          <button
            onClick={handleToggleSaved}
            className="save-room-btn"
            title={isSaved ? "Unsave Room" : "Save Room"}
          >
            <img
              src={isSaved ? savedIcon : saveIcon}
              alt="Save Toggle Icon"
              className="save-icon"
            />
          </button>
          <div className="room-review-overlay">
            {avgRating > 0 ? (
              <>
                <div className="single-star" style={{ position: 'relative', display: 'inline-block', fontSize: '24px', lineHeight: 1 }}>
                  {/* Background outline star */}
                  <div style={{ color: '#ddd' }}>★</div>
                  {/* Filled overlay star; fill based on avgRating */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    width: `${(avgRating / 5) * 100}%`,
                    color: '#FFD700',
                  }}>
                    ★
                  </div>
                </div>
                <span className="room-rating-text">{avgRating.toFixed(1)}</span>
              </>
            ) : (
              <span className="room-rating-text">No review</span>
            )}
          </div>
        </div>
        <div className='room-info'>
          <p className='time-ago'>
            <img src={addressLogo} alt="Address logo" className='icons' />{' '}
            {room.address}
          </p>
          <p className='time-ago'>
            <img src={timeago} alt="Time icon" className='icons' />{' '}
            {formatDistanceToNow(listingTime, { addSuffix: true })} ago
          </p>
          <Link to={`/details/${room._id}/${fromdate || 'undefined'}/${todate || 'undefined'}`}>
            <h2>{room.name}</h2>
          </Link>
          <h4>
            RS. {room.price} <b>{room.roomtype === 'hotelRoom' ? 'per day' : 'per month'}</b>
          </h4>
          <p>From Highway: <strong>{room.awayFromHighway}</strong></p>
          <p>
            Status:{' '}
            <strong style={{ color: room.roomStatus === "Available Now" ? "green" : "red" }}>
              {room.roomStatus}
            </strong>
          </p>
          <Link to={`/details/${room._id}/${fromdate || 'undefined'}/${todate || 'undefined'}`}>
            <p>
              {room.description.length > maxLength
                ? `${room.description.substring(0, maxLength)}`
                : room.description}
              {room.description.length > maxLength && (
                <button className='more-btn'>...</button>
              )}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Rooms;
