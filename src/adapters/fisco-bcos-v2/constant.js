'use strict';

const TxErrorEnum = {
    NoError: 0,
    SandRawTransactionError: 1,
    CallError: 2,

};

const TxErrorIndex = {
    SandRawTransactionError: 0,
    CallError: 1,

};

module.exports = {
    TxErrorIndex: TxErrorIndex,
    TxErrorEnum: TxErrorEnum
};
