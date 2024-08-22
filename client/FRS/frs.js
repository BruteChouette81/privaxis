//js server for Fee Reduction System (FRS)

/**
 * scheme: 
 * 1: when accepting payment, money go through an escrow account managed by CPL
 * 2: if FRS activated, money is transferd to stable decentralized currency and supplied to aave protocol
 * 3: when withdrawed, the money make the same process but end up in client's account 
 * 
 * for optimization, using algo, clients can automate FRS to maximize reductions of fees
 * other method such as CPL merchant PAY can be used to keep money in account
 * 
 */

const express = require('express')
const { ethers } = require('ethers');
var crypto = require('crypto')
var shasum = crypto.createHash('sha1')

var accountID = "thomasberthiaume1"
var key = "E1okt60wxZvrIbHChjBLdP5X28FYnqOy3Kpf9UJm"
var secret = "PFI30MFmKOtZ+kKa01=="
var date = new Date()

// convert to yyyy-mm-dd
date = date.toISOString().split('T')[0]

shasum.update(key + secret + date)
var signature = shasum.digest('hex')

const app = express();

const PORT = 3000;

email = "test@test.com"



// Environment variables
const PRIVATE_KEY = "";
const ARBITRUM_RPC_URL = ""; //infura
const AAVE_POOL_ADDRESS = ""; //arbitrum 
const USDC_CONTRACT_ADDRESS = ""; //arbitrum

// Set up provider and wallet
const provider = new ethers.providers.JsonRpcProvider(ARBITRUM_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// USDC Contract ABI (simplified, include only the necessary functions)
const usdcAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)"
];

// Aave Lending Pool ABI (simplified, include only the necessary functions)
const aaveAbi = [
    "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external"
];

// Create contract instances
const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, usdcAbi, wallet);
const aaveContract = new ethers.Contract(AAVE_POOL_ADDRESS, aaveAbi, wallet);

//Aave helper function
async function supplyUsdcToAave(amount) {
    try {
        // Approve Aave to spend USDC
        const approvalTx = await usdcContract.approve(AAVE_POOL_ADDRESS, amount);
        await approvalTx.wait();

        console.log(`Approved Aave to spend ${amount} USDC`);

        // Supply USDC to Aave
        const supplyTx = await aaveContract.supply(USDC_CONTRACT_ADDRESS, amount, wallet.address, 0);
        await supplyTx.wait();

        console.log(`Supplied ${amount} USDC to Aave`);
    } catch (error) {
        console.error("Error supplying USDC to Aave:", error);
    }
}

async function withdrawUsdcFromAave(amount) {
    try {
        // Withdraw USDC from Aave
        const withdrawTx = await aaveContract.withdraw(USDC_CONTRACT_ADDRESS, amount, wallet.address);
        await withdrawTx.wait();

        console.log(`Withdrew ${amount.toString()} USDC from Aave`);
    } catch (error) {
        console.error("Error withdrawing USDC from Aave:", error);
    }
}

//e transfer helpers

// Function to send Interac e-Transfer to paytrie
async function sendInteracTransfer(amount, recipientEmail, securityQuestion, securityAnswer) {
    try {
        const headers = {
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded"
        }
        
        
        // Set up transfer data
        const transferData = {
            accountID: accountID,
            Key: key,
            Signature: signature,
            amount: amount,
            RecipientName: "PayTrie Inc",
            EmailAddress: recipientEmail,
            Question: securityQuestion,
            Answer: securityAnswer
        };

        // Send the Interac e-Transfer
        const transferResponse = await fetch(`https://earthnode-dev.vopay.com/api/v2/interac/bulk-payout`, {headers: headers, body: transferData, method: "POST"});

        if (transferResponse.status === 200) {
            console.log(`Successfully sent ${amount} CAD to ${recipientEmail}`);
        } else {
            console.error(`Failed to send transfer: ${transferResponse.data.message}`);
        }
    } catch (error) {
        console.error("Error sending Interac e-Transfer:", error);
    }
}






app.get('/', (req, res) => {
  res.send('Hello, World!');

});

app.post('/push2pool', (req, res) => {
    //get https://api.paytrie.com/transactions
    let headers_transaction = {
        'authorization': '' //get the api key
    }
    fetch('https://api.paytrie.com/quotes', {headers: {'authorization': ''}}).then((res1) => {
        //get the quote id
        console.log("New id generated: " + res1.id.toString())
        fetch('https://api.paytrie.com/transactions', {headers: headers_transaction, body: {
            
            "quoteId": res1.id,
            "gasId": res1.gasId,
            "email": "",
            "wallet": wallet.address,
            "leftSideLabel": "CAD",
            "leftSideValue": req.body.amount,
            "rightSideLabel": "USDC-ARB",
              
        }, method: "POST"}).then(async (res2) => {
            //save transaction Id
            //transfer money using vopay
            await sendInteracTransfer(req.body.amount)
            const amount = ethers.utils.parseUnits(req.body.amount, 6); // USDC has 6 decimals
            await supplyUsdcToAave(amount);
            console.log("FRS activated!")
            res.send("success")
        })
    })
    
})

app.post('/pullFromPool', async (req, res) => {
    //get https://api.paytrie.com/transactions
    let headers_transaction = {
        'authorization': '' //get the api key
    }
    const amount = ethers.utils.parseUnits(req.body.amount, 6); // USDC has 6 decimals
    await withdrawUsdcFromAave(amount);
    fetch('https://api.paytrie.com/quotes', {headers: {'authorization': ''}}).then((res1) => {
        //get the quote id
        console.log("New id generated: " + res1.id.toString())
        fetch('https://api.paytrie.com/transactions', {headers: headers_transaction, body: {
            
            "quoteId": res1.id,
            "gasId": res1.gasId,
            "email": "",
            "wallet": wallet.address,
            "leftSideLabel": "USDC-ARB",
            "leftSideValue": req.body.amount,
            "rightSideLabel": "CAD",
              
        }, method: "POST"}).then(async (res2) => {
            //save transaction Id
            //transfer money using vopay
            //await sendInteracTransfer() retrieve money from bulk payout and ach to client acocunt (helcim)
            
            //await supplyUsdcToAave(amount);
            console.log("FRS deactivated!")
            res.send("success")
        })
    })
    
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});