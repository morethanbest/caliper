/**
 * @file: transactionManager.js
 * @author: fisco-dev
 *
 * @date: 2017
 */

let Tx = require('./transactionObject.js');

function signTransaction(tx_data,privKey,callback)
{
    // convert string private key to a Buffer Object
    let privateKey = new Buffer(privKey, 'hex');
    let tx = new Tx.Transaction(tx_data);
    tx.sign(privateKey);
    // Build a serialized hex version of the Tx
    let serializedTx = '0x' + tx.serialize().toString('hex');
    if( callback !== null)
    {
    	callback(serializedTx);
    	return ;
    }
    else
    {
    	return serializedTx;
    }
}

exports.signTransaction=signTransaction;