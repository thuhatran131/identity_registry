# 🆔 Identity Registry Smart Contract

A decentralized identity management system built on the Stacks blockchain using Clarity smart contracts.

## 📋 Overview

The Identity Registry allows users to create and manage digital identity profiles on the blockchain. Each user can have one unique profile with customizable information including name, bio, avatar, and website.

## ✨ Features

### Core Functionality
- **Profile Creation**: Create unique identity profiles
- **Profile Management**: Update profile information
- **Profile Search**: Find profiles by name or address
- **Verification System**: Admin-controlled profile verification
- **Access Control**: Owner-only profile management
- **Profile Deletion**: Remove profiles permanently

### Profile Structure
```
Profile {
  name: string (max 50 chars, unique)
  bio: string (max 200 chars)
  avatar: string (IPFS hash)
  website: optional string (max 100 chars)
  verified: boolean (admin-controlled)
  created-at: uint (block height)
  updated-at: uint (block height)
}
```

## 🏗️ Architecture

```
project5_identity_registry/
├── contracts/
│   └── identity-registry.clar      # Main smart contract
├── tests/
│   └── identity-registry_test.ts   # Comprehensive test suite
├── scripts/
│   ├── deploy.ts                   # Deployment script
│   └── interact.ts                 # Interaction utilities
├── Clarinet.toml                   # Clarinet configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites
- [Clarinet](https://docs.hiro.so/clarinet) installed
- [Node.js](https://nodejs.org/) v16 or higher
- Stacks wallet with testnet STX

### Installation
```bash
# Clone and navigate to project
cd project5_identity_registry

# Install dependencies
npm install

# Check contract syntax
clarinet check

# Run tests
clarinet test
```

### Testing
```bash
# Run all tests
npm test

# Check contract without deploying
npm run check
```

## 📝 Smart Contract Functions

### Public Functions

#### Profile Management
- `create-profile(name, bio, avatar, website)` - Create new profile
- `update-profile(name, bio, avatar, website)` - Update existing profile
- `delete-profile()` - Delete your profile

#### Admin Functions
- `verify-identity(user)` - Verify a profile (admin only)
- `unverify-identity(user)` - Remove verification (admin only)
- `admin-delete-profile(user)` - Force delete profile (admin only)
- `set-admin(new-admin)` - Change contract admin (admin only)

### Read-Only Functions

#### Profile Queries
- `get-profile(user)` - Get profile by principal
- `get-profile-by-name(name)` - Get profile by name
- `profile-exists(user)` - Check if profile exists
- `is-profile-verified(user)` - Check verification status
- `get-profile-count()` - Get total profile count

#### Utility Functions
- `is-name-available(name)` - Check name availability
- `get-profile-owner(name)` - Get owner of a name
- `get-profile-info(user)` - Get profile with existence check
- `get-admin()` - Get current admin address

## 🔧 Deployment

### Deploy to Testnet
```bash
# Set your private key
export STACKS_PRIVATE_KEY="your-private-key-here"

# Deploy contract
npm run deploy
```

### Interact with Contract
```bash
# Run demo
npm run interact demo

# Create profile
npm run interact create "john_doe" "Software developer" "QmHash..." "https://johndoe.dev"

# Get profile
npm run interact get ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Check name availability
npm run interact available "john_doe"

# Get profile count
npm run interact count
```

## 🧪 Testing Strategy

The contract includes comprehensive tests covering:

### Functionality Tests
- Profile creation and validation
- Profile updates and name changes
- Profile search by name and address
- Profile deletion and cleanup

### Security Tests
- Access control verification
- Input validation
- Duplicate prevention
- Owner-only operations

### Edge Cases
- Invalid input handling
- Non-existent profile queries
- Admin privilege escalation
- Counter accuracy

### Example Test Run
```bash
clarinet test

# Expected output:
# ✓ Can create a new profile successfully
# ✓ Cannot create profile with duplicate name
# ✓ Cannot create multiple profiles for same user
# ✓ Can update profile successfully
# ✓ Can search profile by name
# ✓ Admin can verify and unverify profiles
# ✓ Non-admin cannot verify profiles
# ✓ Can delete own profile
# ✓ Profile counter works correctly
# ✓ Input validation works correctly
# ✓ Utility functions work correctly
```

## 🔒 Security Features

### Access Control
- **Owner-only operations**: Only profile owner can update/delete
- **Admin privileges**: Verification requires admin rights
- **Input validation**: All inputs are validated for length and format

### Data Integrity
- **Unique constraints**: One profile per address, unique names
- **Immutable history**: Creation timestamps preserved
- **Atomic operations**: All state changes are atomic

### Privacy Considerations
- **Minimal data**: Only essential information stored
- **User control**: Users own and control their data
- **Optional fields**: Website field is optional

## 💡 Usage Examples

### Creating a Profile
```clarity
(contract-call? .identity-registry create-profile 
  "alice_dev" 
  "Full-stack developer passionate about Web3" 
  "QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx"
  (some "https://alice.dev"))
```

### Searching Profiles
```clarity
;; Get profile by address
(contract-call? .identity-registry get-profile 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Get profile by name
(contract-call? .identity-registry get-profile-by-name "alice_dev")
```

### Admin Operations
```clarity
;; Verify a profile (admin only)
(contract-call? .identity-registry verify-identity 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

## 🎯 Use Cases

### Individual Users
- **Digital Identity**: Create verifiable online presence
- **Profile Management**: Maintain up-to-date information
- **Reputation Building**: Build trust through verification

### Applications
- **Social dApps**: User profiles and discovery
- **Marketplaces**: Seller/buyer identity verification
- **DAOs**: Member identity and reputation
- **DeFi**: KYC-lite identity verification

### Developers
- **Identity Layer**: Build on top of identity registry
- **Integration**: Connect with existing applications
- **Verification**: Implement trust systems

## 🔮 Future Enhancements

### Planned Features
- **Reputation System**: Score-based profile ranking
- **Social Features**: Follow/unfollow functionality
- **Verification Tiers**: Multiple verification levels
- **Privacy Controls**: Granular data sharing settings

### Integration Opportunities
- **IPFS Storage**: Decentralized avatar/media storage
- **ENS Integration**: Domain name resolution
- **Cross-chain**: Multi-blockchain identity
- **API Gateway**: RESTful API for web2 integration

## 📊 Contract Statistics

- **Gas Efficiency**: Optimized for low transaction costs
- **Storage**: Minimal on-chain storage footprint
- **Scalability**: Designed for high user volume
- **Security**: Comprehensive access controls

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [Stacks Documentation](https://docs.stacks.co/)
- **Clarinet**: [Clarinet Documentation](https://docs.hiro.so/clarinet)
- **Community**: [Stacks Discord](https://discord.gg/stacks)

## 🎉 Acknowledgments

- Stacks Foundation for the blockchain infrastructure
- Hiro for Clarinet development tools
- Community contributors and testers

---

Built with ❤️ on Stacks blockchain