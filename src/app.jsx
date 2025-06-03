import React, { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import 'webrtc-adapter';
import './index.css';
import Register from './components/register/Register.jsx';
import SignIn from './components/register/SignIn.jsx';
import { send } from '../src/ZM/ZTRL/send.js';
import { update } from '../src/ZM/ZTRL/update.js';
import { Cube } from '../src/ZM/MORPHCUBE/cube.js';
import { SYMBOL_SEQUENCE } from '../src/ZM/core/SacredSymbols.js';


// Polyfill for global (required for simple-peer in browser)
if (typeof window !== 'undefined') {
  window.global = window.global || window;
  window.process = window.process || { env: {} };
}

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [ws, setWs] = useState(null);
  const [targetDid, setTargetDid] = useState('');
  const [amount, setAmount] = useState('');
  const [peer, setPeer] = useState(null);
  const [error, setError] = useState('');
  const wsRef = useRef(null); // Track WebSocket instance
  const isConnectingRef = useRef(false); // Prevent overlapping connections
  const retryCountRef = useRef(0); // Track retry attempts
  const maxRetries = 5;
  const initialRetryDelay = 2000; // 2 seconds

  // Function to connect to WebSocket with retry logic
  const connectWebSocket = (retryDelay = initialRetryDelay) => {
    if (isConnectingRef.current) {
      console.log('WebSocket connection already in progress, skipping...');
      return;
    }

    isConnectingRef.current = true;
    console.log('Attempting to connect to NEUROM WebSocket server...');
const socket = new WebSocket('ws://192.168.1.166:8080');
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('Connected to NEUROM WebSocket server');
      setWs(socket);
      retryCountRef.current = 0; // Reset retry count on successful connection
      isConnectingRef.current = false;

      // If user is already logged in, re-register the device on reconnect
      if (user) {
        socket.send(JSON.stringify({
          type: 'register',
          did: user.id,
          userData: user
        }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message from NEUROM:', data);

      if (data.type === 'registered') {
        console.log(`Device registered with DID: ${data.did}`);
      } else if (data.type === 'found') {
        console.log(`Device found: ${data.did} at ${data.ip}:${data.port}`);
        initiatePeerConnection(data.ip, data.port, true); // Initiator
      } else if (data.type === 'signal') {
        initiatePeerConnection(null, null, false, data.signalData); // Receiver
      } else if (data.type === 'not-found') {
        setError(`Device not found: ${data.did}`);
      } else if (data.type === 'error') {
        setError(data.message);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from NEUROM WebSocket server');
      setWs(null);
      isConnectingRef.current = false;

      if (retryCountRef.current < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCountRef.current); // Exponential backoff
        console.log(`Retrying WebSocket connection in ${delay/1000} seconds... (Attempt ${retryCountRef.current + 1}/${maxRetries})`);
        setTimeout(() => {
          retryCountRef.current += 1;
          connectWebSocket(retryDelay);
        }, delay);
      } else {
        setError('Failed to connect to NEUROM after maximum retries. Please ensure NEUROM is running.');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnectingRef.current = false;
    };
  };

  // Establish WebSocket connection on app load
  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      isConnectingRef.current = false;
      retryCountRef.current = 0;
    };
  }, []); // Run only once on mount

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

  const initiatePeerConnection = (ip, port, isInitiator, signalData) => {
    // Create a WebRTC peer connection using simple-peer
    const p = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      }
    });

    // Handle incoming signaling data (for receiver)
    if (!isInitiator && signalData) {
      p.signal(signalData);
    }

    // Handle WebRTC signaling data (send to target via NEUROM)
    p.on('signal', (signalData) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'signal',
          targetDid: isInitiator ? targetDid : user.morphAddress, // For initiator: targetDid; for receiver: self
          signalData
        }));
      }
    });

    // Handle connection establishment
    p.on('connect', () => {
      console.log(`Connected to peer: ${isInitiator ? targetDid : 'unknown initiator'}`);
      setPeer(p);

      if (isInitiator) {
        // Send LSD transaction to the target device
        const transaction = {
          intent: 'PUSH',
          value: parseInt(amount),
          morphPin: '◇◇●●',
          target: targetDid
        };
        p.send(JSON.stringify(transaction));
        setError(`Sent ${amount} LSD to ${targetDid}`);
      }
    });

    // Handle incoming data (e.g., transaction or confirmation)
    p.on('data', async (data) => {
      console.log('Received data from peer:', data.toString());
      try {
        const transaction = JSON.parse(data.toString());
        if (transaction.intent === 'PUSH') {
          // Process the incoming LSD transaction using Cube
          const cube = new Cube(user);
          const newSkeletonJson = await cube.receiveRequest(transaction.value, transaction.morphPin);

          // Update user's currentSKEL with the new value
          const newSkeleton = JSON.parse(newSkeletonJson);
          const newValue = parseInt(newSkeleton.units.slice(0, newSkeleton.numberLength).map(u => SYMBOL_SEQUENCE.indexOf(u.currentSymbol)).join('') || '0', 10);
          const updatedUser = { ...user, currentSKEL: newValue };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setError(`Received ${transaction.value} LSD from peer`);
        }
      } catch (err) {
        console.error('Failed to process incoming transaction:', err);
        setError('Failed to process incoming transaction.');
      }
    });

    p.on('error', (err) => {
      console.error('WebRTC error:', err);
      setError('Failed to connect to peer.');
    });
  };

  const handleSend = () => {
    if (!targetDid || !amount) {
      setError('Please enter a target MorphAddress and amount.');
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
        Your MorphAddress: {user.morphAddress}
      </p>
      <p className="note">
        This app will handle LSD transfers via ZTRL and mesh routing to Chronos via NEUROM.
      </p>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label>
          Target MorphAddress:
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