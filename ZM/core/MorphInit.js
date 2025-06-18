import SkeletonInitializer from '../MorphLogic/SkeletonInitializer.js';
import KeyMaker from '../key/KeyMaker.js';
import ShiftKey from '../key/ShiftKey.js';
import { SYMBOL_SEQUENCE, VOID_SYMBOL } from './SacredSymbols.js';

export async function morphInit(newNumber, currentSkeletonNumber, isPushOperation = true) {
  console.log(`morphInit(${newNumber}, ${currentSkeletonNumber})`);
  
  const newNumberLength = newNumber.toString().length;
  const currentSkeletonLength = currentSkeletonNumber.toString().length;
  
  let setNumber, keyNumber;
  
  // Compare lengths to decide skeleton and key
  if (newNumberLength > currentSkeletonLength) {
    setNumber = newNumber; // Larger number for skeleton
    keyNumber = currentSkeletonNumber; // Smaller number for key
  } else {
    setNumber = currentSkeletonNumber; // Keep current skeleton
    keyNumber = newNumber; // New number for key
  }
  
  // Set skeleton
  const skeleton = new SkeletonInitializer();
  await skeleton.set(setNumber, isPushOperation);
  
  // Ensure numberLength is set
  if (!skeleton.state.numberLength) {
    console.warn(`Warning: skeleton.state.numberLength undefined, setting to ${setNumber.toString().length}`);
    skeleton.state.numberLength = setNumber.toString().length;
  }
  
  // Generate and shift key
  const keyMaker = new KeyMaker();
  const tempKey = keyMaker.makeKey(keyNumber);
  const shiftKey = new ShiftKey();
  const shiftedKey = shiftKey.shift(tempKey, skeleton.state.numberLength);
  
  // Log results
  const skeletonState = skeleton.getState();
  const skeletonDisplay = `<${skeletonState.units.slice(0, 4).map(u => u.currentSymbol).join('')}|${skeletonState.units.slice(4, 8).map(u => u.currentSymbol).join('')}|${skeletonState.units.slice(8, 12).map(u => u.currentSymbol).join('')}>`;
  console.log(`morphInit: ${newNumber} length ${newNumberLength}, ${currentSkeletonNumber} length ${currentSkeletonLength}: if current is < new number ${newNumber}, set skeleton for: ${setNumber}, genKEY for: ${keyNumber}, new skeleton: ${skeletonDisplay}, new key: ${JSON.stringify(shiftedKey)}`);
  
  return { skeleton, key: shiftedKey };
}