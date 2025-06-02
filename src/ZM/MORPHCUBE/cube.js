import SkeletonInitializer from '../MorphLogic/SkeletonInitializer.js';
import PushModule from '../MorphLogic/PushModule.js';
import { Signal } from '../ZTRL/signal.js';
import { SYMBOL_SEQUENCE } from '../core/SacredSymbols.js';

class Cube {
  constructor(user) {
    this.currentSKEL = user.currentSKEL;
    this.skeleton = new SkeletonInitializer(this.currentSKEL);
    this.pushModule = new PushModule(this.skeleton);
  }

  receiveRequest(value, morphPin) {
    return new Promise((resolve, reject) => {
      try {
        const signal = new Signal();
        signal.receiveRequest(value, morphPin).then((morphOp) => {
          this.morph(morphOp).then((newSkeletonJson) => {
            resolve(newSkeletonJson);
          }).catch(reject);
        }).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  morph(morphOp) {
    return new Promise((resolve, reject) => {
      try {
        console.log('Cube: Processing morphOp - PUSH', morphOp.VALUE, 'to recipient\'s skeleton');
        this.skeleton = new SkeletonInitializer(this.currentSKEL);
        console.log('Cube morph: Skeleton initialized with value:', this.currentSKEL);
        this.pushModule = new PushModule(this.skeleton);
        this.pushModule.applyPush(morphOp.VALUE);
        const newSkeletonJson = this.skeleton.toJSON();
        console.log('Cube morph: Updated skeleton JSON after pushing', morphOp.VALUE, ':', newSkeletonJson);
        this.currentSKEL = parseInt(
          newSkeletonJson.units
            .slice(0, newSkeletonJson.numberLength)
            .map(u => SYMBOL_SEQUENCE.indexOf(u.currentSymbol))
            .join('') || '0',
          10
        );
        console.log('Cube: Recipient\'s skeleton updated to:', this.currentSKEL);
        resolve(newSkeletonJson);
      } catch (error) {
        console.error('Cube: Failed to process morphOp:', error);
        reject(error);
      }
    });
  }
}

export { Cube };