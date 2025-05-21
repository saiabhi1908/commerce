import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const backendUrl = 'http://localhost:4000'; // Adjust this URL as needed

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Simple email regex check
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    try {
      // Use the new endpoint for password reset OTP
      const res = await axios.post(backendUrl + '/api/user/send-reset-otp', { email });
      if (res.data.success) {
        toast.success('OTP sent to your email');
        // Optionally pass 'purpose' to distinguish reset flow in verify-otp page
        navigate('/verify-otp', { state: { email, purpose: 'reset' } });
      } else {
        toast.error(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      toast.error('Error sending OTP');
    }
  };

  return (
    <div className='container'>
      <h2>Forgot Password</h2>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Enter your email'
      />
      <button onClick={handleSendOtp}>Send OTP</button>
    </div>
  );
};

export default ForgotPassword;
