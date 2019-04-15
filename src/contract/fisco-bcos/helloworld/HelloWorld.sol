pragma solidity ^0.4.2;
contract HelloWorld{
    string name;
    uint test;
    function HelloWorld(){
       name="Hi,Welcome!";
    }
    function get(string n)constant returns(string){
        return name;
    }
    function set(uint n){
        test = 1234;
    	name = "helloworld";
    }
}
