import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EsewaSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to room details after 3 seconds
    const timer = setTimeout(() => {
      navigate('/room-details');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-success">
      <h1>Payment Successful! 🎉</h1>
      <p>Redirecting back to room details...</p>
    </div>
  );
};

export default EsewaSuccess;