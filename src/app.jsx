import React, { useState, useEffect } from 'react';
import Register from '../src/components/register/Register.jsx';
import Wallet from '../src/components/wallet/wallet.jsx';
import CryptoJS from 'crypto-js';
import './index.css';


function App() {
  const [user, setUser] = useState(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('localuser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.currentSKEL !== undefined && parsedUser.pin) {
        // Prompt for PIN on return
        if (!pin) {
          return; // Wait for PIN input
        }
        const hashedPin = CryptoJS.SHA256(pin).toString();
        if (hashedPin === parsedUser.pin) {
          setUser(parsedUser);
          setPin(''); // Clear PIN after success
          setPinError('');
        } else {
          setPinError('Incorrect PIN. Try again.');
        }
      } else {
        localStorage.removeItem('localuser'); // Clear invalid data
      }
    }
  }, [pin]); // Re-run when PIN changes

  const handleRegister = (newUser) => {
    if (newUser && newUser.id && newUser.name && newUser.currentSKEL !== undefined && newUser.pin) {
      setUser(newUser);
      localStorage.setItem('localuser', JSON.stringify(newUser));
      console.log('Registered user:', newUser);
    }
  };

  if (user) {
    return (
      <div className="App">
        <Wallet user={user} />
      </div>
    );
  }

  return (
    <div className="App">
      <h1 className="heading">SIO ZetaMorph</h1>
      {localStorage.getItem('localuser') && !user && (
        <div className="card">
          <h2 className="heading">Enter PIN</h2>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            className="border p-2 m-2"
            placeholder="1234"
          />
          {pinError && <p className="text-red-500">{pinError}</p>}
          <button
            onClick={() => {
              if (pin && pin.length === 4) {
                const storedUser = JSON.parse(localStorage.getItem('localuser'));
                const hashedPin = CryptoJS.SHA256(pin).toString();
                if (hashedPin === storedUser.pin) {
                  setUser(storedUser);
                  setPin('');
                  setPinError('');
                } else {
                  setPinError('Incorrect PIN. Try again.');
                }
              }
            }}
            className="button"
            disabled={!pin || pin.length !== 4}
          >
            Submit PIN
          </button>
        </div>
      )}
      {!localStorage.getItem('localuser') && <Register onRegister={handleRegister} />}
    </div>
  );
}

export default App;
