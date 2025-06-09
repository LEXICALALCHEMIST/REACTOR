import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js'; // Ensure CryptoJS is imported
import './reLogin.css';

function ReLogin({ onLogin }) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('localuser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser.name) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleLogin = () => {
    if (!pin || pin.length !== 4) {
      setPinError('PIN must be 4 digits.');
      return;
    }
    const storedUser = localStorage.getItem('localuser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const hashedPin = CryptoJS.SHA256(pin).toString(); // Hash the entered PIN
      fetch('http://192.168.1.166:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: parsedUser.name, password: parsedUser.pin, pin: hashedPin }), // Validate pin against DB pin
      })
        .then((response) => {
          if (!response.ok) throw new Error('Invalid credentials');
          return response.json();
        })
        .then((data) => {
          const liveMorphID = data.id;
          const liveUser = { name: parsedUser.name, currentSKEL: data.currentSKEL };
          onLogin(liveUser, liveMorphID); // Pass to parent with DB data
          setPin('');
          setPinError('');
          // Override localuser with DB currentSKEL
          localStorage.setItem('localuser', JSON.stringify({ name: parsedUser.name, pin: hashedPin, currentSKEL: data.currentSKEL }));
        })
        .catch((err) => {
          console.error('ReLogin failed:', err);
          setPinError(err.message || 'Invalid PIN or server error.');
        });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="relogin-card">
      <h2 className="heading">Re-Login</h2>
      <input
        type="text"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        maxLength={4}
        className="border p-2 m-2"
        placeholder="Enter PIN"
      />
      {pinError && <p className="text-red-500">{pinError}</p>}
      <button onClick={handleLogin} className="button" disabled={pin.length !== 4}>
        Login
      </button>
    </div>
  );
}

export default ReLogin;