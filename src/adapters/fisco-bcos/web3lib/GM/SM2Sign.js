let sm2 = require('./sm_sm2');
let sm3 = require('./sm_sm3');

function signRS(ecprvhex,msg){
    let keyPair = sm2.SM2KeyPair(null,ecprvhex);
    let pubKeyHex = keyPair.pub.getX().toString(16)+keyPair.pub.getY().toString(16);
    let _msg = Array.from(msg);

    let signData= keyPair.sign(_msg);
    //console.log("pubKeyHexLen:",pubKeyHex.length," pubKeyHex:",pubKeyHex);
    //console.log("sign.R:",signData.r," rLen:",signData.r.length," sLen:",signData.s.length," sign.S:",signData.s);

    let rHex = '000000000000000000000' + signData.r;
    let sHex = '000000000000000000000' + signData.s;
    let rHexLen = rHex.length - 64;
    let sHexLen = sHex.length - 64;
    rHex = rHex.substr(rHexLen,64);
    sHex = sHex.substr(sHexLen,64);

    let r = new Buffer(rHex,'hex');
    let s = new Buffer(sHex,'hex');
    let pub = new Buffer(pubKeyHex, 'hex');
    return {'r': r, 's': s,'pub':pub};
}

function priToPub(ecprvhex){
    let keyPair = sm2.SM2KeyPair(null,ecprvhex);
    let pubKeyHex = keyPair.pub.getX().toString(16)+keyPair.pub.getY().toString(16);
    return new Buffer(pubKeyHex,'hex');
}

function sm3Digest(msg){
    let _sm3 = new sm3();
    let rawData = Array.from(msg);
    let digest = _sm3.sum(rawData);
    let hashHex = Array.from(digest, function(byte) {return ('0' + (byte & 0xFF).toString(16)).slice(-2);}).join('');
    return hashHex;
}

exports.sm3Digest = sm3Digest;
exports.signRS = signRS;
exports.priToPub = priToPub;

/*var hashData = sm3Digest("trans()");
console.log("hashData:",hashData);

var pri = "c9a497f262b30acc933891257c5652f04d2de8b01bd0fbf939e497f215f5394f";
var pub = "04756185a0cd1a3b240bd8fd400b0f34083f557cb3a2a80f0cfb8f9f093f21ed8e349908e3d641db6fe43b152d1cb2180834a398d5e3314403d01178339b6447af";
var msg = "123456";
var signData = signRS(pri,msg);
var verifyRS = verifyRS(pub,msg,signData);
console.log("verifyRSResult:",verifyRS);*/

/*var genKey = sm2GenKey("sm2");
var pri = genKey.ecprvhex;
var pub = genKey.ecpubhex;
console.log("genpri:" + pri + " genpub:" + pub);

var pri = "c9a497f262b30acc933891257c5652f04d2de8b01bd0fbf939e497f215f5394f";
var pub = "04756185a0cd1a3b240bd8fd400b0f34083f557cb3a2a80f0cfb8f9f093f21ed8e349908e3d641db6fe43b152d1cb2180834a398d5e3314403d01178339b6447af";
var msg = "123456";

var _sign = sm2Sign(pri,msg);
var lresult = verify(pub,msg,_sign);
console.log("verifyResult:" + lresult);

var hashData = sm3Digest(msg);

console.log("sm3HashData:" + hashData);
console.log("address:" + hashData.substr(0,40));*/