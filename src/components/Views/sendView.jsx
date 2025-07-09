import React from 'react';
import Container from 'react-bootstrap/Container';
import Send from '../UI/Send/Send.jsx';

function SendView({ userId, onSendComplete }) {
  return (
    <Container>
      <Send userId={userId} onSendComplete={onSendComplete} />
    </Container>
  );
}

export default SendView;