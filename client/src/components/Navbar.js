import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import profileIcon from '../assets/user-regular.svg';
import bookingIcon from '../assets/booking-icon.png';
import logoutIcon from '../assets/logout-icon.png';
import adminIcon from '../assets/administrator.png';
import logo from '../assets/AVASlogo.png';
import { Link } from 'react-router-dom';

function Navbar() {
  const user = JSON.parse(localStorage.getItem('currentUser')) || null;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToPage = (type) => {
    navigate(`/LoginSignupScreen?type=${type}`);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // to get the user's initials
  const getInitials = (name) => {
    const nameParts = name.trim().split(' ');
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || '';
    const secondInitial = nameParts[1]?.charAt(0).toUpperCase() || '';
    return firstInitial + secondInitial;
  };

  const handleSignout = () => {
    localStorage.removeItem('currentUser');
    window.location.href ='/';
  };

  const shrinkHeader = location.pathname === '/';

  return (
    <header className={`navbar-header ${shrinkHeader ? 'home' : 'other'}`}>
      <nav className="navbar-content">
        <div className="navbar-brand">
          <a href="/">
            <img src={logo} alt="Logo" style={{ height: '120px', cursor: 'pointer' }} />
          </a>
        </div>
        <div className="navbar-items">
          <ul className="navbar-links">
            <li className="nav-link"><a href="/">Home</a></li>
            <li className="nav-link">
              <a
                href="#!"
                onClick={() =>
                  document.getElementById('rooms-section').scrollIntoView({ behavior: 'smooth' })
                }
              >
                Rooms
              </a>
            </li>
        <li className="nav-link"><Link to="/about">About</Link></li>
<li className="nav-link"><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="nav-right-btn">
          {user && user.name ? (
            <div className="user-profile">
              <button className="user-profile-btn" type="button" onClick={toggleDropdown}>
                <div className="user-profile-logo">{getInitials(user.name)}</div>
                <strong className="user-profile-btn-name">{user.name}</strong>
              </button>
             
{isOpen && (
  <div className="profile-dropdown-content">
    <Link to="/profile?section=profile">
      <img src={profileIcon} alt="icon" className="icons" /> Profile
    </Link>
    <Link to="/profile?section=bookings">
      <img src={bookingIcon} alt="icon" className="icons" /> My Bookings
    </Link>
    {user?.isAdmin && (
      <Link to="/admin">
        <img src={adminIcon} alt="icon" className="icons" /> Admin Panel
      </Link>
    )}
    <a href="#!" onClick={handleSignout}>
      <img src={logoutIcon} alt="icon" className="icons" /> Sign out
    </a>
  </div>
)}
            </div>
          ) : (
            <div className="btn-log">
              <div className="signupbtn">
                <button onClick={() => redirectToPage('signup')}>Signup</button>
              </div>
              <div className="loginbtn">
                <button onClick={() => redirectToPage('login')}>Login</button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
