
'use strict';

module.exports.info  = 'transfer to next account';
let txnPerBatch;
let transferMoney;
let accountCount = 0;
let bc, contx;
module.exports.init = function(blockchain, context, args) {
    if(!args.hasOwnProperty('txnPerBatch')) {
        args.txnPerBatch = 1;
    }
    txnPerBatch = args.txnPerBatch;
    transferMoney = args.money;
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

/**
 * Generates simple workload
 * @returns {Object} array of json objects
 */
function generateWorkload() {
    let workload = [];
    for(let i = 0; i < txnPerBatch; i++) {
        let acc = {
            'transaction_type': 'sendPayment(string,string,uint256)',
            'from': 'account-' + process.pid.toString() + accountCount.toString(),
            'to': 'account-' + process.pid.toString() + (++accountCount).toString(),
            'money': transferMoney--
        };
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

