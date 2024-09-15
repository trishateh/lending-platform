"use client";

import { useState, useEffect } from "react";
import abi from "../../../../contract/artifacts/contracts/LendingBorrowing.sol/LendingBorrowing.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import tokenAbi from "../../../abi/tokenAbi.json";
import nftAbi from "../../../abi/nftAbi.json";
import { BrowserProvider, ethers, Contract } from "ethers";

export const Lending = () => {
  const [tokenId, setTokenId] = useState<any>();
  const [amount, setAmount] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [repayAmount, setRepayAmount] = useState<number>();
  const [loanId, setLoanId] = useState<number>();
  const [canClaim, setCanClaim] = useState(false);

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
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

  useEffect(() => {
    canClaimCollateral();
  }, [address, loanId]);

  const handleTokenAllowance = async () => {
    try {
      const allowance = await tokenContract.allowance(address, lendingAddress);
      const formatAllowance = parseInt(ethers.formatEther(allowance));
      const balance = await tokenContract.balanceOf(address);

      if (amount && balance < amount) {
        alert("Insufficient funds to fund loan");
        return;
      }

      if (amount && formatAllowance < amount) {
        const provider = new BrowserProvider(walletProvider as any);

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(tokenAddress, tokenAbi, signer);
        const tx = await contract.approve(lendingAddress, amount);
        await tx.wait();
      }
    } catch (err) {
      console.log("Error giving approval: ", err);
    }
  };

  const handleRepayAllowance = async () => {
    try {
      const allowance = await tokenContract.allowance(address, lendingAddress);
      const formatAllowance = parseInt(ethers.formatEther(allowance));
      const balance = await tokenContract.balanceOf(address);

      if (repayAmount && balance < repayAmount) {
        alert("Not enough funds to repay loan");
        return;
      }

      if (repayAmount && formatAllowance < repayAmount) {
        const provider = new BrowserProvider(walletProvider as any);

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(tokenAddress, tokenAbi, signer);
        const tx = await contract.approve(lendingAddress, repayAmount);
        await tx.wait();
      }
    } catch (err) {
      console.log("Error giving approval: ", err);
    }
  };

  const handleNftApproval = async () => {
    try {
      const isApproved = await nftContract.isApprovedForAll(
        address,
        lendingAddress
      );
      if (!isApproved) {
        const provider = new BrowserProvider(walletProvider as any);

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(nftAddress, nftAbi, signer);
        const tx = await contract.setApprovalForAll(lendingAddress, true);
        await tx.wait();
      }
    } catch (err) {
      console.log("Error giving approval: ", err);
    }
  };

  const handleCreateLoan = async () => {
    setLoading(true);
    try {
      await handleNftApproval();
      const provider = new BrowserProvider(walletProvider as any);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(lendingAddress, lendingAbi, signer);
      const transaction = await contract.createLoan(
        ethers.parseEther((amount ?? 0).toString()),
        // NFT address fixed for demo purposes
        process.env.NEXT_PUBLIC_NFT_ADDRESS,
        tokenId,
        // NFT price is set to be >= loan amount for now. TODO: get NFT price from API or on the contract via oracle.
        ethers.parseEther((amount ?? 0).toString())
      );
      await transaction.wait();
      alert("Transaction confirmed!");
    } catch (error) {
      console.error("Error during loan creation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFundLoan = async () => {
    setLoading(true);
    try {
      await handleTokenAllowance();
      const provider = new BrowserProvider(walletProvider as any);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(lendingAddress, lendingAbi, signer);
      const transaction = await contract.fundLoan(loanId);
      await transaction.wait();
      alert("Transaction confirmed!");
    } catch (error) {
      console.error("Error during repayment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    setLoading(true);
    try {
      await handleRepayAllowance();
      const provider = new BrowserProvider(walletProvider as any);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(lendingAddress, lendingAbi, signer);
      const transaction = await contract.repayLoan(loanId);
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
      const provider = new BrowserProvider(walletProvider as any);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(lendingAddress, lendingAbi, signer);
      const transaction = await contract.claimCollateral(loanId);
      await transaction.wait();
      console.log("Transaction confirmed!");
    } catch (error) {
      console.error("Error during collateral claim:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRepayAmount = async (amount: number) => {
    try {
      const contract = new ethers.Contract(
        lendingAddress,
        lendingAbi,
        infuraProvider
      );

      const loan = await contract.getLoanInfo(loanId);
      const borrowedAmount = loan.amount;

      const repayAmount = await contract.getRepaymentAmount(borrowedAmount);

      setRepayAmount(parseInt(ethers.formatEther(repayAmount)));
      console.log("Repay Amount:", ethers.formatEther(repayAmount));
    } catch (error) {
      console.error("Error fetching repayment amount:", error);
    }
  };

  const canClaimCollateral = async () => {
    try {
      const contract = new ethers.Contract(
        lendingAddress,
        lendingAbi,
        infuraProvider
      );

      const loan = await contract.getLoanInfo(loanId);
      const status = await contract.getLoanStatus(loanId);
      const currentTime = Math.floor(Date.now() / 1000);

      // Borrower can claim if loan is ACTIVE
      const cancelLoan = status === 0;

      // Lender can claim if loan is FUNDED and due date has passed
      const defaultLoan = status === 1 && loan.dueDate < currentTime;

      if (
        (cancelLoan &&
          loan.borrower.toLowerCase() === address!.toLowerCase()) ||
        (defaultLoan && loan.lender.toLowerCase() === address!.toLowerCase())
      ) {
        setCanClaim(true);
      } else {
        setCanClaim(false);
      }
    } catch (error) {
      console.error("Error checking collateral claim:", error);
      setCanClaim(false);
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
            type="number"
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
            type="number"
            value={amount}
            onChange={(e: any) => setAmount(e.target.value)}
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-900 text-gray-200 leading-tight focus:outline-none focus:border-blue-500"
            placeholder="Enter borrow amount in ETH"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreateLoan}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Processing..." : "Create Loan"}
          </button>

          <button
            onClick={handleFundLoan}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? "Processing..." : "Fund Loan"}
          </button>

          <button
            onClick={() => getRepayAmount(tokenId)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Get Repay Amount
          </button>

          {repayAmount && (
            <div className="mt-4 text-center">
              <p className="text-gray-300">
                Repayment Amount: {repayAmount} ETH
              </p>
              <button
                onClick={handleRepay}
                className="mt-2 bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? "Processing..." : "Repay Loan"}
              </button>
            </div>
          )}

          {canClaim && (
            <button
              onClick={handleClaimCollateral}
              className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Claim Collateral
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
