
'use strict';

const commUtils = require('../../comm/util');
const commLogger = commUtils.getLogger('install-smart-contact.js');
const api = require('./fisco-api');

module.exports.run = async function (config_path) {
    const fiscoSettings = commUtils.parseYaml(config_path).fiscoBCOS;
    const config = fiscoSettings.config;
    let smartContracts = fiscoSettings.smartContracts;
    if(typeof smartContracts === 'undefined' || smartContracts.length === 0) {
        return;
    }
    // web3sync.setWeb3(config.proxy);
    commLogger.info('Installing smart contracts...');
    try {
        for (let smartContract of smartContracts) {
            await api.deploy(config.proxy, config.account, config.privateKey,  smartContract.path, smartContract.name);
            commLogger.info(`Installed smart contract ${smartContract.id} successfully in all peers`);
        }
    } catch (err) {
        commLogger.error(`Failed to install smart contracts: ${(err.stack ? err.stack : err)}`);
        throw err;
    }
};
