// @ts-nocheck
// https://github.com/dubzzz/fast-check/issues/2781

import { Tx }
  from 'https://deno.land/x/clarinet@v0.31.0/index.ts';

import { Principal, Ascii, Model, Real, CargoCommand }
  from './CargoCommandModel.ts'

export class CargoUpdateShipmentCommand
  implements CargoCommand {

  readonly shipId: Uint;
  readonly region: Ascii;
  readonly sender: Principal;

  constructor(
      shipId: Uint
    , region: Ascii
    , sender: Principal
    ) {
    this.shipId = shipId;
    this.region = region;
    this.sender = sender;
  }

  check(model: Readonly<Model>): bool {
    const hasShipped = this.shipId.value < model.currentId;
    if (hasShipped) {
      const shipment = model.shipments[this.shipId.value];
      return shipment.sender === this.sender.value;
    }
    return false;
  }

  run(model: Model, real: Real): void {
    const block = real.chain.mineBlock([
      Tx.contractCall(
          'cargo'
        , 'update-shipment'
        , [ this.shipId.clarityValue()
          , this.region.clarityValue() ]
        , this.sender.value
      )
    ]);
    block
      .receipts[0]
      .result
      .expectOk()
      .expectAscii(
        'Shipment updated successfully');

    model.shipments[this.shipId.value].region = this.region.clarityValue();

    console.log(this.printInfo(model));
  }

  toString() {
    // fast-check will call toString() in case of errors, e.g. property failed.
    // It will then make a minimal counterexample, a process called 'shrinking'
    // https://github.com/dubzzz/fast-check/issues/2864#issuecomment-1098002642
    return `tx-sender ${this.sender.value} update-shipment`;
  }

  printInfo(model: Readonly<Model>) {
    const info =
        `Ӿ tx-sender ${this.sender.value.padStart(43, ' ')} `
      + `✓     update-shipment id ${model.currentId.toString().padStart(3, ' ')} `
      + `${this.region.clarityValue()}`;
    return info;
  }
}
