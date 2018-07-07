#!/usr/bin/env node
const program = require('commander');
const bitcore = require('bitcore-lib');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const wallets = require('./wallets');

const generatePrivateKey = () => {
  return new bitcore.PrivateKey();
}

program
  .version('0.1.0')
  .option('-p, --privatekey', 'Generate new Private Key')
  .option('-a, --address', 'Display address')
  .option('-q, --qrcode', 'Generate address QR code')
  .parse(process.argv);

let privKey;

if (program.qrcode) qrcode.generate('Some random text')
if (program.privatekey) {
  const key = generatePrivateKey().toObject();
  const randomHash = crypto.createHash('sha256')
    .update((new Date()).valueOf().toString() + Math.random().toString).digest('hex');
  fs.writeFile(path.join(__dirname, `./keychain/${randomHash}.json`), JSON.stringify(key), 'utf8', (err, done) => {
    if(err) throw new Error(err);
    privKey = `${randomHas}.key`;
    console.log(`Created new File ${randomHash}.json`);
  })
}

if (program.address) {
  fs.readFile(path.join(__dirname, `./keychain/${[privKey]}`), (error, file) => {
    if (error) throw new Error(error);
    console.log(JSON.parse(file))
  })
}

// Generate Private Keys
  // Save key
  // display address from private key
