const { Web3 } = require('web3');
const fs = require('fs');

// --- READ CONFIGURATION ---
// Reads the deployed contract address from the config file
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const contractAddress = config.contractAddress;

// --- BLOCKCHAIN & CONTRACT CONFIGURATION ---
const web3 = new Web3('http://localhost:7545');
const abi = JSON.parse(fs.readFileSync('BallotABI.json', 'utf8'));
const ballotContract = new web3.eth.Contract(abi, contractAddress);

// Get the candidate name from the command line (e.g., "Party A")
const candidateName = process.argv[2];
if (!candidateName) {
    console.error("❌ Please provide a candidate name to add in quotes.");
    console.log("Example: node addCandidate.js \"Party A\"");
    process.exit(1);
}

async function addCandidate() {
    try {
        console.log(`Adding candidate: "${candidateName}"...`);

        // Get the list of accounts from Ganache
        const accounts = await web3.eth.getAccounts();
        // The first account is the owner/deployer by default
        const ownerAccount = accounts[0];

        // Send a transaction to the addCandidate function
        const receipt = await ballotContract.methods.addCandidate(candidateName).send({
            from: ownerAccount,
            gas: '1000000'
        });

        console.log(`✅ Candidate added successfully!`);
        console.log(`   Transaction Hash: ${receipt.transactionHash}`);

    } catch (error) {
        console.error("❌ Error adding candidate:", error.message);
    }
}

addCandidate();