import React, { useState, useEffect } from 'react';

import Register from '../src/components/register/Register.jsx';
import Wallet from '../src/components/wallet/wallet.jsx';
import SendButton from '../src/components/send/button.jsx';
import ReLogin from '../src/components/reLogin/reLogin.jsx';

import { useMorphPoller } from '../src/hooks/morphPoller.jsx';
import CryptoJS from 'crypto-js';

import './index.css';

import Cube from '../src/ZM/MORPHCUBE/cube.js';

function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState(''); // Prompt for name on first load
  const [pass, setPass] = useState(''); // Password for initial login
  const [pinError, setPinError] = useState('');
  const [cube, setCube] = useState(null); // State to hold Cube instance
  const [morphID, setMorphID] = useState(null); // State for live morphID

  useEffect(() => {
    console.log('App useEffect - user:', user); // Debug log
    const storedUser = localStorage.getItem('localuser');
    if (storedUser && !user) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Parsed storedUser for re-entry:', parsedUser); // Debug log
      if (parsedUser && parsedUser.name) {
        setName(parsedUser.name); // Pre-fill name for re-entry
      }
    }
  }, [user]); // Only runs if user is not set

  const handleLogin = (liveUser, liveMorphID) => {
    setUser(liveUser);
    setMorphID(liveMorphID);
    setCube(new Cube({ ...liveUser, morphAddress: liveMorphID })); // Initialize Cube with DB data
    setPass('');
    setPinError('');
  };

  const handleRegister = (newUser) => {
    if (newUser && newUser.id && newUser.name && newUser.currentSKEL !== undefined && newUser.pin) {
      const morphAddress = newUser.id; // Use id as morphAddress
      const initialUser = { name: newUser.name, currentSKEL: newUser.currentSKEL };
      setUser(initialUser);
      setMorphID(morphAddress); // Set morphID from registration id
      setCube(new Cube({ ...initialUser, morphAddress })); // Initialize Cube
      localStorage.setItem('localuser', JSON.stringify({ name: newUser.name, pin: newUser.pin })); // Store pin for re-login
      console.log('Registered user:', initialUser, 'morphID:', morphAddress);
    }
  };

  useMorphPoller(morphID, async (morphOp) => {
    if (!cube) throw new Error('Cube not initialized after user registration');
    console.log('Polling MorphOp before interception - toID:', morphID, 'MorphOp:', morphOp);
    console.log('MorphOp details - id:', morphOp.id, 'value:', morphOp.value, 'intent:', morphOp.intent); // Debug properties
    const result = await cube.interceptMorphOp(morphOp);
    console.log('MorphOp intercepted - Result:', result, 'Current toID:', morphID);
  }, [morphID]); // Re-run when morphID changes

  if (user) {
    return (
      <div className="App">
        <Wallet user={user} />
        <SendButton user={{ ...user, morphAddress: morphID }} onSendSuccess={() => setUser({ ...user })} />
      </div>
    );
  }

  return (
    <div className="App">
      <h1 className="heading">SIO ZetaMorph</h1>
      <div className="card">
        <h2 className="heading">Login or Register</h2>
        {localStorage.getItem('localuser') ? (
          <ReLogin onLogin={handleLogin} />
        ) : (
          <>
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
            {pinError && <p className="text-red-500">{pinError}</p>}
            <button
              onClick={() => {
                if (!name || !pass) {
                  setPinError('Name and password are required.');
                  return;
                }
                const hashedPass = CryptoJS.SHA256(pass).toString(); // Hash password for login
                fetch('http://192.168.1.166:3001/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, password: hashedPass, pin: '' }), // Use hashed password, no pin for initial login
                })
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.error) throw new Error(data.error);
                    const liveUser = { name, currentSKEL: data.currentSKEL };
                    handleLogin(liveUser, data.id);
                  })
                  .catch((err) => {
                    console.error('Login error:', err);
                    setPinError(err.message || 'Failed to verify user.');
                  });
              }}
              className="button"
              disabled={!name || !pass}
            >
              Login
            </button>
            <Register onRegister={handleRegister} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;