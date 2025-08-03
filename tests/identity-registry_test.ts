import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can create a new profile successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("john_doe"),
                types.ascii("Software developer passionate about Web3"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.some(types.ascii("https://johndoe.dev"))
            ], user1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Verify profile was created
        let getProfile = chain.callReadOnlyFn('identity-registry', 'get-profile', [
            types.principal(user1.address)
        ], deployer.address);
        
        const profile = getProfile.result.expectSome().expectTuple();
        assertEquals(profile['name'], "john_doe");
        assertEquals(profile['bio'], "Software developer passionate about Web3");
        assertEquals(profile['verified'], false);
    },
});

Clarinet.test({
    name: "Cannot create profile with duplicate name",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;
        
        // Create first profile
        let block1 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("john_doe"),
                types.ascii("First user"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectOk(), true);
        
        // Try to create second profile with same name
        let block2 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("john_doe"),
                types.ascii("Second user"),
                types.ascii("QmYoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user2.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectErr(), types.uint(101)); // ERR-PROFILE-EXISTS
    },
});

Clarinet.test({
    name: "Cannot create multiple profiles for same user",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        // Create first profile
        let block1 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("john_doe"),
                types.ascii("First profile"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectOk(), true);
        
        // Try to create second profile for same user
        let block2 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("john_doe_2"),
                types.ascii("Second profile"),
                types.ascii("QmYoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectErr(), types.uint(101)); // ERR-PROFILE-EXISTS
    },
});

Clarinet.test({
    name: "Can update profile successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        // Create profile
        let block1 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("john_doe"),
                types.ascii("Original bio"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectOk(), true);
        
        // Update profile
        let block2 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'update-profile', [
                types.ascii("john_doe_updated"),
                types.ascii("Updated bio with more information"),
                types.ascii("QmYoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.some(types.ascii("https://updated.johndoe.dev"))
            ], user1.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectOk(), true);
        
        // Verify update
        let getProfile = chain.callReadOnlyFn('identity-registry', 'get-profile', [
            types.principal(user1.address)
        ], user1.address);
        
        const profile = getProfile.result.expectSome().expectTuple();
        assertEquals(profile['name'], "john_doe_updated");
        assertEquals(profile['bio'], "Updated bio with more information");
    },
});

Clarinet.test({
    name: "Can search profile by name",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        // Create profile
        let block = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("searchable_user"),
                types.ascii("This user can be found by name"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Search by name
        let searchResult = chain.callReadOnlyFn('identity-registry', 'get-profile-by-name', [
            types.ascii("searchable_user")
        ], deployer.address);
        
        const profile = searchResult.result.expectSome().expectTuple();
        assertEquals(profile['name'], "searchable_user");
        assertEquals(profile['bio'], "This user can be found by name");
    },
});

Clarinet.test({
    name: "Admin can verify and unverify profiles",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        // Create profile
        let block1 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("verify_me"),
                types.ascii("Please verify my profile"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectOk(), true);
        
        // Check initial verification status
        let isVerified1 = chain.callReadOnlyFn('identity-registry', 'is-profile-verified', [
            types.principal(user1.address)
        ], deployer.address);
        assertEquals(isVerified1.result, false);
        
        // Admin verifies profile
        let block2 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'verify-identity', [
                types.principal(user1.address)
            ], deployer.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectOk(), true);
        
        // Check verification status after verification
        let isVerified2 = chain.callReadOnlyFn('identity-registry', 'is-profile-verified', [
            types.principal(user1.address)
        ], deployer.address);
        assertEquals(isVerified2.result, true);
        
        // Admin unverifies profile
        let block3 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'unverify-identity', [
                types.principal(user1.address)
            ], deployer.address)
        ]);
        
        assertEquals(block3.receipts[0].result.expectOk(), true);
        
        // Check verification status after unverification
        let isVerified3 = chain.callReadOnlyFn('identity-registry', 'is-profile-verified', [
            types.principal(user1.address)
        ], deployer.address);
        assertEquals(isVerified3.result, false);
    },
});

Clarinet.test({
    name: "Non-admin cannot verify profiles",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;
        
        // Create profile
        let block1 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("cannot_verify"),
                types.ascii("Non-admin cannot verify this"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectOk(), true);
        
        // Non-admin tries to verify
        let block2 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'verify-identity', [
                types.principal(user1.address)
            ], user2.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectErr(), types.uint(100)); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Can delete own profile",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        // Create profile
        let block1 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("delete_me"),
                types.ascii("This profile will be deleted"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectOk(), true);
        
        // Verify profile exists
        let exists1 = chain.callReadOnlyFn('identity-registry', 'profile-exists', [
            types.principal(user1.address)
        ], deployer.address);
        assertEquals(exists1.result, true);
        
        // Delete profile
        let block2 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'delete-profile', [], user1.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectOk(), true);
        
        // Verify profile no longer exists
        let exists2 = chain.callReadOnlyFn('identity-registry', 'profile-exists', [
            types.principal(user1.address)
        ], deployer.address);
        assertEquals(exists2.result, false);
        
        // Verify profile cannot be retrieved
        let getProfile = chain.callReadOnlyFn('identity-registry', 'get-profile', [
            types.principal(user1.address)
        ], deployer.address);
        getProfile.result.expectNone();
    },
});

Clarinet.test({
    name: "Profile counter works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;
        
        // Check initial count
        let count1 = chain.callReadOnlyFn('identity-registry', 'get-profile-count', [], deployer.address);
        assertEquals(count1.result, types.uint(0));
        
        // Create first profile
        let block1 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("user_one"),
                types.ascii("First user"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectOk(), true);
        
        // Check count after first profile
        let count2 = chain.callReadOnlyFn('identity-registry', 'get-profile-count', [], deployer.address);
        assertEquals(count2.result, types.uint(1));
        
        // Create second profile
        let block2 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("user_two"),
                types.ascii("Second user"),
                types.ascii("QmYoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user2.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectOk(), true);
        
        // Check count after second profile
        let count3 = chain.callReadOnlyFn('identity-registry', 'get-profile-count', [], deployer.address);
        assertEquals(count3.result, types.uint(2));
        
        // Delete first profile
        let block3 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'delete-profile', [], user1.address)
        ]);
        
        assertEquals(block3.receipts[0].result.expectOk(), true);
        
        // Check count after deletion
        let count4 = chain.callReadOnlyFn('identity-registry', 'get-profile-count', [], deployer.address);
        assertEquals(count4.result, types.uint(1));
    },
});

Clarinet.test({
    name: "Input validation works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        // Test empty name
        let block1 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii(""),
                types.ascii("Valid bio"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectErr(), types.uint(103)); // ERR-INVALID-NAME
        
        // Test empty avatar
        let block2 = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("valid_name"),
                types.ascii("Valid bio"),
                types.ascii(""),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectErr(), types.uint(105)); // ERR-INVALID-AVATAR
    },
});

Clarinet.test({
    name: "Utility functions work correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        // Test name availability before creating profile
        let available1 = chain.callReadOnlyFn('identity-registry', 'is-name-available', [
            types.ascii("unique_name")
        ], deployer.address);
        assertEquals(available1.result, true);
        
        // Create profile
        let block = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', [
                types.ascii("unique_name"),
                types.ascii("Testing utility functions"),
                types.ascii("QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"),
                types.none()
            ], user1.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Test name availability after creating profile
        let available2 = chain.callReadOnlyFn('identity-registry', 'is-name-available', [
            types.ascii("unique_name")
        ], deployer.address);
        assertEquals(available2.result, false);
        
        // Test get profile owner
        let owner = chain.callReadOnlyFn('identity-registry', 'get-profile-owner', [
            types.ascii("unique_name")
        ], deployer.address);
        assertEquals(owner.result.expectSome(), types.principal(user1.address));
        
        // Test get profile info
        let profileInfo = chain.callReadOnlyFn('identity-registry', 'get-profile-info', [
            types.principal(user1.address)
        ], deployer.address);
        profileInfo.result.expectOk().expectSome();
    },
});