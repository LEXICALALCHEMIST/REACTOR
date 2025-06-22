import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Send from '../Send/Send.jsx';
import './Dashboard.css';

function Dashboard({ user }) {
  const handleSendComplete = () => {
    // Optionally refresh user data (e.g., fetch current_skel)
    console.log('Send complete, refreshing UI if needed');
  };

  return (
    <Container className="dashboard">
      <h1>Welcome, {user?.username || 'User'}</h1>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Wallet Balance</Card.Header>
            <Card.Body>
              <Card.Text>Current Skeleton: {user?.current_skel || 0} LSD</Card.Text>
              <Card.Text>Morph ID: {user?.morph_id || 'N/A'}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Send LSD</Card.Header>
            <Card.Body>
              <Send userId={user?.id} onSendComplete={handleSendComplete} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;