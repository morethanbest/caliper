// 测试钱包
// 地址：0xdc41b70baf48275e8493817213ebe565a32a6503
// 私钥：e59ac4433e9d5675028a44ac3ca6bbbd81587059df0c41507c88bb5eaef43de6
// 证书：{"address":"dc41b70baf48275e8493817213ebe565a32a6503","crypto":{"cipher":"aes-128-ctr","ciphertext":"28101f30d8154c023bce84e3b435ecc6bfcd414ab5ece0b6155805aa642b4e0e","cipherparams":{"iv":"0f8c2f9b7a7735b23a453f86b22510f8"},"mac":"18fbfb4bbfc09c4e3943c310c360f95ce954c5f58cc572819b4a1db093bfde2f","kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"r":8,"p":1,"salt":"d29fa55564088a4ca46518cade1216a524212db182b67e0c685b855803adc74d"}},"id":"70db4b00-26a1-4046-8fe2-1b1e57d05d26","version":3}
// 密码：123

// 测试钱包
// 地址：0x633bb489d568b2241c6a0dfff6d847696aab642c
// 私钥：a1f013a3b4a9d7a509bb89543d9d72d6439a5611639667554dbf088615cec430
// 证书：{"address":"633bb489d568b2241c6a0dfff6d847696aab642c","crypto":{"cipher":"aes-128-ctr","ciphertext":"9cc16164076be025034c202e0b6d06d648410d12eea1f3adb30124207fce15ee","cipherparams":{"iv":"6b6b4df52dcfe738402bae494f49c01d"},"mac":"2a809ea7b3a5766b6cfa3e151571cae1189ee556b38780ab62acce44ec945bbd","kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"r":8,"p":1,"salt":"2d9674c7f9af31c9e7d2b92b0ccda7bd0911ad3ca42f7196f73fcc9fd1b0cf11"}},"id":"78925576-67eb-4b39-a61f-bab7fdd368d4","version":3}
// 密码：123

const fs = require('fs')
const execSync = require('child_process').execSync

const web3sync = require('./web3sync')
const BN = require('bn.js')
var request = require('request')

var account = '0x633bb489d568b2241c6a0dfff6d847696aab642c'
var privateKey = 'a1f013a3b4a9d7a509bb89543d9d72d6439a5611639667554dbf088615cec430'
var to = '0x0258986006bc3ea59d28e142695d71d3fe48e87a' //合约地址


//转账
// var func = 'transfer(address,uint256)'
// var params = ['0xdc41b70baf48275e8493817213ebe565a32a6503', 50000000000000000000]

// var signTX = web3sync.getSignTX(account, privateKey, to, func, params, 1000)
// console.log(signTX)

// request.post({
//     url: 'http://127.0.0.1:8545',
//     json: true,
//     body: { "jsonrpc": "2.0", "method": "sendRawTransaction", "params": [1, signTX], "id": 1 }
// }, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         console.log('[sendRawTransaction]:' + JSON.stringify(body))
//     }
// })


// //查询余额
var func = 'balanceOf(address)'
var params = ['0x633bb489d568b2241c6a0dfff6d847696aab642c']
var txData = web3sync.getTxData(func, params)
console.log(txData)

request.post({
    url: 'http://127.0.0.1:8545',
    json: true,
    body: { "jsonrpc": "2.0", "method": "call", "params": [1, { "from": account, "to": to, "value": "0x0", "data": txData }], "id": 1 }
}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var str = body.result.output
        var bn = new BN(str.substr(2), 'hex')
        console.log('[call]:' + bn.toString(10))
    }
})


//部署合约
// execSync('solc --bin -o D:\\temp\\ D:\\project\\BCOS\\ERC20.sol')
// var bin = fs.readFileSync('D:\\temp\\ERC20.bin', 'utf-8')

// var signTX = web3sync.getDeploySignTX(account, privateKey, bin, 1000)
// console.log(signTX)

// request.post({
//     url: 'http://127.0.0.1:8545',
//     json: true,
//     body: { "jsonrpc": "2.0", "method": "sendRawTransaction", "params": [1, signTX], "id": 1 }
// }, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         console.log('[sendRawTransaction]:' + JSON.stringify(body))
//     }
// })