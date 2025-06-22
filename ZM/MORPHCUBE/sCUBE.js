import SkeletonInitializer from '../MorphLogic/SkeletonInitializer.js';
import PullModule from '../MorphLogic/PullModule.js';
import { SYMBOL_SEQUENCE } from '../core/SacredSymbols.js';
import watcher from '../utils/watcher.js';
import weaver from '../utils/weaver.js';
import { v4 as uuidv4 } from 'uuid';

export class SendCube {
  constructor(user) {
    this.user = user; // {id: string, currentSKEL: number}
  }

  async processMorphOps(morphOp) {
    if (!morphOp || typeof morphOp !== 'object' || !['PUSH', 'PULL'].includes(morphOp.INTENT)) {
      throw new Error('SendCube: Invalid morphOp format');
    }

    let currentSKEL = this.user.currentSKEL;
    let newSkeletonJson = null;

    // Initialize skeleton for set phase
    const skeleton = new SkeletonInitializer();
    await skeleton.set(currentSKEL, true);
    const initialState = skeleton.getState();

    // Capture set phase
    watcher({
      phase: 'set',
      state: {
        initialSKEL: currentSKEL,
        units: initialState.units.map(u => u.currentSymbol),
        numberLength: initialState.numberLength
      }
    });

    // Process PULL (send operation)
    newSkeletonJson = await this.morph(currentSKEL, morphOp);

    // Update currentSKEL
    const newSkeleton = JSON.parse(newSkeletonJson);
    currentSKEL = parseInt(newSkeleton.units.slice(0, newSkeleton.numberLength).map(u => SYMBOL_SEQUENCE.indexOf(u.currentSymbol)).join('') || '0', 10);
    this.user.currentSKEL = currentSKEL;

    // Package morphOp for sending (simplified, to be routed via ZTRL later)
    const packagedMorphOp = {
      INTENT: morphOp.INTENT,
      VALUE: morphOp.VALUE,
      morphId: morphOp.morphId || uuidv4(),
      targetId: morphOp.targetId || 'testTarget', // Placeholder, replace with actual target
      signature: 'placeholderSignature' // Replace with EIP-712 signature later
    };

    // WATCHER - FINAL PHASE CAPTURE
    if (newSkeletonJson) {
      const finalState = JSON.parse(newSkeletonJson);
      watcher({
        phase: 'final',
        skeleton: currentSKEL,
        units: finalState.units.map(u => u.currentSymbol),
        length: finalState.numberLength,
        userId: this.user.id || 'user-placeholder',
        proofId: uuidv4() // Generate UUID for proofId
      });
    }

    return {
      currentSKEL,
      newSkeletonJson,
      pom: weaver.pom,
      packagedMorphOp // For testing or ZTRL routing
    };
  }

  // PULL MODULE ACTIVATE PULL
  async morph(currentSKEL, morphOp) {
    const skeleton = new SkeletonInitializer();
    await skeleton.set(currentSKEL, true);

    const pullModule = new PullModule(skeleton);
    const updatedState = await pullModule.pull(morphOp.VALUE); // Pull value from skeleton

    const newSkeletonJson = JSON.stringify(updatedState);
    return newSkeletonJson;
  }

  // RETURN FINAL POM
  getPOM() {
    return weaver.pom || null;
  }
}