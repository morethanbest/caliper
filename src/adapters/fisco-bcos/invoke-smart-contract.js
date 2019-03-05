
'use strict';

const commUtils = require('../../comm/util');
const commLogger = commUtils.getLogger ('install-smart-contact.js');
const web3sync = require('./web3lib/web3sync');
const fs = require('fs');
const TxStatus  = require('../../comm/transaction');


module.exports.submitTransaction = async function (fiscoSettings, contractID, args, timeout) {
    const TxErrorEnum = require('./constant.js').TxErrorEnum;
    const TxErrorIndex = require('./constant.js').TxErrorIndex;
    const config = fiscoSettings.config;
    let smartContracts = fiscoSettings.smartContracts;
    let smartContract;
    if(typeof smartContracts === 'undefined' || smartContracts.length === 0) {
        return;
    }
    for (let sc of smartContracts) {
        if (sc.id === contractID) {
            smartContract = sc;
        }
    }
    if (typeof smartContract === 'undefined') {
        commLogger.error(`Invoked smart contract failed. Smart contract ID ${contractID} undefined.`);
        return;
    }
    const func = args[0];
    args.shift();
    // timestamps are recorded for every phase regardless of success/failure
    let invokeStatus = new TxStatus(config.account);
    let errFlag = TxErrorEnum.NoError;
    invokeStatus.SetFlag(errFlag);
    let address = fs.readFileSync(smartContract.path + smartContract.name + '.address', 'utf-8');
    let receipt = null;
    try {
        receipt = await web3sync.sendRawTransaction(config.account, config.privateKey, address, func, args);
        invokeStatus.SetID(receipt.transactionHash);
        invokeStatus.SetResult(receipt);
        commLogger.info(`transaction hash ：${receipt.transactionHash}`);
    } catch (err) {
        commLogger.error(`Failed to install smart contracts: ${(err.stack ? err.stack : err)}`);
        errFlag |= TxErrorEnum.SandRawTransactionError;
        invokeStatus.SetFlag(errFlag);
        invokeStatus.SetErrMsg(TxErrorIndex.SandRawTransactionError, err.toString());
        invokeStatus.SetResult(receipt);
        invokeStatus.SetVerification(true);
        throw err;
    }
    return invokeStatus;
};
