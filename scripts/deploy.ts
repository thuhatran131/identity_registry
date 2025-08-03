import { 
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createStacksPrivateKey,
  getAddressFromPrivateKey,
  TransactionVersion
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import * as fs from 'fs';

// Configuration
const NETWORK = new StacksTestnet();
const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY || 'your-private-key-here';

async function deployContract() {
  try {
    console.log('🚀 Starting Identity Registry contract deployment...');
    
    // Read contract source
    const contractSource = fs.readFileSync('./contracts/identity-registry.clar', 'utf8');
    
    // Create private key object
    const privateKey = createStacksPrivateKey(PRIVATE_KEY);
    const senderAddress = getAddressFromPrivateKey(privateKey.data, TransactionVersion.Testnet);
    
    console.log(`📝 Deploying from address: ${senderAddress}`);
    
    // Create contract deploy transaction
    const txOptions = {
      contractName: 'identity-registry',
      codeBody: contractSource,
      senderKey: privateKey.data,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 10000, // 0.01 STX
    };
    
    const transaction = await makeContractDeploy(txOptions);
    
    console.log('📡 Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
    
    if (broadcastResponse.error) {
      console.error('❌ Deployment failed:', broadcastResponse.error);
      console.error('Reason:', broadcastResponse.reason);
      return;
    }
    
    console.log('✅ Contract deployed successfully!');
    console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
    console.log(`🔗 Contract Address: ${senderAddress}.identity-registry`);
    console.log(`🌐 Explorer: https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: `${senderAddress}.identity-registry`,
      transactionId: broadcastResponse.txid,
      deployedAt: new Date().toISOString(),
      network: 'testnet'
    };
    
    fs.writeFileSync('./deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to deployment-info.json');
    
  } catch (error) {
    console.error('❌ Deployment error:', error);
  }
}

// Run deployment
deployContract();