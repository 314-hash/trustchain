import fs from 'fs';
import path from 'path';
import solc from 'solc';

const contractPath = path.resolve('contracts/TrustChainEvidenceRegistry.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'TrustChainEvidenceRegistry.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

console.log('Compiling TrustChainEvidenceRegistry.sol with Solc 0.8.24...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  output.errors.forEach((err) => {
    if (err.severity === 'error') {
      hasError = true;
      console.error(err.formattedMessage);
    } else {
      console.warn(err.formattedMessage);
    }
  });
  if (hasError) process.exit(1);
}

const contract = output.contracts['TrustChainEvidenceRegistry.sol']['TrustChainEvidenceRegistry'];
const artifact = {
  contractName: 'TrustChainEvidenceRegistry',
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
};

const artifactPath = path.resolve('contracts/TrustChainEvidenceRegistry.json');
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

console.log(`✅ Compilation successful! Artifact saved to ${artifactPath}`);

