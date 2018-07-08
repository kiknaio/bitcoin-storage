#!/usr/bin/env node --no-deprecation
const program = require('commander');
const bitcore = require('bitcore-lib');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const boxen = require('boxen');
const wallets = require('./wallets');

const generatePrivateKey = livenet => {
  return new bitcore.PrivateKey(
    livenet ? bitcore.Networks.livenet : bitcore.Networks.testnet
  );
}

program
  .version('0.1.0')
  .option('-l, --livenet', 'For Livenet. Default is Testnet')
  .option('-q, --qrcode', 'Generate address QR code')
  .option('-a, --address', 'Display address')

// Generate Private Key
program
  .command('privatekey')
  .description('Generate Bitcoin private key')
  .action(() => {

    // Generate private key
    const key = generatePrivateKey(program.livenet);

    // Display (-a) Address
    if (program.address) {
      console.log(boxen(`Address: ${key.toAddress().toString()} - ${program.livenet ? 'Livenet' : 'Testnet'}`, {padding: 1}));
    }
    // Display (-q) QR code for address
    if (program.qrcode) {
      qrcode.generate(key.toAddress().toString());
    }

    // Generate random hash for private key file
    const randomHash = crypto.createHash('sha256')
      .update((new Date()).valueOf().toString() + Math.random().toString).digest('hex');

    // Save private key as a file
    fs.writeFile(path.resolve(__dirname, `./keychain/${randomHash}.json`), JSON.stringify(key.toObject()), 'utf8', (err, done) => {
      if(err) throw new Error(err);
      console.log(`➜ Created new File ./keychain/${randomHash}.json for ${program.livenet ? 'Livenet' : 'Testnet'}`);
    });
  })

program.parse(process.argv);