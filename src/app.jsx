import React, { useState, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import './index.css';
import Register from './Register.jsx';
import SignIn from './SignIn.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [ws, setWs] = useState(null);
  const [targetDid, setTargetDid] = useState('');
  const [amount, setAmount] = useState('');
  const [peer, setPeer] = useState(null);
  const [error, setError] = useState('');

  // Establish WebSocket connection to NEUROM on app load
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    
    socket.onopen = () => {
      console.log('Connected to NEUROM WebSocket server');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from NEUROM:', data);

      if (data.type === 'registered') {
        console.log(`Device registered with DID: ${data.did}`);
      } else if (data.type === 'found') {
        console.log(`Device found: ${data.did} at ${data.ip}:${data.port}`);
        // Initiate WebRTC P2P connection
        initiatePeerConnection(data.ip, data.port);
      } else if (data.type === 'not-found') {
        setError(`Device not found: ${data.did}`);
      } else if (data.type === 'error') {
        setError(data.message);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from NEUROM WebSocket server');
      setWs(null);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

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
    setPeer(null);
  };

  const initiatePeerConnection = (ip, port) => {
    // Create a WebRTC peer connection using simple-peer
    const p = new SimplePeer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      }
    });

    // Handle WebRTC signaling data (send to target via NEUROM)
    p.on('signal', (signalData) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'signal',
          targetDid,
          signalData
        }));
      }
    });

    // Handle connection establishment
    p.on('connect', () => {
      console.log(`Connected to peer: ${targetDid}`);
      setPeer(p);

      // Send LSD transaction to the target device
      const transaction = {
        intent: 'PUSH',
        value: parseInt(amount),
        morphPin: '◇◇●●',
        target: targetDid
      };
      p.send(JSON.stringify(transaction));
      setError(`Sent ${amount} LSD to ${targetDid}`);
    });

    // Handle incoming data (e.g., confirmation from target)
    p.on('data', (data) => {
      console.log('Received data from peer:', data.toString());
    });

    p.on('error', (err) => {
      console.error('WebRTC error:', err);
      setError('Failed to connect to peer.');
    });
  };

  const handleSend = () => {
    if (!targetDid || !amount) {
      setError('Please enter a target DID and amount.');
      return;
    }

    if (parseInt(amount) > user.currentSKEL) {
      setError('Insufficient LSD balance.');
      return;
    }

    // Query NEUROM to find the target device
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'find',
        targetDid
      }));
    } else {
      setError('Not connected to NEUROM. Please try again.');
    }
  };

  if (!user) {
    return showRegister ? (
      <Register onRegister={handleRegister} ws={ws} />
    ) : (
      <div className="card">
        <h1 className="heading">ZetaMorph SPWA</h1>
        <SignIn onSignIn={handleSignIn} ws={ws} />
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
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label>
          Target DID:
          <input
            type="text"
            value={targetDid}
            onChange={(e) => setTargetDid(e.target.value)}
            className="border p-2 m-2"
            placeholder="e.g., did:zeta:user2"
          />
        </label>
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 m-2"
            placeholder="e.g., 300"
          />
        </label>
        <button onClick={handleSend} className="button">
          Send LSD
        </button>
        <button onClick={handleSignOut} className="button ml-2">
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default App;