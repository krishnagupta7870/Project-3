import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import axios from "../axiosConfig";
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { formatDistanceToNow } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import KhaltiButton from "../components/KhaltiPayment";
import EsewaPayment from '../components/EsewaPayment';
import StripeCheckout from '../components/StripePayment';
import { useNavigate, useLocation } from 'react-router-dom';
import './RoomDetails.css';

import ChatBox from '../components/ChatBox';
import saveIcon from '../assets/save.png';
import savedIcon from '../assets/saved.png';
import ReviewForm from '../components/ReviewForm';
import '../components/ReviewForm.css'
import mapimage from '../assets/map.png';
import { Modal } from 'antd';
const MapComponent = lazy(() => import('../components/MapComponent'));
function RoomDetails({ }) {
  const { roomid, fromdate, todate } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Convert date strings to moment objects and initialize dates
  const fromdateMoment = fromdate !== 'undefined' ? moment(fromdate, 'DD-MM-YYYY') : null;
  const todateMoment = todate !== 'undefined' ? moment(todate, 'DD-MM-YYYY') : null;

  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  // Date handling state - initialize with URL params if they exist
  const [selectedStartDate, setSelectedStartDate] = useState(fromdateMoment ? fromdateMoment.toDate() : null);
  const [selectedEndDate, setSelectedEndDate] = useState(todateMoment ? todateMoment.toDate() : null);
  const [totalDays, setTotalDays] = useState(
    fromdateMoment && todateMoment ? todateMoment.diff(fromdateMoment, 'days') + 1 : 0
  );
  const [bookedDates, setBookedDates] = useState([]);



  // For date-fns "time ago" display
  const listingTime = room?.createdAt;
  const [isSaved, setIsSaved] = useState(false);


  // State for reviews list and average rating
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // State to track if current user has booked the room (thus is eligible to review)
  const [hasBooked, setHasBooked] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Add this after the reviews state
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(3);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  
  // Function to change page
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Update displayed reviews when reviews data or pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    
    // Sort reviews: current user's review first, then by date
    const sortedReviews = [...reviews].sort((a, b) => {
      if (currentUser && a.user?._id === currentUser?.id) return -1;
      if (currentUser && b.user?._id === currentUser?.id) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    setDisplayedReviews(sortedReviews.slice(startIndex, endIndex));
  }, [reviews, currentPage, reviewsPerPage, currentUser]);

  const getRatingDescription = (rating) => {
    if (rating >= 4.5) return 'Fabulous';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.0) return 'Good';
    if (rating >= 2.0) return 'Average';
    if (rating >= 1.0) return 'Poor';
    if (rating > 0) return 'Very Poor';
    return 'No Reviews Yet';
  };


  // Initialize currentUser from localStorage
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Fetch the room details and booked dates on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.post('/api/rooms/getroombyid', { roomid });
        setRoom(response.data);

        // Convert currentBookings dates to Date objects for the calendar
        const bookedDatesList = [];
        response.data.currentBookings.forEach(booking => {
          const start = moment(booking.fromdate, 'DD-MM-YYYY');
          const end = moment(booking.todate, 'DD-MM-YYYY');

          // Add all dates between start and end (inclusive)
          let current = start;
          while (current <= end) {
            bookedDatesList.push(current.toDate());
            current = current.clone().add(1, 'days');
          }
        });
        setBookedDates(bookedDatesList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room data:', error);
        setLoading(false);
        setError(error);
      }
    };
    const fetchAllRooms = async () => {
      try {
        const res = await axios.get('/api/rooms/getallrooms');
        setAllRooms(res.data);
        console.log('All rooms:', res.data); // Debug log
      } catch (err) {
        console.error('Error fetching all rooms:', err);
      }
    };
    fetchData();
    fetchAllRooms();
  }, [roomid]);

  //Saved ROom 
  useEffect(() => {
    const fetchSavedRoom = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!storedUser) return;
        const userId = storedUser.id || storedUser._id;
        const response = await axios.get(`/api/users/${userId}/savedrooms`);
        if (response.data.success) {
          const savedRoomIds = response.data.savedRooms.map(r => r.toString());
          if (savedRoomIds.includes(roomid.toString())) {
            setIsSaved(true);
          } else {
            setIsSaved(false);
          }
        }
      } catch (error) {
        console.error('Error fetching saved rooms:', error);
      }
    };

    fetchSavedRoom();
  }, [roomid]);
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
        const response = await axios.patch(`/api/users/${userId}/saveroom`, { roomid });
        if (response.data.success) {
          setIsSaved(true);
        }
      } else {
        const response = await axios.patch(`/api/users/${userId}/unsaveroom`, { roomid });
        if (response.data.success) {
          setIsSaved(false);
        }
      }
    } catch (error) {
      console.error('Error toggling save state:', error);
    }
  };

  // Fetch reviews and average rating
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRes = await axios.get(`/api/reviews/${roomid}`);
        setReviews(reviewsRes.data);

        const avgRes = await axios.get(`/api/rooms/${roomid}/average-rating`);
        setAvgRating(avgRes.data.averageRating);
        setReviewCount(avgRes.data.numberOfReviews);
      } catch (error) {
        console.error('Error fetching reviews or rating:', error);
      }
    };

    if (roomid) {
      fetchReviews();
    }
  }, [roomid]);

  // ✅ Check if the user has booked this room
  useEffect(() => {
    const checkBookingStatus = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!storedUser) return;

        // Get token from localStorage
        const token = localStorage.getItem('token');

        // ✅ Call the backend to check if the user has booked
        const response = await axios.post(
          "/api/bookings/hasBooked",
          { roomid }, // Send roomid from props/URL
          { headers: { Authorization: `Bearer ${token}` } } // Include token
        );

        setHasBooked(response.data.hasBooked);
        setCurrentUser(storedUser);
        
        // If booked, get the user's bookings to check if they can review
        if (response.data.hasBooked) {
          try {
            // Get all bookings for this user
            const bookingsResponse = await axios.post(
              "/api/bookings/getbookingsbyuserId",
              { userId: storedUser.id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Find the booking for this room
            const roomBooking = bookingsResponse.data.find(
              booking => booking.roomid.toString() === roomid.toString()
            );
            
            if (roomBooking) {
              console.log("Found booking:", roomBooking);
              
              // For hotel rooms, check if check-in date is today or in the past
              if (roomBooking.roomType === 'hotelRoom') {
                const today = moment().startOf('day');
                const checkinDate = moment(roomBooking.fromdate, 'DD-MM-YYYY');
                
                // Can review if check-in date is today or in the past
                const canReviewNow = checkinDate.isSameOrBefore(today);
                console.log(
                  'Check-in date:', checkinDate.format('YYYY-MM-DD'),
                  'Today:', today.format('YYYY-MM-DD'),
                  'Can review:', canReviewNow
                );
                setCanReview(canReviewNow);
              } else {
                // For flats and rooms, always allow reviews once booked
                setCanReview(true);
              }
            }
          } catch (error) {
            console.error("Error fetching user bookings:", error);
            // For now, if there's an error, just let them review
            setCanReview(true);
          }
        } else {
          setCanReview(false);
        }
      } catch (error) {
        console.error("Error checking booking status:", error);
        setHasBooked(false);
        setCanReview(false);
      }
    };
    if (roomid) {
      checkBookingStatus();
    }
  }, [roomid]); // Re-run when roomid changes

  const refreshReviews = async () => {
    try {
      const reviewsRes = await axios.get(`/api/reviews/${roomid}`);
      setReviews(reviewsRes.data);

      const avgRes = await axios.get(`/api/rooms/${roomid}/average-rating`);
      setAvgRating(avgRes.data.averageRating);
      setReviewCount(avgRes.data.numberOfReviews);
    } catch (error) {
      console.error("Failed to refresh reviews or rating:", error);
    }
  };
  // Add this OUTSIDE ReviewForm, near the top of your reviews component file
  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`star ${index < Math.floor(rating) ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };


  // Now that room is available, compute location availability
  const hasLocation = room && room.latitude && room.longitude;

  // Update the handleDateChange function
  const handleDateChange = (dates) => {
    const [start, end] = dates || [null, null];
    console.log('Selected dates:', start, end); // Debug log

    // Always update the selected dates
    setSelectedStartDate(start);
    setSelectedEndDate(end);

    // If we have both dates, perform validation and update
    if (start && end) {
      const startMoment = moment(start);
      const endMoment = moment(end);

      // Check if dates are selected in reverse order
      const isBackwardSelection = startMoment.isAfter(endMoment);
      const firstDate = isBackwardSelection ? endMoment : startMoment;
      const lastDate = isBackwardSelection ? startMoment : endMoment;

      // Check if selected dates overlap with booked dates
      const isOverlapping = room.currentBookings.some(booking => {
        const bookingStart = moment(booking.fromdate, 'DD-MM-YYYY');
        const bookingEnd = moment(booking.todate, 'DD-MM-YYYY');
        return (
          firstDate.isBetween(bookingStart, bookingEnd, null, '[]') ||
          lastDate.isBetween(bookingStart, bookingEnd, null, '[]') ||
          bookingStart.isBetween(firstDate, lastDate, null, '[]') ||
          bookingEnd.isBetween(firstDate, lastDate, null, '[]')
        );
      });

      if (isOverlapping) {
        alert('Some of these dates are already booked. Please select different dates.');
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setTotalDays(0);
        return;
      }

      setTotalDays(Math.abs(endMoment.diff(startMoment, 'days')) + 1);

      const startFormatted = firstDate.format('DD-MM-YYYY');
      const endFormatted = lastDate.format('DD-MM-YYYY');
      navigate(`/details/${roomid}/${startFormatted}/${endFormatted}`, { replace: true });
    } else {
      setTotalDays(0);
    }
  };

  // Function to check if a date is booked
  const isDateBooked = (date) => {
    return bookedDates.some(bookedDate =>
      moment(date).format('YYYY-MM-DD') === moment(bookedDate).format('YYYY-MM-DD')
    );
  };

  // Custom day class names
  const getDayClassNames = (date) => {
    const isBooked = isDateBooked(date);
    if (isBooked && date >= new Date()) {
      return "booked-date";
    }
    return "";
  };

  // Toggle functions remain the same
  const toggleGallery = () => {
    setShowGallery(!showGallery);
  };

  const toggleBookingDetails = () => {
    // First, check if a user is logged in
    if (!localStorage.getItem('currentUser')) {
      window.location.href = '/LoginSignupScreen';
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    // If the room is a hotel room, require check in and check out dates
    if (room.roomtype === 'hotelRoom' && (!selectedStartDate || !selectedEndDate)) {
      alert('Please select a date range.');
      return;
    }

    // Otherwise, proceed with toggling the booking popup
    setIsOpen(!isOpen);
  };


  const toggleBookingSuccess = () => {
    if (isBooked) {
      return;
    }
    setIsBooked(true);
  };

  useEffect(() => {
    if (room) {
      console.log('Room type:', room.roomtype);
      console.log('Full room data:', room);
      window.scrollTo(0, 0);
    }
  }, [room]);

  // Add this useEffect to check if user has submitted a review
  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const userReview = reviews.find(review => review.user?._id === currentUser?.id);
      setHasSubmittedReview(!!userReview);
    } else {
      setHasSubmittedReview(false);
    }
  }, [currentUser, reviews]);

  // Check for query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('showReviewForm') === 'true') {
      setShowReviewForm(true);
      
      // Scroll to review section with a slight delay to ensure the page is loaded
      setTimeout(() => {
        const reviewSection = document.getElementById('reviews-section');
        if (reviewSection) {
          reviewSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000);
    }
  }, [location.search]);

  // Handlers to control the Map Modal
  const showMapModal = () => {
    setIsMapModalVisible(true);
  };
  const handleMapModalCancel = () => {
    setIsMapModalVisible(false);
  };

  // Add state for success message popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  // Function to handle successful review submission
  const handleReviewSubmitted = (newReview) => {
    refreshReviews();
    setShowReviewForm(false);
    setHasSubmittedReview(true);
    setSuccessMessage('Review submitted successfully!');
    setShowSuccessPopup(true);
  };

  return (
    <div className="room-details-main">
      {/* Success popup */}
      {showSuccessPopup && (
        <div className="review-success-popup">
          <div className="review-success-content">
            <i className="fas fa-check-circle"></i>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <div className={`loading-container ${loading ? 'visible' : ''}`}>
        <p className="loading-text">Loading...</p>
      </div>

      <div className={isOpen ? 'booking-popup-blurred-bg' : ''}>
        {error && <p>Error: {error.message}</p>}

        {room && (
          <div className="room-details-content">
            {/* Room Images Section */}
            <div className="room-images">
              <div className="large-image">
                <img
  src={
    room.imageUrls[0].startsWith('http')
      ? room.imageUrls[0]
      : `${process.env.REACT_APP_API_URL}${room.imageUrls[0].startsWith('/') ? '' : '/'}${room.imageUrls[0]}`
  }
  alt="Room"
/>

                <p className="room-info-time-ago">
                  {listingTime ? formatDistanceToNow(new Date(listingTime), { addSuffix: true }) : 'Unknown time'}
                </p>
                <button
                  onClick={handleToggleSaved}
                  className="save-room-btn detail-position"
                  title={isSaved ? "Unsave Room" : "Save Room"}
                >
                  <img
                    src={isSaved ? savedIcon : saveIcon}
                    alt="Save Toggle Icon"
                    className="save-icon"
                  />
                </button>
              </div>

              <div className="small-images">
  {room.imageUrls.slice(1, 4).map((url, index) => {
    const finalUrl = url.startsWith('http')
      ? url
      : `${process.env.REACT_APP_API_URL}${url.startsWith('/') ? '' : '/'}${url}`;

    return (
      <div key={index} className={`small-img-wrapper ${index === 2 ? 'with-overlay' : ''}`}>
        <img
          src={finalUrl}
          alt={`Image ${index + 1}`}
          className={`small-img ${index === 2 && room.imageUrls.length > 4 ? 'blur-img' : ''} small-img-${index + 1}`}
        />
        {index === 2 && room.imageUrls.length > 4 && (
          <div className="overlay" onClick={toggleGallery}>
            <span>+{room.imageUrls.length - 3}</span>
          </div>
        )}
      </div>
    );
  })}
</div>


             {showGallery && (
  <div className="gallery">
    <div className="gallery-content">
      <button className="close-gallery" onClick={toggleGallery}>x</button>
      {room.imageUrls.map((url, index) => {
        const finalUrl = url.startsWith('http')
          ? url
          : `${process.env.REACT_APP_API_URL}${url.startsWith('/') ? '' : '/'}${url}`;

        return (
          <img
            key={index}
            src={finalUrl}
            alt={`Gallery Image ${index + 1}`}
            className={`gallery-image gallery-image-${index + 1}`}
          />
        );
      })}
    </div>
  </div>
)}

            </div>

            {/* Content Section Below Images */}
            <div className="room-details-content-below">
              <div className="room-details-header">
                <div className="room-title-section">
                  <h2>{room.name}</h2>
                  <p>Address: <strong>{room.address}</strong></p>
                  <div className="room-details-box1">
                    <div>
                      <p>Price/{room.roomtype === "hotelRoom" ? "day" : "month"}</p>
                      <p><strong>Rs.{room.price}</strong></p>
                    </div>
                    <div>
                      <p>Listing Type</p>
                      <p>
                        <strong>
                          {room.roomtype === "hotelRoom"
                            ? "Hotel Room"
                            : room.roomtype === "flat"
                              ? "Flat for Rent"
                              : "Room for Rent"}
                        </strong>
                      </p>
                    </div>
                    <div>
                      <p>From Highway</p>
                      <p style={{ textAlign: "center" }}>
                        <strong>{room.awayFromHighway}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="hotel-amenities">
                    <h3>Amenities</h3>
                    <div className="amenities-list">
                      {room.features?.map((feature, index) => (
                        <span key={index} className="amenity-item">{feature}</span>
                      ))}
                    </div>
                  </div>
                  <div className="description-box">
                    <h3>Description</h3>
                    {room.description.split('. ').map((sentence, index) => (
                      <p key={index}>{sentence}.</p>
                    ))}
                  </div>
                </div>
                <div className='room-chat-section'>



                  {room.roomtype === 'hotelRoom' && (
                    <div className="date-picker-section">
                      <h3>Select Your Dates</h3>
                      <div className="calendar-container">
                        <DatePicker
                          selected={selectedStartDate}
                          onChange={handleDateChange}
                          startDate={selectedStartDate}
                          endDate={selectedEndDate}
                          selectsRange
                          inline
                          monthsShown={2}
                          minDate={moment().startOf('day').toDate()}
                          excludeDates={bookedDates}
                          dateFormat="dd-MM-yyyy"
                          dayClassName={getDayClassNames}
                          allowSameDay={true}
                          shouldCloseOnSelect={false}
                          isClearable={true}
                        />
                      </div>
                      <div className="date-legend">
                        <div className="legend-item">
                          <span className="legend-color booked"></span>
                          <span>Booked Dates</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color selected"></span>
                          <span>Your Selection</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>

                    <button
                      className="room-details-book-btn"
                      onClick={toggleBookingDetails}
                    >
                      Book Now
                    </button>
                  </div>
                  {/* Map Preview Section (square shaped) */}
                  <div className=" map-peview-container-roomdetails">
                    <div className="map-preview map-preview-roomdetails" onClick={showMapModal}>
                      <img
                        src={mapimage}
                        alt="Map Preview"
                      />
                      <div className="map-preview-overlay">View on Map</div>
                    </div>
                  </div>
                  <div>

                    {currentUser && (
                      <div className="chat-section">
                        <h3>Chat with Owner</h3>
                        <ChatBox roomid={roomid} currentUser={currentUser} ownerId={room.ownerId} />
                      </div>
                    )}
                  </div>
                </div>
              </div>



              <div id="reviews-section" className="reviews-section">
                <div className="avg-rating">
                  <h1>Reviews and Ratings</h1>
                  <div className="rating-header">
                    <div className="rating-details">
                      <div className="rating-badge">{avgRating.toFixed(1)}</div>
                      <StarRating rating={avgRating} />
                      <div className="rating-text">
                        <span>
                          {getRatingDescription(avgRating)} • {reviewCount} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                  {reviews.length > 0 && (
                    <div className="review-cards-container">
                      <div className="review-cards">
                        {displayedReviews.map((review) => (
                          <div className="review-card" key={review._id}>
                            {editingReview && editingReview._id === review._id ? (
                              <ReviewForm
                                roomid={roomid}
                                existingReview={review}
                                onReviewUpdated={() => {
                                  refreshReviews();
                                  setEditingReview(null);
                                }}
                                onCancel={() => setEditingReview(null)}
                              />
                            ) : (
                              <>
                                <div className="review-header">
                                  <div className="user-circle">{review.user?.name?.charAt(0)}</div>
                                  <h4>{review.user?.name?.split(' ')[0]}</h4>

                                  <div className="user-info">
                                    <div className="user-rating">
                                      <StarRating rating={review.rating} />
                                      <span className="rating-value">{review.rating.toFixed(1)}</span>
                                    </div>
                                    <p className="review-date">
                                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="review-comment">"{review.comment}"</div>

                                {currentUser && review.user?._id === currentUser?.id && (
                                  <button
                                    onClick={() => setEditingReview(review)}
                                    className="edit-button"
                                    aria-label="Edit review"
                                  >
                                    Edit
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {reviews.length > reviewsPerPage && (
                        <div className="pagination-controls">
                          <button 
                            className="pagination-button"
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            &lt;
                          </button>
                          <div className="pagination-info">
                            {currentPage} of {totalPages}
                          </div>
                          <button 
                            className="pagination-button"
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            &gt;
                          </button>
                        </div>
                      )}
                    </div>
                  )}


                  {/* New Review Form */}
                  {!editingReview && currentUser && hasBooked && !hasSubmittedReview && (showReviewForm || canReview) && (
                    <div className="new-review-section">
                      <ReviewForm
                        roomid={roomid}
                        onReviewSubmitted={handleReviewSubmitted}
                      />
                    </div>
                  )}

                  {/* Message for users who booked but can't review yet */}
                  {!editingReview && currentUser && hasBooked && !canReview && !hasSubmittedReview && !showReviewForm && room?.roomtype === 'hotelRoom' && (
                    <div className="review-not-available">
                      <p>You can submit a review after your check-in date.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
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

            {allRooms.length > 0 ? (
              <MapComponent
                rooms={allRooms}          // Pass all rooms
                selectedRoomId={roomid}   // Highlight the current room
              />
            ) : (
              <p>Loading map...</p>
            )}
          </div>

        </Suspense>
      </Modal>

      {isOpen && room && (
        <div className="booking-popup-overlay">
          <div className="booking-popup-content">
            <div className="booking-popup-content-left">
  <h2>{room.name}</h2>
  <div className="booking-popup-image">
    <img
      src={
        room.imageUrls[0].startsWith('http')
          ? room.imageUrls[0]
          : `${process.env.REACT_APP_API_URL}${room.imageUrls[0].startsWith('/') ? '' : '/'}${room.imageUrls[0]}`
      }
      alt="Room"
    />
  </div>
  <p><strong className="strong">{room.address}</strong></p>
</div>

            <div className="booking-popup-content-right">
              <h3>Booking Details</h3>
              <div className="booking-details-detail">
                <p>Name: <strong className="strong">{currentUser?.name}</strong></p>
                <p>Phone Number: <strong className="strong">{currentUser?.phone}</strong></p>
                {room.roomtype === 'hotelRoom' ? (
                  <>
                    <p>Check In: <strong className="strong">
                      {selectedStartDate ? moment(selectedStartDate).format('DD-MM-YYYY') : fromdate}
                    </strong></p>
                    <p>Check Out: <strong className="strong">
                      {selectedEndDate ? moment(selectedEndDate).format('DD-MM-YYYY') : todate}
                    </strong></p>
                  </>
                ) : (
                  <p>Email: <strong className="strong">{currentUser?.email}</strong></p>
                )}

              </div>
              <h3>Amount</h3>
              {room.roomtype === 'hotelRoom' ? (
                <div className="booking-amount-detail">
                  <p>Total Days: <strong className="strong">{totalDays}</strong></p>
                  <p>Rent Per Day: <strong className="strong">Rs.{room.price}</strong></p>
                  <h3>Total Amount: <strong className="strong">Rs.{totalDays * room.price}</strong></h3>
                </div>
              ) : (
                <div className="booking-amount-detail">
                  <p>Rent Per Month: <strong className="strong">Rs.{room.price}</strong></p>
                  <h3>Total Amount: <strong className="strong">Rs.{room.price}</strong></h3>
                </div>
              )}
<div>

              <button className="booking-popup-cancel" onClick={toggleBookingDetails}>Cancel</button>
              <button className="booking-popup-book" onClick={toggleBookingSuccess}>Book Now</button>
</div>
            </div>
          </div>
        </div>
      )}

      {isBooked && room && (
        <div className="booking-type-content">
          <div className="booking-type-items">
            <h2 className="payment-header">Choose Payment Method</h2>
            <div className="booking-types">
              <button className="payment-option khalti-button">
                <KhaltiButton
                  amount={room && room.type === "hotel room" ? totalDays * room.price : room?.price}
                  room={room.name}
                  fromdate={selectedStartDate ? moment(selectedStartDate).format('DD-MM-YYYY') : fromdate}
                  todate={selectedEndDate ? moment(selectedEndDate).format('DD-MM-YYYY') : todate}
                  roomid={roomid}
                  totaldays={totalDays}
                  roomType={room.roomtype}
                />
              </button>

              <button className="payment-option card-button">
                <StripeCheckout
                  amount={room && room.type === "hotel room" ? totalDays * room.price : room?.price}
                  room={room.name}
                  fromdate={selectedStartDate ? moment(selectedStartDate).format('DD-MM-YYYY') : fromdate}
                  todate={selectedEndDate ? moment(selectedEndDate).format('DD-MM-YYYY') : todate}
                  roomid={roomid}
                  totaldays={totalDays}
                  roomType={room.roomtype}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomDetails;
