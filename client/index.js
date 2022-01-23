import "./index.scss";
import sign from "./sign";

const server = "http://localhost:3042";

const accountAddress = document.getElementById("exchange-address");
const sendAmount = document.getElementById("send-amount");
const recepientAddress = document.getElementById("recepient");
const accountBalance = document.getElementById("balance");

let sender = accountAddress.value;
let recepient = recepientAddress.value;
let amount = sendAmount.value;
let txnString = JSON.stringify({
    sender, amount, recepient
});
const txnStringComponent = document.getElementById("txn-string");

fetch(server)
    .then(res => res.json())
    .then(({ accountsArray }) => {
        const exchangeAddressOptions = accountAddress.options;
        accountsArray.forEach(account => exchangeAddressOptions.add(new Option(account)))
        sender = accountAddress.value;
        txnString = JSON.stringify({
            sender, amount, recepient
        });
        txnStringComponent.textContent = "Copy Txn String: " + txnString;

        fetch(`${server}/balance/${accountsArray[0]}`)
        .then(res => res.json())
        .then(({ balance }) => {
            accountBalance.textContent = "Balance: " + balance;
        });
    });

/*
    Get account balance;
    Listen to any changes in transaction inputs;
*/
accountAddress.addEventListener('input', ({ target: { value }}) => {
    sender = value;
    txnString = JSON.stringify({
        sender, amount, recepient
    });
    txnStringComponent.textContent = "Copy Txn String: " + txnString;

    fetch(`${server}/balance/${value}`)
        .then(res => res.json())
        .then(({ balance }) => {
            accountBalance.textContent = "Balance: " + balance;
        });
});
recepientAddress.addEventListener('input', ({ target: { value }}) => {
    recepient = value;
    txnString = JSON.stringify({
        sender, amount, recepient
    });
    txnStringComponent.textContent = "Copy Txn String: " + txnString;
});
sendAmount.addEventListener('input', ({ target: { value }}) => {
    amount = value;
    txnString = JSON.stringify({
        sender, amount, recepient
    });
    txnStringComponent.textContent = "Copy Txn String: " + txnString;
});

/*
    Select signing option
*/
let enterPrivateKey = true;
const pvtKeyField = document.getElementById("pvt-key-value");
const rValueField = document.getElementById("r-value");
const sValueField = document.getElementById("s-value");
document.getElementById("pvt-key").addEventListener('change', () => {
    enterPrivateKey = true;
    txnStringComponent.style.display = "none";
    pvtKeyField.disabled = false;
    rValueField.disabled = true;
    sValueField.disabled = true;

    rValueField.value = "";
    sValueField.value = "";
});
document.getElementById("sign").addEventListener('change', () => {
    enterPrivateKey = false;
    txnStringComponent.style.display = "inline-block";
    pvtKeyField.disabled = true;
    pvtKeyField.value = "";

    rValueField.disabled = false;
    sValueField.disabled = false;
});


/*
    Send transaction
*/
document.getElementById("transfer-amount").addEventListener('click', () => {
    let body;
    if(recepient === "" || amount === "") {
        alert("please enter valid details");
        return;
    }

    // create transaction body
    if(enterPrivateKey) {
        const privateKey = document.getElementById("pvt-key-value").value;
        if(privateKey === "") {
            alert("private key can't be empty");
            return;
        }
        body = sign(privateKey, txnString);
    } else {
        const r = document.getElementById("r-value").value;
        const s = document.getElementById("s-value").value;
        if(r === "" || s === "") {
            alert("r & s can't be empty");
            return;
        }
        const signature = {
            r,
            s
        }
        body = JSON.stringify({
            txnString,
            signature
        });
    }

    // send request to server
    const request = new Request(`${server}/send`, { method: 'POST', body });
    fetch(request, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(({ balance }) => {
        accountBalance.textContent = "Balance: " + balance;
    })
    .catch(error => {
        alert("invalid values");
    });

    // reset fields
    sendAmount.value = "";
    recepientAddress.value = "";
    recepient = "";
    amount = "";
    txnString = JSON.stringify({
        sender, amount, recepient
    });
    txnStringComponent.textContent = "Copy Txn String: " + txnString;
    pvtKeyField.value = "";
});