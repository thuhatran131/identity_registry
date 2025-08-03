# 🚀 Getting Started with Identity Registry

## Quick Setup Guide

### 1. Prerequisites
```bash
# Install Clarinet (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install clarinet-cli

# Verify installation
clarinet --version
```

### 2. Project Setup
```bash
# Navigate to project directory
cd project5_identity_registry

# Check contract syntax
clarinet check

# Run console for testing
clarinet console
```

### 3. Testing the Contract

#### Manual Testing in Console
```clarity
;; Create a profile
(contract-call? .identity-registry create-profile 
  "test_user" 
  "This is a test profile" 
  "QmTestHash123" 
  (some "https://test.com"))

;; Get the profile
(contract-call? .identity-registry get-profile tx-sender)

;; Search by name
(contract-call? .identity-registry get-profile-by-name "test_user")

;; Check if profile exists
(contract-call? .identity-registry profile-exists tx-sender)

;; Get profile count
(contract-call? .identity-registry get-profile-count)
```

### 4. Contract Functions Overview

#### Core Functions
- **create-profile**: Create new identity profile
- **update-profile**: Update existing profile
- **delete-profile**: Remove your profile
- **get-profile**: Retrieve profile by address
- **get-profile-by-name**: Search profile by name

#### Admin Functions
- **verify-identity**: Mark profile as verified (admin only)
- **unverify-identity**: Remove verification (admin only)
- **set-admin**: Change contract admin

#### Utility Functions
- **profile-exists**: Check if profile exists
- **is-profile-verified**: Check verification status
- **get-profile-count**: Get total profiles
- **is-name-available**: Check name availability

### 5. Error Codes
- `u100`: ERR-NOT-AUTHORIZED
- `u101`: ERR-PROFILE-EXISTS
- `u102`: ERR-PROFILE-NOT-FOUND
- `u103`: ERR-INVALID-NAME
- `u104`: ERR-INVALID-BIO
- `u105`: ERR-INVALID-AVATAR
- `u106`: ERR-INVALID-WEBSITE
- `u107`: ERR-NOT-OWNER

### 6. Example Usage Scenarios

#### Scenario 1: Basic Profile Management
```clarity
;; 1. Create profile
(contract-call? .identity-registry create-profile 
  "alice_dev" 
  "Full-stack developer" 
  "QmAliceAvatar" 
  (some "https://alice.dev"))

;; 2. Update profile
(contract-call? .identity-registry update-profile 
  "alice_developer" 
  "Senior full-stack developer with 5 years experience" 
  "QmAliceNewAvatar" 
  (some "https://alicedev.com"))

;; 3. Check verification status
(contract-call? .identity-registry is-profile-verified tx-sender)
```

#### Scenario 2: Profile Discovery
```clarity
;; Search for profiles
(contract-call? .identity-registry get-profile-by-name "alice_developer")

;; Check if name is available
(contract-call? .identity-registry is-name-available "new_username")

;; Get total registered profiles
(contract-call? .identity-registry get-profile-count)
```

#### Scenario 3: Admin Operations
```clarity
;; Admin verifies a profile
(contract-call? .identity-registry verify-identity 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Check verification
(contract-call? .identity-registry is-profile-verified 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

### 7. Deployment Steps

#### Local Testing
```bash
# Start Clarinet console
clarinet console

# Test functions interactively
```

#### Testnet Deployment
```bash
# Set environment variable
export STACKS_PRIVATE_KEY="your-private-key-here"

# Deploy to testnet
npm run deploy

# Interact with deployed contract
npm run interact demo
```

### 8. Integration Examples

#### Frontend Integration
```javascript
import { 
  makeContractCall,
  stringAsciiCV,
  someCV,
  noneCV 
} from '@stacks/transactions';

// Create profile function
async function createProfile(name, bio, avatar, website) {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'identity-registry',
    functionName: 'create-profile',
    functionArgs: [
      stringAsciiCV(name),
      stringAsciiCV(bio),
      stringAsciiCV(avatar),
      website ? someCV(stringAsciiCV(website)) : noneCV()
    ],
    // ... other options
  };
  
  return await makeContractCall(txOptions);
}
```

### 9. Best Practices

#### Profile Creation
- Use descriptive but concise names (max 50 chars)
- Keep bio informative but brief (max 200 chars)
- Use valid IPFS hashes for avatars
- Include website only if relevant

#### Security
- Never share private keys
- Verify contract addresses before interaction
- Test on devnet before mainnet deployment
- Keep profile information appropriate

#### Performance
- Check name availability before creation
- Batch read operations when possible
- Use appropriate gas limits
- Monitor transaction costs

### 10. Troubleshooting

#### Common Issues
1. **Profile already exists**: Each address can only have one profile
2. **Name taken**: Profile names must be unique
3. **Invalid input**: Check character limits and format
4. **Not authorized**: Admin functions require admin privileges

#### Debug Steps
1. Check contract syntax with `clarinet check`
2. Test in console before deployment
3. Verify account balances
4. Check transaction status on explorer

### 11. Next Steps

After getting familiar with basic operations:
1. Explore advanced features like verification
2. Build frontend integration
3. Implement profile discovery features
4. Add reputation systems
5. Integrate with other dApps

## 🎯 Ready to Start?

1. Run `clarinet console` to start testing
2. Try creating your first profile
3. Experiment with different functions
4. Build your identity management system!

Happy coding! 🚀