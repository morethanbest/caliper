
'use strict';

const commUtils = require('../../comm/util');
const commLogger = commUtils.getLogger ('invoke-smart-contact.js');
const fs = require('fs');
const TxStatus  = require('../../comm/transaction');
const api = require('./fisco-api');


module.exports.submitTransaction = async function (context, fiscoSettings, contractID, args, timeout) {
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
        if(context.engine) {
            context.engine.submitCallback(1);
        }
        for(let arg in args){
            commLogger.info(`arg ${args[arg]}`);
        }
        receipt = await api.sendRawTransaction(config.proxy, config.account, config.privateKey, address, func, args);
        commLogger.info(`contract return ${JSON.stringify(receipt)}`);
        if(typeof receipt.error === 'undefined') {
            invokeStatus.SetID(receipt.transactionHash);
            invokeStatus.SetResult(receipt);
            invokeStatus.SetVerification(true);
            invokeStatus.SetStatusSuccess();
        } else {
            let err = receipt.error;
            invokeStatus.SetID('artifact');
            invokeStatus.SetResult(receipt);
            invokeStatus.SetVerification(true);
            invokeStatus.SetStatusFail();
            commLogger.error(`Failed to invoke smart contracts: ${(err.stack ? err.stack : err)}`);
        }
    } catch (err) {
        commLogger.error(`Failed to invoke smart contracts: ${(err.stack ? err.stack : err)}`);
        errFlag |= TxErrorEnum.SandRawTransactionError;
        invokeStatus.SetFlag(errFlag);
        invokeStatus.SetErrMsg(TxErrorIndex.SandRawTransactionError, err.toString());
        invokeStatus.SetResult(receipt);
        invokeStatus.SetVerification(true);
        invokeStatus.SetStatusFail();
        throw err;
    }
    return invokeStatus;
};

module.exports.submitQuery = async function(context, fiscoSettings, contractID, args){
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
        commLogger.error(`Query smart contract failed. Smart contract ID ${contractID} undefined.`);
        return;
    }
    // const func = args;
    const func = args[0];
    args.shift();
    for(let arg in args){
        commLogger.info(`arg ${args[arg]}`);
    }
    // timestamps are recorded for every phase regardless of success/failure
    let invokeStatus = new TxStatus(config.account);
    let errFlag = TxErrorEnum.NoError;
    invokeStatus.SetFlag(errFlag);
    let address = fs.readFileSync(smartContract.path + smartContract.name + '.address', 'utf-8');
    let receipt = null;
    try {
        if(context.engine) {
            context.engine.submitCallback(1);
        }
        for(let arg in args){
            commLogger.info(`arg ${args[arg]}`);
        }
        receipt = await api.call(config.proxy, config.account, address, func, args);
        commLogger.info(`contract return ${JSON.stringify(receipt)}`);
        if(typeof receipt.error === 'undefined') {
            invokeStatus.SetID(receipt.transactionHash);
            invokeStatus.SetResult(receipt);
            invokeStatus.SetVerification(true);
            invokeStatus.SetStatusSuccess();
        } else {
            let err = receipt.error;
            invokeStatus.SetID('artifact');
            invokeStatus.SetResult(receipt);
            invokeStatus.SetVerification(true);
            invokeStatus.SetStatusFail();
            commLogger.error(`Failed to query smart contracts: ${(err.stack ? err.stack : err)}`);
        }
    } catch (err) {
        commLogger.error(`Failed to query smart contracts: ${(err.stack ? err.stack : err)}`);
        errFlag |= TxErrorEnum.SandRawTransactionError;
        invokeStatus.SetFlag(errFlag);
        invokeStatus.SetErrMsg(TxErrorIndex.CallError, err.toString());
        invokeStatus.SetResult(receipt);
        invokeStatus.SetVerification(true);
        invokeStatus.SetStatusFail();
        throw err;
    }
    return invokeStatus;
};
