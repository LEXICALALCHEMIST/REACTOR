import React from 'react';

function Wallet({ user }) {
  if (!user) return null;

  return (
    <div className="wallet">
      <h2 className="wallet-heading">Wallet</h2>
      <p>Name: {user.name}</p>
      <p>Balance: {user.currentSKEL} LSD</p>
    </div>
  );
}

export default Wallet;