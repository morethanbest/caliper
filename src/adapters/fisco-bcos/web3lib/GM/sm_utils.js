/**
 * Utils for SM2 and SM3 module
 */
let utils = exports;
let BN = require('bn.js');
let crypto = require('crypto');

utils.strToBytes = strToBytes;
utils.hashToBN = hashToBN;
utils.random = random;

function strToBytes(s) {
    let ch, st, re = [];
    for (let i = 0; i < s.length; i++ ) {
        ch = s.charCodeAt(i);  // get char
        st = [];                 // set up "stack"
        do {
            st.push( ch & 0xFF );  // push byte to stack
            ch = ch >> 8;          // shift value down by 1 byte
        }
        while ( ch );
        // add stack contents to result
        // done because chars have "wrong" endianness
        re = re.concat( st.reverse() );
    }
    return re;
}

function hashToBN(hash) {
    if (typeof hash === 'string') {
        return new BN(hash, 16);
    } else {
        let hex = '';
        for (let i = 0; i < hash.length; i++) {
            let b = hash[i].toString(16);
            if (b.length == 1) {
                hex += '0';
            }
            hex += b;
        }
        return new BN(hex, 16);
    }
}

/**
 * Generate cryptographic random value.
 *
 * @param {Number} n: byte length of the generated value
 */
function random(n) {
    return crypto.randomBytes(n).toString('hex');
}
