import { useState, useEffect } from 'react';
import axios from "../axiosConfig";

function ReviewForm({ 
  roomid, 
  existingReview,     // Optional: if provided, the form is in edit mode.
  onReviewSubmitted,  // Called after a new review is submitted.
  onReviewUpdated,    // Called after a review is updated.
  onCancel            // Called when the user cancels editing.
}) {
  // Determine if we're editing based on whether an existing review was provided.
  const isEditing = existingReview !== undefined;

  // Initialize form fields with existing review values if editing; else use default values.
  const [rating, setRating] = useState(isEditing ? existingReview.rating : 0);
  const [comment, setComment] = useState(isEditing ? existingReview.comment : '');
  const [hasBooked, setHasBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Only check booking status if we're creating a new review. If editing,
  // we assume the user already booked the room.
  useEffect(() => {
    if (!roomid || isEditing) return;

    const checkBookingStatus = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!storedUser) return;
        const token = localStorage.getItem('token');

        // Send the roomid to the backend to check booking status.
        const response = await axios.post(
          "/api/bookings/hasBooked",
          { roomid },
          { headers: { Authorization: `Bearer ${token}` } }
        );

      
        setHasBooked(response.data.hasBooked);
      } catch (error) {
        console.error("Error checking booking status:", error);
        setHasBooked(false);
      }
    };

    checkBookingStatus();
  }, [roomid, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Ensure the user is logged in
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      const token = localStorage.getItem('token');
      if (!storedUser || !token) {
        alert("You need to log in to submit a review.");
        setSubmitting(false);
        return;
      }

      if (isEditing) {
        // Update the existing review via PUT
        const res = await axios.put(
          `/api/reviews/${existingReview._id}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 200) {
          if (onReviewUpdated) onReviewUpdated(res.data);
        }
      } else {
        // Create a new review via POST
        const res = await axios.post(
          '/api/reviews',
          { roomid, rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 201) {
          setRating(0);
          setComment('');
          if (onReviewSubmitted) onReviewSubmitted(res.data);
        }
      }
    } catch (err) {
      console.error('Review submission error:', err);
      alert(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };
  const StarInput = ({ value, onChange }) => {
    return (
      <div className="rating-input">
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              className={`star ${num <= value ? 'filled' : ''}`}
              onClick={() => onChange(num)}
              onMouseEnter={() => onChange(num)}
              onMouseLeave={() => onChange(value)}
              aria-label={`${num} star`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>{isEditing ? "Edit Your Review" : "Submit Your Review"}</h3>
      <StarInput 
        value={rating} 
        onChange={(newRating) => setRating(newRating)}
      />
      <div className="comment-input">
        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          required
          placeholder="Share your experience..."
        />
      </div>
      
      <button type="submit" disabled={submitting || (!hasBooked && !isEditing)}>
        {submitting 
          ? (isEditing ? 'Updating...' : 'Submitting...') 
          : (isEditing ? 'Update Review' : 'Submit Review')}
      </button>
      {isEditing && (
        <button type="button" onClick={onCancel} disabled={submitting} className="cancel-button">
          Cancel
        </button>
      )}
      {!isEditing && !hasBooked && (
        <p className="booking-required">You must book this room to submit a review.</p>
      )}
    </form>
  );
}

export default ReviewForm;
