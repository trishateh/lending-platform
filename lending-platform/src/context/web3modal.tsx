"use client";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

// 2. Set chains
const linea_sepolia = {
  chainId: 59141,
  name: "Linea",
  currency: "ETH",
  explorerUrl: "https://sepolia.lineascan.build/",
  rpcUrl: "https://rpc.sepolia.linea.build",
};

// 3. Create a metadata object
const metadata = {
  name: "My Lending and Borrowing Platform",
  description: "Lend and Borrow Tokens",
  url: "http://localhost:3000/", // origin must match your domain & subdomain
  icons: ["http://localhost:3000/favicon.ico"],
};
// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  //   rpcUrl: "...", // used for the Coinbase SDK
  //   defaultChainId: 59141, // used for the Coinbase SDK
});

// 5. Create a AppKit instance
createWeb3Modal({
  ethersConfig,
  chains: [linea_sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export function AppKit({ children }: any) {
  return children;
}
