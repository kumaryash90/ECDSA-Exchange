const express = require('express');
const cors = require('cors');
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const { verify } = require('./verify');

const PORT = 3042;

const ec = new EC('secp256k1');
const accounts = {};

for(let i = 0; i < 5; i++) {
    let key = ec.genKeyPair();
    const privateKey = key.getPrivate().toString(16);
    const publicKey = key.getPublic();
    const publicKeyHash = SHA256(publicKey.encode('hex')).toString();

    accounts['0x'+publicKeyHash.substr(publicKeyHash.length - 40)] = {
        privateKey: privateKey,
        publicX: publicKey.x.toString(16),
        publicY: publicKey.y.toString(16),
        balance: 100
    };
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    const accountsArray = []
    for(account in accounts) {
        accountsArray.push(account);
    }
    res.send({ accountsArray });
});

app.get('/balance/:address', (req, res) => {
    const { address } = req.params;
    const balance = accounts[address].balance || 0;
    res.send({ balance });
});

app.post('/send', (req, res) => {
    const { txnString, signature } = req.body;
    console.log("txn: ", txnString);
    const { sender, recepient, amount } = JSON.parse(txnString);
    console.log("sender: ",sender);
    console.log("recepient: ", recepient);
    console.log("amount: ", amount);
    console.log("signature: ", signature);
    const verified = verify(accounts[sender].publicX, accounts[sender].publicY, txnString, signature);

    if(verified) {
        if(accounts[sender].balance >= amount) {
            accounts[sender].balance -= Number(amount);
            accounts[recepient].balance += Number(amount);
            res.send({ balance: accounts[sender].balance });
        } else {
            res.status(400).json({ msg: "insufficient funds" });
        }
    } else {
        console.log("invalid details");
        res.status(400).json({ msg: "invalid details"});
    }
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
    console.log("\nAvailable accounts");
    console.log("==================");
    let i = 0;
    for(let account in accounts) {
        console.log(`(${i}) ${account} (${accounts[account].balance} ETH)`);
        i++;
    }

    console.log("\nPrivate keys");
    console.log("==================");
    i = 0;
    for(let account in accounts) {
        console.log(`(${i}) ${accounts[account].privateKey}`);
        i++;
    }
});