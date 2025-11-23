import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-container">
      <div className="how-it-works-header">
        <h1>How AVAS Works</h1>
        <p>Our simple process connects property owners with tenants in just a few steps</p>
      </div>

      <div className="process-section tenant-section">
        <h2>For Tenants</h2>
        
        <div className="process-steps">
          <div className="process-step">
            <div className="step-icon">
              <i className="fas fa-search"></i>
            </div>
            <div className="step-number">1</div>
            <h3>Search Properties</h3>
            <p>Browse our extensive listings of rooms, flats, and hotel rooms. Use filters to narrow down by location, price, and amenities.</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="step-number">2</div>
            <h3>Book Your Stay</h3>
            <p>For hotel rooms, select your dates and book instantly. For long-term rentals, submit a booking request to the property owner.</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon">
              <i className="fas fa-credit-card"></i>
            </div>
            <div className="step-number">3</div>
            <h3>Secure Payment</h3>
            <p>Make payments through our trusted payment gateways. Your booking is confirmed once payment is processed.</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="step-number">4</div>
            <h3>Enjoy & Review</h3>
            <p>After your stay, share your experience by leaving a review to help future tenants make informed decisions.</p>
          </div>
        </div>
      </div>

      <div className="process-section owner-section">
        <h2>For Property Owners</h2>
        
        <div className="process-steps">
          <div className="process-step">
            <div className="step-icon">
              <i className="fas fa-home"></i>
            </div>
            <div className="step-number">1</div>
            <h3>List Your Property</h3>
            <p>Create a detailed listing with high-quality photos, accurate descriptions, and competitive pricing.</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon">
              <i className="fas fa-bell"></i>
            </div>
            <div className="step-number">2</div>
            <h3>Receive Bookings</h3>
            <p>Get notified instantly when tenants book your property or send booking requests.</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="step-number">3</div>
            <h3>Confirm Reservations</h3>
            <p> Bookings are automatically confirmed.</p>
          </div>
          
          <div className="process-step">
            <div className="step-icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div  className="step-number">4</div>
            <h3>Get Paid</h3>
            <p>Receive secure payments directly to your account after bookings are confirmed.</p>
          </div>
        </div>
        <div id="faq" style={{ scrollMarginTop: '100px' }}></div>
      </div>

      <div  className="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How do I book a property?</h3>
            <p>Search for properties using our filters, select the one you like, and follow the booking process. For hotel rooms, you can book instantly by selecting Check in and Check out date. For long-term rentals (Flats & Rooms), you can book directly.</p>
          </div>
          
          <div className="faq-item">
            <h3>What payment methods are accepted?</h3>
            <p>We accept payments through Khalti and Card . All transactions are secure and protected.</p>
          </div>
          
          <div className="faq-item">
            <h3>How do I list my property?</h3>
            <p>Register your account,goto your profile and click on list your account, complete your KYC verification by submitting your details, and use our simple listing form to add your property details, photos, pricing, and room coordinates for acurate location.</p>
          </div>
          
          <div className="faq-item">
            <h3>Is there a fee for listing my property?</h3>
            <p>Basic listings are free. We charge a small commission only when you receive a booking through our platform.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <div className="cta-buttons">
          <a href="/" className="cta-button tenant-cta">Find a Room</a>
          <a href="/" className="cta-button owner-cta">List Your Property</a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks; 