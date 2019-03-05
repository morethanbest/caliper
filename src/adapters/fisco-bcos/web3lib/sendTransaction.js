/**
 * @file: sendTransaction.js
 * @author: fisco-dev
 *
 * @date: 2017
 */

let fs = require('fs');
let Web3 = require('web3');
let  net = require('net');
let conf = require('./config');

//init web3
let web3 = new Web3();
let client = new net.Socket();
web3.setProvider(new web3.providers.IpcProvider(conf.ipc_path,client));

//sendTransaction
function sendTransaction()
{
    let postdata = {
        data: params_data,
        from: conf.account,
        to:conf.contract_addr,
        value:params_value,
        gas: 1000000
    };
    //发送交易
    web3.eth.sendTransaction(postdata, function(err, address) {
        if (!err)
        {
		    logger.debug(tx_id + ' | send transaction success！|', address);
            process.exit();
            return;
        }
        else
        {
		    logger.debug(tx_id + '|send transaction failed！', err);
            process.exit();
            return;
        }
    });
}

function callContract()
{
    let test_params = '';
    //调用合约
    let abi_obj = conf.abi_arr;
    let args = test_params;
    console.log(' |args : ' + args);
    if( typeof(abi_obj) === 'string' || Object.prototype.toString.call(abi_obj) === '[object String]')
    {
        abi_obj = JSON.parse(abi_obj);
    }
    if( typeof(args) === 'string' || Object.prototype.toString.call(args) === '[object String]')
    {
        args = JSON.parse(args);
    }
    console.log(typeof(abi_obj) + ' | ' + Object.prototype.toString.call(abi_obj));
    console.log(typeof(args) + ' | ' + Object.prototype.toString.call(args));
    if(typeof(abi_obj) !== 'object' || Object.prototype.toString.call(abi_obj) !== '[object Array]' || typeof(args) !== 'object' || Object.prototype.toString.call(args) !== '[object Array]')
    {
        console.log('invalid format！ abi_obj : ' + JSON.stringify(abi_obj) +' | args : ' + JSON.stringify(args));
        process.exit();
        return;
    }
    else
    {
        console.log(' |args : ' + args + ' | ' + JSON.stringify(args));
        let breaked = false;
        let abi_obj_size = abi_obj.length;
        abi_obj.forEach(function (obj,index)
        {
            if(breaked) {return;}
            console.log('obj : ' + JSON.stringify(obj) + ' | ' + abi_obj_size + ' | ' + index);
            if(obj.constant !== undefined && obj.name !== undefined && obj.name === fun)
            {
                console.log('call fun : ' + obj.name);
                try{
                    // creation of contract object
                    let MyContract = web3.eth.contract(abi_obj);
                    // initiate contract for an address
                    if( conf.contract_addr === '' || conf.contract_addr === undefined)
                    {
                        console.log('invalid contract address！');
                        process.exit();
                        return;
                    }
                    let myContractInstance = MyContract.at(conf.contract_addr);
                    let f = myContractInstance[fun];
                    if(obj.constant)
                    {
                        console.log(fun+' is a constant function, we should call it.');
                        if(typeof(f) === 'function')
                        {
                            try
                            {
                                var call_param = args;
                                function call_back(err,ret_data){
                                    console.log('err : ' + err + ' | ret_data : ' + JSON.stringify(ret_data));
                                    if( !err )
                                    {
                                        console.log(f + ' result : ' + JSON.stringify(ret_data));
                                        process.exit();
                                        return;
                                    }
                                    else
                                    {
                                        console.log(' contract call failture!');
                                        process.exit();
                                        return;
                                    }
                                }
                                call_param.push(call_back);
                                console.log('f:'+f + ' | args : ' + JSON.stringify(call_param));
                                f.apply(myContractInstance, call_param);
                            }
                            catch(e)
                            {
                                console.log('exception:'+e.message);
                                process.exit();
                                return;
                            }
                        }
                        else
                        {
                            console.log(f + ' is not function of contract！');
                            process.exit();
                            return;
                        }
                    }
                    else
                    {
                        console.log(fun+' is not a constant function, we should send a Transaction.');
                        if(typeof(f) === 'function')
                        {
                            try
                            {
                                var call_param = args;
                                let fromparam = {
                                    from:conf.account,
                                    gas:100000000
                                };
                                //gas: 1000000000
                                call_param.push(fromparam);
                                function call_back(err,ret_data)
                                {
                                    console.log('err : ' + err + ' | ret_data : ' + JSON.stringify(ret_data));
                                    if( !err )
                                    {
                                        console.log(f + ' result : ' + JSON.stringify(ret_data));
                                        process.exit();
                                        return;
                                    }
                                    else
                                    {
                                        console.log('contract call failture！');
                                        process.exit();
                                        return;
                                    }
                                }
                                call_param.push(call_back);
                                console.log('call_param : ' + JSON.stringify(call_param));
                                f.apply(myContractInstance, call_param);
                            }
                            catch(e)
                            {
							    console.log('contract call failture！ | exception:', e);
                                process.exit();
                                return;
                            }
                        }
                        else
                        {
						    console.log('the contract has no member of this function！' + fun);
                            process.exit();
                            return;
                        }
                    }
                    breaked = true;
                }
                catch(ex)
                {
                    console.log('exception:',ex);
                    process.exit();
                    return;
                }
            }
            if( parseInt(abi_obj_size) === (parseInt(index)+1) && !breaked )
            {
                console.log('the contract has no member of this function！' + fun);
                process.exit();
                return;
            }
        });
    }
}
