import React, { useState } from 'react';
import './register.css';

function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [pass, setPass] = useState(''); // Password
  const [pin, setPin] = useState(''); // 4-digit PIN
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !pass || !pin || pin.length !== 4) {
      setError('Name, password, and 4-digit PIN are required.');
      return;
    }
    try {
      const response = await fetch('http://192.168.1.166:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: pass, pin }), // Send both password and pin
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      onRegister({ id: data.id, name, currentSKEL: data.currentSKEL, pin }); // Pass pin for local storage
      setName('');
      setPass('');
      setPin('');
      setError('');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-card">
      <h2 className="heading">Register</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 m-2"
        placeholder="Enter name"
      />
      <input
        type="password" // Mask the password
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        className="border p-2 m-2"
        placeholder="Enter password"
      />
      <input
        type="text"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        maxLength={4}
        className="border p-2 m-2"
        placeholder="Enter 4-digit PIN"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleRegister} className="button" disabled={!name || !pass || !pin || pin.length !== 4}>
        Register
      </button>
    </div>
  );
}

export default Register;