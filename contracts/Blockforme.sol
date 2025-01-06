// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

contract Blockforme {

    address public owner;

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event Purchase(address buyer, uint256 orderId, uint256 itemId);
    event ListItems(string name, uint256 cost, uint256 quantity);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function listProducts(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {

        Item memory newItem = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );

        items[_id] = newItem;

        emit ListItems(_name, _cost, _stock);
    }

    function buyProducts(uint256 _id) public payable {

        Item memory newItem = items[_id];


        require(msg.value >= newItem.cost, "You don't have enough ether to make the purchase");

        require(newItem.stock > 0, "The item that you are trying to purchase is not in stock");


        Order memory newOrder = Order(block.timestamp, newItem);

        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = newOrder;

        items[_id].stock = newItem.stock - 1;

        emit Purchase(msg.sender, orderCount[msg.sender], newItem.id);
    }

    function withdrawFunds() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
