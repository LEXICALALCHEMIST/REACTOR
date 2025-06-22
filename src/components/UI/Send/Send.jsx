import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { v4 as uuidv4 } from 'uuid'; // For morphId generation
import { create } from '../../../../Nuerom/ZTRL/create.js'; // Adjust path as needed
import { getSkel } from '../../../../Nuerom/ZTRL/getSkel.js'; // Added for skeleton fetch
import { sCUBE } from '../../../../ZM/MORPHCUBE/sCUBE.js'; // Added for cube integration


function Send({ userId, onSendComplete }) {
  const [formData, setFormData] = useState({
    targetMorphId: '',
    value: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const value = parseInt(formData.value, 10);
    if (isNaN(value) || value <= 0) {
      setError('Value must be a positive number');
      return;
    }
    if (!formData.targetMorphId) {
      setError('Target Morph ID is required');
      return;
    }
    try {
      const currentSKEL = await getSkel(userId); // Fetch current skeleton
      console.log('Current Skeleton:', currentSKEL);
      const sCube = new sCUBE(currentSKEL, userId); // Pass userId
      const { newSkeleton, pom } = await sCube.process(value); // Process with cube
      console.log('Cube Result:', { newSkeleton, pom });
      const morphOp = {
        intent: 'PULL', // Required field
        value: value,   // Required field
        morphId: uuidv4(),
        targetMorphId: formData.targetMorphId, // Required field
        userId: userId,
        signature: 'temp-signature', // Required field
        id: null // Placeholder for morphOp.id from create
      };
      await create(morphOp, (err, data) => {
        if (err) {
          setError(err);
        } else {
          console.log('MorphOp created:', data.morphOp);
          if (onSendComplete) onSendComplete(); // Notify Dashboard
        }
      });
    } catch (error) {
      setError('Failed to fetch skeleton, process cube, or create morphOp: ' + error.message);
    }
  };

  return (
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
  );
}

export default Send;