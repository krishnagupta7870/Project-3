import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './LoginSignupScreen.css';
import axios from "../axiosConfig";
import { useNavigate } from 'react-router-dom';

function LoginSignupScreen() {
  const navigate = useNavigate();

  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState('login');
  const [message, setMessage] = useState('');  // Message state
  const [messageType, setMessageType] = useState('');  // Message type (success or error)

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type');
    if (type === 'signup') {
      setSelectedTab('signup');
    } else {
      setSelectedTab('login');
    }
  }, [location.search]);

  // Signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');

  // Login state (for email or phone)
  const [loginInput, setLoginInput] = useState('');  // This will hold email or phone
  const [loginPassword, setLoginPassword] = useState('');

  // Signup function
  async function signup(e) {
    e.preventDefault();
    if (password === cpassword) {
      const user = { name, email, phone, password, cpassword };
  
      try {
        const result = await axios.post('/api/users/submit-users', user);
        const data = result.data;
  
        if (data.success) {
          setMessage(data.message || 'Signup successful!');
          setMessageType('success');
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          localStorage.setItem('token', data.token); // ✅ Save token
          resetSignupField();
          navigate(-1);
        }
         else {
          setMessage(data.message || 'Something went wrong');
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error:', error.response ? error.response.data.message : error.message);
  
        setMessage(error.response?.data?.message || 'Error logging in');
        setMessageType('error');
      }
    } else {
      setMessage('Passwords do not match');
      setMessageType('error');
    }
  }

  // Login function
  // Login function
async function login(e) {
  e.preventDefault();
  const user = { input: loginInput, password: loginPassword };  // `input` can be email or phone

  try {
    const result = await axios.post('/api/users/login-users', user);
    const data = result.data;

    if (data.success) {
      setMessage('Login successful!');
      setMessageType('success');
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); // ✅ Save token here
      resetLoginField();
      navigate(-1);
    } else {
      setMessage(data.message || 'Login failed');
      setMessageType('error');
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data.message : error.message);
    setMessage(error.response?.data?.message || 'Error logging in');
    setMessageType('error');
  }
}

  function resetSignupField(){
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setCpassword('');
  }
  function resetLoginField(){
    setLoginInput('');
    setLoginPassword('');
  }
  

  return (
    <div className="container-log">
      <div className="sub-container-log">
        <div>
          <input
            type="radio"
            id="signup"
            name="radio-name-loginpage"
            checked={selectedTab === 'signup'}
            onChange={() => setSelectedTab('signup')}
          />
          <label htmlFor="signup">Sign Up</label>

          <input
            type="radio"
            id="login"
            name="radio-name-loginpage"
            checked={selectedTab === 'login'}
            onChange={() => setSelectedTab('login')}
          />
          <label htmlFor="login">Login</label>

          {selectedTab === 'signup' && (
            <form id="signup-form" className="login-signup-form">
              <label htmlFor="user-name">Name:</label>
              <input
                type="text"
                id="user-name"
                name="name"
                placeholder="Enter your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <br />
              <label htmlFor="signup-email">Email:</label>
              <input
                type="email"
                id="signup-email"
                name="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <br />
              <label htmlFor="phone">Phone Number:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <br />
              <label htmlFor="signup-password">Password:</label>
              <input
                type="password"
                id="signup-password"
                name="password"
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <br />
              <label htmlFor="confirm-password">Confirm Password:</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm_password"
                placeholder="Confirm your password"
                required
                value={cpassword}
                onChange={(e) => setCpassword(e.target.value)}
              />
              <br />
              <button className="btn-log-signin-page" type='submit' onClick={signup}>
                Signup
              </button>
            </form>
          )}

          {selectedTab === 'login' && (
            <form id="login-form" className="login-signup-form">
              <label htmlFor="login-input">Email/Phone:</label>
              <input
                type="text"
                id="login-input"
                name="input"
                placeholder="Enter your email or phone"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
              />
              <br />
              <label htmlFor="login-password">Password:</label>
              <input
                type="password"
                id="login-password"
                name="password"
                placeholder="Enter your password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <br />
              <button className="btn-log-signin-page" onClick={login}>
                Login
              </button>
            </form>
          )}

          {/* Display message below login/signup buttons */}
          {message && (
            <p
              className={`message ${messageType === 'success' ? 'success' : 'error'}`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginSignupScreen;
