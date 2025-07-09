import React from 'react';
import Wallet from '../UI/Wallet/Wallet.jsx';
import Container from 'react-bootstrap/Container';

function WalletView({ user }) {
  return (
    <Container>
      <Wallet user={user} />
    </Container>
  );
}

export default WalletView;