import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from "../axiosConfig";
import Rooms from '../components/Rooms';
import { DatePicker, Slider, Modal, Button } from 'antd';
import moment from 'moment';
import Loading from '../components/Loading';
import mapimage from '../assets/map.png';
import Footer from '../components/Footer';
// Lazy load MapComponent
const MapComponent = lazy(() => import('../components/MapComponent'));
const { RangePicker } = DatePicker;

function Homescreen() {
  const [rooms, setrooms] = useState([]);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [fromdate, setfromdate] = useState('');
  const [todate, settodate] = useState('');
  const [duplicaterooms, setduplicaterooms] = useState([]);
  const [searchkey, setsearchkey] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('hotelRoom'); // Default is 'hotelRoom'
  const [sortOption, setSortOption] = useState(''); // Sorting options
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [visibleRooms, setVisibleRooms] = useState(5);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  // LOAD MORE ROOMS: Show 5 rooms initially
  const loadMoreRooms = () => {
    setVisibleRooms(prev => prev + 5);
  };

  // Helper function to convert distance string to meters
  function convertDistanceToMeters(distanceStr) {
    if (!distanceStr) return Infinity;
    const lower = distanceStr.trim().toLowerCase();
    if (lower.includes('km')) {
      return parseFloat(lower) * 1000;
    } else if (/(\bm\b|\bmeter\b|\bmeters\b)/.test(lower)) {
      return parseFloat(lower);
    }
    return parseFloat(distanceStr);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setloading(true);
        const response = await axios.get('/api/rooms/getallrooms');
        // Initially, filter to show hotel rooms
        setrooms(response.data.filter(room => room.roomtype?.toLowerCase() === 'hotelroom'));
        setduplicaterooms(response.data);
        setloading(false);
      } catch (error) {
        seterror(error.message);
        console.log(error);
        setloading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setVisibleRooms(6);
  }, [selectedRoomType]);

  // Apply all filters whenever dependencies change
  useEffect(() => {
    let tempRooms = [...duplicaterooms];

    // Apply date filter ONLY if hotelRoom is selected and dates are set
    if (selectedRoomType === 'hotelRoom' && fromdate && todate) {
      tempRooms = filterRoomsByDateOnly(tempRooms, fromdate, todate);
    }

    // Apply type filter
    tempRooms = filterByTypeOnly(tempRooms, selectedRoomType);

    // Apply search filter
    tempRooms = filterBySearchOnly(tempRooms, searchkey);

    // Apply price range filter
    tempRooms = filterByPriceRange(tempRooms, priceRange);


    // Apply sorting based on selected option
    if (sortOption === 'priceLowToHigh') {
      tempRooms.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'priceHighToLow') {
      tempRooms.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newestFirst') {
      tempRooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'oldestFirst') {
      tempRooms.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    else if (sortOption === 'nearestHighway') {
      tempRooms.sort((a, b) => convertDistanceToMeters(a.awayFromHighway) - convertDistanceToMeters(b.awayFromHighway));
    }

    // Exclude rooms whose roomStatus is "Not Available" (update this string as needed)
    tempRooms = tempRooms.filter(room => room.roomStatus !== "Not Available");

    setrooms(tempRooms);
  }, [duplicaterooms, fromdate, todate, selectedRoomType, searchkey, priceRange, sortOption]);

  // Handler for date changes (only used for hotel rooms)
  function handleDateChange(dates) {
    if (dates) {
      setfromdate(dates[0].format('DD-MM-YYYY'));
      settodate(dates[1].format('DD-MM-YYYY'));
    } else {
      setfromdate('');
      settodate('');
    }
  }

  // Handler for type filter changes
  function handleTypeFilter(type) {
    setSelectedRoomType(type);
  }

  // Helper function to filter by date only (Only for Hotel Rooms)
  function filterRoomsByDateOnly(rooms, fromdate, todate) {
    return rooms.filter((room) => {
      if (room.roomtype?.toLowerCase() !== 'hotelroom') return true;

      const bookings = Array.isArray(room.currentBookings) ? room.currentBookings : [];
      for (const booking of bookings) {
        const bookingStartDate = moment(booking.fromdate, 'DD-MM-YYYY');
        const bookingEndDate = moment(booking.todate, 'DD-MM-YYYY');
        const requestedStartDate = moment(fromdate, 'DD-MM-YYYY');
        const requestedEndDate = moment(todate, 'DD-MM-YYYY');

        if (
          (requestedStartDate.isBetween(bookingStartDate, bookingEndDate, null, '[)') ||
            requestedEndDate.isBetween(bookingStartDate, bookingEndDate, null, '(]') ||
            requestedStartDate.isSame(bookingStartDate, 'day') ||
            requestedEndDate.isSame(bookingEndDate, 'day') ||
            (requestedStartDate.isBefore(bookingStartDate) && requestedEndDate.isAfter(bookingEndDate)))
        ) {
          return false;
        }
      }
      return true;
    });
  }

  // Helper function to filter by type only
  function filterByTypeOnly(rooms, type) {
    if (type === 'hotelRoom') {
      return rooms.filter((room) => room.roomtype?.toLowerCase() === 'hotelroom');
    } else if (type === 'flat') {
      return rooms.filter((room) => room.roomtype?.toLowerCase() === 'flat');
    } else if (type === 'room') {
      return rooms.filter((room) => room.roomtype?.toLowerCase() === 'room');
    } else if (type === 'all') {
      return rooms.filter((room) => {
        const rt = room.roomtype?.toLowerCase();
        return rt === 'flat' || rt === 'room';
      });
    }
    return rooms;
  }

  // Helper function to filter by search only
  function filterBySearchOnly(rooms, searchKey) {
    if (!searchKey) return rooms;
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(searchKey.toLowerCase()) ||
        room.address.toLowerCase().includes(searchKey.toLowerCase())
    );
  }

  // Helper function to filter by price range
  function filterByPriceRange(rooms, range) {
    const [min, max] = range;
    return rooms.filter(room => room.price >= min && room.price <= max);
  }

  // Handlers to control the Map Modal
  const showMapModal = () => {
    setIsMapModalVisible(true);
  };
  const handleMapModalCancel = () => {
    setIsMapModalVisible(false);
  };

  return (
    <div className='home-screen-container' id='rooms-section'>
      <div className='home-screen-container-top'>
        <div className='home-screen-container-top-left'>
          <div className='range-picker'>
            <RangePicker
              format="DD-MM-YYYY"
              onChange={handleDateChange}
              disabled={selectedRoomType !== 'hotelRoom'}
            />
          </div>
          <div className='search-room'>
            <input
              type="text"
              className='search-room-font'
              placeholder='Search rooms...'
              value={searchkey}
              onChange={(e) => setsearchkey(e.target.value)}
            />
          </div>
        </div>
        {/* Map Preview Section (square shaped) */}
        <div className="map-preview-container">
          <div className="map-preview" onClick={showMapModal}>
            <img
              src={mapimage}
              alt="Map Preview"
            />
            <div className="map-preview-overlay">View on map</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className='room-filters'>
        <div className="top-filters">
          <div className="type-buttons">
            <button className={selectedRoomType === 'hotelRoom' ? 'selected-btn' : ''} onClick={() => handleTypeFilter('hotelRoom')}>Hotel Rooms</button>
            <button className={selectedRoomType === 'flat' ? 'selected-btn' : ''} onClick={() => handleTypeFilter('flat')}>Flats</button>
            <button className={selectedRoomType === 'room' ? 'selected-btn' : ''} onClick={() => handleTypeFilter('room')}>Rooms</button>
            <button className={selectedRoomType === 'all' ? 'selected-btn' : ''} onClick={() => handleTypeFilter('all')}>
              <div className="tooltip">Flats & Rooms</div>
            </button>
          </div>

        </div>

        <div className="bottom-filters">
          <div className="sort-options">
            <label>Sort By: </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={sortOption && sortOption !== 'none' ? 'blue-border' : 'default-border'}
            >
              <option value="none">None</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="newestFirst">Newest First</option>
              <option value="oldestFirst">Oldest First</option>
              <option value="nearestHighway">Nearest to Highway</option>
            </select>
          </div>
          <div className="price-range-filter">
            <label>Price Range: </label>
            <Slider
              range
              min={0}
              max={50000}
              value={priceRange}
              onChange={setPriceRange}
              marks={{ 0: '0', 50000: '50000' }}
            />
          </div>

        </div>
      </div>




      {/* Rooms Container */}
      <div className='rooms-container'>
        {loading ? (
          <Loading />
        ) : error ? (
          <h1>Error: {error}</h1>
        ) : rooms.length === 0 ? (
          <h2 className='no-room-available'>No rooms available for the selected filter range.</h2>
        ) : (
          rooms.slice(0, visibleRooms).map((room, index) => {
            // If this is the last visible room and there are more available, wrap it in a container with an overlay.
            if (index === visibleRooms - 1 && visibleRooms < rooms.length) {
              return (
                <div key={room._id} className="room-card-container">
                  <Rooms room={room} fromdate={fromdate} todate={todate} />
                  <div className="more-overlay" onClick={loadMoreRooms} tabIndex="-1">
                    <span>Load More Rooms</span>
                  </div>
                </div>
              );
            } else {
              return (
                <Rooms key={room._id} room={room} fromdate={fromdate} todate={todate} />
              );
            }
          })
        )}
      </div>

      {/* Modal for Map */}
      <Modal
        title={null}
        visible={isMapModalVisible}
        onCancel={handleMapModalCancel}
        footer={null}
        closable={false}
        maskClosable={true}
        width="80%"
        zIndex={100}
        style={{ top: 150, padding: 0 }}
        bodyStyle={{ padding: 0, margin: '-70px', height: '80vh', overflow: 'hidden' }}
      >
        <Suspense fallback={<div>Loading Map...</div>}>
          <div style={{ width: '100%', height: '100%' }}>
            <MapComponent rooms={rooms} />
          </div>
        </Suspense>
      </Modal>


      <div className='footer-container-main'>
        <Footer />
      </div>
    </div>
  );
}

export default Homescreen;
