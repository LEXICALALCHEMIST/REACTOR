import SkeletonInitializer from '../MorphLogic/SkeletonInitializer.js';
import PushModule from '../MorphLogic/PushModule.js';
import { SYMBOL_SEQUENCE } from '../core/SacredSymbols.js';
import { getSkel } from '../../Nuerom/ZTRL/getSkel.js';
import { update } from '../../Nuerom/ZTRL/update.js';
import { updateMorph } from '../../Nuerom/ZTRL/updateMorph.js';
import watcher from '../utils/watcher.js';
import weaver from '../utils/weaver.js';

export class ReceiveCube {
  constructor(user) {
    this.user = user; // { id: string, token: string, morph_id: string }
  }

  async process(morphOp) {
    // Validate morphOp
    if (!morphOp || typeof morphOp !== 'object') {
      throw new Error('ReceiveCube: Invalid morphOp format');
    }
    if (morphOp.intent !== 'PUSH' || !Number.isInteger(morphOp.value) || morphOp.value < 0) {
      throw new Error(`ReceiveCube: Invalid morphOp - intent: ${morphOp.intent}, value: ${morphOp.value}`);
    }
    if (!morphOp.signature) {
      console.warn('ReceiveCube: Using placeholder signature, replace with proper validation');
    }

    // Fetch user's current skeleton
    let currentSKEL;
    try {
      currentSKEL = await getSkel(this.user.id);
      if (typeof currentSKEL !== 'number' || currentSKEL < 0 || currentSKEL > 999999999999) {
        throw new Error('ReceiveCube: Invalid current_skel value');
      }
    } catch (error) {
      console.error('ReceiveCube: Failed to fetch skeleton:', error.message);
      throw error;
    }

    // Initialize skeleton for set phase
    const skeleton = new SkeletonInitializer();
    await skeleton.set(currentSKEL, true);
    const initialState = skeleton.getState();

    // Capture set phase with watcher
    watcher({
      phase: 'set',
      state: {
        initialSKEL: currentSKEL,
        units: initialState.units.map(u => u.currentSymbol),
        numberLength: initialState.numberLength
      }
    });

    // Capture morphOp details
    watcher({
      phase: 'morphops',
      id: morphOp.morph_id || 'unknown',
      intent: morphOp.intent,
      value: morphOp.value,
      unitName: 'u1', // Assuming push starts at u1
      symbolBefore: initialState.units[0].currentSymbol
    });

    // Process PUSH with PushModule
    const pushModule = new PushModule(skeleton);
    const updatedState = await pushModule.push(morphOp.value);

    // Calculate new skeleton value
    const newSKEL = parseInt(
      updatedState.units.slice(0, updatedState.numberLength)
        .map(u => u.currentSymbol)
        .map(s => SYMBOL_SEQUENCE.indexOf(s))
        .join('') || '0',
      10
    );

    // Check for skeleton overflow
    if (newSKEL > 999999999999) {
      throw new Error('ReceiveCube: Skeleton overflow');
    }

    // Update server: user skeleton
    await new Promise((resolve, reject) => {
      update({ userId: this.user.id, newSKEL }, (err, data) => {
        if (err) {
          console.error('ReceiveCube: Failed to update skeleton:', err);
          reject(new Error('Failed to update skeleton: ' + err));
        } else {
          console.log(`ReceiveCube: Updated user ${this.user.id} skeleton to ${newSKEL}`);
          resolve(data);
        }
      });
    });

    // Update server: morphOp status
    await new Promise((resolve, reject) => {
      updateMorph({ morphOpId: morphOp.id, status: 'COMPLETED' }, (err, data) => {
        if (err) {
          console.error('ReceiveCube: Failed to update morphOp status:', err);
          reject(new Error('Failed to update morphOp: ' + err));
        } else {
          console.log(`ReceiveCube: Marked morphOp ${morphOp.id} as COMPLETED`);
          resolve(data);
        }
      });
    });

    // Capture final phase with watcher
    watcher({
      phase: 'final',
      skeleton: newSKEL,
      units: updatedState.units.map(u => u.currentSymbol),
      length: updatedState.numberLength,
      userId: this.user.id
    });

    // Log the new skeleton value
    const skeletonDisplay = `<${updatedState.units.slice(0, 4).map(u => u.currentSymbol).join('')}|${updatedState.units.slice(4, 8).map(u => u.currentSymbol).join('')}|${updatedState.units.slice(8, 12).map(u => u.currentSymbol).join('')}>`;
    console.log(`ReceiveCube: Processed morphOp - New skeleton value: ${newSKEL}, Display: ${skeletonDisplay}`);

    // Return new skeleton value and POM
    return {
      newSKEL,
      newSkeletonJson: JSON.stringify(updatedState),
      pom: weaver.pom
    };
  }
}