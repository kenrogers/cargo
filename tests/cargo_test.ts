import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.31.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "A user should be able to successfully create a new shipment",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const shipper = accounts.get("wallet_1")!.address;
    const receiver = accounts.get("wallet_2")!.address;
    let block = chain.mineBlock([
      // Call the create-new-shipment function, passing in the starting location as the only parameter
      Tx.contractCall(
        "cargo",
        "create-new-shipment",
        [types.ascii("Denver"), types.principal(receiver)],
        shipper
      ),
    ]);
    const result = block.receipts[0].result;
    // Check for the success message
    result.expectOk().expectAscii("Shipment created successfully");
    // Check that a shipment was created
    const newShipment = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(1)],
      receiver
    );
    // Now we want to check and see if this returns the shipment tuple we are expecting
    const expectedShipment = newShipment.result;
    expectedShipment.expectOk();
    assertEquals(
      expectedShipment,
      `(ok {location: "Denver", receiver: ${receiver}, shipper: ${shipper}, status: "In Transit"})`
    );
  },
});

Clarinet.test({
    name: "Multiple users should be able to successfully create multiple shipments",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const firstShipper = accounts.get("wallet_1")!.address;
      const firstReceiver = accounts.get("wallet_2")!.address;
      const firstLocation = "Denver";
      let block = chain.mineBlock([
        // Call the create-new-shipment function, passing in the starting location as the only parameter
        Tx.contractCall(
          "cargo",
          "create-new-shipment",
          [types.ascii(firstLocation), types.principal(firstReceiver)],
          firstShipper
        ),
      ]);
      const firstResult = block.receipts[0].result;
      // Check for the success message
      firstResult.expectOk().expectAscii("Shipment created successfully");
      // Check that a shipment was created
      const firstShipment = chain.callReadOnlyFn(
        "cargo",
        "get-shipment",
        [types.uint(1)],
        firstReceiver
      );
      // Now we want to check and see if this returns the shipment tuple we are expecting
      const firstExpectedShipment = firstShipment.result;
      firstExpectedShipment.expectOk();
      assertEquals(
        firstExpectedShipment,
        `(ok {location: "${firstLocation}", receiver: ${firstReceiver}, shipper: ${firstShipper}, status: "In Transit"})`
      );

      // Now let's create another shipment and perform the same checks
      const secondShipper = accounts.get("wallet_3")!.address;
      const secondReceiver = accounts.get("wallet_4")!.address;
      const secondLocation = "New York";
      block = chain.mineBlock([
        // Call the create-new-shipment function, passing in the starting location as the only parameter
        Tx.contractCall(
          "cargo",
          "create-new-shipment",
          [types.ascii(secondLocation), types.principal(secondReceiver)],
          secondShipper
        ),
      ]);
      const secondResult = block.receipts[0].result;
      // Check for the success message
      secondResult.expectOk().expectAscii("Shipment created successfully");
      // Check that a shipment was created
      const secondShipment = chain.callReadOnlyFn(
        "cargo",
        "get-shipment",
        [types.uint(2)],
        secondReceiver
      );
      // Now we want to check and see if this returns the shipment tuple we are expecting
      const secondExpectedShipment = secondShipment.result;
      secondExpectedShipment.expectOk();
      assertEquals(
        secondExpectedShipment,
        `(ok {location: "${secondLocation}", receiver: ${secondReceiver}, shipper: ${secondShipper}, status: "In Transit"})`
      );
    },
  });

Clarinet.test({
  name: "A user should be able to update their shipment",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const shipper = accounts.get("wallet_1")!.address;
    const receiver = accounts.get("wallet_2")!.address;
    let block = chain.mineBlock([
      // Call the create-new-shipment function, passing in the starting location as the only parameter
      Tx.contractCall(
        "cargo",
        "create-new-shipment",
        [types.ascii("Denver"), types.principal(receiver)],
        shipper
      ),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block = chain.mineBlock([
      // Call the update-shipment function, passing in the shipment id and current location
      Tx.contractCall(
        "cargo",
        "update-shipment",
        [types.uint(1), types.ascii("Phoenix")],
        shipper
      ),
    ]);
    const result = block.receipts[0].result;
    // Check for the success message
    result.expectOk().expectAscii("Shipment updated successfully");
    // Check that a shipment was updated
    const newShipment = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(1)],
      receiver
    );
    // Now we want to check and see if this returns the shipment tuple we are expecting
    const expectedShipment = newShipment.result;
    expectedShipment.expectOk();
    assertEquals(
      expectedShipment,
      `(ok {location: "Phoenix", receiver: ${receiver}, shipper: ${shipper}, status: "In Transit"})`
    );
  },
});

Clarinet.test({
  name: "A user should not be able to update a shipment that does not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const shipper = accounts.get("wallet_1")!.address;
    const receiver = accounts.get("wallet_2")!.address;
    let block = chain.mineBlock([
      // Call the create-new-shipment function, passing in the starting location as the only parameter
      Tx.contractCall(
        "cargo",
        "create-new-shipment",
        [types.ascii("Denver"), types.principal(receiver)],
        shipper
      ),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block = chain.mineBlock([
      // Call the update-shipment function, passing in the shipment id and current location
      Tx.contractCall(
        "cargo",
        "update-shipment",
        [types.uint(5), types.ascii("Phoenix")],
        shipper
      ),
    ]);
    const result = block.receipts[0].result;
    // Check for the correct message defined in our constants
    result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "A user should not be able to update another shipper's shipment status",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const shipper = accounts.get("wallet_1")!.address;
    const receiver = accounts.get("wallet_2")!.address;
    const stranger = accounts.get("wallet_3")!.address;
    let block = chain.mineBlock([
      // Call the create-new-shipment function, passing in the starting location as the only parameter
      Tx.contractCall(
        "cargo",
        "create-new-shipment",
        [types.ascii("Denver"), types.principal(receiver)],
        shipper
      ),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block = chain.mineBlock([
      // Call the update-shipment function, passing in the shipment id and current location
      // This should fail since it is being called by a stranger and not the shipper
      Tx.contractCall(
        "cargo",
        "update-shipment",
        [types.uint(1), types.ascii("Phoenix")],
        stranger
      ),
    ]);
    const result = block.receipts[0].result;
    // Check for the correct error message defined in our constants
    result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "A user should be able to read the current status of a shipment",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const shipper = accounts.get("wallet_1")!.address;
    const receiver = accounts.get("wallet_2")!.address;
    let block = chain.mineBlock([
      // Call the create-new-shipment function, passing in the starting location as the only parameter
      Tx.contractCall(
        "cargo",
        "create-new-shipment",
        [types.ascii("Denver"), types.principal(receiver)],
        shipper
      ),
    ]);
    // Get the shipment information with an ID of 1
    const newShipment = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(1)],
      receiver
    );
    // Now we want to check and see if this returns the shipment tuple we are expecting
    const expectedShipment = newShipment.result;
    expectedShipment.expectOk();
    assertEquals(
      expectedShipment,
      `(ok {location: "Denver", receiver: ${receiver}, shipper: ${shipper}, status: "In Transit"})`
    );
  },
});

import fc
  from 'https://cdn.skypack.dev/fast-check@3.0.0';

import { CargoCommands }
  from './model-based/CargoCommands.ts'

Clarinet.test({
  name: 'Cargo V1 generated tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const initialChain = { chain: chain };
    const initialModel = {
      shipments: new Map<number, Record<string, string>>(),
      currentId: 0
    };
    fc.assert(fc.property(
      CargoCommands(accounts), (cmds: []) => {
        const initialState = () =>
          ({ model: initialModel, real: initialChain });
        fc.modelRun(initialState, cmds);
    }), { numRuns: 10, verbose: true });
  }
});
