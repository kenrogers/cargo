// @ts-nocheck
// https://github.com/dubzzz/fast-check/issues/2781

import { Uint, Model, Real, CargoCommand }
  from './CargoCommandModel.ts'

import { assertEquals }
  from 'https://deno.land/std@0.90.0/testing/asserts.ts';

export class CargoGetShipmentCommand
  implements CargoCommand {

  readonly shipId: Uint;

  constructor(
      shipId: Uint
    ) {
    this.shipId = shipId;
  }

  check(model: Readonly<Model>): bool {
    const hasShipped = this.shipId.value < model.currentId;
    return hasShipped;
  }

  run(model: Model, real: Real): void {
    const record = model.shipments[this.shipId.value];
    const actual = real.chain
      .callReadOnlyFn(
        'cargo', 'get-shipment', [this.shipId.clarityValue()],
        record.sender)
      .result
      .expectOk()
      .expectTuple();

    assertEquals(actual, {
      location: record.region,
      receiver: record.giftee,
      shipper : record.sender,
      status  : record.status
    });

    console.log(this.printInfo(model));
  }

  toString() {
    // fast-check will call toString() in case of errors, e.g. property failed.
    // It will then make a minimal counterexample, a process called 'shrinking'
    // https://github.com/dubzzz/fast-check/issues/2864#issuecomment-1098002642
    return `get-shipment ${this.shipId.value}`;
  }

  printInfo(model: Readonly<Model>) {
    const ship = model.shipments[this.shipId.value];
    const info =
        `Ӿ tx-sender ${ship.sender.padStart(43, ' ')} `
      + `✓ ${'get-shipment'.padStart(19, ' ')} `
      + `id ${this.shipId.value.toString().padStart(3, ' ')} ${ship.region}`;
    return info;
  }
}
