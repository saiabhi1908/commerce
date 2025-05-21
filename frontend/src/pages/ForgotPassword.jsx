import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const backendUrl = 'https://healthy-1-2jaf.onrender.com'; // Adjust this URL

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
      const res = await axios.post(backendUrl + '/api/user/send-otp', { email });
      if (res.data.success) {
        toast.success('OTP sent to your email');
        navigate('/verify-otp', { state: { email } });
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
        placeholder='Enter email'
      />
      <button onClick={handleSendOtp}>Send OTP</button>
    </div>
  );
};

export default ForgotPassword;
