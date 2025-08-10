import SkeletonInitializer from '../MorphLogic/SkeletonInitializer.js';
import PullModule from '../MorphLogic/PullModule.js';
import watcher from '../utils/watcher.js';
import weaver from '../utils/weaver.js';
import { SYMBOL_SEQUENCE, VOID_SYMBOL } from '../core/SacredSymbols.js';
import { update } from '../../Nuerom/ZTRL/update.js'; // Added for skeleton update`

export class sCUBE {
  constructor(currentSKEL, userId) {
    this.currentSKEL = currentSKEL; // Initial skeleton value
    this.userId = userId; // Added for update
  }

  async process(morphOp) {
    console.log('CUBE ACTIVATE:', { currentSKEL: this.currentSKEL, morphOp });
    // Debug validation
    console.log('Validating morphOp:', {
      isObject: !!morphOp && typeof morphOp === 'object',
      hasIntent: morphOp?.intent === 'PULL',
      isValueInteger: Number.isInteger(Number(morphOp?.value)),
      isValuePositive: Number(morphOp?.value) > 0
    });
    if (!morphOp || typeof morphOp !== 'object' || morphOp.intent !== 'PULL' || !Number.isInteger(Number(morphOp.value)) || Number(morphOp.value) <= 0) {
      throw new Error('sCUBE: Invalid morphOp format or value');
    }
    if (Number(morphOp.value) > this.currentSKEL) {
      throw new Error('sCUBE: Send amount exceeds current skeleton balance');
    }

    // Initialize skeleton for set phase
    const skeleton = new SkeletonInitializer();
    await skeleton.set(this.currentSKEL, true);
    const initialState = skeleton.getState();

    // Capture set phase with watcher
    watcher({
      phase: 'set',
      state: {
        initialSKEL: this.currentSKEL,
        units: initialState.units.map(u => u.currentSymbol),
        numberLength: initialState.numberLength
      }
    });

    // Capture morphOp details
    watcher({
      phase: 'morphops',
      id: morphOp.morphId || 'unknown',
      intent: morphOp.intent,
      value: Number(morphOp.value),
      unitName: 'u1',
      symbolBefore: initialState.units[0].currentSymbol
    });

    // Process pull with PullModule
    const pullModule = new PullModule(skeleton);
    const updatedState = await pullModule.pull(Number(morphOp.value));

    // Update currentSKEL with correct conversion using SYMBOL_SEQUENCE
    const newSkeleton = updatedState;
    this.currentSKEL = parseInt(
      newSkeleton.units.slice(0, newSkeleton.numberLength)
        .map(u => SYMBOL_SEQUENCE.indexOf(u.currentSymbol))
        .join('') || '0',
      10
    );

    // Capture final phase with watcher using updated currentSKEL
    watcher({
      phase: 'final',
      skeleton: this.currentSKEL,
      units: newSkeleton.units.map(u => u.currentSymbol),
      length: newSkeleton.numberLength,
      userId: this.userId,
      proofId: null
    });

    // Update weaver with POM
    weaver.pom = {
      phase: 'final',
      proofId: 'temp-proof-id',
      skeleton: this.currentSKEL,
      units: newSkeleton.units.map(u => u.currentSymbol),
      length: newSkeleton.numberLength,
      userId: this.userId
    };

    // Log the updated skeleton and update server
    console.log('CUBE UPDATED:', { newSkeleton });
    update(
      { userId: this.userId, newSKEL: this.currentSKEL },
      (err, updateData) => {
        if (err) {
          console.error('Skeleton update failed:', err);
        } else {
          console.log('Skeleton updated successfully:', updateData);
        }
      }
    );

    return {
      newSkeleton,
      pom: weaver.pom
    };
  }
}