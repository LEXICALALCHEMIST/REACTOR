import React, { useState, useEffect } from 'react';
import { fetchMorphOps } from '../../../../Nuerom/ZTRL/receive.js'; // Adjust path
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import { ReceiveCube } from '../../../../ZM/MORPHCUBE/rCUBE.js';
import Vesper from '../Vesper/Vesper.jsx';

function Receive({ userId, onReceiveComplete }) {
  const [morphOps, setMorphOps] = useState([]); // Fetch pending morph operations
  const [error, setError] = useState('');
  const [vesperState, setVesperState] = useState({ show: false, message: '' });// State for Vesper notifications

  useEffect(() => {
    const loadMorphOps = async () => {
      try {
        const ops = await fetchMorphOps(userId);
        setMorphOps(ops);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch morphOps');
      }
    };

    //Pending MorphOs Mount
    loadMorphOps();
    const intervalId = setInterval(loadMorphOps, 10000);

    return () => clearInterval(intervalId);
  }, [userId]);

  //Process MorphOp
  const handleProcess = async (morphOp) => {
    try {
      const cube = new ReceiveCube({ id: userId, token: localStorage.getItem('token') });
      const result = await cube.process(morphOp);
      console.log('Receive: Processed morphOp:', result);
      setVesperState({ show: true, message: `Processed Successful: ${result.newSKEL} LSD` });
      if (onReceiveComplete) {
        onReceiveComplete(result.newSKEL);
      }
    } catch (error) {
      setError(error.message);
      setVesperState({ show: true, message: `Process Failed: ${error.message}` });
    }
  };

  //VESPER State/Notifcation Handler
  const handleVesperClose = async (stateKey) => {
    try {
      if (stateKey === 'morphOps') {
        const ops = await fetchMorphOps(userId);
        setMorphOps(ops);
        console.log('Receive: Refreshed morphOps:', ops);
      }
      setVesperState({ show: false, message: '' });
    } catch (error) {
      console.error('Receive: Failed to refresh morphOps:', error.message);
    }
  };

  return (
    <>
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
      <Vesper
        show={vesperState.show}
        message={vesperState.message}
        stateKey="morphOps"
        refreshState={handleVesperClose}
        onClose={() => setVesperState({ show: false, message: '' })}
      />
    </>
  );
}

export default Receive;