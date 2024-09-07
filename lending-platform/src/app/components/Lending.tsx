"use client";

import { useState, useEffect } from "react";
import abi from "../../../../contract/artifacts/contracts/SimpleLending.sol/SimpleLending.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import tokenAbi from "../../../abi/tokenAbi.json";
import nftAbi from "../../../abi/nftAbi.json";

const { ethers } = require("ethers");

export const Lending = () => {
  const [tokenId, setTokenId] = useState<any>();
  const [amount, setAmount] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [repayAmount, setRepayAmount] = useState<any>();

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS ?? "";
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "";
  const lendingAddress = process.env.NEXT_PUBLIC_LENDING_ADDRESS ?? "";
  const infuraProvider = new ethers.JsonRpcProvider(
    `https://linea-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
  );
  const lendingAbi = abi.abi;
  const tokenContract = new ethers.Contract(
    tokenAddress,
    tokenAbi,
    infuraProvider
  );
  const nftContract = new ethers.Contract(nftAddress, nftAbi, infuraProvider);

  const handleNftApproval = async () => {
    try {
      const isApproved = await nftContract.isApprovalForAll(
        address,
        lendingAddress
      );
      if (!isApproved) {
        const signer = infuraProvider.getSigner();
        const contract = new ethers.Contract(
          lendingAddress,
          lendingAbi,
          signer
        );
        const tx = await contract.setApprovalForAll(lendingAddress, true);
      }
    } catch (err) {
      console.log("Error giving approval: ", err);
    }
  };

  const handleBorrow = async () => {
    setLoading(true);
    try {
      await handleNftApproval();
      const signer = infuraProvider.getSigner();
      const contract = new ethers.Contract(lendingAddress, lendingAbi, signer);
      const transaction = await contract.borrowAgainstNFT(
        tokenId,
        ethers.utils.parseEther(amount)
      );
      await transaction.wait();
      alert("Transaction confirmed!");
    } catch (error) {
      console.error("Error during borrowing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    setLoading(true);
    try {
      const signer = infuraProvider.getSigner();
      const contract = new ethers.Contract(lendingAddress, lendingAbi, signer);
      const transaction = await contract.repayLoan(tokenId);
      await transaction.wait();
      alert("Transaction confirmed!");
    } catch (error) {
      console.error("Error during repayment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCollateral = async () => {
    setLoading(true);
    try {
      const signer = infuraProvider.getSigner();
      const contract = new ethers.Contract(lendingAddress, lendingAbi, signer);
      const transaction = await contract.claimCollateral(tokenId);
      await transaction.wait();
      console.log("Transaction confirmed!");
    } catch (error) {
      console.error("Error during collateral claim:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRepayAmount = async (tokenId: any) => {
    try {
      const contract = new ethers.Contract(
        lendingAddress,
        lendingAbi,
        infuraProvider
      );
      const amount = await contract.calculateRepaymentAmount(tokenId);
      setRepayAmount(ethers.utils.formatEther(amount));
    } catch (error) {
      console.error("Error fetching repayment amount:", error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">
        Borrow Against Your NFT
      </h2>
      <div className="bg-gray-800 text-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            NFT Token ID
          </label>
          <input
            type="text"
            value={tokenId}
            onChange={(e: any) => setTokenId(e.target.value)}
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-900 text-gray-200 leading-tight focus:outline-none focus:border-blue-500"
            placeholder="Enter NFT Token ID"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Borrow Amount (ETH)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e: any) => setAmount(e.target.value)}
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-900 text-gray-200 leading-tight focus:outline-none focus:border-blue-500"
            placeholder="Enter borrow amount in ETH"
          />
        </div>

        <div className="flex justify-between space-x-4">
          <button
            onClick={handleBorrow}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Processing..." : "Borrow"}
          </button>

          <button
            onClick={() => getRepayAmount(tokenId)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Get Repay Amount
          </button>
        </div>

        {repayAmount && (
          <div className="mt-4 text-center">
            <p className="text-gray-300">Repayment Amount: {repayAmount} ETH</p>
            <button
              onClick={handleRepay}
              className="mt-2 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? "Processing..." : "Repay Loan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
