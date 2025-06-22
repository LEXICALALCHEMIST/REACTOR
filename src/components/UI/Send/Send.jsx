import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { v4 as uuidv4 } from 'uuid'; // For morphId generation

function Send({ userId, onSend }) {
  const [formData, setFormData] = useState({
    targetMorphId: '',
    value: ''
  });
  const [error, setError] = useState(''); // Added error state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
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
    const morphOp = {
      INTENT: 'PUSH',
      VALUE: value,
      morphId: uuidv4(), // Generate unique morphId
      targetMorphId: formData.targetMorphId,
      userId: userId
    };
    if (onSend) onSend(morphOp); // Pass to parent or ZTRL
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