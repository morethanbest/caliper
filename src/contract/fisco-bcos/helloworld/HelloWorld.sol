pragma solidity ^0.4.2;
contract HelloWorld{
    string name;
    mapping(string=>uint) test;
    function HelloWorld(){
       name="Hi,Welcome!";
    }
    function get(string n)constant returns(uint){
        return test[n];
    }
    function set(uint n, string f){
        test["123"] = n + 100;
    	name = f;
    }
}
