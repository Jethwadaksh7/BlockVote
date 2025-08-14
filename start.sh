#!/bin/bash

# Exit immediately if any command fails
set -e

echo "✅ 1. Starting Ganache... (Please ensure Ganache is running)"
sleep 2

echo "🚀 2. Deploying the smart contract..."
node deploy.js

# --- INTERACTIVE CANDIDATE REGISTRATION ---
echo "📝 3. Registering candidates..."

# Ask the user how many candidates to add
read -p "Enter the number of candidates you want to register: " count

# Loop that many times to get each candidate's name
for (( i=1; i<=count; i++ ))
do
  read -p "Enter the name for Candidate #$i: " candidate_name
  echo "Registering \"$candidate_name\"..."
  node addCandidate.js "$candidate_name"
done
# --- END OF INTERACTIVE SECTION ---

echo "🔍 4. Verifying final ballot setup..."
node checkResults.js

echo "📡 5. Starting the API server..."
echo "Server is starting. You can now use Postman to vote."
node server.js