import { morphInit } from '../core/MorphInit.js';
import { Shutter } from './shutter.js';
import { SYMBOL_SEQUENCE, VOID_SYMBOL } from '../core/SacredSymbols.js';

export default class PullModule {
  constructor(skeleton) {
    this.skeleton = skeleton;
  }

  async pull(keyNumber) {
    console.log(`Applying pull for ${keyNumber}`);
    
    const currentSkeletonNumber = parseInt(this.skeleton.units.slice(0, this.skeleton.state.numberLength).map(u => SYMBOL_SEQUENCE.indexOf(u.state.currentSymbol)).join('') || '0', 10);
    
    // Use MorphInit to determine skeleton and key
    const { skeleton, key } = await morphInit(keyNumber, currentSkeletonNumber, false);
    this.skeleton = skeleton;
    const units = this.skeleton.units;
    
    // Apply the shifted key for pulling
    for (let i = 0; i < key.push.length && i < units.length; i++) {
      const pushEntry = key.push[i];
      const [unitName, value] = pushEntry.split(':');
      const unitIndex = parseInt(unitName.replace('U', '')) - 1;
      const unit = units[unitIndex];
      const position = `u${unitIndex + 1}`;
      
      const currentSymbol = unit.state && unit.state.currentSymbol ? unit.state.currentSymbol : VOID_SYMBOL;
      
      if (value !== 'null') {
        const numValue = parseInt(value);
        if (numValue > 0) {
          console.log(`Pulling ${unitName}-${position}: ${numValue}`);
          unit.pull(numValue, this.skeleton.carryBus);
          // Propagate borrows (negative carries)
          while (this.skeleton.carryBus.carryValue < 0) {
            const { carryValue, carryTarget } = this.skeleton.carryBus.flushCarry();
            const targetIndex = parseInt(carryTarget.replace('Unit', '')) - 1;
            if (targetIndex >= 0 && targetIndex < units.length) {
              console.log(`Borrow applied to Unit${targetIndex + 1}: ${carryValue}`);
              units[targetIndex].pull(1, this.skeleton.carryBus);
            }
          }
        } else if (currentSymbol !== VOID_SYMBOL) {
          console.log(`Preserving ${unitName}-${position}: ${currentSymbol} (no pull)`);
        }
      } else {
        console.log(`Skipping ${unitName}-${position}: null`);
      }
    }
    
    // Compute the new skeleton number
    const newSkeletonNumber = Math.max(currentSkeletonNumber - keyNumber, 0);
    console.log(`Computed new skeleton number: ${newSkeletonNumber}`);
    
    // Clear all unit states and carryBus before snapshot to prevent extra pushes
    units.forEach(unit => {
      if (unit.state) {
        unit.state.pushes = [];
        unit.state.pushesLength = 0;
        unit.state.carry = 0;
        unit.state.hasCollapsed = false;
        unit.state.u1Collapse = false;
      }
    });
    this.skeleton.carryBus.carryValue = 0;
    this.skeleton.carryBus.carryTarget = null;
    console.log('Cleared unit states and carryBus before snapshot');
    
    // Snapshot the skeleton mid-morph to ensure consistency
    this.skeleton = await Shutter.snapMidMorph(this.skeleton, newSkeletonNumber);
    
    // Return the final state after snapshot
    const finalState = this.skeleton.getState();
    const finalSkeletonDisplay = `<${finalState.units.slice(0, 4).map(u => u.currentSymbol).join('')}|${finalState.units.slice(4, 8).map(u => u.currentSymbol).join('')}|${finalState.units.slice(8, 12).map(u => u.currentSymbol).join('')}>`;
    console.log(`Final Skeleton (after pull): ${finalSkeletonDisplay}`);
    return finalState;
  }
}