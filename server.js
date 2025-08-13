const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const VOTES_FILE = path.join(__dirname, "votes.json");

// Ensure votes.json exists
if (!fs.existsSync(VOTES_FILE)) {
    console.log("Creating votes.json file...");
    fs.writeFileSync(VOTES_FILE, JSON.stringify([]));
}

// Test route
app.get("/", (req, res) => {
    res.send("BlockVote Gateway is running!");
});

// Vote submission route
app.post("/vote", (req, res) => {
    const { voterId, encryptedVote } = req.body;

    if (!voterId || !encryptedVote) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const txHash = crypto.createHash("sha256")
        .update(encryptedVote + Date.now())
        .digest("hex");

    console.log("New vote received:");
    console.log("Voter ID:", voterId);
    console.log("Encrypted Vote:", encryptedVote);
    console.log("Transaction Hash:", txHash);

    try {
        // Load existing votes
        let votes = JSON.parse(fs.readFileSync(VOTES_FILE));

        // Add new vote
        votes.push({
            voterId,
            encryptedVote,
            transactionHash: txHash,
            timestamp: new Date().toISOString()
        });

        // Write back to the file
        fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2));

        console.log("Successfully wrote to votes.json"); // Added success log

        res.json({
            message: "Vote recorded successfully",
            transactionHash: txHash
        });

    } catch (error) {
        console.error("!!! FAILED TO WRITE TO FILE !!!:", error); // Vital error log
        res.status(500).json({ error: "Could not save the vote." });
    }
});


// View all stored votes
app.get("/results", (req, res) => {
    try {
        const votes = JSON.parse(fs.readFileSync(VOTES_FILE));
        res.json(votes);
    } catch (error) {
        console.error("Could not read votes.json:", error);
        res.status(500).json({ error: "Could not retrieve results." });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`BlockVote Gateway running on port ${PORT}`);
});