const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Web3 } = require('web3');

// --- BLOCKCHAIN & CONTRACT CONFIGURATION ---
const web3 = new Web3('http://localhost:7545');

// Load the contract's ABI
const abi = JSON.parse(fs.readFileSync('BallotABI.json', 'utf8'));

// The address of your DEPLOYED Ballot contract
const contractAddress = '0x9474EcA5002C3A0A9dd8924ef12136601aFaD098'; // <-- Paste your new address here

// Create an instance of your contract
const ballotContract = new web3.eth.Contract(abi, contractAddress);

const app = express();
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
    res.send("BlockVote Gateway is running!");
});

// --- UPDATED VOTE SUBMISSION ROUTE ---
app.post("/vote", async (req, res) => {
    const { voterId, encryptedVote } = req.body;

    if (!voterId || !encryptedVote) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("New vote received for Voter ID:", voterId);

    try {
        // Get the deployer account from Ganache to send the transaction
        const accounts = await web3.eth.getAccounts();
        const fromAccount = accounts[0];

        // Create a unique hash for this specific vote to store on-chain
        const voteHash = web3.utils.sha3(encryptedVote);

        console.log(`Submitting vote with hash: ${voteHash}`);

        // Send a transaction to the smart contract's castVote function
        const receipt = await ballotContract.methods.castVote(voteHash).send({
            from: fromAccount,
            gas: '1000000'
        });

        console.log(`✅ Vote successfully recorded on the blockchain.`);

        // Return the real transaction hash
        res.json({
            message: "Vote recorded successfully on the blockchain",
            transactionHash: receipt.transactionHash
        });

    } catch (error) {
        console.error('❌ Error submitting vote to the blockchain:', error.message);
        res.status(500).json({
            error: "Failed to record vote on the blockchain.",
            details: error.message
        });
    }
});


// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`BlockVote Gateway running on port ${PORT}`);
    console.log(`Connected to smart contract at address: ${contractAddress}`);
});