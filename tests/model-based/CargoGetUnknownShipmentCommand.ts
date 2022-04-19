// @ts-nocheck
// https://github.com/dubzzz/fast-check/issues/2781

import { Principal, Uint, Model, Real, CargoCommand }
  from './CargoCommandModel.ts'

export class CargoGetUnknownShipmentCommand
  implements CargoCommand {

  readonly shipId: Uint;
  readonly sender: Principal;

  constructor(
      shipId: Uint
    , sender: Principal
    ) {
    this.shipId = shipId;
    this.sender = sender;
  }

  check(model: Readonly<Model>): bool {
    const isUnknown = this.shipId.value > model.currentId;
    return isUnknown;
  }

  run(_: Model, real: Real): void {
    real.chain
      .callReadOnlyFn(
        'cargo', 'get-shipment', [this.shipId.clarityValue()],
        this.sender.value)
      .result
      .expectErr()
      .expectUint(100);

    console.log(this.printInfo());
  }

  toString() {
    // fast-check will call toString() in case of errors, e.g. property failed.
    // It will then make a minimal counterexample, a process called 'shrinking'
    // https://github.com/dubzzz/fast-check/issues/2864#issuecomment-1098002642
    return `get-shipment ${this.shipId.value} (which is unknown)`;
  }

  printInfo(_: Readonly<Model>) {
    const info =
        `Ӿ tx-sender ${this.sender.value.padStart(43, ' ')} `
      + `░ ${'get-shipment'.padStart(19, ' ')} `
      + `id ${this.shipId.value.toString().padStart(3, ' ')} `
      + `which is unknown, returns err u100`;
    return info;
  }
}
