/**
 * @file: web3sync.js
 * @author: fisco-dev
 * @modify: George Lau
 * @date: 2019.3.29
 */


const secp256k1 = require('secp256k1');
const rlp = require('rlp');
const BN = require('bn.js');
const coder = require('./codeUtils');
let utils = require('./utils');
let config = require('./config');
const assert = require('assert');
/*
*   npm install --save-dev babel-cli babel-preset-es2017
*   echo '{ "presets": ["es2017"] }' > .babelrc
*   npm install secp256k1
*   npm install keccak
*   npm install rlp
*/

function privateToPublic(privateKey) {
    return utils.privateToPublic(privateKey);
}

function privateToAddress(privateKey) {
    return utils.privateToAddress(privateKey);
}

function publicToAddress(pubKey, sanitize) {
    return utils.publicToAddress(pubKey, sanitize);
}


function toBuffer(v) {
    if (!Buffer.isBuffer(v)) {
        if (Array.isArray(v)) {
            v = Buffer.from(v);
        } else if (typeof v === 'string') {
            if (isHexPrefixed(v)) {
                v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
            } else {
                v = Buffer.from(v);
            }
        } else if (typeof v === 'number') {
            v = intToBuffer(v);
        } else if (v === null || v === undefined) {
            v = Buffer.allocUnsafe(0);
        } else if (v.toArray) {
            // converts a BN to a Buffer
            v = Buffer.from(v.toArray());
        } else {
            throw new Error('invalid type');
        }
    }
    return v;
}

function isHexPrefixed(str) {
    return str.slice(0, 2) === '0x';
}

function padToEven(a) {
    if (a.length % 2) {a = '0' + a;}
    return a;
}

function stripHexPrefix(str) {
    if (typeof str !== 'string') {
        return str;
    }
    return isHexPrefixed(str) ? str.slice(2) : str;
}

function intToBuffer(i) {
    let hex = intToHex(i);
    return Buffer.from(hex.slice(2), 'hex');
}

function intToHex(i) {
    assert(i % 1 === 0, 'number is not a integer');
    assert(i >= 0, 'number must be positive');
    let hex = i.toString(16);
    if (hex.length % 2) {
        hex = '0' + hex;
    }
    return '0x' + hex;
}

function setLength(msg, length, right) {
    let buf = zeros(length);
    msg = toBuffer(msg);
    if (right) {
        if (msg.length < length) {
            msg.copy(buf);
            return buf;
        }
        return msg.slice(0, length);
    } else {
        if (msg.length < length) {
            msg.copy(buf, length - msg.length);
            return buf;
        }
        return msg.slice(-length);
    }
}

function sha3(a, bits) {
    return utils.sha3(a, bits);
}

function baToJSON(ba) {
    if (Buffer.isBuffer(ba)) {
        return '0x' + ba.toString('hex');
    } else if (ba instanceof Array) {
        let array = [];
        for (let i = 0; i < ba.length; i++) {
            array.push(baToJSON(ba[i]));
        }
        return array;
    }
}

function zeros(bytes) {
    return Buffer.allocUnsafe(bytes).fill(0);
}

function stripZeros(a) {
    a = stripHexPrefix(a);
    let first = a[0];
    while (a.length > 0 && first.toString() === '0') {
        a = a.slice(1);
        first = a[0];
    }
    return a;
}

function defineProperties(self, fields, data) {
    self.raw = [];
    self._fields = [];

    // attach the `toJSON`
    self.toJSON = function (label) {
        if (label) {
            let obj = {};
            self._fields.forEach(function (field) {
                obj[field] = '0x' + self[field].toString('hex');
            });
            return obj;
        }
        return baToJSON(this.raw);
    };

    self.serialize = function serialize() {
        return rlp.encode(self.raw);
    };

    fields.forEach(function (field, i) {
        self._fields.push(field.name);
        function getter() {
            return self.raw[i];
        }
        function setter(v) {
            v = toBuffer(v);

            if (v.toString('hex') === '00' && !field.allowZero) {
                v = Buffer.allocUnsafe(0);
            }

            if (field.allowLess && field.length) {
                v = stripZeros(v);
                assert(field.length >= v.length, 'The field ' + field.name + ' must not have more ' + field.length + ' bytes');
            } else if (!(field.allowZero && v.length === 0) && field.length) {
                assert(field.length === v.length, 'The field ' + field.name + ' must have byte length of ' + field.length);
            }

            self.raw[i] = v;
        }

        Object.defineProperty(self, field.name, {
            enumerable: true,
            configurable: true,
            get: getter,
            set: setter
        });

        if (field.default) {
            self[field.name] = field.default;
        }

        // attach alias
        if (field.alias) {
            Object.defineProperty(self, field.alias, {
                enumerable: false,
                configurable: true,
                set: setter,
                get: getter
            });
        }
    });

    // if the constuctor is passed data
    if (data) {
        if (typeof data === 'string') {
            data = Buffer.from(stripHexPrefix(data), 'hex');
        }

        if (Buffer.isBuffer(data)) {
            data = rlp.decode(data);
        }

        if (Array.isArray(data)) {
            if (data.length > self._fields.length) {
                throw (new Error('wrong number of fields in data'));
            }

            // make sure all the items are buffers
            data.forEach(function (d, i) {
                self[self._fields[i]] = toBuffer(d);
            });
        } else if (typeof data === 'object') {
            const keys = Object.keys(data);
            fields.forEach(function (field) {
                if (keys.indexOf(field.name) !== -1) {self[field.name] = data[field.name];}
                if (keys.indexOf(field.alias) !== -1) {self[field.alias] = data[field.alias];}
            });
        } else {
            throw new Error('invalid data');
        }
    }
}

function bufferToInt(buf) {
    return new BN(toBuffer(buf)).toNumber();
}

function rlphash(a) {
    //console.log("rlpencode:",rlp.encode(a).toString("hex"));
    return sha3(rlp.encode(a));
}

function ecrecover(msgHash, v, r, s) {
    let signature = Buffer.concat([setLength(r, 32), setLength(s, 32)], 64);
    let recovery = v - 27;
    if (recovery !== 0 && recovery !== 1) {
        throw new Error('Invalid signature v value');
    }
    let senderPubKey = secp256k1.recover(msgHash, signature, recovery);
    return secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
}

function ecsign(msgHash, privateKey) {
    return utils.ecsign(msgHash, privateKey);
}

//const BN = ethUtil.BN

// secp256k1n/2
const N_DIV_2 = new BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16);

function Transaction(data) {
    if (config.EncryptType === 1) {
        data = data || {};
        // Define Properties
        const fields = [{
            name: 'randomid',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'gasPrice',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'gasLimit',
            alias: 'gas',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'blockLimit',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'to',
            allowZero: true,
            length: 20,
            default: Buffer.from([])
        }, {
            name: 'value',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'data',
            alias: 'input',
            allowZero: true,
            default: Buffer.from([])
        }, {
            name: 'pub',
            length: 64,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'r',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 's',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }];

        /**
     * Returns the rlp encoding of the transaction
     * @method serialize
     * @return {Buffer}
     */
        // attached serialize
        defineProperties(this, fields, data);

        /**
     * @prop {Buffer} from (read only) sender address of this transaction, mathematically derived from other parameters.
     */
        Object.defineProperty(this, 'from', {
            enumerable: true,
            configurable: true,
            get: this.getSenderAddress.bind(this)
        });

        // set chainId
        this._chainId = -4;
        this._homestead = true;
    } else {
        data = data || {};
        // Define Properties
        const fields = [{
            name: 'randomid',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'gasPrice',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'gasLimit',
            alias: 'gas',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'blockLimit',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'to',
            allowZero: true,
            length: 20,
            default: Buffer.from([])
        }, {
            name: 'value',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 'data',
            alias: 'input',
            allowZero: true,
            default: Buffer.from([])
        }, {
            name: 'v',
            length: 1,
            default: Buffer.from([0x1c])
        }, {
            name: 'r',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }, {
            name: 's',
            length: 32,
            allowLess: true,
            default: Buffer.from([])
        }];

        /**
     * Returns the rlp encoding of the transaction
     * @method serialize
     * @return {Buffer}
     */
        // attached serialize
        defineProperties(this, fields, data);

        /**
     * @prop {Buffer} from (read only) sender address of this transaction, mathematically derived from other parameters.
     */
        Object.defineProperty(this, 'from', {
            enumerable: true,
            configurable: true,
            get: this.getSenderAddress.bind(this)
        });

        // calculate chainId from signature
        let sigV = bufferToInt(this.v);
        let chainId = Math.floor((sigV - 35) / 2);
        if (chainId < 0) {chainId = 0;}

        // set chainId
        this._chainId = chainId || data.chainId || 0;
        this._homestead = true;
    }
}

/**
 * If the tx's `to` is to the creation address
 * @return {Boolean}
 */
Transaction.prototype.toCreationAddress = function () {
    return this.to.toString('hex') === '';
};

/**
 * Computes a sha3-256 hash of the serialized tx
 * @param {Boolean} [includeSignature=true] whether or not to inculde the signature
 * @return {Buffer}
 */
Transaction.prototype.hash = function (includeSignature) {
    if (includeSignature === undefined) {includeSignature = true;}
    // backup original signature
    const rawCopy = this.raw.slice(0);

    // modify raw for signature generation only
    if (this._chainId > 0) {
        includeSignature = true;
        this.v = this._chainId;
        this.r = 0;
        this.s = 0;
    }
    // generate rlp params for hash
    let txRawForHash = includeSignature ? this.raw : this.raw.slice(0, this.raw.length - 3);
    //var txRawForHash = includeSignature ? this.raw : this.raw.slice(0, 7)

    // restore original signature
    this.raw = rawCopy.slice();

    // create hash
    return rlphash(txRawForHash);
};

/**
 * returns the public key of the sender
 * @return {Buffer}
 */
Transaction.prototype.getChainId = function () {
    return this._chainId;
};

/**
 * returns the sender's address
 * @return {Buffer}
 */
Transaction.prototype.getSenderAddress = function () {
    if (this._from) {
        return this._from;
    }
    const pubkey = this.getSenderPublicKey();
    this._from = publicToAddress(pubkey);
    return this._from;
};

/**
 * returns the public key of the sender
 * @return {Buffer}
 */
Transaction.prototype.getSenderPublicKey = function () {
    if (!this._senderPubKey || !this._senderPubKey.length) {
        if (!this.verifySignature()) {throw new Error('Invalid Signature');}
    }
    return this._senderPubKey;
};

/**
 * Determines if the signature is valid
 * @return {Boolean}
 */
Transaction.prototype.verifySignature = function () {
    const msgHash = this.hash(false);
    // All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
    if (this._homestead && new BN(this.s).cmp(N_DIV_2) === 1) {
        return false;
    }

    try {
        let v = bufferToInt(this.v);
        if (this._chainId > 0) {
            v -= this._chainId * 2 + 8;
        }
        this._senderPubKey = ecrecover(msgHash, v, this.r, this.s);
    } catch (e) {
        return false;
    }

    return !!this._senderPubKey;
};

/**
 * sign a transaction with a given a private key
 * @param {Buffer} privateKey
 */
Transaction.prototype.sign = function (privateKey) {
    const msgHash = this.hash(false);
    const sig = ecsign(msgHash, privateKey);
    if (this._chainId > 0) {
        sig.v += this._chainId * 2 + 8;
    }
    Object.assign(this, sig);
};

/**
 * The amount of gas paid for the data in this tx
 * @return {BN}
 */
Transaction.prototype.getDataFee = function () {
    const data = this.raw[5];
    const cost = new BN(0);
    for (let i = 0; i < data.length; i++) {
        data[i] === 0 ? cost.iaddn(fees.txDataZeroGas.v) : cost.iaddn(fees.txDataNonZeroGas.v);
    }
    return cost;
};

/**
 * the minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
 * @return {BN}
 */
Transaction.prototype.getBaseFee = function () {
    const fee = this.getDataFee().iaddn(fees.txGas.v);
    if (this._homestead && this.toCreationAddress()) {
        fee.iaddn(fees.txCreation.v);
    }
    return fee;
};

/**
 * the up front amount that an account must have for this transaction to be valid
 * @return {BN}
 */
Transaction.prototype.getUpfrontCost = function () {
    return new BN(this.gasLimit)
        .imul(new BN(this.gasPrice))
        .iadd(new BN(this.value));
};

/**
 * validates the signature and checks to see if it has enough gas
 * @param {Boolean} [stringError=false] whether to return a string with a dscription of why the validation failed or return a Bloolean
 * @return {Boolean|String}
 */
Transaction.prototype.validate = function (stringError) {
    const errors = [];
    if (!this.verifySignature()) {
        errors.push('Invalid Signature');
    }

    if (this.getBaseFee().cmp(new BN(this.gasLimit)) > 0) {
        errors.push([`gas limit is to low. Need at least ${this.getBaseFee()}`]);
    }

    if (stringError === undefined || stringError === false) {
        return errors.length === 0;
    } else {
        return errors.join(' ');
    }
};
exports.Transaction = Transaction;

function signTransaction(tx_data, privKey, callback) {
    // convert string private key to a Buffer Object
    let privateKey = Buffer.from(privKey, 'hex');
    let tx = new Transaction(tx_data);
    tx.sign(privateKey);
    // Build a serialized hex version of the Tx
    let serializedTx = '0x' + tx.serialize().toString('hex');
    if (callback !== null) {
        callback(serializedTx);
    }
    else {
        return serializedTx;
    }
}
exports.signTransaction = signTransaction;

function getSignTX(account, privateKey, to, func, params, blockLimit) {
    let tx_data = getTxData(func, params);

    let postdata = {
        data: tx_data,
        from: account,
        to: to,
        gas: 1000000,
        randomid: Math.ceil(Math.random() * 100000000),
        blockLimit: blockLimit,
    };
    return signTransaction(postdata, privateKey, null);
}
exports.getSignTX = getSignTX;

function getDeploySignTX(account, privateKey, bin, blockLimit) {
    let tx_data = bin.indexOf('0x') === 0 ? bin : ('0x'+bin);
    console.log(tx_data);

    let postdata = {
        data: tx_data,
        from: account,
        to: null,
        gas: 1000000,
        randomid: Math.ceil(Math.random() * 100000000),
        blockLimit: blockLimit,
    };

    return signTransaction(postdata, privateKey, null);
}
exports.getDeploySignTX = getDeploySignTX;

function getTxData(func, params) {
    // var r = /^\w+\((.+)\)$/g.exec(func);
    let r = /^\w+\((.*)\)$/g.exec(func);
    let types = [];
    if (r[1]) {
        types = r[1].split(',');
    }
    return coder.codeTxData(func, types, params);
}
exports.getTxData = getTxData;
