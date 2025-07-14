import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { v4 as uuidv4 } from 'uuid';
import { create } from '../../../../Nuerom/ZTRL/create.js';
import { getSkel } from '../../../../Nuerom/ZTRL/getSkel.js';
import { sCUBE } from '../../../../ZM/MORPHCUBE/sCUBE.js';
import Vesper from '../Vesper/Vesper.jsx';

function Send({ userId, onSendComplete }) {
  const [formData, setFormData] = useState({
    targetMorphId: '',
    value: ''
  });
  const [error, setError] = useState('');
  const [vesperState, setVesperState] = useState({ show: false, message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const value = parseInt(formData.value, 10);
    if (isNaN(value) || value <= 0) {
      setError('Value must be a positive number');
      setVesperState({ show: true, message: 'Send Failed: Value must be a positive number' });
      return;
    }
    if (!formData.targetMorphId) {
      setError('Target Morph ID is required');
      setVesperState({ show: true, message: 'Send Failed: Target Morph ID is required' });
      return;
    }
    try {
      const currentSKEL = await getSkel(userId);
      console.log('Current Skeleton:', currentSKEL);
      if (value > currentSKEL) {
        setError('Insufficient LSD balance');
        setVesperState({ show: true, message: 'Send Failed: Insufficient LSD balance' });
        return;
      }
      const sCube = new sCUBE(currentSKEL, userId);
      const { newSkeleton, pom } = await sCube.process(value);
      console.log('Cube Result:', { newSkeleton, pom });
      const morphOp = {
        intent: 'PUSH',
        value: value,
        morphId: uuidv4(),
        targetMorphId: formData.targetMorphId,
        userId: userId,
        signature: 'temp-signature',
        id: null
      };
      
      await create(morphOp, (err, data) => {
        if (err) {
          setError(err);
          setVesperState({ show: true, message: `Send Failed: ${err}` });
        } else {
          console.log('MorphOp created:', data.morphOp);
          setVesperState({ show: true, message: `Send Complete: ${value} LSD` });
          if (onSendComplete) onSendComplete(newSkeleton);
        }
      });
      setFormData({ targetMorphId: '', value: '' });
    } catch (error) {
      setError('Failed to fetch skeleton, process cube, or create morphOp: ' + error.message);
      setVesperState({ show: true, message: `Send Failed: ${error.message}` });
    }
  };

  const handleVesperClose = async (stateKey) => {
    try {
      if (stateKey === 'current_skel' && onSendComplete) {
        const current_skel = await getSkel(userId);
        onSendComplete(current_skel);
      }
      setVesperState({ show: false, message: '' });
    } catch (error) {
      console.error('Send: Failed to refresh state via Vesper:', error.message);
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicTargetMorphId">
          <Form.Label>Target Morph ID</Form.Label>
          <Form.Control
            type="text"
            name="targetMorphId"
            placeholder="Enter target Morph ID"
            value={formData.targetMorphId}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicValue">
          <Form.Label>Value (LSD)</Form.Label>
          <Form.Control
            type="number"
            name="value"
            placeholder="Enter amount to send"
            value={formData.value}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Send LSD
        </Button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </Form>
      <Vesper
        show={vesperState.show}
        message={vesperState.message}
        stateKey="current_skel"
        refreshState={handleVesperClose}
        onClose={() => setVesperState({ show: false, message: '' })}
      />
    </>
  );
}

export default Send;