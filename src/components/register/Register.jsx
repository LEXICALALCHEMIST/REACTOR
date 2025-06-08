import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import './register.css';

function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear invalid localuser data on mount
    const storedUser = localStorage.getItem('localuser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser || !parsedUser.id || !parsedUser.name || !parsedUser.pin) {
        localStorage.removeItem('localuser');
      }
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !password || !pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('Name, password, and a 4-digit PIN are required.');
      return;
    }

    setError(''); // Clear previous errors
    const id = `did:zeta:user_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const morphAddress = id;
    const hashedPassword = CryptoJS.SHA256(password).toString();
    const hashedPin = CryptoJS.SHA256(pin).toString(); // Hash the PIN for security

    try {
      const response = await fetch('http://192.168.1.166:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: hashedPassword }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      const newUser = { id, name, currentSKEL: data.currentSKEL, morphAddress, pin: hashedPin };
      localStorage.setItem('localuser', JSON.stringify(newUser));
      onRegister(newUser); // Trigger parent action
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Try again.');
    }
  };

  return (
    <div className="card">
      <h1 className="heading">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleRegister}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
        <label>
          PIN (4 digits):
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            className="border p-2 m-2"
            placeholder="1234"
          />
        </label>
        <button type="submit" className="button">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;