



'use strict';

const BlockchainInterface = require('../../comm/blockchain-interface.js');
const commUtils = require('../../comm/util');
const impl_install = require('./install-smart-contract.js');
const impl_invoke = require('./invoke-smart-contract.js');
const commLogger = commUtils.getLogger('fisco-bcos.js');
const web3sync = require('./web3lib/web3sync');
const TxStatus  = require('../../comm/transaction');

/**
 * Sawtooth class, which implements the caliper's NBI for hyperledger sawtooth lake
 */
class FiscoBCOS extends BlockchainInterface {
    /**
     * Constructor
     * @param {String} config_path path of the Sawtooth configuration file
     */
    constructor(config_path) {
        super(config_path);
    }

    /**
     * Initialize the {Fisco} object.
     * Nothing to do now
     */
    init() {
        // todo: Fisco
        const fiscoSettings = commUtils.parseYaml(this.configPath).fiscoBCOS;
        const config = fiscoSettings.config;
        web3sync.setWeb3(config.proxy);
    }

    /**
     * Deploy the chaincode specified in the network configuration file to all peers.
     * Not supported now
     * {Promise} The return promise.
     */
    async installSmartContract() {
        // todo: now all chaincodes are installed and instantiated in all peers, should extend this later
        try {
            await impl_install.run(this.configPath);
        } catch (err) {
            commLogger.error(`fisco-bcos smart contracts install failed: ${(err.stack ? err.stack : err)}`);
            throw err;
        }
    }

    /**
     * Return the Fabric context associated with the given callback module name.
     * @param {string} name The name of the callback module as defined in the configuration files.
     * @param {object} args unused.
     * @param {Integer} clientIdx The client index.
     * @return {object} The assembled Fabric context.
     * @async
     */
    async getContext(name, args, clientIdx) {
        const fiscoSettings = commUtils.parseYaml(this.configPath).fiscoBCOS;
        const config = fiscoSettings.config;
        web3sync.setWeb3(config.proxy);
        return Promise.resolve();
    }

    /**
     * Release the given Fabric context.
     * @param {object} context The Fabric context to release.
     * @async
     */
    async releaseContext(context) {
        await commUtils.sleep(1000);
    }

    /**
     * Invoke the given chaincode according to the specified options. Multiple transactions will be generated according to the length of args.
     * @param {object} context The Fabric context returned by {getContext}.
     * @param {string} contractID The name of the chaincode.
     * @param {string} contractVer The version of the chaincode.
     * @param {Array} args Array of JSON formatted arguments for transaction(s). Each element contains arguments (including the function name) passing to the chaincode. JSON attribute named transaction_type is used by default to specify the function name. If the attribute does not exist, the first attribute will be used as the function name.
     * @param {number} timeout The timeout to set for the execution in seconds.
     * @return {Promise<object>} The promise for the result of the execution.
     */
    async invokeSmartContract(context, contractID, contractVer, args, timeout) {
        const fiscoSettings = commUtils.parseYaml(this.configPath).fiscoBCOS;
        let promises = [];
        try {
            args.forEach((item, index)=>{
                try {
                    let simpleArgs = [];
                    let func;
                    for(let key in item) {
                        if(key === 'transaction_type') {
                            func = item[key].toString();
                        }
                        else {
                            simpleArgs.push(item[key].toString());
                        }
                    }
                    if(func) {
                        simpleArgs.splice(0, 0, func);
                    }
                    promises.push(impl_invoke.submitTransaction(fiscoSettings, contractID, simpleArgs, timeout));
                }
                catch(err) {
                    commLogger.error(err);
                    let badResult = new TxStatus('artifact');
                    badResult.SetStatusFail();
                    promises.push(Promise.resolve(badResult));
                }
            });
        } catch (err) {
            commLogger.error(`fisco-bcos smart contracts invoke failed: ${(err.stack ? err.stack : err)}`);
            throw err;
        }
        return await Promise.all(promises);
    }

}

module.exports = FiscoBCOS;
