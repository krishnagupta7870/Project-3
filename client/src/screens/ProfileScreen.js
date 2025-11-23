import React, { useEffect, useRef, useState } from 'react';
import axios from "../axiosConfig";
import { useNavigate, useLocation } from 'react-router-dom';
import { Tag } from 'antd';
import AddYourRoom from '../components/AddYourRoom';
import ChatBox from '../components/ChatBox'; 
import profileIcon from '../assets/user-solid.svg';
import bookingsIcon from '../assets/booking-icon.png';
import contact from '../assets/customer-service.png';
import listroom from '../assets/list-property.png';
import logoutIcon from '../assets/logout.png';
import '../components/ProfileScreen.css'; 
import Rooms from '../components/Rooms';
import savedIcon from '../assets/saved.png';


function ProfileScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // Current User
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const userName = currentUser?.name || 'Guest';
  const userPhone = currentUser?.phone || 'Not Provided';
  const userEmail = currentUser?.email || 'Not Provided';
  const userId = currentUser?.id || 'Not Provided';

  // Selected Section (profile, bookings, etc.)
  const [selectedSection, setSelectedSection] = useState('profile');

  // Profile Image
  const [profileImage, setProfileImage] = useState(currentUser?.profilePic || null);
  const fileInputRef = useRef(null);

  // Bookings / Listings
  const [userBookings, setUserBookings] = useState([]);
  const [ownerListings, setOwnerListings] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]); // New state for owner's bookings
  const [expandedBookingRooms, setExpandedBookingRooms] = useState([]); // Track which rooms have expanded booking view

  const [savedRooms, setSavedRooms] = useState([]);


  // --------------------------
  // Chat integration for My Listings
  // --------------------------
  const [activeChatListing, setActiveChatListing] = useState(null);
  const toggleChat = (listingId) => {
    setActiveChatListing((prev) => (prev === listingId ? null : listingId));
  };

  // KYC States
  const [showKycForm, setShowKycForm] = useState(false); // For popup form
  const [kycStatus, setKycStatus] = useState(currentUser?.kycStatus || 'notSubmitted');
  // 'notSubmitted' | 'pending' | 'approved' | 'rejected'

  // State for success popup after submission
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // KYC Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Document Type
  const [documentType, setDocumentType] = useState('');

  // PP Photo
  const [ppPhoto, setPpPhoto] = useState(null);
  const [ppPhotoPreview, setPpPhotoPreview] = useState(null);
  const ppPhotoInputRef = useRef(null);

  // Citizenship/Driving License (front/back)
  const [documentFront, setDocumentFront] = useState(null);
  const [documentFrontPreview, setDocumentFrontPreview] = useState(null);
  const documentFrontInputRef = useRef(null);

  const [documentBack, setDocumentBack] = useState(null);
  const [documentBackPreview, setDocumentBackPreview] = useState(null);
  const documentBackInputRef = useRef(null);

  // Passport (single file)
  const [passportFile, setPassportFile] = useState(null);
  const [passportFilePreview, setPassportFilePreview] = useState(null);
  const passportInputRef = useRef(null);

  // Image Preview Modal
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);

  // Cancel Booking Confirmation Modal
  // We'll store an object containing bookingId and roomId.
  const [showCancelBookingConfirm, setShowCancelBookingConfirm] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Remove Room Confirmation Modal
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [roomIdToRemove, setRoomIdToRemove] = useState(null);

  const [savedRoomDetails, setSavedRoomDetails] = useState([]);

  // -------------------------------------------
  // Utility & Event Handlers
  // -------------------------------------------
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    return (
      (parts[0]?.[0] || '').toUpperCase() +
      (parts[1]?.[0] || '').toUpperCase()
    );
  };

  const handleProfileImageClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // KYC Photo changes
  const handlePpPhotoBoxClick = () => {
    ppPhotoInputRef.current && ppPhotoInputRef.current.click();
  };

  const handlePpPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPpPhoto(file);
      setPpPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Document Type
  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
    // Clear out old selections if user changes doc type
    setDocumentFront(null);
    setDocumentFrontPreview(null);
    setDocumentBack(null);
    setDocumentBackPreview(null);
    setPassportFile(null);
    setPassportFilePreview(null);
  };

  // Front/Back for document
  const handleDocumentFrontBoxClick = () => {
    documentFrontInputRef.current && documentFrontInputRef.current.click();
  };
  const handleDocumentBackBoxClick = () => {
    documentBackInputRef.current && documentBackInputRef.current.click();
  };
  const handleDocumentFrontChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFront(file);
      setDocumentFrontPreview(URL.createObjectURL(file));
    }
  };
  const handleDocumentBackChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentBack(file);
      setDocumentBackPreview(URL.createObjectURL(file));
    }
  };

  // Passport
  const handlePassportBoxClick = () => {
    passportInputRef.current && passportInputRef.current.click();
  };
  const handlePassportChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPassportFile(file);
      setPassportFilePreview(URL.createObjectURL(file));
    }
  };

  // KYC Submit
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('address', address);
      formData.append('phoneNumber', phoneNumber);
      if (ppPhoto) formData.append('ppPhoto', ppPhoto);
      formData.append('documentType', documentType);
      if (documentType === 'Passport') {
        if (passportFile) formData.append('passportFile', passportFile);
      } else {
        if (documentFront) formData.append('documentFront', documentFront);
        if (documentBack) formData.append('documentBack', documentBack);
      }
      await axios.post('/api/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowSuccessPopup(true);
      setKycStatus('pending');
    } catch (error) {
      console.error('KYC submission error:', error);
      alert('Error submitting KYC.');
    }
  };

  // Check KYC status
  const checkKycStatus = async () => {
    try {
      const { data } = await axios.get('/api/kyc/status', { params: { userId } });
      setKycStatus(data.status);
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  // Sign out
  const handleSignout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  // Remove Room Confirmation Handlers
  const handleRemoveClick = (roomId) => {
    setRoomIdToRemove(roomId);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveRoom = async () => {
    try {
      await axios.delete('/api/rooms/deleteRoom', { data: { roomId: roomIdToRemove } });
      fetchOwnerListings();
      setShowRemoveConfirm(false);
      setRoomIdToRemove(null);
    } catch (error) {
      console.error('Error removing room:', error);
      alert('Failed to remove room.');
    }
  };

  const cancelRemoveRoom = () => {
    setShowRemoveConfirm(false);
    setRoomIdToRemove(null);
  };

  // Cancel Booking Confirmation Handlers
  // We now store an object with bookingId and roomId
  const handleCancelBookingClick = (bookingId, roomId) => {
    setBookingToCancel({ bookingId, roomId });
    setShowCancelBookingConfirm(true);
  };

  const confirmCancelBooking = async () => {
    try {
      await axios.post('/api/bookings/cancelbooking', {
        bookingid: bookingToCancel.bookingId,
        roomid: bookingToCancel.roomId,
      });
      fetchBookings();
      setShowCancelBookingConfirm(false);
      setBookingToCancel(null);
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking.');
    }
  };

  const cancelCancelBooking = () => {
    setShowCancelBookingConfirm(false);
    setBookingToCancel(null);
  };

  // Fetch Bookings on mount
  async function fetchBookings() {
    if (userId === 'Not Provided') return;
    try {
      const { data } = await axios.post('/api/bookings/getbookingsbyuserId', { userId });
      setUserBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  }

  // Fetch Owner Listings
  async function fetchOwnerListings() {
    try {
      const { data } = await axios.get('/api/rooms/getByOwner', { params: { ownerId: userId } });
      setOwnerListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  }

  // Fetch bookings for owner's rooms
  async function fetchOwnerBookings() {
    if (userId === 'Not Provided') return;
    try {
      const { data } = await axios.post('/api/bookings/getBookingsByOwnerId', { ownerId: userId });
      setOwnerBookings(data);
    } catch (err) {
      console.error('Error fetching owner bookings:', err);
    }
  }

  useEffect(() => {
    if (userId !== 'Not Provided') {
      fetchBookings();
      fetchSavedRooms();
      if (currentUser.isOwner) {
        fetchOwnerListings();
        fetchOwnerBookings(); // Fetch owner bookings on component mount
      }
    }
  }, [userId, currentUser.isOwner]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      setSelectedSection(section);
    }
  }, [location.search]);

  // Image Preview Handlers (simple preview mode)
  const openImagePreview = (src) => {
    setPreviewImage(src);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImage(null);
    setImageScale(1);
  };
  useEffect(() => {
    if (selectedSection === 'saved') {
      fetchSavedRooms();
    }
  }, [selectedSection]);

  // Function to fetch saved rooms
  async function fetchSavedRooms() {
    try {
      const { data } = await axios.get(`/api/users/${userId}/savedrooms`);

      if (data.success) {
        setSavedRooms(data.savedRooms); // Set the savedRooms array to state
      } else {
        console.error('No saved rooms found');
      }
    } catch (err) {
      console.error('Error fetching saved rooms:', err);
    }
  }

  useEffect(() => {
    const fetchAllSavedRooms = async () => {
      const response = await fetch('/api/rooms/getroomsbyids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomIds: savedRooms })
      });
  
      const data = await response.json();
      setSavedRoomDetails(data.rooms);
    };
  
    if (savedRooms.length > 0) {
      fetchAllSavedRooms();
    }
  }, [savedRooms]);
  
  // In the useEffect section, add an effect to fetch ratings for all listings
  useEffect(() => {
    if (selectedSection === 'my-listings' && ownerListings.length > 0) {
      // Make sure each listing has rating information
      ownerListings.forEach(listing => {
        if (!listing.rating) {
          fetchRoomRating(listing._id);
        }
      });
    }
  }, [selectedSection, ownerListings]);

  // Add a function to fetch room rating
  const fetchRoomRating = async (roomId) => {
    try {
      const response = await axios.get(`/api/rooms/${roomId}/average-rating`);
      if (response.data.averageRating !== undefined) {
        console.log("Rating response:", response.data); // Log to see the response
        // Update the listing with the fetched rating
        setOwnerListings(prev => 
          prev.map(listing => 
            listing._id === roomId ? 
            {...listing, 
              rating: response.data.averageRating, 
              reviewCount: response.data.numberOfReviews // Use numberOfReviews from API
            } : 
            listing
          )
        );
      }
    } catch (error) {
      console.error('Error fetching room rating:', error);
    }
  };

  // Toggle expanded booking view for a specific room
  const toggleBookingsView = (roomId) => {
    setExpandedBookingRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId) 
        : [...prev, roomId]
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <button
            className={selectedSection === 'profile' ? 'active' : ''}
            onClick={() => setSelectedSection('profile')}
          >
            <img src={profileIcon} alt="Profile" className="profile-page-logo" />
            Profile
          </button>
          <button
            className={selectedSection === 'bookings' ? 'active' : ''}
            onClick={() => setSelectedSection('bookings')}
          >
            <img src={bookingsIcon} alt="Bookings" className="profile-page-logo" />
            My Bookings
          </button>
          <button
        className={selectedSection === 'saved' ? 'active' : ''}
        onClick={() => setSelectedSection('saved')}
      >
        <img src={savedIcon} alt="Saved" className="profile-page-logo" />
        Saved Rooms
      </button>
          
          <button
            className={selectedSection === 'support' ? 'active' : ''}
            onClick={() => setSelectedSection('support')}
          >
            <img src={contact} alt="Support" className="profile-page-logo" />
            Contact &amp; Support
          </button>
          <button
            className={selectedSection === 'list-room' ? 'active' : ''}
            onClick={() => {
              setSelectedSection('list-room');
              checkKycStatus();
            }}
          >
            <img src={listroom} alt="List Property" className="profile-page-logo" />
            List Your Property
          </button>
          {currentUser.isOwner && (
            <button
              className={selectedSection === 'my-listings' ? 'active' : ''}
              onClick={() => setSelectedSection('my-listings')}
            >
              <img src={listroom} alt="My Listings" className="profile-page-logo" />
              My Listings
            </button>
          )}
          <button className="logout" onClick={handleSignout}>
            <img src={logoutIcon} alt="Logout" className="profile-page-logo" />
            Logout
          </button>
        </div>

        {/* Right Content */}
        <div className="profile-content">
          {selectedSection === 'profile' && (
            <div className="profile-main-profile">
              <h1>Profile Details</h1>
              <div className="profile-card">
                <div className="profile-header">
                <div className="profile-image-container" onClick={handleProfileImageClick}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-pic-profile" />
                  ) : (
                    <div className="profile-initials">{getInitials(userName)}</div>
                  )}
                    <div className="profile-image-overlay">
                      <i className="fas fa-camera"></i>
                    </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleProfileImageChange}
                />
                  <div className="profile-name">
                    <h2>{userName}</h2>
                    {currentUser.isOwner && <span className="profile-badge">Property Owner</span>}
                  </div>
                </div>

                <div className="profile-info">
                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-envelope"></i>
                      <span>Email</span>
                    </div>
                    <div className="info-value">{userEmail}</div>
                  </div>

                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-phone"></i>
                      <span>Phone</span>
                    </div>
                    <div className="info-value">{userPhone}</div>
                  </div>

                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-id-card"></i>
                      <span>User ID</span>
                    </div>
                    <div className="info-value">{userId}</div>
                  </div>

                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-shield-alt"></i>
                      <span>KYC Status</span>
                    </div>
                    <div className="info-value">
                      {kycStatus === 'approved' && (
                        <span className="status-badge approved">
                          <i className="fas fa-check-circle"></i> Verified
                        </span>
                      )}
                      {kycStatus === 'pending' && (
                        <span className="status-badge pending">
                          <i className="fas fa-clock"></i> Pending
                        </span>
                      )}
                      {kycStatus === 'rejected' && (
                        <span className="status-badge rejected">
                          <i className="fas fa-times-circle"></i> Rejected
                        </span>
                      )}
                      {kycStatus === 'notSubmitted' && (
                        <span className="status-badge not-submitted">
                          <i className="fas fa-exclamation-circle"></i> Not Submitted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="update-profile-btn"
                    onClick={() => navigate('/profile/edit')}
                  >
                    <i className="fas fa-user-edit"></i> Edit Profile
                </button>

                  {kycStatus === 'notSubmitted' && (
                    <button
                      className="verify-kyc-btn"
                      onClick={() => {
                        setSelectedSection('list-room');
                        checkKycStatus();
                      }}
                    >
                      <i className="fas fa-id-card"></i> Verify Account
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div className="stat-value">{userBookings.length}</div>
                  <div className="stat-label">Bookings</div>
                </div>

                {currentUser.isOwner && (
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-home"></i>
                    </div>
                    <div className="stat-value">{ownerListings.length}</div>
                    <div className="stat-label">Listed Properties</div>
                  </div>
                )}

                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-bookmark"></i>
                  </div>
                  <div className="stat-value">{savedRooms.length}</div>
                  <div className="stat-label">Saved Rooms</div>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'bookings' && (
            <div className="bookings-container">
              <h1>My Bookings</h1>
              {userBookings.length > 0 ? (
                <ul className="booking-list">
                  {userBookings
                    .sort((a, b) => {
                      // Sort by newest first (using createdAt or _id as fallback)
                      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a._id.substring(0, 8));
                      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b._id.substring(0, 8));
                      return dateB - dateA; // Newest first
                    })
                    .map((booking) => {
                    // Parse dates for comparison
                    const fromDate = new Date(booking.fromdate);
                    const toDate = new Date(booking.todate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Reset time to start of day
                    
                    console.log(`Booking ${booking._id}:`, {
                      fromdate: booking.fromdate,
                      parsedFromDate: fromDate,
                      today: today,
                      roomType: booking.roomtype || booking.roomType
                    });
                    
                    // Check if fromdate is today or in the past
                    // Always allow reviews for bookings made today
                    const canReviewHotelRoom = true;
                    
                    // Check if booking is completed (checkout date is in the past)
                    const isCompleted = toDate < today;
                    const isArrived = booking.fromdate <= today;
                    
                    // Determine if we should show review button based on roomtype
                    const showReviewButton = 
                      booking.roomtype === 'hotelRoom' || booking.roomType === 'hotelRoom' 
                        ? canReviewHotelRoom  // For hotel rooms, only show if check-in date has passed
                        : true;               // For other room types, always show
                    
                    return (
                      <li key={booking._id} className={`booking-item ${booking.status === 'cancelled' ? 'cancelled' : isCompleted ? 'completed' : 'booked'}`}>
                        <div className="booking-item-header">
                          <div className="booking-item-title">
                      <h2>{booking.room}</h2>
                            <span className="booking-type">{booking.roomtype}</span>
                          </div>
                          <div className="booking-status">
                            {booking.status === 'cancelled' ? (
                              <Tag color="red">CANCELLED</Tag>
                            ) : isCompleted ? (
                              <Tag color="blue">COMPLETED</Tag>
                            ) : (
                              <Tag color="green">BOOKED</Tag>
                            )}
                          </div>
                        </div>
                        
                        <div className="booking-item-details">
                          <div className="booking-item-info">
                            <div className="info-row">
                              <div className="info-label">
                                <i className="fas fa-calendar-check"></i>
                                Check In
                              </div>
                              <div className="info-value">{booking.fromdate}</div>
                            </div>
                            
                            <div className="info-row">
                              <div className="info-label">
                                <i className="fas fa-calendar-times"></i>
                                Check Out
                              </div>
                              <div className="info-value">{booking.todate}</div>
                            </div>
                            
                            <div className="info-row">
                              <div className="info-label">
                                <i className="fas fa-home"></i>
                                Room Type
                              </div>
                              <div className="info-value">
                                {booking.roomType === 'hotelRoom' ? 'Hotel Room' : 
                                 booking.roomType === 'flat' ? 'Apartment/Flat' : 
                                 booking.roomType === 'room' ? 'Private Room' : booking.roomtype}
                              </div>
                            </div>
                            
                            <div className="info-row">
                              <div className="info-label">
                                <i className="fas fa-credit-card"></i>
                                Payment Method
                              </div>
                              <div className="info-value payment-method">
                                {booking.paymentMethod === 'Khalti' ? (
                                  <><i className="fas fa-wallet text-purple"></i> Khalti</>
                                ) : booking.paymentMethod === 'esewa' ? (
                                  <><i className="fas fa-wallet text-green"></i> eSewa</>
                                ) : booking.paymentMethod === 'Stripe' ? (
                                  <><i className="fas fa-credit-card"></i> Card Payment</>
                                ) : (
                                  <><i className="fas fa-money-bill"></i> Standard Payment</>
                                )}
                              </div>
                            </div>
                            
                            <div className="info-row">
                              <div className="info-label">
                                <i className="fas fa-money-bill-wave"></i>
                                Total Amount
                              </div>
                              <div className="info-value price">Rs.{booking.totalamount}</div>
                            </div>
                            
                            {/* <div className="info-row">
                              <div className="info-label">
                                <i className="fas fa-receipt"></i>
                                Booking ID
                              </div>
                              <div className="info-value booking-id">{booking._id}</div>
                            </div> */}

                            <div className="info-row">
                              <div className="info-label">
                                <i className="fas fa-clock"></i>
                                Reservation Time
                              </div>
                              <div className="info-value">
                                {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'Not available'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="booking-room-details">
                            <h3>Property Details</h3>
                            <p>
                              <i className="fas fa-map-marker-alt"></i> 
                              <span><strong>Address:</strong> {booking.roomaddress || "Address not available"}</span>
                      </p>
                      <p>
                              <i className="fas fa-user"></i>
                              <span><strong>Owner:</strong> {booking.ownerName || "Not available"}</span>
                      </p>
                      <p>
                              <i className="fas fa-phone"></i>
                              <span><strong>Contact:</strong> {booking.ownerPhone || "Not available"}</span>
                            </p>
                            {booking.roomFeatures && booking.roomFeatures.length > 0 && (
                              <div className="room-features">
                                <p><strong>Features:</strong></p>
                                <div className="features-list">
                                  {booking.roomFeatures.map((feature, index) => (
                                    <span key={index} className="feature-tag">
                                      <i className="fas fa-check-circle"></i> {feature}
                        </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="booking-item-actions">
                        {booking.status !== 'cancelled' && (
                            <>
                              {showReviewButton &&  (
                                <button 
                                  className="review-booking-btn"
                                  onClick={() => {
                                    navigate(`/details/${booking.roomid}/undefined/undefined?showReviewForm=true`);
                                    // Add scroll to review section logic
                                    setTimeout(() => {
                                      const reviewSection = document.getElementById('reviews-section');
                                      if (reviewSection) {
                                        reviewSection.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }, 1000);
                                  }}
                                >
                                  <i className="fas fa-star"></i> Write Review
                                </button>
                              )}
                              {!isCompleted && (
                          <button
                            className="cancel-booking-btn"
                            onClick={() => handleCancelBookingClick(booking._id, booking.roomid)}
                          >
                                  <i className="fas fa-times-circle"></i> Cancel Booking
                          </button>
                        )}
                            </>
                          )}
                        </div>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="no-bookings">
                  <i className="fas fa-calendar-times no-bookings-icon"></i>
                  <p>You don't have any bookings yet.</p>
                  <button onClick={() => navigate('/')} className="browse-rooms-btn">
                    Browse Rooms
                  </button>
                </div>
              )}
            </div>
          )}
          {selectedSection === 'saved' && (
  <div>
    <h1>My Saved Rooms</h1>
    {savedRoomDetails.length > 0 ? (
      <div className="my-save-room-list">
        {savedRoomDetails.map((room) => (
          <Rooms key={room._id} room={room} />
        ))}
      </div>
    ) : (
      <p>No saved rooms yet.</p>
    )}
  </div>
)}



{selectedSection === 'support' && (
  <div className="support-container">
    <h1>Contact & Support</h1>
    
    <div className="admin-contact-info">
      <div className="contact-method">
        <i className="fas fa-envelope"></i>
        <div>
          <h3>Email Support</h3>
          <p>support@avasbooking.com</p>
          <a href="mailto:support@avasbooking.com" className="contact-button">Send Email</a>
        </div>
      </div>
      
      <div className="contact-method">
        <i className="fas fa-phone-alt"></i>
        <div>
          <h3>Call Us</h3>
          <p>+977 9800000000</p>
          <p className="support-hours">Available Sunday-Friday, 9AM-6PM</p>
        </div>
      </div>
    </div>

    <div className='support-container-chatbox'>
      <ChatBox
        roomid="1234567890"
        currentUser={currentUser}
        ownerId="68001083272ec6d7af3d83c0"
      />
    </div>
  </div>
)}

          {selectedSection === 'list-room' && (
            <div>
              <h1>List Your Property</h1>
              {kycStatus === 'notSubmitted' && (
                <div>
                  <p>Please submit your KYC documents for verification before listing.</p>
                  <button onClick={() => setShowKycForm(true)}>Start KYC Verification</button>
                </div>
              )}
              {kycStatus === 'pending' && (
                <div className="kyc-under-review">
                  <p>Your KYC documents are under review.</p>
                  <button onClick={checkKycStatus}>Refresh Status</button>
                </div>
              )}
              {kycStatus === 'approved' && (
                <div>
                  <AddYourRoom isOwnerView={true} />
                </div>
              )}
              {kycStatus === 'rejected' && (
                <div className="kyc-rejected-message">
                  <p>Your KYC has been rejected. Please resubmit.</p>
                  <button onClick={() => setShowKycForm(true)}>Resubmit KYC</button>
                </div>
              )}
            </div>
          )}

{selectedSection === 'my-listings' && (
  <div className="owner-listings-section">
    <h1>My Listings</h1>
    {ownerListings.length > 0 ? (
      <ul className="owner-property-list">
        {ownerListings.map((listing) => (
          <li key={listing._id} className="owner-property-card">
            <div className="owner-property-layout">
              {/* Main Property Info */}
              <div className="owner-property-main">
                {/* Left Column */}
                <div className="owner-property-left">
                  {/* Room Type Badge */}
                  <div className={`owner-property-badge ${listing.roomtype === 'hotelRoom' ? 'owner-badge-hotel' : 
                     listing.roomtype === 'flat' ? 'owner-badge-apartment' : 'owner-badge-room'}`}>
                    {listing.roomtype === 'hotelRoom' ? 'Hotel Room' : 
                     listing.roomtype === 'flat' ? 'Flat' : 'Room'}
                  </div>
                  
                  {/* Photo Gallery */}
                  <div className="owner-property-gallery-container">
  <div className="owner-property-gallery">
    {listing.imageUrls && listing.imageUrls.length > 0 ? (
      listing.imageUrls.map((photo, idx) => (
        <img
          key={idx}
          src={photo.startsWith('http') ? photo : `${process.env.REACT_APP_API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`}
          alt={`Room Photo ${idx + 1}`}
          className="owner-property-image"
          onClick={() => openImagePreview(photo.startsWith('http') ? photo : `${process.env.REACT_APP_API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`)}
        />
      ))
    ) : (
      <p>No Photos Available</p>
    )}
  </div>
</div>

                  
                  {/* Info Section */}
                  <div className="owner-info-section">
                    {/* Room Address */}
                    <div className="owner-address-box">
                      <i className="fas fa-map-marker-alt"></i>
                      <div className="owner-address-content">
                        <strong>Location:</strong> {listing.address}
                        <div><small>Distance from Highway: {listing.awayFromHighway}</small></div>
                      </div>
                    </div>
                    
                    {/* Features Box */}
                    <div className="owner-features-container">
                      <strong>Facilities:</strong>
                      {listing.features && listing.features.length > 0 ? (
                        listing.features.map((feature, idx) => (
                          <span key={idx} className="owner-feature-tag">{feature}</span>
                        ))
                      ) : (
                        <span>No facilities available</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="owner-property-right">
                  {/* Room Details */}
                  <div className="owner-property-info">
                    <h2>{listing.name}</h2>
                    
                    {/* Price Tag */}
                    <div className="owner-property-price">
                      Rs.{listing.price}
                      <span>{listing.roomtype === 'hotelRoom' ? 'per day' : 'per month'}</span>
                    </div>
                    
                    {/* Rating Display */}
                    <div className="owner-rating-display">
                      <div className="owner-stars-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= (listing.rating || 0) ? "owner-star-filled" : "owner-star-empty"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="owner-rating-value">{listing.rating ? listing.rating.toFixed(1) : 'No Rating'}</span>
                      <span className="owner-rating-count">({listing.reviewCount || 0} reviews)</span>
                      <button 
                        className="owner-reviews-button"
                        onClick={() => {
                          navigate(`/details/${listing._id}/undefined/undefined`);
                          // Add scroll to review section logic
                          setTimeout(() => {
                            const reviewSection = document.getElementById('reviews-section');
                            if (reviewSection) {
                              reviewSection.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 1000);
                        }}
                      >
                        <i className="fas fa-star"></i> View Reviews
                      </button>
                    </div>
                    
                    <p><strong>Room Type:</strong> {listing.roomtype === 'hotelRoom' ? 'Hotel Room' : 
                       listing.roomtype === 'flat' ? 'Apartment/Flat' : 'Private Room'}</p>
                    
                    <p><strong>Description:</strong> {listing.description}</p>
                    
                    {/* Room Action Buttons */}
                    <div className="owner-button-group">
                      {/* <button 
                        className="owner-edit-button" 
                        onClick={() => navigate(`/edit-room/${listing._id}`)}
                      >
                        <i className="fas fa-edit"></i> Edit Room
                      </button> */}
                      
                      <button className="owner-delete-button" onClick={() => handleRemoveClick(listing._id)}>
                        <i className="fas fa-trash-alt"></i> Remove Room
                      </button>

                      <button 
                        className="owner-bookings-button" 
                        onClick={() => toggleBookingsView(listing._id)}
                      >
                        <i className="fas fa-calendar-check"></i> 
                        {expandedBookingRooms.includes(listing._id) ? 'Hide Bookings' : 'View Bookings'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bookings Section - Show when expanded */}
              {expandedBookingRooms.includes(listing._id) && (
                <div className="owner-property-bookings">
                  <h3 className="owner-bookings-title">Room Bookings</h3>
                  {ownerBookings.filter(booking => booking.roomid.toString() === listing._id.toString()).length > 0 ? (
                    <div className="owner-bookings-list">
                      {ownerBookings
                        .filter(booking => booking.roomid.toString() === listing._id.toString())
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((booking) => (
                          <div key={booking._id} className="owner-booking-item">
                            <div className="owner-booking-header">
                              <h4>Booking #{booking._id.substring(0, 8)}</h4>
                              <span className={`owner-booking-status ${booking.status}`}>
                                {booking.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="owner-booking-details">
                              <div className="owner-booking-dates">
                                <div>
                                  <strong>Check In:</strong> {booking.fromdate}
                                </div>
                                <div>
                                  <strong>Check Out:</strong> {booking.todate}
                                </div>
                                <div>
                                  <strong>Duration:</strong> {booking.totaldays} {booking.totaldays === 1 ? 'day' : 'days'}
                                </div>
                              </div>
                              <div className="owner-booking-guest">
                                <div>
                                  <strong>Guest:</strong> {booking.userName || 'N/A'}
                                </div>
                                <div>
                                  <strong>Phone:</strong> {booking.userPhone || 'N/A'}
                                </div>
                                <div>
                                  <strong>Email:</strong> {booking.userEmail || 'N/A'}
                                </div>
                              </div>
                              <div className="owner-booking-payment">
                                <div>
                                  <strong>Amount:</strong> Rs. {booking.totalamount}
                                </div>
                                <div>
                                  <strong>Payment:</strong> {booking.paymentMethod || 'N/A'}
                                </div>
                                <div>
                                  <strong>Transaction ID:</strong> {booking.transactionId || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="owner-no-bookings">
                      <i className="fas fa-calendar-times"></i>
                      <p>No bookings for this property yet.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Dedicated Chat Section - Now as a full width row */}
              <div className="owner-property-chat">
                <h3 className="owner-chat-title">Customer Inquiries</h3>
                {currentUser && (
                  <div className="owner-chat-container">
                    <ChatBox roomid={listing._id} currentUser={currentUser} ownerId={listing.ownerId} />
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="owner-empty-state">
        <i className="fas fa-home owner-empty-icon"></i>
        <p>You haven't listed any properties yet.</p>
        <button onClick={() => setSelectedSection('list-room')} className="owner-add-button">
          <i className="fas fa-plus-circle"></i> Add Your First Property
        </button>
      </div>
    )}
  </div>
)}

        </div>
      </div>

      {/* KYC Modal Popup */}
      {showKycForm && (
        <div className="kyc-modal-overlay">
          <div className="kyc-modal-content">
            <button className="kyc-close-button" onClick={() => setShowKycForm(false)}>X</button>
            <h2>KYC Verification</h2>
            <p>Submit following to initiate KYC Process</p>
            <form onSubmit={handleKycSubmit} className="kyc-form">
              {/* PP-size Photo */}
              <div className="form-group">
                <div className="ppsizephoto">
                  <label>PP-size Photo:</label>
                  <div className="photo-upload-square" onClick={handlePpPhotoBoxClick}>
                    {ppPhotoPreview ? (
                      <img src={ppPhotoPreview} alt="PP Preview" />
                    ) : (
                      <span>Click to Upload</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={ppPhotoInputRef}
                    style={{ display: 'none' }}
                    onChange={handlePpPhotoChange}
                  />
                </div>
              </div>
              {/* Row: First Name & Last Name */}
              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/* Address */}
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              {/* Phone Number */}
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              {/* Document Type */}
              <div className="form-group document-type-group">
                <label>Document Type:</label>
                <select
                  value={documentType}
                  onChange={handleDocumentTypeChange}
                  required
                  className="customer-select"
                >
                  <option value="">-- Select --</option>
                  <option value="Citizenship">Citizenship</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              {/* If Passport => single upload */}
              {documentType === 'Passport' && (
                <div className="form-group document-section">
                  <label>Upload Passport:</label>
                  <div className="passport-container">
                    <div className="photo-upload-square" onClick={handlePassportBoxClick}>
                      {passportFilePreview ? (
                        <img src={passportFilePreview} alt="Passport Preview" />
                      ) : (
                        <span>Click to Upload</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      ref={passportInputRef}
                      style={{ display: 'none' }}
                      onChange={handlePassportChange}
                    />
                  </div>
                </div>
              )}
              {/* If Citizenship or Driving License => front/back */}
              {(documentType === 'Citizenship' || documentType === 'Driving License') && (
                <div className="form-group document-section">
                  <label>Upload Document (Front &amp; Back):</label>
                  <div className="document-row">
                    {/* Front */}
                    <div className="photo-upload-square" onClick={handleDocumentFrontBoxClick}>
                      {documentFrontPreview ? (
                        <img src={documentFrontPreview} alt="Front Preview" />
                      ) : (
                        <span>Front</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      ref={documentFrontInputRef}
                      style={{ display: 'none' }}
                      onChange={handleDocumentFrontChange}
                    />
                    {/* Back */}
                    <div className="photo-upload-square" onClick={handleDocumentBackBoxClick}>
                      {documentBackPreview ? (
                        <img src={documentBackPreview} alt="Back Preview" />
                      ) : (
                        <span>Back</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      ref={documentBackInputRef}
                      style={{ display: 'none' }}
                      onChange={handleDocumentBackChange}
                    />
                  </div>
                </div>
              )}
              
              {/* Submit */}
              <button type="submit" className="kyc-submit-button">
                Submit KYC
              </button>
            </form>
            {/* Success Popup */}
            {showSuccessPopup && (
              <div className="popup-overlay-for-kyc-success">
                <div className="popup-content-for-kyc-success">
                  <p>
                    KYC submitted successfully. Your documents are under review.
                  </p>
                  <button onClick={() => window.location.reload()}>OK</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="image-preview-overlay" onClick={closeImagePreview}>
          <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-preview-close" onClick={closeImagePreview}>X</button>
            <div className="image-preview-display">
              <img src={previewImage} alt="Preview" style={{ transform: `scale(${imageScale})` }} />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {showCancelBookingConfirm && (
        <div className="confirm-remove-overlay" onClick={cancelCancelBooking}>
          <div className="confirm-remove-content" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to cancel this booking?</p>
            <div className="confirm-remove-actions">
              <button className="cancel-button" onClick={cancelCancelBooking}>Don't Cancel</button>
              <button className="remove-button" onClick={confirmCancelBooking}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Room Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="confirm-remove-overlay" onClick={cancelRemoveRoom}>
          <div className="confirm-remove-content" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to remove your property?</p>
            <div className="confirm-remove-actions">
              <button className="cancel-button" onClick={cancelRemoveRoom}>Cancel</button>
              <button className="remove-button" onClick={confirmRemoveRoom}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileScreen;
