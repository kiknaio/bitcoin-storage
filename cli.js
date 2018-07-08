#!/usr/bin/env node --no-deprecation
const program = require('commander');
const bitcore = require('bitcore-lib');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const boxen = require('boxen');
const wallets = require('./wallets');

program
  .version('0.1.0')
  .option('-l, --livenet', 'for Livenet. Default is Testnet')
  .option('-q, --qrcode', 'generate address QR code')
  .option('-a, --address', 'display address')

// Generate Private Key
program
  .command('privatekey')
  .description('generate Bitcoin private key')
  .action(() => {

    // Generate private key
    const key = wallets.generatePrivateKey(program.livenet);

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
  });

// Generate addres from private key file
program
  .command('address <file>')
  .description('generate address from private key file')
  .action(file => {
    // Read private key
    wallets.generateAddress(file, program);
  });

program
  .command('balance <address>')
  .description('check address balance')
  .action(address => {
    try {
      wallets.checkAddressBalance(address, program);
    } catch (e) { 
      throw new Error(e);
    }
  })

program
  .command('save <privatekey> <content>')
  .description('Save <content> to Bitcoin\'s Blockchain')
  .action((privatekey, content) => {
    wallets.broadcastTransaction(privatekey, content, program);
  })

program.parse(process.argv);