// AdminScreen.jsx
import React, { useEffect, useState } from 'react';
import axios from "../axiosConfig";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AddYourRoom from '../components/AddYourRoom';
import ChatBox from '../components/ChatBox'; 
import '../components/AdminScreen.css';

dayjs.extend(relativeTime);

function AdminScreen() {
  const [selectedSection, setSelectedSection] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);
  const [chatSessions, setChatSessions] = useState([]); // List of chat sessions from users
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for KYC Popup
  const [selectedKycRequest, setSelectedKycRequest] = useState(null);
  const [showKycPopup, setShowKycPopup] = useState(false);

  // State for Image Preview Modal
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);

  // Admin authentication check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.isAdmin) {
      setIsAdmin(true);
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  }, []);

  // Fetch data for each section when selectedSection changes
  useEffect(() => {
    if (selectedSection === 'bookings') {
      fetchBookings();
    } else if (selectedSection === 'rooms') {
      fetchRooms();
    } else if (selectedSection === 'users') {
      fetchUsers();
    } else if (selectedSection === 'payments') {
      fetchPayments();
    } else if (selectedSection === 'kyc-request') {
      fetchKycRequests();
    } else if (selectedSection === 'admin-chat') {
      
    }
  }, [selectedSection]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/getallbookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms/getallrooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/getallusers');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments/getallpayments');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchKycRequests = async () => {
    try {
      const response = await axios.get('/api/kyc/getallkyc');
      setKycRequests(response.data);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
    }
  };

  // New function: Fetch chat sessions initiated by users for support
  const fetchChatSessions = async () => {
    try {
      // Assumes an API endpoint that returns support chat sessions relevant to admin
      const response = await axios.get('/api/chats/admin');
      setChatSessions(response.data); // response.data should be an array of chat sessions
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  // KYC Popup Handlers
  const openKycPopup = (request) => {
    setSelectedKycRequest(request);
    setShowKycPopup(true);
  };

  const closeKycPopup = () => {
    setShowKycPopup(false);
    setSelectedKycRequest(null);
  };

  const handleApproveKyc = async (requestId) => {
    try {
      await axios.post('/api/kyc/approve', { requestId });
      alert('KYC Approved. User is now an owner.');
      closeKycPopup();
      fetchKycRequests();
    } catch (error) {
      alert('Error approving KYC.');
    }
  };

  const handleRejectKyc = async (requestId) => {
    try {
      await axios.post('/api/kyc/reject', { requestId });
      alert('KYC Rejected.');
      closeKycPopup();
      fetchKycRequests();
    } catch (error) {
      alert('Error rejecting KYC.');
    }
  };

  // Image Preview Handlers
  const openImagePreview = (src) => {
    setPreviewImage(src);
    setImageScale(1);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImage(null);
    setImageScale(1);
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }
  if (!isAdmin) {
    return null;
  }

  // Get current admin user from localStorage
  const currentAdmin = JSON.parse(localStorage.getItem('currentUser'));

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      <div className="admin-navbar">
        <button className={selectedSection === 'bookings' ? 'active' : ''} onClick={() => setSelectedSection('bookings')}>
          Bookings
        </button>
        <button className={selectedSection === 'rooms' ? 'active' : ''} onClick={() => setSelectedSection('rooms')}>
          Rooms
        </button>
        <button className={selectedSection === 'users' ? 'active' : ''} onClick={() => setSelectedSection('users')}>
          Users
        </button>
        <button className={selectedSection === 'payments' ? 'active' : ''} onClick={() => setSelectedSection('payments')}>
          Payments
        </button>
        <button className={selectedSection === 'add-room' ? 'active' : ''} onClick={() => setSelectedSection('add-room')}>
          Add Room
        </button>
        <button className={selectedSection === 'kyc-request' ? 'active' : ''} onClick={() => setSelectedSection('kyc-request')}>
          KYC Request
        </button>
        <button className={selectedSection === 'admin-chat' ? 'active' : ''} onClick={() => setSelectedSection('admin-chat')}>
          Admin Chat
        </button>
      </div>

      <div className="admin-content">
        {selectedSection === 'add-room' && (
          <div>
            <AddYourRoom />
          </div>
        )}

        {selectedSection === 'bookings' && (
          <div>
            {bookings.length > 0 ? (
              <div className="table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>Booking Id</th>
                      <th>User Id</th>
                      <th>Room</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <tr key={booking._id}>
                        <td>{index + 1}</td>
                        <td>{booking._id}</td>
                        <td>{booking.userid}</td>
                        <td>{booking.room}</td>
                        <td>{booking.fromdate}</td>
                        <td>{booking.todate}</td>
                        <td>Rs. {booking.totalamount}</td>
                        <td>{booking.status === 'cancelled' ? <span className="status cancelled">CANCELLED</span> : <span className="status booked">BOOKED</span>}</td>
                        <td>{dayjs(booking.createdAt).fromNow()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No bookings found.</p>
            )}
          </div>
        )}

        {selectedSection === 'rooms' && (
          <div>
            {rooms.length > 0 ? (
              <div className="table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>Room Id</th>
                      <th>Name</th>
                      <th>Owner Id</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room, index) => (
                      <tr key={room._id}>
                        <td>{index + 1}</td>
                        <td>{room._id}</td>
                        <td>{room.name}</td>
                        <td>{room.ownerId}</td>
                        <td>{room.roomtype}</td>
                        <td>
                          Rs. {room.price}{' '}
                          {room.roomtype === 'hotelRoom' ? <span className="admin-rooms-price"> per day</span> : <span className="admin-rooms-price"> per month</span>}
                        </td>
                        <td>{dayjs(room.listedAt || room.createdAt).fromNow()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No rooms found.</p>
            )}
          </div>
        )}

        {selectedSection === 'users' && (
          <div>
            {users.length > 0 ? (
              <div className="table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>User Id</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td>{user._id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.isAdmin ? 'Admin' : user.isOwner ? 'Owner' : user.isRenter ? 'Customer' : 'User'}</td>
                        <td>{dayjs(user.createdAt).fromNow()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No users found.</p>
            )}
          </div>
        )}

        {selectedSection === 'payments' && (
          <div>
            {payments.length > 0 ? (
              <div className="table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>Payment Id</th>
                      <th>User Id</th>
                      <th>Room Id</th>
                      <th>Gateway</th>
                      <th>Paid Amount</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment._id}>
                        <td>{index + 1}</td>
                        <td>{payment._id}</td>
                        <td>{payment.customer_id}</td>
                        <td>{payment.room_id}</td>
                        <td>{payment.gateway}</td>
                        <td>Rs. {payment.amount}</td>
                        <td>
                          {payment.status === 'Completed' || payment.status === 'succeeded' ? (
                            <span className="status booked">Completed</span>
                          ) : (
                            <span className="kyc-status-pending">Pending</span>
                          )}
                        </td>
                        <td>{dayjs(payment.createdAt).fromNow()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No payments found.</p>
            )}
          </div>
        )}

        {selectedSection === 'kyc-request' && (
          <div>
            {kycRequests.length > 0 ? (
              <div className="table-container">
                <table className="kyc-table">
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>Request ID</th>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Phone Number</th>
                      <th>Address</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycRequests.map((request, index) => (
                      <tr key={request._id}>
                        <td>{index + 1}</td>
                        <td>{request._id}</td>
                        <td>{request.userId}</td>
                        <td>{request.firstName} {request.lastName}</td>
                        <td>{request.phoneNumber}</td>
                        <td>{request.address}</td>
                        <td>
                          <button className="view-details-button" onClick={() => openKycPopup(request)}>
                            View Details
                          </button>
                        </td>
                        <td>
                          {request.status.toLowerCase() === 'approved' ? (
                            <span className="kyc-status-approved">APPROVED</span>
                          ) : request.status.toLowerCase() === 'rejected' ? (
                            <span className="kyc-status-rejected">REJECTED</span>
                          ) : (
                            <span className="kyc-status-pending">PENDING</span>
                          )}
                        </td>
                        <td>{dayjs(request.createdAt).fromNow()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No KYC requests found.</p>
            )}
          </div>
        )}

        {/* Admin Chat Section */}
        {selectedSection === 'admin-chat' && (
          <div className="admin-chat-section">
            <h1>Support Chat Sessions</h1>
            <div className="admin-chat-box">
                <ChatBox roomid="1234567890" currentUser={currentAdmin} ownerId="68001083272ec6d7af3d83c0" />
              </div>
            
          </div>
        )}
      </div>

      {/* KYC Details Popup */}
      {showKycPopup && selectedKycRequest && (
        <div className="popup-overlay">
          <div className="popup-overlay-container">
            <div className="popup-content">
              <button className="popup-close" onClick={closeKycPopup}>X</button>
              <h2>KYC Verification Details</h2>
              <div className="kyc-details">
                <div className="inline-group">
                  <label>Profile Photo:</label>
                  <div className="photo-upload-square-admin-profile" onClick={() => openImagePreview(`/${selectedKycRequest.ppPhoto}`)}>
                    {selectedKycRequest.ppPhoto ? (
                      <img src={`/${selectedKycRequest.ppPhoto}`} alt="Profile Photo" />
                    ) : (
                      <span>No Profile Photo</span>
                    )}
                  </div>
                </div>
                <div className="inline-groupss">
                  <label>Full Name:</label>
                  <p>{selectedKycRequest.firstName} {selectedKycRequest.lastName}</p>
                </div>
                <div className="inline-groupss">
                  <label>Address:</label>
                  <p>{selectedKycRequest.address}</p>
                </div>
                <div className="inline-groupss">
                  <label>Phone Number:</label>
                  <p>{selectedKycRequest.phoneNumber}</p>
                </div>
                <div className="inline-groupss">
                  <label>Document Type:</label>
                  <p>{selectedKycRequest.documentType}</p>
                </div>
                {selectedKycRequest.documentType === 'Passport' ? (
                  <div className="inline-group">
                    <label>Passport:</label>
                    <div className="photo-upload-square-adminside" onClick={() => openImagePreview(`/${selectedKycRequest.passportFile}`)}>
                      {selectedKycRequest.passportFile ? (
                        <img src={`/${selectedKycRequest.passportFile}`} alt="Passport File" />
                      ) : (
                        <span>No Passport File</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="inline-group">
                      <label>Document Front:</label>
                      <div className="photo-upload-square-adminside" onClick={() => openImagePreview(`/${selectedKycRequest.documentFront}`)}>
                        {selectedKycRequest.documentFront ? (
                          <img src={`/${selectedKycRequest.documentFront}`} alt="Document Front" />
                        ) : (
                          <span>No Front Image</span>
                        )}
                      </div>
                    </div>
                    <div className="inline-group">
                      <label>Document Back:</label>
                      <div className="photo-upload-square-adminside" onClick={() => openImagePreview(`/${selectedKycRequest.documentBack}`)}>
                        {selectedKycRequest.documentBack ? (
                          <img src={`/${selectedKycRequest.documentBack}`} alt="Document Back" />
                        ) : (
                          <span>No Back Image</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="kyc-popup-actions">
                <button className="approve-button" onClick={() => handleApproveKyc(selectedKycRequest._id)}>
                  Approve
                </button>
                <button className="reject-button" onClick={() => handleRejectKyc(selectedKycRequest._id)}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="image-preview-overlay" onClick={closeImagePreview}>
          <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-preview-display">
              <img src={previewImage} alt="Preview" style={{ transform: `scale(${imageScale})` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminScreen;
