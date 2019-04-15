pragma solidity ^0.4.2;
contract HelloWorld{
    string name;
    mapping(string=>string) test;
    function HelloWorld(){
       name="Hi,Welcome!";
    }
    function get()constant returns(string){
        return test["123"];
    }
    function set(string n){
        test["123"] = "456";
    	name=n;
    }
}
