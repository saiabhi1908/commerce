import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const backendUrl = 'https://healthy-1-2jaf.onrender.com';  // your backend URL

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please start from Forgot Password page.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      const res = await axios.post('https://healthy-1-2jaf.onrender.com' + '/api/user/verify-otp', { email, otp });
      if (res.data.success) {
        toast.success('OTP verified');
        navigate('/reset-password', { state: { email, otp } });
      } else {
        toast.error(res.data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      toast.error('Error verifying OTP');
    }
  };

  return (
    <div className='container'>
      <h2>Verify OTP</h2>
      <input
        type='text'
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder='Enter OTP'
      />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
};

export default VerifyOtp;
