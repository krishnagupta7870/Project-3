import React from 'react';
import axios from "../axiosConfig";

const EsewaPayment = ({ roomId, amount, productId }) => {
  const initiateEsewaPayment = async () => {
    try {
      // Call backend to prepare eSewa payment
      const response = await axios.post('/api/esewa/initiate', {
        roomId,
        amount,
        productId, // Unique identifier for the transaction
      });

      // Extract payment data from backend response
      const { paymentUrl, paymentData } = response.data;

      // Dynamically create a form and submit to eSewa
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;

      for (const key in paymentData) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = paymentData[key];
        form.appendChild(hiddenField);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Error initiating eSewa payment:', error);
    }
  };

  return (
    <button onClick={initiateEsewaPayment} className="esewa-button">
      Pay with eSewa
    </button>
  );
};

export default EsewaPayment;