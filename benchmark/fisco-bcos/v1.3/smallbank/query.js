
'use strict';

module.exports.info  = 'query balance';

let accountCount = 0;
let bc, contx;
module.exports.init = function(blockchain, context, args) {
    bc       = blockchain;
    contx    = context;
    return Promise.resolve();
};

/**
 * Generates smallbank workload
 * @returns {Object} array of json objects
 */
function generateWorkload() {
    let acc = {
        'query_type': 'getBalance',
        'string': 'account-' + process.pid.toString() + accountCount.toString(),
    };
    accountCount++;
    return acc;
}
module.exports.run = function() {
    let args = generateWorkload();
    return bc.queryState(contx, 'smallbank', 'v0', null, args);
};

module.exports.end = function() {
    // do nothing
    return Promise.resolve();
};
