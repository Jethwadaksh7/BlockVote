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

async function getResults() {
    try {
        console.log("--- Fetching Election Results from the Blockchain ---");

        // Call the getCandidatesCount function from the smart contract
        const candidatesCount = await ballotContract.methods.getCandidatesCount().call();
        console.log(`Total number of candidates: ${candidatesCount}\n`);

        const results = [];
        // Loop through each candidate to get their details
        for (let i = 0; i < candidatesCount; i++) {
            const candidate = await ballotContract.methods.candidates(i).call();
            results.push({
                id: i,
                name: candidate.name,
                voteCount: candidate.voteCount.toString()
            });
        }

        // Display the results in a user-friendly table format
        console.table(results);
        console.log("----------------------------------------------------");

    } catch (error) {
        console.error("❌ Error fetching results:", error.message);
    }
}

getResults();