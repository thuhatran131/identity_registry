import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createStacksPrivateKey,
  getAddressFromPrivateKey,
  TransactionVersion,
  stringAsciiCV,
  principalCV,
  someCV,
  noneCV,
  callReadOnlyFunction,
  cvToString
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import * as fs from 'fs';

// Configuration
const NETWORK = new StacksTestnet();
const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY || 'your-private-key-here';

// Load deployment info
let deploymentInfo: any;
try {
  deploymentInfo = JSON.parse(fs.readFileSync('./deployment-info.json', 'utf8'));
} catch (error) {
  console.error('❌ Could not load deployment info. Please deploy the contract first.');
  process.exit(1);
}

const CONTRACT_ADDRESS = deploymentInfo.contractAddress;
const [DEPLOYER_ADDRESS, CONTRACT_NAME] = CONTRACT_ADDRESS.split('.');

class IdentityRegistryInteractor {
  private privateKey: any;
  private senderAddress: string;

  constructor() {
    this.privateKey = createStacksPrivateKey(PRIVATE_KEY);
    this.senderAddress = getAddressFromPrivateKey(this.privateKey.data, TransactionVersion.Testnet);
  }

  // Create a new profile
  async createProfile(name: string, bio: string, avatar: string, website?: string) {
    console.log(`🆕 Creating profile: ${name}`);
    
    const txOptions = {
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'create-profile',
      functionArgs: [
        stringAsciiCV(name),
        stringAsciiCV(bio),
        stringAsciiCV(avatar),
        website ? someCV(stringAsciiCV(website)) : noneCV()
      ],
      senderKey: this.privateKey.data,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 5000,
    };

    try {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
      
      if (broadcastResponse.error) {
        console.error('❌ Transaction failed:', broadcastResponse.error);
        return null;
      }
      
      console.log('✅ Profile created successfully!');
      console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
      return broadcastResponse.txid;
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      return null;
    }
  }

  // Update existing profile
  async updateProfile(name: string, bio: string, avatar: string, website?: string) {
    console.log(`📝 Updating profile: ${name}`);
    
    const txOptions = {
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'update-profile',
      functionArgs: [
        stringAsciiCV(name),
        stringAsciiCV(bio),
        stringAsciiCV(avatar),
        website ? someCV(stringAsciiCV(website)) : noneCV()
      ],
      senderKey: this.privateKey.data,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 5000,
    };

    try {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
      
      if (broadcastResponse.error) {
        console.error('❌ Transaction failed:', broadcastResponse.error);
        return null;
      }
      
      console.log('✅ Profile updated successfully!');
      console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
      return broadcastResponse.txid;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return null;
    }
  }

  // Get profile by principal
  async getProfile(userAddress: string) {
    console.log(`🔍 Getting profile for: ${userAddress}`);
    
    try {
      const result = await callReadOnlyFunction({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-profile',
        functionArgs: [principalCV(userAddress)],
        network: NETWORK,
        senderAddress: this.senderAddress,
      });

      if (result.type === 'optional' && result.value) {
        console.log('✅ Profile found:');
        const profile = result.value as any;
        console.log(`   Name: ${cvToString(profile.data.name)}`);
        console.log(`   Bio: ${cvToString(profile.data.bio)}`);
        console.log(`   Avatar: ${cvToString(profile.data.avatar)}`);
        console.log(`   Verified: ${profile.data.verified.value}`);
        console.log(`   Created at block: ${profile.data['created-at'].value}`);
        return profile;
      } else {
        console.log('❌ Profile not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting profile:', error);
      return null;
    }
  }

  // Get profile by name
  async getProfileByName(name: string) {
    console.log(`🔍 Getting profile by name: ${name}`);
    
    try {
      const result = await callReadOnlyFunction({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-profile-by-name',
        functionArgs: [stringAsciiCV(name)],
        network: NETWORK,
        senderAddress: this.senderAddress,
      });

      if (result.type === 'optional' && result.value) {
        console.log('✅ Profile found by name');
        return result.value;
      } else {
        console.log('❌ Profile not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting profile by name:', error);
      return null;
    }
  }

  // Check if profile exists
  async profileExists(userAddress: string) {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'profile-exists',
        functionArgs: [principalCV(userAddress)],
        network: NETWORK,
        senderAddress: this.senderAddress,
      });

      const exists = result.type === 'bool' && result.value;
      console.log(`Profile exists for ${userAddress}: ${exists}`);
      return exists;
    } catch (error) {
      console.error('❌ Error checking profile existence:', error);
      return false;
    }
  }

  // Check if profile is verified
  async isProfileVerified(userAddress: string) {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-profile-verified',
        functionArgs: [principalCV(userAddress)],
        network: NETWORK,
        senderAddress: this.senderAddress,
      });

      const verified = result.type === 'bool' && result.value;
      console.log(`Profile verified for ${userAddress}: ${verified}`);
      return verified;
    } catch (error) {
      console.error('❌ Error checking verification status:', error);
      return false;
    }
  }

  // Get total profile count
  async getProfileCount() {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-profile-count',
        functionArgs: [],
        network: NETWORK,
        senderAddress: this.senderAddress,
      });

      const count = result.type === 'uint' ? Number(result.value) : 0;
      console.log(`Total profiles: ${count}`);
      return count;
    } catch (error) {
      console.error('❌ Error getting profile count:', error);
      return 0;
    }
  }

  // Check if name is available
  async isNameAvailable(name: string) {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-name-available',
        functionArgs: [stringAsciiCV(name)],
        network: NETWORK,
        senderAddress: this.senderAddress,
      });

      const available = result.type === 'bool' && result.value;
      console.log(`Name "${name}" available: ${available}`);
      return available;
    } catch (error) {
      console.error('❌ Error checking name availability:', error);
      return false;
    }
  }

  // Delete profile
  async deleteProfile() {
    console.log('🗑️ Deleting profile...');
    
    const txOptions = {
      contractAddress: DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'delete-profile',
      functionArgs: [],
      senderKey: this.privateKey.data,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 5000,
    };

    try {
      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
      
      if (broadcastResponse.error) {
        console.error('❌ Transaction failed:', broadcastResponse.error);
        return null;
      }
      
      console.log('✅ Profile deleted successfully!');
      console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
      return broadcastResponse.txid;
    } catch (error) {
      console.error('❌ Error deleting profile:', error);
      return null;
    }
  }
}

// Demo function
async function runDemo() {
  console.log('🎭 Identity Registry Demo');
  console.log('========================');
  
  const interactor = new IdentityRegistryInteractor();
  
  // Check initial state
  await interactor.getProfileCount();
  await interactor.isNameAvailable('demo_user');
  
  // Create a profile
  await interactor.createProfile(
    'demo_user',
    'This is a demo profile for testing the Identity Registry',
    'QmXoYpVyKxQXGxuNqXR7uo8rqjNVvQxQxQxQxQxQxQxQx',
    'https://demo.example.com'
  );
  
  // Wait a bit for transaction to be processed
  console.log('⏳ Waiting for transaction to be processed...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Check profile
  await interactor.getProfile(interactor.senderAddress);
  await interactor.profileExists(interactor.senderAddress);
  await interactor.isProfileVerified(interactor.senderAddress);
  await interactor.getProfileByName('demo_user');
  await interactor.getProfileCount();
}

// Command line interface
const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  const interactor = new IdentityRegistryInteractor();
  
  switch (command) {
    case 'demo':
      await runDemo();
      break;
    case 'create':
      if (args.length < 3) {
        console.log('Usage: npm run interact create <name> <bio> <avatar> [website]');
        return;
      }
      await interactor.createProfile(args[0], args[1], args[2], args[3]);
      break;
    case 'get':
      if (args.length < 1) {
        console.log('Usage: npm run interact get <address>');
        return;
      }
      await interactor.getProfile(args[0]);
      break;
    case 'get-by-name':
      if (args.length < 1) {
        console.log('Usage: npm run interact get-by-name <name>');
        return;
      }
      await interactor.getProfileByName(args[0]);
      break;
    case 'count':
      await interactor.getProfileCount();
      break;
    case 'exists':
      if (args.length < 1) {
        console.log('Usage: npm run interact exists <address>');
        return;
      }
      await interactor.profileExists(args[0]);
      break;
    case 'verified':
      if (args.length < 1) {
        console.log('Usage: npm run interact verified <address>');
        return;
      }
      await interactor.isProfileVerified(args[0]);
      break;
    case 'available':
      if (args.length < 1) {
        console.log('Usage: npm run interact available <name>');
        return;
      }
      await interactor.isNameAvailable(args[0]);
      break;
    case 'delete':
      await interactor.deleteProfile();
      break;
    default:
      console.log('Available commands:');
      console.log('  demo                           - Run full demo');
      console.log('  create <name> <bio> <avatar>   - Create profile');
      console.log('  get <address>                  - Get profile by address');
      console.log('  get-by-name <name>             - Get profile by name');
      console.log('  count                          - Get total profile count');
      console.log('  exists <address>               - Check if profile exists');
      console.log('  verified <address>             - Check if profile is verified');
      console.log('  available <name>               - Check if name is available');
      console.log('  delete                         - Delete your profile');
  }
}

main();