



'use strict';

const BlockchainInterface = require('../../comm/blockchain-interface.js');
const commUtils = require('../../comm/util');
const impl_install = require('./install-smart-contract.js');
const commLogger = commUtils.getLogger('fisco-bcos.js');

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
     * @return {Promise} The return promise.
     */
    init() {
        // todo: Fisco
        return Promise.resolve();
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
            commLogger.error(`Fabric chaincode install failed: ${(err.stack ? err.stack : err)}`);
            throw err;
        }
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
        let promises = [];
        args.forEach((item, index)=>{
            // try {
            //     let simpleArgs = [];
            //     let func;
            //     for(let key in item) {
            //         if(key === 'transaction_type') {
            //             func = item[key].toString();
            //         }
            //         else {
            //             simpleArgs.push(item[key].toString());
            //         }
            //     }
            //     if(func) {
            //         simpleArgs.splice(0, 0, func);
            //     }
            //     promises.push(e2eUtils.invokebycontext(context, contractID, contractVer, simpleArgs, timeout));
            // }
            // catch(err) {
            //     commLogger.error(err);
            //     let badResult = new TxStatus('artifact');
            //     badResult.SetStatusFail();
            //     promises.push(Promise.resolve(badResult));
            // }
        });
        return await Promise.all(promises);
    }

}

module.exports = FiscoBCOS;
