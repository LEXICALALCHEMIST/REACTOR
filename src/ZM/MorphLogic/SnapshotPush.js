import { SYMBOL_SEQUENCE, VOID_SYMBOL } from '../core/SacredSymbols.js';

export const SnapshotPush = {
  async snapPush(skeleton, newNumber) {
    const u1 = skeleton.units[0]; // Unit 1

    // Check if U1 has collapsed (exceeded 9)
    if (u1.state.u1Collapse) {
      console.log(`U1 has collapsed (u1Collapse: ${u1.state.u1Collapse}), triggering snapshot push for new number: ${newNumber}`);

      // Snapshot the new number and reset the skeleton
      const digits = newNumber.toString().split('').map(Number);
      skeleton.state.numberLength = digits.length;
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
          console.log(`Resetting unit${i + 1} to ${digit}`);
          unit.state.currentSymbol = SYMBOL_SEQUENCE[digit];
          console.log(`Reset unit${i + 1} to ${digit} (symbol: ${SYMBOL_SEQUENCE[digit]})`);
        }
      });

      const state = skeleton.getState();
      skeleton.state.snapshot = JSON.parse(JSON.stringify(state)); // Deep copy snapshot
      const skeletonDisplay = `<${state.units.slice(0, 4).map(u => u.currentSymbol).join('')}|${state.units.slice(4, 8).map(u => u.currentSymbol).join('')}|${state.units.slice(8, 12).map(u => u.currentSymbol).join('')}>`;
      console.log(`Snapshot: ${JSON.stringify({
        units: state.units.map(u => u.currentSymbol),
        numberLength: state.numberLength,
        activeUnitTarget: state.activeUnitTarget
      })}`);
      console.log(`Reset Skeleton: ${skeletonDisplay}`);
    } else {
      console.log(`U1 has not collapsed (u1Collapse: ${u1.state.u1Collapse}), skipping snapshot push`);
    }

    return skeleton;
  }
};