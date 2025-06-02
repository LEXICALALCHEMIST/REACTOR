import { SYMBOL_SEQUENCE, VOID_SYMBOL } from '../core/SacredSymbols.js';

export default class ShiftKey {
  shift(key, targetLength) {
    console.log(`Shifting key for ${key.number} to targetLength: ${targetLength}`);
    
    const oldPush = key.push;
    console.log(`Shifting key: Old: PUSH[${oldPush.join(', ')}]`);
    
    // Default targetLength to key.length if undefined
    const effectiveTargetLength = targetLength !== undefined ? targetLength : key.length;
    if (targetLength === undefined) {
      console.warn(`Warning: targetLength undefined, defaulting to key.length=${key.length}`);
    }
    
    const newPush = Array(12).fill('null').map((_, i) => {
      const oldIndex = i - (effectiveTargetLength - key.length);
      if (oldIndex >= 0 && oldIndex < oldPush.length && !oldPush[oldIndex].includes('null')) {
        const [, value] = oldPush[oldIndex].split(':');
        return `U${i + 1}:${value}`; // Preserve value, update unit
      }
      return `U${i + 1}:null`;
    });
    
    const newView = newPush.map(entry => {
      if (entry.includes('null')) return VOID_SYMBOL;
      const [, value] = entry.split(':');
      return SYMBOL_SEQUENCE[parseInt(value)] || VOID_SYMBOL;
    });
    
    const shiftedKey = {
      number: key.number,
      length: key.length,
      targetLength: effectiveTargetLength,
      push: newPush,
      view: newView,
      targetUnit: `u${effectiveTargetLength}`
    };
    
    console.log(`Shifting key: New: PUSH[${newPush.join(', ')}]`);
    return shiftedKey;
  }
}