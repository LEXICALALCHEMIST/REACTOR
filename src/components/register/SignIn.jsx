import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

function SignIn({ onSignIn, ws }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = () => {
    // Retrieve user from LocalStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser) {
      setError('No user found. Please register first.');
      return;
    }

    // Hash the input password for comparison
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // Verify credentials
    if (storedUser.name === name && storedUser.password === hashedPassword) {
      setError('');

      // Register device with NEUROM on sign-in
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'register',
          did: storedUser.id,
          userData: storedUser
        }));
      } else {
        setError('Failed to connect to NEUROM. Please try again.');
        return;
      }

      onSignIn(storedUser);
    } else {
      setError('Invalid name or password.');
    }
  };

  return (
    <div className="card">
      <h1 className="heading">Sign In</h1>
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
      <button onClick={handleSignIn} className="button">
        Sign In
      </button>
    </div>
  );
}

export default SignIn;