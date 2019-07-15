

'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;
const commUtils = require('../../comm/util');
const request = require('request-promise');
const commLogger = commUtils.getLogger('fisco-api.js');
const web3sync = require('./web3lib/web3sync');
let flag = 0;

/**
 *
 * @returns {Promise<void>}
 */
module.exports.sendRawTransaction = async function (host, account, privateKey, to, func, params) {
    let signTX = web3sync.getSignTX(account, privateKey, to, func, params, 1000);
    return request({
        method: 'POST',
        uri: host,
        json: true,
        body: { 'jsonrpc': '2.0', 'method': 'sendRawTransaction', 'params': [1, signTX], 'id': 1 }
    });
};

/**
 *
 * @returns {Promise<void>}
 */
module.exports.call = async function (host, account, to, func, params) {
    let txData = web3sync.getTxData(func, params);
    return request({
        method: 'POST',
        uri: host,
        json: true,
        body: { 'jsonrpc': '2.0', 'method': 'call', 'params': [1, { 'from': account, 'to': to, 'value': '0x0', 'data': txData }], 'id': 1 }
    });
};

/**
 * 强制等待
 * @param {Number} ms 等待时常
 * @returns {Promise<*>} 无用返回
 */
async function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.deploy = async function (host, account, privateKey, path, name) {
    let pathName = path + name;
    try{
        //用FISCO-BCOS的合约编译器fisco-solc进行编译
        execSync('fisco-solc --overwrite --abi --bin -o ' + path + ' ' + pathName + '.sol');
        commLogger.info(`${pathName} complie success！`);
    } catch(e){
        commLogger.error(`${pathName} complie failed! ${e}`);
    }

    let bin = fs.readFileSync(pathName + '.bin','utf-8');
    let signTX = web3sync.getDeploySignTX(account, privateKey, bin, 1000);
    commLogger.info(`Deploy sign tx: ${signTX}`);
    let res = await request({
        method: 'POST',
        uri: host,
        json: true,
        body: { 'jsonrpc': '2.0', 'method': 'sendRawTransaction', 'params': [1, signTX], 'id': 1 }
    });
    commLogger.info('Deploy tx resp: '+JSON.stringify(res));
    commLogger.info('Send deploy tx success. Wait 10 seconds for deploying.');
    await sleep(10000);
    if (typeof res.result === 'undefined') {
        fs.writeFileSync(pathName + '.address', '0x0000000000000000000000000000000000000000', 'utf-8');
    } else {
        let grt = await request({
            method: 'POST',
            uri: host,
            json: true,
            body: { 'jsonrpc': '2.0', 'method': 'getTransactionReceipt', 'params': [1, res.result], 'id': 1 }
        });
        if (typeof grt.contractAddress !== 'undefined') {
            fs.writeFileSync(pathName + '.address', grt.contractAddress, 'utf-8');
        } else {
            fs.writeFileSync(pathName + '.address', '0x0000000000000000000000000000000000000000', 'utf-8');
        }
        commLogger.info('Get receipt resp: '+JSON.stringify(grt));
    }
};
