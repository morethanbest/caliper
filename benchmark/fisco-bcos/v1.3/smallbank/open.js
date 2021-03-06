
'use strict';

module.exports.info  = 'opening accounts';
let txnPerBatch;
let initMoney;
let accountCount = 0;
let bc, contx;
module.exports.init = function(blockchain, context, args) {
    if(!args.hasOwnProperty('txnPerBatch')) {
        args.txnPerBatch = 1;
    }
    initMoney = args.money;
    txnPerBatch = args.txnPerBatch;
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

/**
 * Generates smallbank workload
 * @returns {Object} array of json objects
 */
function generateWorkload() {
    let workload = [];
    for(let i = 0; i < txnPerBatch; i++) {
        let acc = {
            'transaction_type': 'createAccount(string,uint256)',
            'string': 'account-' + process.pid.toString() + accountCount.toString(),
            'money': initMoney
        };
        accountCount++;
        workload.push(acc);
    }
    return workload;
}

module.exports.run = function() {
    let args = generateWorkload();
    return bc.invokeSmartContract(contx, 'smallbank', 'v0', args, 100);
};

module.exports.end = function() {
    return Promise.resolve();
};

