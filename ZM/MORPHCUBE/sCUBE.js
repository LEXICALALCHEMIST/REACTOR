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

  async process(sendAmount) {
    console.log('CUBE ACTIVATE:', { currentSKEL: this.currentSKEL, sendAmount });
    if (typeof sendAmount !== 'number' || sendAmount <= 0) {
      throw new Error('sCUBE: Invalid send amount');
    }
    if (sendAmount > this.currentSKEL) {
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

    // Process pull with PullModule
    const pullModule = new PullModule(skeleton);
    const updatedState = await pullModule.pull(sendAmount);

    // Update currentSKEL with correct conversion using SYMBOL_SEQUENCE
    const newSkeleton = updatedState;
    this.currentSKEL = parseInt(newSkeleton.units.slice(0, newSkeleton.numberLength).map(u => SYMBOL_SEQUENCE.indexOf(u.currentSymbol)).join('') || '0', 10);

    // Capture final phase with watcher using updated currentSKEL
    watcher({
      phase: 'final',
      skeleton: this.currentSKEL, // Reflects the new value (e.g., 90)
      units: newSkeleton.units.map(u => u.currentSymbol),
      length: newSkeleton.numberLength,
      userId: this.userId, // Pass userId
      proofId: null // To be generated
    });

    // Update weaver with POM
    weaver.pom = { 
      phase: 'final', 
      proofId: 'temp-proof-id', 
      skeleton: this.currentSKEL, // Updated skeleton value
      units: newSkeleton.units.map(u => u.currentSymbol),
      length: newSkeleton.numberLength,
      userId: this.userId // Pass userId
    };

    // Log the updated skeleton and update server
    console.log('CUBE UPDATED:', { newSkeleton });
    update(
      { userId: this.userId, newSKEL: this.currentSKEL }, // Use passed userId
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