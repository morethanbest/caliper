pragma solidity ^0.4.2;
contract HelloWorld{
    string name;
    int test;
    function HelloWorld(){
       name="Hi,Welcome!";
    }
    function get(string n)constant returns(int){
        return test;
    }
    function set(int n){
        test = 1234;
    	name = "helloworld";
    }
}
