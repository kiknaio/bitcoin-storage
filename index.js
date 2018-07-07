const { generateRawTx, generateAddress, opReturn } = require('./wallets');

const privkey = {
  "address" : "mtfhz7tR35mBu93RftzarFFUaR2Wh1HijT",
  "bn" : "4c11fe9882848abc6f256d0a76c7748c429ad063f29869f47d29cdc9f9593776",
  "compressed" : true,
  "network" : "testnet"
};

// generateRawTx('n2cTWE8fReHtXn7fbFk9dfZG9x6DWhdFBG', privkey, 100, 'mtfhz7tR35mBu93RftzarFFUaR2Wh1HijT');

opReturn("Start of new era");