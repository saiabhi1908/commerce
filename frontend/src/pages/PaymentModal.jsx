import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PaymentModal = ({ show, onHide, appointmentId, amount, backendUrl, token }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isPaymentInitiated = useRef(false);  // Track if the payment has been initiated

  useEffect(() => {
    // Ensure amount is a valid number before initiating payment
    if (!show) return;
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (appointmentId && amount && show && !isPaymentInitiated.current) {
      const initiatePayment = async () => {
        try {
          setLoading(true);
          isPaymentInitiated.current = true;  // Mark that payment initiation is in progress

          // Make sure to pass necessary data to the backend
          const { data } = await axios.post(
            backendUrl + '/api/user/payment-stripe',
            { appointmentId, amount },  // Pass appointmentId and amount to backend
            { headers: { token } }
          );

          if (data.success) {
            // Redirect to payment page with clientSecret and other details
            navigate('/payment-page', {
              state: {
                clientSecret: data.clientSecret,
                appointmentId,
                amount,
              },
            });
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error('Failed to initiate payment');
        } finally {
          setLoading(false);
        }
      };
      initiatePayment();
    }
  }, [appointmentId, amount, backendUrl, token, show, navigate]);

  if (!show) return null;

  return (
    <div className="modal" style={{ display: show ? 'block' : 'none' }}>
      <div className="modal-content">
        <h2>Redirecting to Payment Page...</h2>
        {loading && <p>Loading payment details...</p>}
        <button
          onClick={onHide}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
