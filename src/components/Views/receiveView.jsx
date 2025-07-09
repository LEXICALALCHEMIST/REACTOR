import React from 'react';
import Container from 'react-bootstrap/Container';
import Receive from '../UI/Receive/Receive.jsx'; // Adjust the import path as necessary

function ReceiveView({ userId, onReceiveComplete }) {
  return (
    <Container>
      <Receive userId={userId} onReceiveComplete={onReceiveComplete} />
    </Container>
  );
}

export default ReceiveView;