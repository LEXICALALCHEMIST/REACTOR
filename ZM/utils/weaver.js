import { v4 as uuidv4 } from 'uuid';
export default function weaver(data) {
  // Initialize POM if not set
  if (!weaver.pom) {
    weaver.pom = {
      set: null,
      morphops: [],
      final: null,
      proofId: null,
      userId: null
    };
  }

  // Label data based on phase
  if (data && data.phase) {
    if (data.phase === 'set') {
      weaver.pom.set = {
        initialSKEL: data.state?.initialSKEL,
        units: data.state?.units,
        length: data.state?.numberLength
      };
    } else if (data.phase === 'morphops') {
      const morph = {
        id: data.id || 'uuid-placeholder',
        intent: data.intent,
        value: data.value,
        unitName: data.unitName,
        symbolBefore: data.symbolBefore
      };
      weaver.pom.morphops.push(morph);
    } else if (data.phase === 'final') {
      weaver.pom.final = {
        skeleton: data.skeleton,
        units: data.units,
        length: data.length
      };
      weaver.pom.userId = data.userId;
      weaver.pom.proofId = uuidv4(); // UUID later
    }
  }

  // Log the current POM state
  console.log('Weaver: Building POM:', JSON.stringify(weaver.pom, null, 2));

  return weaver.pom;
}

// Reset POM for new test cases
weaver.reset = function() {
  weaver.pom = null;
};