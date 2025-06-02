import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

function Register({ onRegister, ws }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    if (!name || !password) {
      setError('Name and password are required.');
      return;
    }

    // Generate a unique DID (simple timestamp-based for now)
    const did = `did:zeta:user_${Date.now()}`;

    // Hash the password using CryptoJS
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // Create user object with initial skeleton value and morphAddress
    const user = {
      id: did,
      name,
      password: hashedPassword,
      currentSKEL: 6483, // Initial balance, same as testUser.js
      morphAddress: did // Use DID as the morphAddress for now
    };

    // Store user in LocalStorage
    localStorage.setItem('user', JSON.stringify(user));

    // Send registration info to NEUROM via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'register',
        did,
        userData: user
      }));
    } else {
      setError('Failed to connect to NEUROM. Please try again.');
      return;
    }

    // Notify parent component of successful registration
    onRegister(user);
  };

  return (
    <div className="card">
      <h1 className="heading">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
      </div>
      <button onClick={handleRegister} className="button">
        Register
      </button>
    </div>
  );
}

export default Register;