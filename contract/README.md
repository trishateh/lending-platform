# Hardhat Project
These are the smart contracts for a lending and borrowing platform written in Solidity and deployed onto the Linea network. 
Users will be able to borrow tokens, using an NFT as a collateral.
Smart contract testing was done using Remix.

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/SimpleLending.js --network linea_sepolia
```


# Deployments
Linea Sepolia testnet: 
Simple Lending contract address: 0xB4a2F5fB72fCA9F35942ab22b9EF29A7fd0bA7BB
BONE token contract address: [0x692f50c2fb942B6cadB8f65E7717Ae40F1e1ba87](https://sepolia.lineascan.build/address/0x692f50c2fb942B6cadB8f65E7717Ae40F1e1ba87)
Pup NFT contract address: [0xc1EF9b45Cd110ad11bae39A173BDaE161E240557](https://sepolia.lineascan.build/address/0xc1EF9b45Cd110ad11bae39A173BDaE161E240557)

## Future Features:
- Add access control to only allow admins to withdraw the NFT collateral.
- Incorporate more tokens and liquidity pools.
- Allow P2P lending and borrowing.
- Using an Oracle to determine the value of an NFT.
- Allow bridging of ETH and ERC-20 tokens from Ethereum to Linea network.