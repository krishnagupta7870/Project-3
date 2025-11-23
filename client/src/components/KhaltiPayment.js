import React, { useState } from 'react';
import axios from "../axiosConfig";

const KhaltiPayment = ({
  amount,       // Ensure amount has a default value (to prevent NaN)
  room,
  fromdate,
  todate,
  roomid ,
  roomType,
  totaldays      // Ensure it's a number
}) => {
  const [loading, setLoading] = useState(false);

  // Get current user data from local storage
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const userName = currentUser?.name || "Guest";
  const userPhone = currentUser?.phone || "Not Provided";
  const userEmail = currentUser?.email || "Not Provided";
  const userId = currentUser?.id || "Not Provided";

  const handlePayment = async () => {
    setLoading(true); // Start loading state
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/payments/initiate`, {
        amount:100, // Use the passed amount dynamically
        purchase_order_id: `order_${Date.now()}`,
        purchase_order_name: "Room Booking",
        return_url: `${process.env.REACT_APP_FRONTEND_URL}/payment-success`,
        customer_name: userName,
        customer_email: userEmail,
        customer_phone: userPhone,
        customer_id: userId,
        room,
        fromdate,
        todate,
        roomid,
        roomType,
        totaldays
      });

      // Redirect to Khalti payment URL
      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Payment initiation failed. Please try again.");
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className='khalti-button'
      >
        {loading ? 'Processing...' : 'Pay via Khalti'}  
      </button>
    </div>
  );
};

export default KhaltiPayment;
