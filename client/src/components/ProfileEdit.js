import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../axiosConfig";
import './ProfileScreen.css';

function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Current User Data
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('currentUser')) || {}
  );
  
  // Form Data
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // UI States
  const [profileImage, setProfileImage] = useState(currentUser?.profilePic || null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Error/Success messages
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Get user initials for avatar placeholder
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return (
      (parts[0]?.[0] || '').toUpperCase() +
      (parts[1]?.[0] || '').toUpperCase()
    );
  };

  // Handle image selection
  const handleProfileImageClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Verify current password before allowing sensitive changes
  const verifyCurrentPassword = async () => {
    setIsVerifying(true);
    setFormError('');
    
    try {
      const response = await axios.post('/api/users/verify-password', {
        userId: currentUser.id,
        password: formData.currentPassword
      });
      
      if (response.data.success) {
        setVerificationMode(false);
        setShowPasswordFields(true);
        setFormSuccess('Password verified successfully');
      } else {
        setFormError('Current password is incorrect');
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error verifying password');
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    // Validate password fields if shown
    if (showPasswordFields) {
      if (formData.newPassword !== formData.confirmPassword) {
        setFormError('New passwords do not match');
        return;
      }
      
      if (formData.newPassword && formData.newPassword.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }
    }
    
    // Start upload process
    setIsUploading(true);
    
    try {
      // Create form data for file upload
      const uploadData = new FormData();
      uploadData.append('userId', currentUser.id);
      uploadData.append('name', formData.name);
      uploadData.append('email', formData.email);
      uploadData.append('phone', formData.phone);
      
      // Only include password fields if shown and filled
      if (showPasswordFields && formData.newPassword) {
        uploadData.append('password', formData.newPassword);
      }
      
      // Add profile image if selected
      if (imageFile) {
        uploadData.append('profileImage', imageFile);
      }
      
      // Send update to server
      const response = await axios.post('/api/users/update-profile', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        // Update localStorage with new user data
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profilePic: response.data.profilePic || currentUser.profilePic
        };
        
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        
        setFormSuccess('Profile updated successfully');
        
        // Reset sensitive fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setShowPasswordFields(false);
        
        // Redirect after a delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    navigate('/profile');
  };

  // Handle changing security settings (password, email)
  const handleSecurityChange = () => {
    setVerificationMode(true);
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="profile-edit-main-container">
      <div className="profile-edit-header">
        <h1>Edit Your Profile</h1>
        <p>Update your personal information and account settings</p>
      </div>

      {formError && <div className="form-error-message">{formError}</div>}
      {formSuccess && <div className="form-success-message">{formSuccess}</div>}
      
      <div className="profile-edit-tabs">
        <button 
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <i className="fas fa-user"></i> Basic Info
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-lock"></i> Security
        </button>
      </div>

      <div className="profile-edit-content">
        {activeTab === 'basic' && (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="profile-image-upload">
              <div className="profile-image-edit" onClick={handleProfileImageClick}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-pic-edit" />
                ) : (
                  <div className="profile-initials-edit">{getInitials(formData.name)}</div>
                )}
                <div className="image-upload-overlay">
                  <i className="fas fa-camera"></i>
                  <span>Change Photo</span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleProfileImageChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                />
                <small>To change email, go to Security tab</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="save-button" disabled={isUploading}>
                {isUploading ? <i className="fas fa-spinner fa-spin"></i> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && !verificationMode && !showPasswordFields && (
          <div className="security-options">
            <div className="security-option-card">
              <div className="security-option-icon">
                <i className="fas fa-lock"></i>
              </div>
              <div className="security-option-content">
                <h3>Change Password</h3>
                <p>Update your password to keep your account secure</p>
                <button onClick={handleSecurityChange}>Change Password</button>
              </div>
            </div>
            
            <div className="security-option-card">
              <div className="security-option-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="security-option-content">
                <h3>Update Email Address</h3>
                <p>Change the email address associated with your account</p>
                <button onClick={handleSecurityChange}>Update Email</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && verificationMode && (
          <div className="verification-form">
            <div className="verification-header">
              <i className="fas fa-shield-alt"></i>
              <h3>Verify Your Identity</h3>
              <p>Please enter your current password to continue</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={() => setVerificationMode(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="verify-button" 
                onClick={verifyCurrentPassword}
                disabled={isVerifying || !formData.currentPassword}
              >
                {isVerifying ? <i className="fas fa-spinner fa-spin"></i> : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && showPasswordFields && (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
              </div>
              <small>Leave blank if you don't want to change your password</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={() => {
                  setShowPasswordFields(false);
                  setActiveTab('basic');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="save-button" disabled={isUploading}>
                {isUploading ? <i className="fas fa-spinner fa-spin"></i> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfileEdit;
