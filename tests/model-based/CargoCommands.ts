// @ts-nocheck
// https://github.com/dubzzz/fast-check/issues/2781

import { Account }
  from 'https://deno.land/x/clarinet@v0.31.0/index.ts';

import fc
  from 'https://cdn.skypack.dev/fast-check@3.0.0';

import { Principal, Uint, Ascii }
  from './CargoCommandModel.ts'

import { CargoCreateShipmentCommand }
  from './CargoCreateShipmentCommand.ts'

import { CargoGetShipmentCommand }
  from './CargoGetShipmentCommand.ts'

import { CargoGetUnknownShipmentCommand }
  from './CargoGetUnknownShipmentCommand.ts'

import { CargoUpdateShipmentCommand }
  from './CargoUpdateShipmentCommand.ts'

import { CargoUpdateOthersShipmentCommand }
  from './CargoUpdateOthersShipmentCommand.ts'

export function CargoCommands(accounts: Map<string, Account>) {
  const allCommands = [
    fc.record({
        region: fc.constantFrom('Southwest', 'Southeast', 'Midwest')
      , sender: fc.constantFrom(...accounts.values()).map(account => account.address)
      , giftee: fc.constantFrom(...accounts.values()).map(account => account.address)
    }).map(r =>
      new CargoCreateShipmentCommand(
          new Ascii(
            r.region)
        , new Principal(
            r.sender)
        , new Principal(
            r.giftee)
        )
      ),
    fc.record({
        shipId: fc.integer({min: 1, max: 100})
    }).map(r =>
      new CargoGetShipmentCommand(
          new Uint(
            r.shipId)
        )
      ),
    fc.record({
        shipId: fc.integer({min: 100, max: 999})
      , sender: fc.constantFrom(...accounts.values()).map(account => account.address)
    }).map(r =>
      new CargoGetUnknownShipmentCommand(
          new Uint(
            r.shipId)
        , new Principal(
            r.sender)
        )
      ),
    fc.record({
        shipId: fc.integer({min: 1, max: 100}),
        region: fc.constantFrom('Northeast', 'West')
      , sender: fc.constantFrom(...accounts.values()).map(account => account.address)
    }).map(r =>
      new CargoUpdateShipmentCommand(
          new Uint(
            r.shipId)
        , new Ascii(
            r.region)
        , new Principal(
            r.sender)
        )
      ),
    fc.record({
        shipId: fc.integer({min: 1, max: 100}),
        region: fc.constantFrom('Northeast', 'West')
      , sender: fc.constantFrom(...accounts.values()).map(account => account.address)
    }).map(r =>
      new CargoUpdateOthersShipmentCommand(
          new Uint(
            r.shipId)
        , new Ascii(
            r.region)
        , new Principal(
            r.sender)
        )
      ),
  ];
  return fc.commands(allCommands, { size: '+1' });
}
