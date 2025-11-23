import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  
  // Function to check if user is logged in
  const isUserLoggedIn = () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser !== null;
  };

  // Function to check if user is an owner
  const isUserOwner = () => {
    if (!isUserLoggedIn()) return false;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser.isOwner === true;
  };

  // Function to check if user is verified (completed KYC)
  const isUserVerified = () => {
    if (!isUserLoggedIn()) return false;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser.isVerified === true;
  };

  // Function to handle tenant actions (bookings, reviews)
  const handleTenantAction = (action) => {
    if (!isUserLoggedIn()) {
      // If not logged in, redirect to login page
      navigate('/LoginSignupScreen');
      return;
    }
    
    // User is logged in, redirect to appropriate section
    if (action === 'bookings') {
      navigate('/profile?section=bookings');
    } else if (action === 'reviews') {
      navigate('/profile?section=reviews');
    }
  };

  // Function to handle owner actions
  const handleOwnerAction = (action) => {
    if (action === 'listProperty') {
      // If logged in, redirect to profile/listing section, otherwise login
      if (isUserLoggedIn()) {
        navigate('/profile?section=list-room');
      } else {
        navigate('/LoginSignupScreen');
      }
      return;
    }
    
    if (action === 'mylistings') {
      if (!isUserLoggedIn()) {
        navigate('/LoginSignupScreen');
        return;
      }
      
      // If user is an owner, redirect to "My Listings", otherwise redirect to "List Your Property"
      if (isUserOwner()) {
        navigate('/profile?section=my-listings');
      } else {
        navigate('/profile?section=list-room');
      }
    } else if (action === 'profile') {
      // Owner dashboard should redirect to owner profile if logged in
      if (isUserLoggedIn()) {
        navigate('/profile');
      } else {
        navigate('/LoginSignupScreen');
      }
    } else if (action === 'ownerFAQ') {
      // For FAQ, navigate to the page then scroll to FAQ section
      navigate('/how-it-works');
      
      // Then scroll to FAQ section after page has loaded
      setTimeout(() => {
        const faqSection = document.getElementById('faq');
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  };

  // Function to scroll to rooms section
  const scrollToRooms = (e) => {
    e.preventDefault();
    const roomsSection = document.getElementById('rooms-section');
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If on a different page, navigate to home and then scroll
      navigate('/');
      // Need a slight delay to allow the component to mount
      setTimeout(() => {
        const section = document.getElementById('rooms-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about-section">
          <h3>AVAS</h3>
          <p>Your trusted platform for finding the perfect accommodation in Nepal. We connect property owners with tenants for a seamless rental experience.</p>
          <div className="contact-info">
            <p><i className="fas fa-map-marker-alt"></i> Pokhara, Nepal</p>
            <p><i className="fas fa-envelope"></i> info@avas.com</p>
            <p><i className="fas fa-phone"></i> +977 1234567890</p>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>For Tenants</h3>
          <ul>
            <li><a href="#" onClick={scrollToRooms}><i className="fas fa-search"></i> Find Rooms</a></li>
            <li><a href="#" onClick={() => handleTenantAction('bookings')}><i className="fas fa-bookmark"></i> My Bookings</a></li>
            <li><a href="#" onClick={() => handleTenantAction('reviews')}><i className="fas fa-star"></i> Write Reviews</a></li>
            <li><Link to="/how-it-works"><i className="fas fa-info-circle"></i> How It Works</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>For Property Owners</h3>
          <ul>
            <li><a href="#" onClick={() => handleOwnerAction('listProperty')}><i className="fas fa-home"></i> List Your Property</a></li>
            <li><a href="#" onClick={() => handleOwnerAction('mylistings')}><i className="fas fa-calendar-check"></i> Manage Rooms</a></li>
            <li><a href="#" onClick={() => handleOwnerAction('profile')}><i className="fas fa-chart-line"></i> Owner Dashboard</a></li>
            <li><a href="#" onClick={() => handleOwnerAction('ownerFAQ')}><i className="fas fa-question-circle"></i> Owner FAQ</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Stay Connected</h3>
          <div className="social-icons">
            <a href="#" className="social-icon facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social-icon instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" className="social-icon twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-icon linkedin"><i className="fab fa-linkedin-in"></i></a>
          </div>
          <div className="newsletter">
            <h4>Subscribe to our newsletter</h4>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit"><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-middle">
        <div className="footer-middle-container">
          <div className="footer-feature">
            <i className="fas fa-shield-alt"></i>
            <span>Secure Payments</span>
          </div>
          <div className="footer-feature">
            <i className="fas fa-thumbs-up"></i>
            <span>Verified Properties</span>
          </div>
          <div className="footer-feature">
            <i className="fas fa-headset"></i>
            <span>24/7 Support</span>
          </div>
          <div className="footer-feature">
            <i className="fas fa-smile"></i>
            <span>User Satisfaction</span>
          </div>
        </div>
      </div>
      
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
        <Link to="#">Privacy Policy</Link>
        <Link to="#">Terms of Service</Link>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} AVAS Room Rental System. All rights reserved.</p>
        <p>Designed and Developed by Krishna Kumar Gupta, Karan Gupta, Mahendra Saud, Priti Paudel - Pokhara University</p>
      </div>
    </footer>
  );
};

export default Footer; 