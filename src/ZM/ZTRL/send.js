import { update } from './update.js';

export async function send(sendObject, currentSKEL) {
  // Define the placeholder MORPH PIN
  const VALID_MORPH_PIN = '◇◇●●';

  // Validate the send object structure
  if (!sendObject || typeof sendObject !== 'object') {
    throw new Error('ZTRL send: Invalid send object format');
  }

  const { intent, value, morphPin, target } = sendObject;

  // Validate the intent
  if (intent !== 'PUSH') {
    throw new Error('ZTRL send: Intent must be PUSH');
  }

  // Validate the value
  if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
    throw new Error('ZTRL send: Value must be a non-negative integer');
  }

  // Validate the MORPH PIN
  if (morphPin !== VALID_MORPH_PIN) {
    throw new Error('ZTRL send: Invalid MORPH PIN. Verification failed.');
  }

  // Validate the target
  if (target !== 'Dummy2') {
    throw new Error('ZTRL send: Target must be Dummy2');
  }

  // Log the send operation
  console.log(`ZTRL send: Intent: ${intent}, value: ${value}, MORPHPIN: ${morphPin}, Target: ${target}`);

  // Update the sender's skeleton by pulling the send amount
  const newSkeletonJson = await update(currentSKEL, value);

  // Create the morphOp object for the recipient
  const morphOp = {
    INTENT: intent,
    VALUE: value
  };

  // Return both the morphOp and the updated skeleton JSON
  return { morphOp, newSkeletonJson };
}