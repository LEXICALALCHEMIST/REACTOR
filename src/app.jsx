import React, { useState, useEffect } from 'react';
import './index.css';
import Register from '../src/components/register/Register.jsx';
import SignIn from '../src/components/register/SignIn.jsx';
import testUser from '../user/testUser.js';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Check LocalStorage for existing user on app load
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleRegister = (newUser) => {
    setUser(newUser);
    setShowRegister(false);
  };

  const handleSignIn = (signedInUser) => {
    setUser(signedInUser);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  if (!user) {
    return showRegister ? (
      <Register onRegister={handleRegister} />
    ) : (
      <div className="card">
        <h1 className="heading">ZetaMorph SPWA</h1>
        <SignIn onSignIn={handleSignIn} />
        <button
          onClick={() => setShowRegister(true)}
          className="button mt-4"
        >
          Register
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="heading">ZetaMorph SPWA</h1>
      <p className="description">
        Welcome, {user.name}! Your current LSD balance: {user.currentSKEL}
      </p>
      <p className="note">
        This app will handle LSD transfers via ZTRL and mesh routing to Chronos via NEUROM.
      </p>
      <div>
        <button className="button">
          Send LSD (Coming Soon)
        </button>
        <button onClick={handleSignOut} className="button ml-2">
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default App;