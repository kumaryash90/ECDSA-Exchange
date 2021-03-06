const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

function verify(publicX, publicY, txnString, signature) {
    const ec = new EC('secp256k1');
    const publicKey = {
        x: publicX,
        y: publicY
    }
    console.log("public key: ", publicKey);
    const key = ec.keyFromPublic(publicKey, 'hex');
    const txnHash = SHA256(txnString).toString();
    const sign = {
        r: signature.r,
        s: signature.s
    }
    console.log("signature: ", sign);
    return key.verify(txnHash, sign);
}

module.exports = {
    verify
};
