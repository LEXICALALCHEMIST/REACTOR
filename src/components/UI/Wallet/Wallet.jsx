import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';

function Wallet({ user }) {
  return (
    <>
      <h1 className='navbar-logo'>Hive ID: {user?.username || 'User'}</h1>
      <Col md={6}>
        <Card className="mb-4">
          <Card.Header>Wallet Balance</Card.Header>
          <Card.Body>
            <Card.Text>Current Skeleton: {user?.current_skel || 0} LSD</Card.Text>
            <Card.Text>Morph ID: {user?.morph_id || 'N/A'}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}

export default Wallet;
