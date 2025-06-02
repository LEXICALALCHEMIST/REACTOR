import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Generate a unique ID (simple timestamp-based for now)
    const id = `user_${Date.now()}`;

    // Hash the password using CryptoJS
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // Create user object with initial skeleton value
    const user = {
      id,
      name,
      password: hashedPassword,
      currentSKEL: 6483 // Initial balance, same as testUser.js
    };

    // Store user in LocalStorage
    localStorage.setItem('user', JSON.stringify(user));

    // Notify parent component of successful registration
    onRegister(user);
  };

  return (
    <div className="card">
      <h1 className="heading">Register</h1>
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