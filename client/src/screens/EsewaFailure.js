import React from 'react';
import { Link } from 'react-router-dom';

const EsewaFailure = () => {
  return (
    <div className="payment-failure">
      <h1>Payment Failed! 😞</h1>
      <p>Please try again or contact support.</p>
      <Link to="/room-details">Back to Room</Link>
    </div>
  );
};

export default EsewaFailure;