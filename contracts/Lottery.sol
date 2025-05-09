// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Lottery is Ownable {
    struct Ticket {
        uint256 ticketNumber;
        address owner;
    }

    Ticket[] public tickets;
    mapping(address => uint256[]) public playerTickets;

    uint public lotteryId;
    address public recentWinner;
    uint public winningTicketNumber;

    uint public ticketPrice;
    uint public maxTickets;
    bool public lotteryStatus;

    event TicketPurchased(address indexed player, uint256 ticketNumber);
    event WinnerPicked(address indexed winner, uint256 winningTicketNumber);
    event LotteryStarted(
        uint indexed lotteryId,
        uint ticketPrice,
        uint maxTickets
    );
    event LotteryEnded(uint indexed lotteryId);

    constructor() Ownable(msg.sender) {
        lotteryStatus = false;
    }

    function startLottery(
        uint _ticketPrice,
        uint _maxTickets
    ) public onlyOwner {
        require(!lotteryStatus, "Lottery is already running");

        ticketPrice = _ticketPrice;
        maxTickets = _maxTickets;
        lotteryStatus = true;
        lotteryId++;

        // Clear tickets from previous lottery
        delete tickets;

        emit LotteryStarted(lotteryId, ticketPrice, maxTickets);
    }

    function buyTicket() public payable {
        require(lotteryStatus, "Lottery is not running");
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(tickets.length < maxTickets, "Maximum tickets sold");

        uint256 ticketNumber = tickets.length + 1;

        // Create a new ticket
        tickets.push(Ticket({ticketNumber: ticketNumber, owner: msg.sender}));

        // Store the ticket in the player's collection
        playerTickets[msg.sender].push(ticketNumber);

        emit TicketPurchased(msg.sender, ticketNumber);

        // If max tickets sold, automatically pick a winner
        if (tickets.length == maxTickets) {
            pickWinner();
        }
    }

    function getPlayerTickets(
        address player
    ) public view returns (uint256[] memory) {
        return playerTickets[player];
    }

    function pickWinner() internal {
        require(lotteryStatus, "Lottery is not running");
        require(tickets.length > 0, "No tickets sold");

        // Generate random number
        uint randomNumber = uint(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    tickets.length
                )
            )
        ) % tickets.length;

        // Adjust to get 1-based ticket number
        winningTicketNumber = randomNumber + 1;

        // Get the winning ticket
        Ticket memory winningTicket = tickets[randomNumber];
        recentWinner = winningTicket.owner;

        // Transfer prize
        uint prizeMoney = address(this).balance;
        payable(recentWinner).transfer(prizeMoney);

        emit WinnerPicked(recentWinner, winningTicketNumber);
        _endLottery();
    }

    function _endLottery() internal {
        require(lotteryStatus, "Lottery is not running");

        lotteryStatus = false;

        // We don't delete the tickets here so players can check after the lottery

        emit LotteryEnded(lotteryId);
    }

    function endLottery() public onlyOwner {
        pickWinner();
    }

    function getTotalTickets() public view returns (uint) {
        return tickets.length;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
