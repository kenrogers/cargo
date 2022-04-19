// @ts-nocheck
// https://github.com/dubzzz/fast-check/issues/2781

import { Tx }
  from 'https://deno.land/x/clarinet@v0.31.0/index.ts';

import { Principal, Ascii, Model, Real, CargoCommand }
  from './CargoCommandModel.ts'

export class CargoCreateShipmentCommand
  implements CargoCommand {

  readonly region: Ascii;
  readonly sender: Principal;
  readonly giftee: Principal;

  constructor(
      region: Ascii
    , sender: Principal
    , giftee: Principal
    ) {
    this.region = region;
    this.sender = sender;
    this.giftee = giftee;
  }

  check(_: Readonly<Model>): bool {
    // Can always create shipment.
    return true;
  }

  run(model: Model, real: Real): void {
    const block = real.chain.mineBlock([
      Tx.contractCall(
          'cargo'
        , 'create-new-shipment'
        , [ this.region.clarityValue()
          , this.giftee.clarityValue() ]
        , this.sender.value
      )
    ]);
    block
      .receipts[0]
      .result
      .expectOk()
      .expectAscii(
        'Shipment created successfully');

    model.currentId = model.currentId + 1;
    model.shipments[model.currentId] = {
        region: this.region
                  .clarityValue()
      , status: new Ascii('In Transit')
                  .clarityValue()
      , sender: this.sender
                  .value
      , giftee: this.giftee
                  .value
    };

    console.log(this.printInfo(model));
  }

  toString() {
    // fast-check will call toString() in case of errors, e.g. property failed.
    // It will then make a minimal counterexample, a process called 'shrinking'
    // https://github.com/dubzzz/fast-check/issues/2864#issuecomment-1098002642
    return `tx-sender ${this.sender.value} create-new-shipment`;
  }

  printInfo(model: Readonly<Model>) {
    const info =
        `Ӿ tx-sender ${this.sender.value.padStart(43, ' ')} `
      + `✓ create-new-shipment id ${model.currentId.toString().padStart(3, ' ')} `
      + `${this.region.clarityValue()}`;
    return info;
  }
}
