const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

export default sign = (privateKey, txnString) => {
    const ec = new EC('secp256k1');
    const key = ec.keyFromPrivate(privateKey);

    const txnHash = SHA256(txnString);

    const signature = key.sign(txnHash.toString());

    return JSON.stringify({
        txnString,
        signature: {
            r: signature.r.toString(16),
            s: signature.s.toString(16)
        }
    });
}