# Lending and Borrowing Platform PoC
These are the smart contracts for a lending and borrowing platform, using NFTs as collateral, written in Solidity and deployed onto the Linea network.  
The platform provides functionalities for borrowers to create loans and handle repayments, lenders to fund them, and both parties to handle collateral claims. Interest is calculated on the loan amount.

## Features
1. **Create Loan**
- Borrower can create a new loan by providing an NFT as collateral. The loan amount should not be higher than the NFT price. In future versions, we can improve this by implementing an oracle service to retrieve price of the NFT.
- As a result, a loan request will be created and the loan status will be marked as 'Active'.

2. **Fund Loan**
- When a loan is marked as active, it allows a lender to fund the loan by providing the requested amount to the borrower, activating the loan with a specified due date.
- The loan status will be marked as 'Funded'.

3. **Repay Loan**
- When a loan is funded, within the loan duration, borrowers can repay the loan, including the principal amount and accrued interest, to retrieve their NFT collateral.
- The loan status will be marked as 'Repaid'.

4. **Claim Collateral**
- If a borrower defaults on their loan (i.e., fails to repay by the due date), the lender can claim the NFT collateral. The loan status will be marked as 'Defaulted'.
- If a borrower wants to cancel the loan, they will be able to claim back their NFT. The loan status will be marked as 'Canceled'.

5. **Repayment Amount Calculation**
- Calculates the total repayment amount including the principal and the fixed interest rate.

6. **Get Loan Information**
- Loan information can be retrieved by providing the loan ID.

## Events
- LoanCreated: Emitted when a loan is created.
- LoanFunded: Emitted when a loan is funded.
- LoanRepaid: Emitted when a loan is repaid.
- CollateralClaimed: Emitted when collateral is claimed.

## Getting Started

### Prerequisites
Before you begin, ensure you have the following:

- Node.js >= 18.0
- MetaMask wallet with testnet ETH
- Infura account and API key

### Installation
To set up the project and install all dependencies, run:
```bash
npm install
```

## How to Deploy or Run
1. Compile the smart contract
Before deploying, make sure the contract compiles successfully:
```bash
npx hardhat compile
```

2. Test the Contract
```bash
npx hardhat test
```

3. Deploy the Contract
To deploy the contract locally using Hardhat’s development network:

```bash
npx hardhat node
```

In a separate terminal, run the deployment script:
```bash
npx hardhat ignition deploy ./ignition/modules/LendingBorrowing.js --network localhost
```

To deploy on a live network such as Ethereum, ensure you have set up your environment variables for the deployment wallet and Infura provider in a .env file:
```bash
cp .env.example .env
```

```bash
INFURA_API_KEY=your_infura_key
PRIVATE_KEY=your_private_key
```
Then deploy to a testnet (e.g. Linea Sepolia):

```bash
npx hardhat ignition deploy ./ignition/modules/LendingBorrowing.js --network linea_sepolia
```

4. Interact with the Contract
Once the contract is deployed, you can interact with it via the console, through scripts or via the front end project (lending-platform).


# Deployments
Linea Sepolia testnet: 

BONE token contract address: [0x692f50c2fb942B6cadB8f65E7717Ae40F1e1ba87](https://sepolia.lineascan.build/address/0x692f50c2fb942B6cadB8f65E7717Ae40F1e1ba87)

Pup NFT contract address: [0xc1EF9b45Cd110ad11bae39A173BDaE161E240557](https://sepolia.lineascan.build/address/0xc1EF9b45Cd110ad11bae39A173BDaE161E240557)

P2P Lending & Borrowing contract address (version 2):
0x99F73aE0C6fd441BD88bb5a13fa3D70C686334Cc

Simple Lending contract address (version 1): 0xB4a2F5fB72fCA9F35942ab22b9EF29A7fd0bA7BB

## Future Features:
- Incorporate support for more tokens.
- Allow P2P lending and borrowing. --> Added in version 2
- Use an Oracle to determine the value of an NFT.
- Allow bridging of ETH and ERC-20 tokens from Ethereum to Linea network.