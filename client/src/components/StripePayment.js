// src/components/StripePayment.js
import React from "react";
import StripeCheckout from "react-stripe-checkout";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";

function StripePayment({ amount, room, fromdate, todate, roomid ,roomType , totaldays  }) {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const userName = currentUser?.name || "Guest";
  const userPhone = currentUser?.phone || "Not Provided";
  const userEmail = currentUser?.email || "Not Provided";
  const userId = currentUser?.id || "Not Provided";

  const onToken = async (token) => {
    console.log("Stripe Token:", token);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/stripe/charge`, {
        token,
        amount: amount * 100 , // amount in cents for Stripe
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

      console.log("Stripe charge response:", response.data);

      if (response.data.success) {
        // The charge response contains the payment ID, charged amount (in cents), and status.
        // Convert the charged amount back to dollars by dividing by 100.
        const { pidx, amount: chargedAmount, status } = response.data.charge;
        navigate(`/stripe-payment-success?pidx=${pidx}&amount=${chargedAmount / 100}&status=${status}`);
      } else {
        alert(`Payment Failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert(`Payment Error: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div >
      <StripeCheckout
        name="Room Booking Payment"
        description={`Pay $${amount}`} // Displaying the currency symbol is fine for UI; storage remains numeric
        amount={amount * 100 } // Convert amount to cents for Stripe
        currency="usd"
        token={onToken}
        stripeKey="pk_test_51QnKHcHv15qt8VfKPQCgL5566tPovTZguwuNdvpd8t9zwXHADFqryhpIc9yIXjQ4nRS9k5Xg3NRD8bKtC1iX90Pd00C5Aj2Rbb"
      />
    </div>
  );
}

export default StripePayment;
