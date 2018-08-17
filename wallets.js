const axios = require('axios');
const { PrivateKey, Networks, PublicKey, Address, Transaction } = require('bitcore-lib');
const fs = require('fs');
const boxen = require('boxen');
const qrcode = require('qrcode-terminal');
const Confirm = require('prompt-confirm');
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

exports.broadcastTransaction = async (privatekey, content, { livenet }) => {
  // Read the private key file
  const key = PrivateKey.fromObject(JSON.parse(fs.readFileSync(privatekey, 'utf8')));
  const network = key.network === 'testnet' ? Networks.testnet : Networks.livenet;

  // Fetch UTXOs
  let {data: [utxos]} = await axios.get(`https://${livenet ? '' : 'testnet.'}blockexplorer.com/api/addr/${key.toAddress().toString()}/utxo`);
  utxos = new Transaction.UnspentOutput(utxos);

  // Fee for transaction
  // let transactionFee;
  // if (!livenet) {
  //   transactionFee = await axios.get('https://bitcoinfees.earn.com/api/v1/fees/recommended')
  //   transactionFee = transactionFee.data.hourFee;
  // } else {
  //   transactionFee = 500;
  // }
  // console.log(transactionFee);
  
  // Create RawTx
  const rawtx = await new Transaction()
    .from(utxos)
    .addData(content)
    .change(key.toAddress().toString())
    .sign(key)
    .toString()

  
  const prompt = new Confirm('Confirm the transaction?');
  prompt.ask(answer => {
    if(answer) {
      // Broadcast transaction
      axios.post(`https://testnet.blockexplorer.com/api/tx/send`, { rawtx })
        .then(res => console.log(`https://www.blocktrail.com/tBTC/tx/${res.data.txid}`))
        .catch(error => console.error(error.response.data));
    }
  });
