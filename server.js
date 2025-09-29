const express = require("express");
const fs = require("fs");
const path = require("path");
const { Web3 } = require('web3');

// --- READ CONFIGURATION ---
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const contractAddress = config.contractAddress;

// --- BLOCKCHAIN & CONTRACT CONFIGURATION ---
const web3 = new Web3('http://localhost:7545');
const abi = JSON.parse(fs.readFileSync('BallotABI.json', 'utf8'));
const ballotContract = new web3.eth.Contract(abi, contractAddress); // <-- FIX IS HERE

const app = express();

// --- MODERN BODY PARSER ---
app.use(express.json());

app.get("/", (req, res) => {
    res.send("BlockVote Gateway is running!");
});

app.post("/vote", async (req, res) => {
    const { voterId, candidateId } = req.body;
    if (!voterId || candidateId === undefined) {
        return res.status(400).json({ error: "voterId and candidateId are required." });
    }

    console.log(`New vote received for Voter ID: ${voterId} for Candidate ID: ${candidateId}`);

    try {
        const accounts = await web3.eth.getAccounts();
        const fromAccount = accounts[0];

        console.log(`Submitting vote to smart contract...`);
        const receipt = await ballotContract.methods.castVote(candidateId, voterId).send({ from: fromAccount, gas: '1000000' });
        console.log(`✅ Vote successfully recorded on the blockchain.`);

        res.json({
            message: "Vote recorded successfully on the blockchain",
            transactionHash: receipt.transactionHash
        });

    } catch (error) {
        console.error('❌ Error submitting vote to the blockchain:', error.message);
        const reason = error.data?.message || "Execution reverted.";
        res.status(500).json({
            error: "Failed to record vote on the blockchain.",
            details: reason
        });
    }
});

app.get("/results", async (req, res) => {
    try {
        console.log("Fetching election results from the blockchain...");
        const results = [];
        const candidatesCount = await ballotContract.methods.getCandidatesCount().call();
        for (let i = 0; i < candidatesCount; i++) {
            const candidate = await ballotContract.methods.candidates(i).call();
            results.push({ id: i, name: candidate.name, voteCount: candidate.voteCount.toString() });
        }
        console.log("✅ Results fetched successfully.");
        res.json(results);
    } catch (error) {
        console.error("❌ Error fetching results:", error.message);
        res.status(500).json({ error: "Could not retrieve results from the blockchain." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`BlockVote Gateway running on port ${PORT}`);
    console.log(`Connected to smart contract at address: ${contractAddress}`);
});
//Daksh Jethwa