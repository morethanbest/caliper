pragma solidity ^0.4.2;
contract HelloWorld{
    string name;
    mapping(string=>uint) test;
    function HelloWorld(){
       name="Hi,Welcome!";
    }
    function get()constant returns(string){
        return uintToBytes(test["123"]);
    }
    function set(string n){
        test["123"] = 100;
    	name=n;
    }
}

function uintToBytes(uint v) constant returns (bytes32 ret) {
    if (v == 0) {
        ret = '0';
    }
    else {
        while (v > 0) {
            ret = bytes32(uint(ret) / (2 ** 8));
            ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
            v /= 10;
        }
    }
    return ret;
}
