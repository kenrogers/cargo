
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "A user should be able to successfully create a new shipment",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const shipper = accounts.get('wallet_1')!.address;
        const receiver = accounts.get('wallet_2')!.address
        let block = chain.mineBlock([
            // Call the create-new-shipment function, passing in the starting location as the only parameter
            Tx.contractCall(
                'cargo',
                'create-new-shipment',
                [types.ascii('Denver'), types.principal(receiver)],
                shipper
            )
        ]);
        const result = block.receipts[0].result;
        // Check for the success message
        result.expectOk().expectAscii('Shipment created successfully')
    },
});

Clarinet.test({
    name: "A user should be able to update their shipment",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const shipper = accounts.get('wallet_1')!.address;
        const receiver = accounts.get('wallet_2')!.address
        let block = chain.mineBlock([
            // Call the create-new-shipment function, passing in the starting location as the only parameter
            Tx.contractCall(
                'cargo',
                'create-new-shipment',
                [types.ascii('Denver'), types.principal(receiver)],
                shipper
            )

        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block = chain.mineBlock([
            // Call the update-shipment function, passing in the shipment id and current location
            Tx.contractCall(
                'cargo',
                'update-shipment',
                [types.uint(1), types.ascii('Phoenix')],
                shipper
            )

        ]);
        const result = block.receipts[0].result;
        // Check for the success message
        result.expectOk().expectAscii('Shipment updated successfully')
    },
});

Clarinet.test({
    name: "A user should not be able to update a shipment that does not exist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const shipper = accounts.get('wallet_1')!.address;
        const receiver = accounts.get('wallet_2')!.address
        let block = chain.mineBlock([
            // Call the create-new-shipment function, passing in the starting location as the only parameter
            Tx.contractCall(
                'cargo',
                'create-new-shipment',
                [types.ascii('Denver'), types.principal(receiver)],
                shipper
            )

        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block = chain.mineBlock([
            // Call the update-shipment function, passing in the shipment id and current location
            Tx.contractCall(
                'cargo',
                'update-shipment',
                [types.uint(5), types.ascii('Phoenix')],
                shipper
            )

        ]);
        const result = block.receipts[0].result;
        // Check for the correct message defined in our constants
        result.expectErr().expectUint(100)
    },
});

Clarinet.test({
    name: "A user should not be able to update another shipper's shipment status",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const shipper = accounts.get('wallet_1')!.address;
        const receiver = accounts.get('wallet_2')!.address
        const stranger = accounts.get('wallet_3')!.address
        let block = chain.mineBlock([
            // Call the create-new-shipment function, passing in the starting location as the only parameter
            Tx.contractCall(
                'cargo',
                'create-new-shipment',
                [types.ascii('Denver'), types.principal(receiver)],
                shipper
            )

        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block = chain.mineBlock([
            // Call the update-shipment function, passing in the shipment id and current location
            // This should fail since it is being called by a stranger and not the shipper
            Tx.contractCall(
                'cargo',
                'update-shipment',
                [types.uint(1), types.ascii('Phoenix')],
                stranger
            )

        ]);
        const result = block.receipts[0].result;
        // Check for the correct error message defined in our constants
        result.expectErr().expectUint(101)
    },
});

Clarinet.test({
    name: "A user should be able to read the current status of a shipment",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const shipper = accounts.get('wallet_1')!.address;
        const receiver = accounts.get('wallet_2')!.address
        let block = chain.mineBlock([
            // Call the create-new-shipment function, passing in the starting location as the only parameter
            Tx.contractCall(
                'cargo',
                'create-new-shipment',
                [types.ascii('Denver'), types.principal(receiver)],
                shipper
            )

        ]);
        // Get the shipment information with an ID of 1
        const newShipment = chain.callReadOnlyFn(
            'cargo',
            'get-shipment',
            [types.uint(3)],
            receiver
        )
        // Now we want to check and see if this returns the shipment tuple we are expecting
        const expectedShipment = newShipment.result
        expectedShipment.expectOk()
        assertEquals(expectedShipment, `(ok {location: "Denver", receiver: ${receiver}, shipper: ${shipper}, status: "In Transit"})`)
    },
});
