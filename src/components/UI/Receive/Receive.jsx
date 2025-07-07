import React, { useState, useEffect } from 'react';
import { fetchMorphOps } from '../../../../Nuerom/ZTRL/receive.js'; // Adjust path
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { ReceiveCube } from '../../../../ZM/MORPHCUBE/rCUBE.js';

function Receive({ userId }) {
  const [morphOps, setMorphOps] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMorphOps = async () => {
      try {
        const ops = await fetchMorphOps(userId);
        setMorphOps(ops);
      } catch (err) {
        setError(err);
      }
    };
    loadMorphOps();
  }, [userId]);

const handleProcess = async (morphOp) => {
  try {
    const cube = new ReceiveCube({ id: userId, token: localStorage.getItem('token') });
    const result = await cube.process(morphOp);
    console.log('Receive: Processed morphOp:', result);
    // Trigger UI refresh (e.g., notify Dashboard.jsx)
    // Future: Call update.js to sync server
  } catch (error) {
    setError(error.message);
  }
};

  return (
    <Card>
      <Card.Header>Pending Morph Operations</Card.Header>
      <Card.Body>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ListGroup>
          {morphOps.map((morphOp) => (
            <ListGroup.Item key={morphOp.id}>
              ID: {morphOp.id}, Value: {morphOp.value}, Target: {morphOp.target_id || morphOp.targetMorphId}
              <Button variant="primary" className="ms-2" onClick={() => handleProcess(morphOp)}>Process</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

export default Receive;