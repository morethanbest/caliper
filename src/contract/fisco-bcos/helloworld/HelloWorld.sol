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
    function set(string n, string f){
        test["123"] = f;
    	name = n;
    }
}
