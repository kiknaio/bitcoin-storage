const axios = require('axios');
const { PrivateKey, Networks, PublicKey, Address, Transaction } = require('bitcore-lib');
const fs = require('fs');
const boxen = require('boxen');
const qrcode = require('qrcode-terminal');
const { savePrivateKey } = require('./db');

exports.generatePrivateKey = livenet => {
  return new PrivateKey(
    livenet ? Networks.livenet : Networks.testnet
  );
}

exports.generateAddress = (file, { qrcode: wantsQrcode }) => {
  fs.readFile(file, 'utf8', (err, key) => {
    if (err) throw new Error(err);
    const address = PrivateKey.fromObject(JSON.parse(key)).toAddress();
    const network = address.toObject().network;
    console.log(boxen(`Address: ${address.toString()} - ${network}`, {padding: 1}));
    if (wantsQrcode) qrcode.generate(address.toString());
  })
}

exports.checkAddressBalance = async (address, { livenet }) => {
  console.log(`https://${livenet ? '' : 'testnet.'}blockexplorer.com/api/addr/${address}/balance`)
  const balance = await axios.get(`https://${livenet ? '' : 'testnet.'}blockexplorer.com/api/addr/${address}/balance`);
  console.log(boxen(`BTC ${balance.data / 100000000}`, { padding: 1 }));
}

exports.generateRawTx = async (receiver, privateKey, amount, changeAddress) => {
  // Create UTXO
  const UnspentOutput = Transaction.UnspentOutput;
  let utxos = await axios.get('https://testnet.blockexplorer.com/api/addr/mtfhz7tR35mBu93RftzarFFUaR2Wh1HijT/utxo');
  utxos = new UnspentOutput(utxos.data[0]);

  privateKey = new PrivateKey.fromObject(privateKey, Networks.testnet);
  console.log(new Address(new PublicKey(privateKey)), Networks.testnet);
  // Create Transaction
  const transaction = new Transaction()
    .from(utxos)
    .to(receiver, 100)
    .change(changeAddress)
    .sign(privateKey)
    .fee(550)
  
  console.log(transaction);
}

exports.broadcastTransaction = rawtx => {
  axios.post(`https://testnet.blockexplorer.com/api/tx/send`, { rawtx })
    .then(res => console.log(res.data.txid))
    .catch(error => console.error(error));
}

exports.opReturn = async text => {
  let utxo = await axios.get('https://testnet.blockexplorer.com/api/addr/mxTq9fUWhgYTyr7t7H3yrEYgaknxtcNxpW/utxo');
  utxo = new Transaction.UnspentOutput(utxo.data[0]);

  const key = PrivateKey.fromObject({
    "address" : "mxTq9fUWhgYTyr7t7H3yrEYgaknxtcNxpW",
    "bn" : "1c7ffbe9477d351771fdb6980317a444714464acd5cabeb1c850b67de9c34dda",
    "compressed" : true,
    "network" : "testnet"
  });
  var transaction = new Transaction()
    .from(utxo)
    .addData(text) // Add OP_RETURN data
    .change('mxTq9fUWhgYTyr7t7H3yrEYgaknxtcNxpW')
    .sign(key)
    .toString();
  
  await this.broadcastTransaction(transaction);
  console.log('Transaction Broadcasted')
}