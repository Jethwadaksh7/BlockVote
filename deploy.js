const { Web3 } = require('web3');
const fs = require('fs');

const web3 = new Web3('http://localhost:7545');
const abi = JSON.parse(fs.readFileSync('BallotABI.json', 'utf8'));
const bytecode = fs.readFileSync('BallotBytecode.txt', 'utf8');

async function deploy() {
    console.log('Attempting to deploy contract...');
    try {
        const accounts = await web3.eth.getAccounts();
        const deployerAccount = accounts[0];
        console.log(`Using deployer account: ${deployerAccount}`);

        const ballotContract = new web3.eth.Contract(abi);
        const deployTx = ballotContract.deploy({ data: '0x' + bytecode });
        const deployedContract = await deployTx.send({ from: deployerAccount, gas: '1000000' });
        const contractAddress = deployedContract.options.address;

        console.log('✅ Contract deployment successful!');
        console.log(`Contract deployed to address: ${contractAddress}`);

        // --- SAVE ADDRESS TO CONFIG FILE ---
        const config = { contractAddress: contractAddress };
        fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
        console.log('📝 Contract address saved to config.json');

    } catch (error) {
        console.error('❌ Contract deployment failed:', error);
    }
}

deploy();