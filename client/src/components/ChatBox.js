import React, { useState, useEffect, useRef } from 'react';
import axios from "../axiosConfig";
import io from 'socket.io-client';
import '../screens/RoomDetails.css';

// Connect to your Socket.io backend
const socket = io(process.env.REACT_APP_API_URL);; // Update with your backend URL if different

function ChatBox({ roomid, currentUser, ownerId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyingToName, setReplyingToName] = useState('');
  const [ownerProfilePic, setOwnerProfilePic] = useState('');
  const [ownerName, setOwnerName] = useState('');     // Owner name
  const isOwner = currentUser.id === ownerId;
  const messagesEndRef = useRef(null);
  const popupRef = useRef(null);


  // New states for user info popup (for admin view)
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Fetch all messages for the room on component mount
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chat/${roomid}`);
        if (isOwner) {
          setMessages(response.data);
          return;
        }
        // For regular users, filter messages accordingly
        const filteredMessages = response.data.filter(msg => {
          const isDirectMessage = (msg.senderId === currentUser.id && msg.receiverId === ownerId) ||
            (msg.senderId === ownerId && msg.receiverId === currentUser.id);
          return isDirectMessage;
        });
        setMessages(filteredMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Fetch owner profile picture, status, and name
    const fetchOwnerProfile = async () => {
      try {
        const ownerResponse = await axios.get(`/api/users/${ownerId}`);
        if (ownerResponse.data) {
          setOwnerProfilePic(ownerResponse.data.profilePic);
          setOwnerName(ownerResponse.data.name);
        }
      } catch (error) {
        console.error('Error fetching owner profile:', error);
      }
    };

    fetchOwnerProfile();

    // Listen for real-time messages targeted to the current user
    socket.on(`receiveMessage-${roomid}-${currentUser.id}`, (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socket.off(`receiveMessage-${roomid}-${currentUser.id}`);
    };
  }, [roomid, currentUser.id, ownerId, isOwner]);

  useEffect(() => {
    const chatContainer = document.querySelector(".chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    const messageData = {
      roomid,
      senderId: currentUser.id,
      senderName: currentUser.name,
      message: newMessage,
      receiverId: isOwner ? replyingTo : ownerId,
      replyTo: replyingToName || null, // Optional field for frontend use
    };
  
    try {
      await axios.post('/api/chat/send', messageData);
      socket.emit('sendMessage', messageData);
      setNewMessage('');
      setReplyingTo(null);
      setReplyingToName('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleReply = (message, event) => {
    // Ensure event is defined before accessing properties
    if (event && event.target && event.target.tagName === "SPAN") {
      setReplyingTo(message.senderId);
      setReplyingToName(message.senderName);
      setNewMessage(`@${message.senderName} `);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyingToName('');
    setNewMessage('');
  };

  // Helper function to get initials from a name
  const getInitials = (name) => {
    const nameParts = name.split(' ');
    return nameParts.length > 1
      ? nameParts[0].charAt(0) + nameParts[1].charAt(0)
      : name.charAt(0) + name.charAt(1);
  };

  // NEW: Function to open user info popup (only for admin view)
  const openUserInfo = async (userId, event) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setUserInfo(response.data);

      // Set the position of the click
      setPopupPosition({ x: event.clientX, y: event.clientY });

      setShowUserInfo(true);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };


  const closeUserInfo = () => {
    setShowUserInfo(false);
    setUserInfo(null);
  };
  useEffect(() => {
    function handleOutsideClick(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowUserInfo(false);
      }
    }
  
    if (showUserInfo) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showUserInfo]);
  

  return (
    <div className="chat-box">
      {/* Owner profile section */}
      <div className="owner-profile">
        <div className="owner-profile-pic">
          {ownerProfilePic ? (
            <img src={ownerProfilePic} alt="Owner Profile" className="profile-img" />
          ) : (
            <span className="profile-initials">{getInitials(ownerName)}</span>
          )}
        </div>
        <div className="owner-name-status">
          <div className="owner-name">{ownerName}</div>
        </div>
      </div>

      {/* Chat messages section */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-container ${msg.senderId === currentUser.id ? 'my-message' : 'other-message'}`}
            onClick={() => handleReply(msg)}
          >
            <div className="message-header">
              <div
                className="profile-pic clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentUser.isAdmin && msg.senderId !== currentUser.id) {
                    openUserInfo(msg.senderId, e);
                  }
                }}
              >
                <span className="profile-initials-chat">{getInitials(msg.senderName)}</span>
              </div>

              {isOwner && msg.senderId !== currentUser.id && (
                <span className="reply-hint"></span>
              )}
            </div>
            <div className="message-content" onClick={(e) => handleReply(msg, e)}>
              <span>{msg.message}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input section */}
      <div className="chat-input">
        {replyingTo && (
          <div className="reply-indicator">
            Replying to {replyingToName}
            <button className="cancel-reply" onClick={cancelReply}>×</button>
          </div>
        )}
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      {/* NEW: User Info Popup Modal (only shown in admin view) */}
      {showUserInfo && userInfo && (
        <div
        className="user-info-popup"
        style={{ top: popupPosition.y + 10, left: popupPosition.x + 10 }}
        ref={popupRef}
      >
      
          <button className="close-modal" onClick={closeUserInfo}>×</button>
          <h4>User Details</h4>
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>User ID:</strong> {userInfo._id}</p>
          <p><strong>Phone:</strong> {userInfo.phone}</p>
        </div>
      )}

    </div>
  );
}

export default ChatBox;
