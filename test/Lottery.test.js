const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", function () {
  let lottery;
  let owner;
  let player1;
  let player2;
  let player3;

  beforeEach(async function () {
    // Get signers (accounts)
    [owner, player1, player2, player3] = await ethers.getSigners();

    // Deploy the contract
    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
    await lottery.waitForDeployment();
  });

  it("Should start a new lottery", async function () {
    const ticketPrice = ethers.parseEther("0.1"); // 0.1 ETH
    const maxTickets = 5;

    await lottery.startLottery(ticketPrice, maxTickets);
    
    expect(await lottery.lotteryStatus()).to.equal(true);
    expect(await lottery.ticketPrice()).to.equal(ticketPrice);
    expect(await lottery.maxTickets()).to.equal(maxTickets);
  });

  it("Should allow players to buy tickets and pick a winner", async function () {
    const ticketPrice = ethers.parseEther("0.1");
    const maxTickets = 5;

    // Start lottery
    await lottery.startLottery(ticketPrice, maxTickets);

    // Get initial balances
    const initialBalance1 = await ethers.provider.getBalance(player1.address);
    const initialBalance2 = await ethers.provider.getBalance(player2.address);
    const initialBalance3 = await ethers.provider.getBalance(player3.address);

    console.log("Initial Balances:");
    console.log(`Player 1 (${player1.address}): ${ethers.formatEther(initialBalance1)} ETH`);
    console.log(`Player 2 (${player2.address}): ${ethers.formatEther(initialBalance2)} ETH`);
    console.log(`Player 3 (${player3.address}): ${ethers.formatEther(initialBalance3)} ETH`);

    // Buy tickets
    console.log("\nTicket Purchases:");
    
    // Player 1 buys 2 tickets
    const tx1a = await lottery.connect(player1).buyTicket({ value: ticketPrice });
    await tx1a.wait();
    console.log(`Player 1 bought ticket #1`);
    
    const tx1b = await lottery.connect(player1).buyTicket({ value: ticketPrice });
    await tx1b.wait();
    console.log(`Player 1 bought ticket #2`);
    
    // Player 2 buys 2 tickets
    const tx2a = await lottery.connect(player2).buyTicket({ value: ticketPrice });
    await tx2a.wait();
    console.log(`Player 2 bought ticket #3`);
    
    const tx2b = await lottery.connect(player2).buyTicket({ value: ticketPrice });
    await tx2b.wait();
    console.log(`Player 2 bought ticket #4`);
    
    // Player 3 buys 1 ticket (final ticket that triggers winner selection)
    const tx3 = await lottery.connect(player3).buyTicket({ value: ticketPrice });
    const receipt3 = await tx3.wait();
    console.log(`Player 3 bought ticket #5`);

    // Get player tickets
    const player1Tickets = await lottery.getPlayerTickets(player1.address);
    const player2Tickets = await lottery.getPlayerTickets(player2.address);
    const player3Tickets = await lottery.getPlayerTickets(player3.address);
    
    console.log("\nTicket Distribution:");
    console.log(`Player 1 tickets: ${player1Tickets.join(", ")}`);
    console.log(`Player 2 tickets: ${player2Tickets.join(", ")}`);
    console.log(`Player 3 tickets: ${player3Tickets.join(", ")}`);

    // Get final balances
    const finalBalance1 = await ethers.provider.getBalance(player1.address);
    const finalBalance2 = await ethers.provider.getBalance(player2.address);
    const finalBalance3 = await ethers.provider.getBalance(player3.address);

    // Get the winner info
    const winner = await lottery.recentWinner();
    const winningTicket = await lottery.winningTicketNumber();
    
    console.log("\nLottery Results:");
    console.log(`Winning Ticket Number: ${winningTicket}`);
    console.log(`Winner Address: ${winner}`);
    
    let winnerName = "Unknown";
    if (winner === player1.address) winnerName = "Player 1";
    else if (winner === player2.address) winnerName = "Player 2";
    else if (winner === player3.address) winnerName = "Player 3";
    
    console.log(`Winner is ${winnerName}`);
    
    console.log("\nFinal Balances:");
    console.log(`Player 1 (${player1.address}): ${ethers.formatEther(finalBalance1)} ETH (${ethers.formatEther(finalBalance1 - initialBalance1)} change)`);
    console.log(`Player 2 (${player2.address}): ${ethers.formatEther(finalBalance2)} ETH (${ethers.formatEther(finalBalance2 - initialBalance2)} change)`);
    console.log(`Player 3 (${player3.address}): ${ethers.formatEther(finalBalance3)} ETH (${ethers.formatEther(finalBalance3 - initialBalance3)} change)`);

    // Verify lottery has ended
    expect(await lottery.lotteryStatus()).to.equal(false);
    
    // Prize should be 0.5 ETH (5 tickets * 0.1 ETH)
    const expectedPrize = ethers.parseEther("0.5");
    
    // Check that winner's balance increased (accounting for gas)
    if (winner === player1.address) {
      // Player 1 spent 0.2 ETH on tickets, should get 0.5 ETH prize (profit of ~0.3 ETH minus gas)
      expect(finalBalance1 - initialBalance1).to.be.gt(ethers.parseEther("0.2"));
    } else if (winner === player2.address) {
      // Player 2 spent 0.2 ETH on tickets
      expect(finalBalance2 - initialBalance2).to.be.gt(ethers.parseEther("0.2"));
    } else if (winner === player3.address) {
      // Player 3 spent 0.1 ETH on ticket
      expect(finalBalance3 - initialBalance3).to.be.gt(ethers.parseEther("0.3"));
    }
  });
});