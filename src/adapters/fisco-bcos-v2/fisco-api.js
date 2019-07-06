

'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;
const commUtils = require('../../comm/util');
const request = require('request-promise');
const commLogger = commUtils.getLogger('fisco-api.js');
const web3sync = require('./web3lib/web3sync');
let intervalObj;

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
    let res = request({
        method: 'POST',
        uri: host,
        json: true,
        body: { 'jsonrpc': '2.0', 'method': 'sendRawTransaction', 'params': [1, signTX], 'id': 1 }
    }, function (error, response, body) {
        commLogger.info('deploy tx'+JSON.stringify(body));
        if (!error && response.statusCode === 200) {
            intervalObj = setInterval(() => {
                request({
                    method: 'POST',
                    uri: host,
                    json: true,
                    body: { 'jsonrpc': '2.0', 'method': 'getTransactionReceipt', 'params': [1, body.transactionHash], 'id': 1 }
                }, function (error, response, body) {
                    commLogger.info('query tx' + JSON.stringify(body));
                    if (typeof body.contractAddress !== 'undefined') {
                        commLogger.info(pathName+'contract address '+ body.contractAddress);
                        fs.writeFileSync(pathName+'.address', body.contractAddress, 'utf-8');
                        clearInterval(intervalObj);
                    }
                });
            }, 500);
        }
    });

};
