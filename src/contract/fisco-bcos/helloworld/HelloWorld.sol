pragma solidity ^0.4.2;
contract HelloWorld{
    string name;
    mapping(string=>uint) test;
    function HelloWorld(){
       name="Hi,Welcome!";
    }
    function get(string n)constant returns(string){
        return name;
    }
    function set(uint n, string f){
        test["123"] = n;
    	name = f;
    }
}
