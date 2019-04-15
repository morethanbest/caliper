pragma solidity ^0.4.2;
contract HelloWorld{
    string name;
    mapping(string=>string) test;
    function HelloWorld(){
       name="Hi,Welcome!";
    }
    function get(string n)constant returns(string){
        return test[n];
    }
    function set(string n){
        test["123"] = "456";
    	name=n;
    }
}
