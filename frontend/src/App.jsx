import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';
import MyAppointments from './pages/MyAppointments';
import MyProfile from './pages/MyProfile';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify';
import VoiceAssistant from './components/VoiceAssistant';
import AIChatBot from './components/AIChatBot';
import NearbyHospitals from './components/NearbyHospitals';
import LanguageRecommendation from './components/LanguageRecommendation';

const App = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [prevY, setPrevY] = useState(0);
  const currentLocation = useLocation();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  useEffect(() => {
    let scrollTimeout;

    const handleMouseMove = (event) => {
      const deltaY = event.movementY;
      if (Math.abs(deltaY) > 5) {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          window.scrollBy(0, deltaY);
        }, 20);
      }
      setPrevY(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [prevY]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  }, []);

  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />

      {/* Admin Panel Redirect Button and Login Info */}
      <div className="my-4 flex flex-col items-end gap-2">
        <button
          onClick={() => window.open('http://localhost:5174/', '_blank')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Admin Panel
        </button>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded w-fit text-sm shadow">
          <p><strong>Admin Login Details:</strong></p>
          <p><strong>Email:</strong> admin@practo.com</p>
          <p><strong>Password:</strong> Laasyap@1908</p>
        </div>
      </div>

      <VoiceAssistant />
      <AIChatBot />

      {currentLocation.pathname === '/' && <LanguageRecommendation />}

      {currentLocation.pathname === '/' && location.lat && location.lng ? (
        <NearbyHospitals lat={location.lat} lng={location.lng} />
      ) : (
        <p></p>
      )}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/verify' element={<Verify />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
