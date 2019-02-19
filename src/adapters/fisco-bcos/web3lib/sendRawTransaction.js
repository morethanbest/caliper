/**
 * @file: sendRawTransaction.js
 * @author: fisco-dev
 *
 * @date: 2017
 */

let fs = require('fs');
let Web3 = require('web3');
let  net = require('net');
let conf = require('./config');
let txm = require('./transactionManager');
let coder = require('./codeUtils');

//init web3
let web3 = new Web3();
let client = new net.Socket();
web3.setProvider(new web3.providers.IpcProvider(conf.ipc_path,client));

//sendRawTransaction
function sendRawTransaction()
{
    web3.eth.getBlockNumber(function(e,d){
        console.log(e+','+d);
        let blocknumber=d+100;

        let call_fun='add(uint256)';
        let types=['uint256'];
        let params=['15'];
        let tx_data = coder.codeTxData(call_fun,types,params);

        console.log('account:'+conf.account);

        let postdata = {
            data: tx_data,
            from: conf.account,
            to:conf.contract_addr,
            gas: 1000000,
            randomid:Math.ceil(Math.random()*100000000),
            blockLimit:blocknumber
        };

        let signTX = txm.signTransaction(postdata,conf.privKey,null);
        console.log('signTX : ',signTX);
        web3.eth.sendRawTransaction(signTX, function(err, address) {
            console.log(err,address);
            if (!err)
            {
                console.log('send transaction success !|',address);
                process.exit();
                return;
            }
            else
            {
			    console.log('send transaction failed ！', err);
                process.exit();
                return;
            }
        });


    });


}


sendRawTransaction();