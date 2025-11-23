import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import "../components/paymentcss.css"; // Make sure to include the spinner CSS here

const StripePaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Extract query parameters
  const pidx = queryParams.get("pidx");
  const amount = queryParams.get("amount"); // Expected in dollars
  const status = queryParams.get("status");

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.post(
  `${process.env.REACT_APP_API_URL}/api/stripe/verify`, {
          pidx,
          amount: Number(amount), // Convert the amount to a number
          status,
        });
        console.log("Stripe verification response:", response.data);
        setVerificationStatus(response.data.success ? "success" : "failure");
      } catch (error) {
        console.error("Stripe verification error:", error);
        setVerificationStatus("failure");
      } finally {
        setIsLoading(false);
      }
    };

    if (pidx && amount && status) {
      verifyPayment();
    }
  }, [pidx, amount, status]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Verifying your Stripe payment...</p>
        </div>
      );
    }

    if (verificationStatus === "success") {
      return (
        <div className="success-message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="64"
            height="64"
          >
            <path
              fill="#4CAF50"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
          <h2>Payment Successful!</h2>
          <p>Transaction ID: {pidx}</p>
          <button className="navigate-button" onClick={() => navigate("/profile?section=bookings")}>
            Close
          </button>
        </div>
      );
    }

    return (
      <div className="failure-message">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="64"
          height="64"
        >
          <path
            fill="#FF5722"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
          />
        </svg>
        <h2>Stripe Payment Failed</h2>
        <p>
          Payment verification failed. Please try again or contact support if the
          issue persists.
        </p>
        <button className="navigate-button" onClick={() => navigate("/")}>
          Retry Payment
        </button>
      </div>
    );
  };

  return <div className="payment-status-container">{renderContent()}</div>;
};

export default StripePaymentSuccess;
