# Blockchain Lottery

A ticket-based blockchain lottery system where users purchase numbered tickets, and one ticket is randomly selected as the winner. The owner of the winning ticket receives the entire prize pool.

## Features

- Smart contract-based lottery system with numbered tickets
- Players can purchase multiple tickets to increase their chances of winning
- Each ticket is associated with a unique number
- Configurable ticket price and maximum number of tickets
- Automatic winner selection using blockchain randomness
- Transparent and fair lottery mechanism
- Full test suite to verify functionality

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Basic knowledge of Ethereum and smart contracts

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd course-project
```

2. Install dependencies:

```bash
npm install
npm install figlet
```

## Usage

### Compiling the Smart Contract

Compile the Lottery smart contract:

```bash
npm run compile
```

### Running Tests

Run the test suite to verify the lottery functionality:

```bash
npm test
```

## Testing the Lottery

The automated test suite provides a comprehensive demonstration of how the lottery works. Here's what happens when you run `npm test`:

1. **Lottery Initialization**:

   - A new lottery is started with a ticket price of 0.1 ETH and a maximum of 5 tickets
   - The test verifies that the lottery status is active and settings are correct

2. **Ticket Purchases**:

   - Player 1 buys tickets #1 and #2 (0.2 ETH total)
   - Player 2 buys tickets #3 and #4 (0.2 ETH total)
   - Player 3 buys ticket #5 (0.1 ETH total)
   - The test displays each purchase and shows the ticket numbers assigned

3. **Ticket Distribution**:

   - The test displays which tickets each player owns
   - You can verify that the tickets are correctly distributed

4. **Winner Selection**:

   - When all tickets are sold, a winning ticket is automatically selected
   - The test displays the winning ticket number and the address of the winner

5. **Prize Distribution**:

   - The test shows each player's final balance
   - The winner's balance should increase significantly (they receive the 0.5 ETH prize pool)
   - Other players' balances decrease based on their ticket purchases

6. **Verification**:
   - The test verifies that the lottery has ended
   - It confirms that the winner received the correct prize amount

### Example Test Output

When you run `npm test`, you'll see output similar to this:

```
Initial Balances:
Player 1 (0x70997970C51812dc3A010C7d01b50e0d17dc79C8): 10000.0 ETH
Player 2 (0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC): 10000.0 ETH
Player 3 (0x90F79bf6EB2c4f870365E785982E1f101E93b906): 10000.0 ETH

Ticket Purchases:
Player 1 bought ticket #1
Player 1 bought ticket #2
Player 2 bought ticket #3
Player 2 bought ticket #4
Player 3 bought ticket #5

Ticket Distribution:
Player 1 tickets: 1, 2
Player 2 tickets: 3, 4
Player 3 tickets: 5

Lottery Results:
Winning Ticket Number: 3
Winner Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Winner is Player 2

Final Balances:
Player 1 (0x70997970C51812dc3A010C7d01b50e0d17dc79C8): 9999.78 ETH (-0.22 change)
Player 2 (0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC): 10000.28 ETH (+0.28 change)
Player 3 (0x90F79bf6EB2c4f870365E785982E1f101E93b906): 9999.89 ETH (-0.11 change)
```

### Manual Testing with Hardhat Console

You can also manually test the lottery using the Hardhat console:

1. Start a local Hardhat blockchain node:

```bash
npm run node
```

2. In a new terminal, deploy the contract:

```bash
npm run deploy
```

3. Open the Hardhat console:

```bash
npx hardhat console --network localhost
```

4. Connect to the deployed contract:

```javascript
const Lottery = await ethers.getContractFactory("Lottery");
const deployedContract = await Lottery.deploy();
await deployedContract.waitForDeployment();
const lotteryAddress = await deployedContract.getAddress();
const lottery = await Lottery.attach(lotteryAddress);
```

5. Get accounts to test with:

```javascript
const [owner, addr1, addr2, addr3] = await ethers.getSigners();
```

6. Start a new lottery:

```javascript
await lottery.startLottery(ethers.parseEther("0.1"), 3);
console.log("Lottery started");
```

7. Buy tickets from different accounts:

```javascript
await lottery.connect(addr1).buyTicket({ value: ethers.parseEther("0.1") });
console.log("Address 1 bought ticket #1");

await lottery.connect(addr2).buyTicket({ value: ethers.parseEther("0.1") });
console.log("Address 2 bought ticket #2");
```

8. Check ticket distribution:

```javascript
const addr1Tickets = await lottery.getPlayerTickets(addr1.address);
console.log(
  "Address 1 tickets:",
  addr1Tickets.map((t) => t.toString())
);

const addr2Tickets = await lottery.getPlayerTickets(addr2.address);
console.log(
  "Address 2 tickets:",
  addr2Tickets.map((t) => t.toString())
);
```

9. Buy the final ticket to trigger winner selection:

```javascript
await lottery.connect(addr3).buyTicket({ value: ethers.parseEther("0.1") });
console.log("Address 3 bought ticket #3 - should trigger winner selection");
```

10. Check the winner:

```javascript
const winner = await lottery.recentWinner();
const winningTicket = await lottery.winningTicketNumber();
console.log("Winning ticket:", winningTicket.toString());
console.log("Winner address:", winner);
```

### Local Development

1. Start a local Hardhat blockchain node:

```bash
npm run node
```

2. In a new terminal, deploy the contract to your local network:

```bash
npm run deploy
```

### Interacting with the Contract

Here's how to interact with the deployed contract using Hardhat console:

1. Open the Hardhat console:

```bash
npx hardhat console --network localhost
```

2. Connect to the deployed contract:

```javascript
const Lottery = await ethers.getContractFactory("Lottery");
const lotteryAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace with your contract address
const lottery = await Lottery.attach(lotteryAddress);
```

3. Start a new lottery (owner only):

```javascript
const ticketPrice = ethers.parseEther("0.1"); // 0.1 ETH per ticket
const maxTickets = 10; // Total tickets available
await lottery.startLottery(ticketPrice, maxTickets);
```

4. Buy a lottery ticket:

```javascript
await lottery.buyTicket({ value: ethers.parseEther("0.1") });
```

5. Check your tickets:

```javascript
const myAddress = await ethers.provider.getSigner().getAddress();
const myTickets = await lottery.getPlayerTickets(myAddress);
console.log(
  "My tickets:",
  myTickets.map((t) => t.toString())
);
```

6. Check lottery status:

```javascript
const isRunning = await lottery.lotteryStatus();
console.log("Lottery running:", isRunning);
```

7. Check total tickets sold:

```javascript
const totalTickets = await lottery.getTotalTickets();
console.log("Total tickets sold:", totalTickets.toString());
```

8. Get the last winner (after lottery ends):

```javascript
const winner = await lottery.recentWinner();
const winningTicket = await lottery.winningTicketNumber();
console.log("Winning ticket:", winningTicket.toString());
console.log("Winner address:", winner);
```

## How It Works

1. The contract owner starts a lottery by setting a ticket price and maximum number of tickets
2. Players purchase tickets by sending the exact ticket price
3. Each ticket is assigned a sequential number (1, 2, 3, etc.)
4. When all tickets are sold, a winning ticket is randomly selected
5. The owner of the winning ticket receives the entire prize pool
6. The lottery ends and can be started again

## Contract Architecture

The lottery contract consists of the following components:

- **Ticket Structure**: Stores the ticket number and owner's address
- **Constructor**: Initializes the contract with the owner's address
- **startLottery**: Starts a new lottery with specified ticket price and maximum tickets
- **buyTicket**: Allows players to buy a lottery ticket
- **getPlayerTickets**: Returns the tickets owned by a specific player
- **pickWinner**: Internal function that selects a winning ticket when max tickets are sold
- **endLottery**: Ends the current lottery and picks a winner
- **getTotalTickets**: Returns the total number of tickets sold
- **getBalance**: Returns the current contract balance

## License

This project is licensed under the MIT License - see the LICENSE file for details.
