pragma solidity ^0.4.2;
contract HelloWorld{

    uint256 name;

    function HelloWorld(){
       name=142857;
    }

    function get()constant returns(uint256){
        return name;
    }

    function set(uint256 n){
    	name = n;
    }
}
