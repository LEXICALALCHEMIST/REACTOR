import { SYMBOL_SEQUENCE, VOID_SYMBOL } from '../core/SacredSymbols.js';

export const Shutter = {
  async snapMidMorph(skeleton, computedNumber) {
    console.log(`Shutter: Creating mid-morph snapshot for computed number: ${computedNumber}`);

    // Reset the skeleton to the computed number
    const digits = computedNumber.toString().split('').map(Number);
    skeleton.state.numberLength = computedNumber === 0 ? 1 : digits.length;
    skeleton.state.activeUnitTarget = `u${skeleton.state.numberLength}`;

    skeleton.units.forEach((unit, i) => {
      unit.state.currentSymbol = VOID_SYMBOL;
      unit.state.carry = 0;
      unit.state.hasCollapsed = false;
      unit.state.pushes = [];
      unit.state.pushesLength = 0;
      unit.state.u1Collapse = false;

      const digit = digits[i];
      if (digit !== undefined) {
        console.log(`Shutter: Resetting unit${i + 1} to ${digit}`);
        unit.state.currentSymbol = SYMBOL_SEQUENCE[digit];
        console.log(`Shutter: Reset unit${i + 1} to ${digit} (symbol: ${SYMBOL_SEQUENCE[digit]})`);
      }
    });

    // Force update of skeleton.state.units to reflect the changes
    skeleton.state.units = skeleton.units.map(unit => ({
      currentSymbol: unit.state.currentSymbol,
      carry: unit.state.carry,
      hasCollapsed: unit.state.hasCollapsed,
      pushes: unit.state.pushes,
      pushesLength: unit.state.pushesLength,
      u1Collapse: unit.state.u1Collapse
    }));
    skeleton.state.snapshot = JSON.parse(JSON.stringify(skeleton.state)); // Deep copy snapshot

    const skeletonDisplay = `<${skeleton.state.units.slice(0, 4).map(u => u.currentSymbol).join('')}|${skeleton.state.units.slice(4, 8).map(u => u.currentSymbol).join('')}|${skeleton.state.units.slice(8, 12).map(u => u.currentSymbol).join('')}>`;
    console.log(`Shutter: Snapshot created: ${JSON.stringify({
      units: skeleton.state.units.map(u => u.currentSymbol),
      numberLength: skeleton.state.numberLength,
      activeUnitTarget: skeleton.state.activeUnitTarget
    })}`);
    console.log(`Shutter: Skeleton: ${skeletonDisplay}`);

    return skeleton;
  }
};