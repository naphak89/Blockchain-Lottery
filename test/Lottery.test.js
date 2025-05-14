
const { expect } = require("chai");
const { ethers } = require("hardhat");
const chalk = require("chalk");
const boxen = require("boxen");
const figlet = require("figlet");

describe("Lottery", function () {
  process.stdout.write(chalk.cyan(figlet.textSync("Lottery Test")) + "\n");

  let lottery;
  let owner;
  let player1;
  let player2;
  let player3;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
    await lottery.waitForDeployment();
  });

  it("Should start a new lottery", async function () {
    const ticketPrice = ethers.parseEther("0.1");
    const maxTickets = 5;

    await lottery.startLottery(ticketPrice, maxTickets);

    expect(await lottery.lotteryStatus()).to.equal(true);
    expect(await lottery.ticketPrice()).to.equal(ticketPrice);
    expect(await lottery.maxTickets()).to.equal(maxTickets);
  });

  it("Should allow players to buy tickets and pick a winner", async function () {
    const ticketPrice = ethers.parseEther("0.1");
    const maxTickets = 5;
    await lottery.startLottery(ticketPrice, maxTickets);

    const initialBalance1 = await ethers.provider.getBalance(player1.address);
    const initialBalance2 = await ethers.provider.getBalance(player2.address);
    const initialBalance3 = await ethers.provider.getBalance(player3.address);

    process.stdout.write(boxen("✨ 💼  INITIAL BALANCES  💼 ✨", { padding: 1, borderColor: "yellow", borderStyle: "double" }) + "\n");
    process.stdout.write(chalk.yellow.bold(`🧾 Player 1 (${player1.address}): `) + chalk.yellow(`${ethers.formatEther(initialBalance1)} ETH`) + "\n");
    process.stdout.write(chalk.yellow(`🧾 Player 2 (${player2.address}): ${ethers.formatEther(initialBalance2)} ETH\n`));
    process.stdout.write(chalk.yellow(`🧾 Player 3 (${player3.address}): ${ethers.formatEther(initialBalance3)} ETH\n`));

    process.stdout.write(boxen("✨ 💼  TICKET PURCHASES  💼 ✨", { padding: 1, borderColor: "green", borderStyle: "double" }) + "\n");
    await lottery.connect(player1).buyTicket({ value: ticketPrice });
    process.stdout.write(chalk.green("🎟️ Player 1 bought ticket #1\n"));
    await lottery.connect(player1).buyTicket({ value: ticketPrice });
    process.stdout.write(chalk.green("🎟️ Player 1 bought ticket #2\n"));
    await lottery.connect(player2).buyTicket({ value: ticketPrice });
    process.stdout.write(chalk.green("🎟️ Player 2 bought ticket #3\n"));
    await lottery.connect(player2).buyTicket({ value: ticketPrice });
    process.stdout.write(chalk.green("🎟️ Player 2 bought ticket #4\n"));
    await lottery.connect(player3).buyTicket({ value: ticketPrice });
    process.stdout.write(chalk.green("🎟️ Player 3 bought ticket #5\n"));

    const player1Tickets = await lottery.getPlayerTickets(player1.address);
    const player2Tickets = await lottery.getPlayerTickets(player2.address);
    const player3Tickets = await lottery.getPlayerTickets(player3.address);

    process.stdout.write(boxen("📦🎁  TICKET DISTRIBUTION  🎁📦", { padding: 1, borderColor: "blue", borderStyle: "double" }) + "\n");
    process.stdout.write(chalk.blue(`Player 1 tickets: ${player1Tickets.join(", ")}\n`));
    process.stdout.write(chalk.blue(`Player 2 tickets: ${player2Tickets.join(", ")}\n`));
    process.stdout.write(chalk.blue(`Player 3 tickets: ${player3Tickets.join(", ")}\n`));

    const finalBalance1 = await ethers.provider.getBalance(player1.address);
    const finalBalance2 = await ethers.provider.getBalance(player2.address);
    const finalBalance3 = await ethers.provider.getBalance(player3.address);

    const winner = await lottery.recentWinner();
    const winningTicket = await lottery.winningTicketNumber();

    process.stdout.write(boxen("🎯🏁  LOTTERY RESULTS  🏁🎯", { padding: 1, borderColor: "magenta", borderStyle: "double" }) + "\n");
    process.stdout.write(chalk.magenta(`🏆 Winning Ticket Number: ${winningTicket}\n`));
    process.stdout.write(chalk.cyanBright(`👑 Winner Address: ${winner}\n`));

    let winnerName = "Unknown";
    if (winner === player1.address) winnerName = "Player 1";
    else if (winner === player2.address) winnerName = "Player 2";
    else if (winner === player3.address) winnerName = "Player 3";
    process.stdout.write(chalk.green(`🎉 Winner is ${winnerName}\n`));

    // Consolidate "Final Balances" into one clean section
    process.stdout.write(boxen("💸💰  FINAL BALANCES  💰💸", { padding: 1, borderColor: "yellow", borderStyle: "double" }) + "\n");

    const change1 = finalBalance1 - initialBalance1;
    const change2 = finalBalance2 - initialBalance2;
    const change3 = finalBalance3 - initialBalance3;

    process.stdout.write(
      chalk.yellow(`🧾 Player 1 (${player1.address}): ${ethers.formatEther(finalBalance1)} ETH `) +
      ((change1 > 0) ? chalk.greenBright(`(+${ethers.formatEther(change1)} change)\n`) : chalk.redBright(`(${ethers.formatEther(change1)} change)\n`))
    );

    process.stdout.write(
      chalk.yellow(`🧾 Player 2 (${player2.address}): ${ethers.formatEther(finalBalance2)} ETH `) +
      ((change2 > 0) ? chalk.greenBright(`(+${ethers.formatEther(change2)} change)\n`) : chalk.redBright(`(${ethers.formatEther(change2)} change)\n`))
    );

    process.stdout.write(
      chalk.yellow(`🧾 Player 3 (${player3.address}): ${ethers.formatEther(finalBalance3)} ETH `) +
      ((change3 > 0) ? chalk.greenBright(`(+${ethers.formatEther(change3)} change)\n`) : chalk.redBright(`(${ethers.formatEther(change3)} change)\n`))
    );

    expect(await lottery.lotteryStatus()).to.equal(false);

    const expectedPrize = ethers.parseEther("0.5");
    if (winner === player1.address) {
      expect(change1).to.be.gt(ethers.parseEther("0.2"));
    } else if (winner === player2.address) {
      expect(change2).to.be.gt(ethers.parseEther("0.2"));
    } else if (winner === player3.address) {
      expect(change3).to.be.gt(ethers.parseEther("0.3"));
    }
  });
});
