import SkeletonInitializer from '../MorphLogic/SkeletonInitializer.js';
import PushModule from '../MorphLogic/PushModule.js';
import { Signal } from '../ZTRL/signal.js';
import { SYMBOL_SEQUENCE } from '../core/SacredSymbols.js';

console.log('MorphCube Initialized');

export class Cube {
  constructor(user) {
    this.user = user;
    this.skeleton = null;
    this.signal = new Signal(); // Initialize Signal for ZTRL integration
    this.initializeSkeleton(); // Initialize skeleton with user's currentSKEL
  }

  // Initialize the skeleton with the user's currentSKEL
  async initializeSkeleton() {
    if (!this.skeleton) {
      this.skeleton = new SkeletonInitializer();
      await this.skeleton.set(this.user.currentSKEL, true); // Use set as skeletonInitialize
      console.log(`Cube: Skeleton initialized with value: ${this.user.currentSKEL} for user: ${JSON.stringify(this.user)}`);
    }
    return this.skeleton;
  }

  // Intercept MorphOp from poll and log value/intent
  async interceptMorphOp(morphOp) {
    if (!morphOp || typeof morphOp !== 'object') {
      throw new Error('Cube interceptMorphOp: Invalid morphOp format');
    }

    const { value, intent } = morphOp;
    console.log('Intercepted MorphOp - Value:', value, 'Intent:', intent);

    // Initialize or reinitialize skeleton if needed
    await this.initializeSkeleton();

    // For now, log and return current state (no push/pull yet)
    const skeletonState = this.skeleton.getState();
    const skeletonDisplay = `<${skeletonState.units.slice(0, 4).map(u => u.currentSymbol).join('')}|${skeletonState.units.slice(4, 8).map(u => u.currentSymbol).join('')}|${skeletonState.units.slice(8, 12).map(u => u.currentSymbol).join('')}>`;
    console.log(`Current Skeleton State: ${skeletonDisplay}, currentSKEL: ${this.user.currentSKEL}`);
    return { currentSKEL: this.user.currentSKEL, units: skeletonState.units };
  }
}

export default Cube;