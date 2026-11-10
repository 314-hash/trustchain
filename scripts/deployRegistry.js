import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('====================================================');
  console.log(' 🛡️ TRUSTCHAIN EVIDENCE REGISTRY DEPLOYMENT SCRIPT ');
  console.log('====================================================');

  const artifactPath = path.resolve('contracts/TrustChainEvidenceRegistry.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found. Please run: node scripts/compileContracts.js first.');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Target Network configuration
  const rpcUrl = process.env.EVM_RPC_URL || 'https://sepolia.base.org';
  const privateKey = process.env.EVM_SIGNER_PRIVATE_KEY;

  console.log(`Connecting to EVM RPC: ${rpcUrl}`);
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  let wallet;
  if (privateKey) {
    wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Using configured deployer wallet: ${wallet.address}`);
  } else {
    // Generate a clean ephemeral test wallet and display instructions
    const randomWallet = ethers.Wallet.createRandom();
    wallet = randomWallet.connect(provider);
    console.log('----------------------------------------------------');
    console.log('⚠️  NO PRIVATE KEY FOUND IN .env');
    console.log(`Generated Ephemeral Deployer Address: ${wallet.address}`);
    console.log('To deploy to Base Sepolia Testnet or Base Mainnet:');
    console.log('1. Get free testnet ETH from: https://faucets.chain.link or https://learnweb3.io/faucets/base_sepolia');
    console.log('2. Add your wallet private key to .env: EVM_SIGNER_PRIVATE_KEY=your_key_here');
    console.log('----------------------------------------------------');
    return;
  }

  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error('❌ Insufficient balance to deploy smart contract. Fund the deployer wallet first.');
    return;
  }

  console.log('Deploying TrustChainEvidenceRegistry smart contract to blockchain...');
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`🎉 CONTRACT DEPLOYED SUCCESSFULLY!`);
  console.log(`Registry Address: ${contractAddress}`);
  console.log(`View on BaseScan: https://sepolia.basescan.org/address/${contractAddress}`);

  console.log('\nUpdating server configuration...');
  const envContent = `\nEVM_REGISTRY_CONTRACT=${contractAddress}\n`;
  fs.appendFileSync('.env', envContent);
  console.log('✅ Updated .env with new registry contract address!');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});

