export async function receive(sendObject) {
  // Define the placeholder MORPH PIN
  const VALID_MORPH_PIN = '◇◇●●';

  // Validate the send object structure
  if (!sendObject || typeof sendObject !== 'object') {
    throw new Error('ZTRL receive: Invalid send object format');
  }

  const { intent, value, morphPin, target } = sendObject;

  // Validate the intent
  if (intent !== 'PUSH') {
    throw new Error('ZTRL receive: Intent must be PUSH');
  }

  // Validate the value
  if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
    throw new Error('ZTRL receive: Value must be a non-negative integer');
  }

  // Validate the MORPH PIN
  if (morphPin !== VALID_MORPH_PIN) {
    throw new Error('ZTRL receive: Invalid MORPH PIN. Verification failed.');
  }

  // Validate the target
  if (target !== 'Dummy2') {
    throw new Error('ZTRL receive: Target must be Dummy2');
  }

  // Log receipt from NEUROM
  console.log(`ZTRL received from NEUROM: Intent: ${intent}, value: ${value}, MORPHPIN: ${morphPin}, Target: ${target}`);

  // Create the morphOp object
  const morphOp = {
    INTENT: intent,
    VALUE: value
  };

  return morphOp;
}