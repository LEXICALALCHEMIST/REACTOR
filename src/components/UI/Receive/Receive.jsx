import React, { useState, useEffect } from 'react';
import { fetchMorphOps } from '../../../../Nuerom/ZTRL/receive.js'; // Adjust path
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { rCUBE } from '../../../../ZM/MORPHCUBE/rCUBE.js'; // Placeholder import

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

  const handleProcess = (morphOp) => {
    console.log('CUBE IGNITED');
    console.log('MorphOp in play:', morphOp);
    // Placeholder for rCUBE logic
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