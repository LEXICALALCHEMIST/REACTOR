import { SYMBOL_SEQUENCE, VOID_SYMBOL } from '../core/SacredSymbols.js';

export default class KeyMaker {
  makeKey(number) {
    console.log(`Generating key for ${number}`);
    
    const digits = number.toString().split('').map(Number);
    const length = digits.length;
    const push = Array(12).fill(null).map((_, i) => {
      const digit = digits[i];
      return digit !== undefined ? `U${i + 1}:${digit}` : `U${i + 1}:null`;
    });
    
    const view = push.map(entry => {
      if (entry.includes('null')) return VOID_SYMBOL;
      const [, value] = entry.split(':');
      return SYMBOL_SEQUENCE[parseInt(value)] || VOID_SYMBOL;
    });
    
    const key = {
      number,
      length,
      push,
      view
    };
    
    console.log(`KEY:${number} LENGTH:${length} PUSH[${push.join(' ')}] VIEW:${view.join('|')}`);
    return key;
  }
}