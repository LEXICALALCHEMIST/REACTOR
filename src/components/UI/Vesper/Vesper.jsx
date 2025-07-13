import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function Vesper({ show, message, stateKey, refreshState, onClose }) {
  const handleClose = async () => {
    try {
      if (refreshState) {
        await refreshState(stateKey);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Vesper: Failed to refresh state:', error.message);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Action Completed</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message || 'Operation completed successfully.'}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Vesper;