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
                <img src="data:image/png;base64,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" alt="CEO" />
              </div>
              <h3>Karan Gupta</h3>
              {/* <p className="member-title">CEO & Founder</p> */}
            </div>
            
            <div className="team-member">
              <div className="member-photo">
                <img src="data:image/png;base64,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" alt="CTO" />
              </div>
              <h3>Krishna Kumar Gupta</h3>
              {/* <p className="member-title">CTO</p> */}
            </div>
            
            <div className="team-member">
              <div className="member-photo">
                <img src="data:image/png;base64,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" alt="CMO" />
              </div>
              <h3>Mahendra Saud</h3>
              {/* <p className="member-title">CMO</p> */}
            </div>
            
            <div className="team-member">
              <div className="member-photo">
                <img src="data:image/jpeg;base64,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" alt="COO" />
              </div>
              <h3>Priti Poudel</h3>
              {/* <p className="member-title">COO</p> */}
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