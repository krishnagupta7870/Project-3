import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About AVAS</h1>
          <p>Connecting travelers with perfect accommodations since 2024</p>
        </div>
      </div>

      <div className="about-section">
        <div className="about-container">
          <div className="about-story">
            <h2>Our Story</h2>
            <p>
              AVAS was founded with a simple mission: to make finding and booking accommodations easier, 
              more transparent, and more enjoyable for everyone. We started as a small team of travelers 
              and property owners who understood the challenges from both sides of the market.
            </p>
            <p>
              Today, we've grown into a comprehensive platform that connects thousands of travelers 
              with unique, comfortable, and affordable places to stay across Nepal.
            </p>
          </div>

          <div className="about-vision">
            <h2>Our Vision</h2>
            <p>
              We envision a world where finding the perfect place to stay is seamless and stress-free. 
              Where property owners can easily connect with guests who will appreciate their spaces. 
              Where every journey begins with excitement rather than uncertainty.
            </p>
          </div>

          <div className="about-values">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3>Trust</h3>
                <p>We prioritize honest reviews, accurate listings, and secure transactions.</p>
              </div>
              
              <div className="value-card">
                <div className="value-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h3>Community</h3>
                <p>We foster connections between travelers and local property owners.</p>
              </div>
              
              <div className="value-card">
                <div className="value-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Safety</h3>
                <p>We implement verification systems to ensure safe and pleasant experiences.</p>
              </div>
              
              <div className="value-card">
                <div className="value-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <h3>Innovation</h3>
                <p>We continuously improve our platform based on user feedback and needs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="team-section">
        <div className="about-container">
          <h2>Our Team</h2>
          <p className="team-intro">
            AVAS is driven by a passionate team of individuals from diverse backgrounds, 
            united by our commitment to transform the accommodation booking experience.
          </p>
          
          <div className="team-grid">
                        
            <div className="team-member">
              <div className="member-photo">
                <img src="data:image/png;base64,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" alt="CTO" />
              </div>
              <h3>Krishna Kumar Gupta</h3>
              {/* <p className="member-title">CTO</p> */}
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-content">
          <h2>Join Our Community</h2>
          <p>Find your perfect accommodation or list your property with AVAS today.</p>
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
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 
