import SkeletonInitializer from '../MorphLogic/SkeletonInitializer.js';
import PullModule from '../MorphLogic/PullModule.js';
import { SYMBOL_SEQUENCE } from '../core/SacredSymbols.js';

export async function update(currentSKEL, value) {
  // Validate the send amount against the current skeleton balance
  if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
    throw new Error('ZTRL update: Value must be a non-negative integer');
  }

  if (value > currentSKEL) {
    throw new Error('ZTRL update: not enough funds');
  }

  // Initialize the skeleton with the currentSKEL value
  const skeleton = new SkeletonInitializer();
  await skeleton.set(currentSKEL, false);
  console.log(`ZTRL update: Skeleton initialized with value: ${currentSKEL}`);

  // Perform the PULL operation using PullModule
  const pullModule = new PullModule(skeleton);
  const updatedState = await pullModule.pull(value);

  // Convert the updated state to a JSON string
  const newSkeletonJson = JSON.stringify(updatedState);
  console.log(`ZTRL update: Updated skeleton JSON after pulling ${value}: ${newSkeletonJson}`);

  return newSkeletonJson;
}