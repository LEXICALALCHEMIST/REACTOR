export default class CarryBus {
  constructor() {
    this.carryValue = 0;
    this.carryTarget = null;
  }

  registerCarry(value, target) {
    this.carryValue = value;
    this.carryTarget = target;
    console.log(`CarryBus: Registered CARRY: ${value} to ${target}`);
  }

  flushCarry() {
    const carry = { carryValue: this.carryValue, carryTarget: this.carryTarget };
    console.log(`CarryBus: Flushed CARRY: ${this.carryValue} to ${this.carryTarget}`);
    this.carryValue = 0;
    this.carryTarget = null;
    return carry;
  }
}