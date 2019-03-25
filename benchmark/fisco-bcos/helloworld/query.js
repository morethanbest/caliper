/**
 * Copyright 2017 HUAWEI. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 */

'use strict';

module.exports.info  = 'querying name';


let bc, contx;
module.exports.init = function(blockchain, context, args) {
    bc       = blockchain;
    contx    = context;
    return Promise.resolve();
};

module.exports.run = function() {
    return bc.queryState(contx, 'helloworld', 'v0', 'get');
};

module.exports.end = function() {
    // do nothing
    return Promise.resolve();
};
