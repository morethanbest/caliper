



'use strict';

const BlockchainInterface = require('../../comm/blockchain-interface.js');
const commUtils = require('../../comm/util');
const impl_install = require('./install-smart-contract.js');
const impl_invoke = require('./invoke-smart-contract.js');
const commLogger = commUtils.getLogger('fisco-bcos.js');
const web3sync = require('./web3lib/web3sync');
const TxStatus  = require('../../comm/transaction');

/**
 * FiscoBCOS class, which implements the caliper's NBI for fisco-bcos 1.3
 */
class FiscoBCOS extends BlockchainInterface {
    /**
     * Constructor
     * @param {String} config_path path of the fisco-bcos configuration file
     */
    constructor(config_path) {
        super(config_path);
    }

    /**
     * Initialize the {Fisco} object.
     * init web3
     */
    init() {
        // todo: Fisco
        const fiscoSettings = commUtils.parseYaml(this.configPath).fiscoBCOS;
        const config = fiscoSettings.config;
        web3sync.setWeb3(config.proxy);
    }

    /**
     * Deploy the smart contract specified in the network configuration file to all peers.
     * Not supported now
     * {Promise} The return promise.
     */
    async installSmartContract() {
        // todo: now all smart contracts are installed and instantiated in all peers, should extend this later
        try {
            await impl_install.run(this.configPath);
        } catch (err) {
            commLogger.error(`fisco-bcos smart contracts install failed: ${(err.stack ? err.stack : err)}`);
            throw err;
        }
    }

    /**
     * Return the fisco-bcos context associated with the given callback module name.
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
     * Invoke the given smart contract according to the specified options. Multiple transactions will be generated according to the length of args.
     * @param {object} context The Fabric context returned by {getContext}.
     * @param {string} contractID The name of the smart contract.
     * @param {string} contractVer The version of the smart contract.
     * @param {Array} args Array of JSON formatted arguments for transaction(s). Each element contains arguments (including the function name) passing to the smart contract. JSON attribute named transaction_type is used by default to specify the function name. If the attribute does not exist, the first attribute will be used as the function name.
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
                    promises.push(impl_invoke.submitTransaction(context, fiscoSettings, contractID, simpleArgs, timeout));
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
    /**
     * Query the given smart contract according to the specified options.
     * @param {object} context The Fabric context returned by {getContext}.
     * @param {string} contractID The name of the smart contract.
     * @param {string} contractVer The version of the smart contract.
     * @param {string} key The argument to pass to the smart contract query.
     * @param {string} fcn The smart contract query function name.
     * @return {Promise<object>} The promise for the result of the execution.
     */
    async queryState(context, contractID, contractVer, key, fcn) {
        // TODO: change string key to general object
        const fiscoSettings = commUtils.parseYaml(this.configPath).fiscoBCOS;
        let simpleArgs = [];
        let func;
        try {
            for(let key in fcn) {
                if(key === 'query_type') {
                    func = fcn[key].toString();
                }
                else {
                    simpleArgs.push(fcn[key].toString());
                }
            }
            if(func) {
                simpleArgs.splice(0, 0, func);
            }
        }
        catch(err) {
            commLogger.error(err);
            let badResult = new TxStatus('artifact');
            badResult.SetStatusFail();
            return badResult;
        }
        return await impl_invoke.submitQuery(context, fiscoSettings, contractID, simpleArgs);
    }

}

module.exports = FiscoBCOS;
