import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const backendUrl = 'http://localhost:4000';  // your backend URL

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const purpose = location.state?.purpose || 'register'; // default to registration

  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please start from the Forgot Password or Register page.');
      navigate(purpose === 'reset' ? '/forgot-password' : '/register');
    }
  }, [email, navigate, purpose]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      // Choose endpoint based on purpose
      const endpoint = purpose === 'reset' ? '/api/user/verify-reset-otp' : '/api/user/verify-otp';
      const res = await axios.post(backendUrl + endpoint, { email, otp });

      if (res.data.success) {
        toast.success('OTP verified');
        if (purpose === 'reset') {
          navigate('/reset-password', { state: { email, otp } });
        } else {
          // For registration, proceed as needed (e.g., navigate to login)
          navigate('/login');
        }
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
