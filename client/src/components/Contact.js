import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 3000);
    }, 1500);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>Have questions? We're here to help you find the perfect accommodation.</p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="contact-card">
            <div className="contact-card-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="contact-card-content">
              <h3>Our Location</h3>
              <p>Pokhara, Nepal</p>
              <p>Lakeside Road, 33700</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon">
              <i className="fas fa-phone-alt"></i>
            </div>
            <div className="contact-card-content">
              <h3>Phone Number</h3>
              <p>+977 1234567890</p>
              <p>+977 9876543210</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="contact-card-content">
              <h3>Email Address</h3>
              <p>info@avas.com</p>
              <p>support@avas.com</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="contact-card-content">
              <h3>Working Hours</h3>
              <p>Sunday - Friday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <div className="contact-form-wrapper">
            <h2>Send Us a Message</h2>
            <p>Feel free to reach out with any questions, concerns, or feedback.</p>

            {submitted ? (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <h3>Thank you for your message!</h3>
                <p>We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      

      <div className="cta-section">
        <div className="cta-content">
          <h2>Join Our Community</h2>
          <p>Find your perfect accommodation or list your property with AVAS.</p>
          <div className="cta-buttons">
            {!localStorage.getItem('currentUser') ? (
              <button 
                className="cta-button primary" 
                onClick={() => navigate('/LoginSignupScreen?type=signup')}
              >
                Sign Up Now
              </button>
            ) : (
              <button 
                className="cta-button primary" 
                onClick={() => navigate('/profile')}
              >
                Go to Dashboard
              </button>
            )}
            <button 
              className="cta-button secondary"
              onClick={() => navigate('/about')}
            >
              About Us
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => navigate('/how-it-works')}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 