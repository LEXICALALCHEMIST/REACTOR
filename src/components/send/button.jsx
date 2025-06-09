import React, { useState } from 'react';
import './button.css';

function SendButton({ user, onSendSuccess }) {
  const [toMorphAddress, setToMorphAddress] = useState(''); // Manual entry
  const [amount, setAmount] = useState('');
  const [intent, setIntent] = useState('PUSH');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!user || !toMorphAddress || !amount || !intent) {
      setError('All fields are required.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    if (parseInt(amount) > user.currentSKEL) {
      setError('Insufficient LSD balance.');
      return;
    }

    setError('');
    try {
      const response = await fetch('http://192.168.1.166:3001/morphQueue/sendMorph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: user.morphAddress,
          to: toMorphAddress,
          value: parseInt(amount),
          intent,
        }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setToMorphAddress(''); // Clear after success
      setAmount('');
      setIntent('PUSH');
      setShowForm(false);
      onSendSuccess();
      console.log('MorphOp sent successfully:', data);
    } catch (err) {
      console.error('Send error:', err);
      setError(err.message || 'Failed to send MorphOp.');
    }
  };

  return (
    <div className="send-container">
      <button className="send-button" onClick={() => setShowForm(true)}>
        Send LSD
      </button>
      {showForm && (
        <div className="send-form">
          <form onSubmit={handleSend}>
            <label>
              To MorphAddress:
              <input
                type="text"
                value={toMorphAddress}
                onChange={(e) => setToMorphAddress(e.target.value)}
                className="send-input"
                placeholder="Enter morphAddress (e.g., did:zeta:...)"
              />
            </label>
            <label>
              Amount:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="send-input"
              />
            </label>
            <label>
              Intent:
              <select value={intent} onChange={(e) => setIntent(e.target.value)} className="send-input">
                <option value="PUSH">Push</option>
                <option value="PULL">Pull</option>
              </select>
            </label>
            {error && <p className="send-error">{error}</p>}
            <button type="submit" className="send-button">
              Send
            </button>
            <button type="button" className="send-button cancel" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SendButton;