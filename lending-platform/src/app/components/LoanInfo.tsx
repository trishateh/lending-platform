"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import lendingAbi from "../../../abi/lendingAbi.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";

export const LoanInfo = () => {
  const [borrowerLoans, setBorrowerLoans] = useState<any>([]);
  const [lenderLoans, setLenderLoans] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const { address, chainId, isConnected } = useWeb3ModalAccount();

  const lendingAddress = process.env.NEXT_PUBLIC_LENDING_ADDRESS ?? "";

  const infuraProvider = new ethers.JsonRpcProvider(
    `https://linea-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
  );

  // Function to fetch loans based on wallet address
  const fetchLoans = async () => {
    try {
      const contract = new ethers.Contract(
        lendingAddress,
        lendingAbi,
        infuraProvider
      );

      // Retrieve the total number of loans
      const loanCount = await contract.loanCount();

      const borrowerLoansTemp = [];
      const lenderLoansTemp = [];

      // Loop through all loans and check if the logged-in wallet address is either a borrower or lender
      for (let loanId = 0; loanId < loanCount; loanId++) {
        const loan = await contract.getLoanInfo(loanId);

        // The structure of the loan array:
        const borrower = loan[0];
        const amount = loan[1]; // BigNumber, needs formatting
        const nftContract = loan[2];
        const nftTokenId = loan[3]; // BigNumber, needs formatting
        const lender = loan[4];
        const dueDate = loan[5]; // Unix timestamp
        const status = loan[6]; // Loan status enum

        const loanData = {
          loanId,
          borrower,
          amount: ethers.formatEther(amount.toString()),
          nftContract,
          nftTokenId: nftTokenId.toString(),
          lender,
          dueDate:
            dueDate === BigInt(0)
              ? "Not Available"
              : new Date(Number(dueDate) * 1000).toLocaleString(),
          status: status.toString(), // Enum status as string
        };

        // Check if the logged-in wallet is the borrower
        if (address && borrower.toLowerCase() === address.toLowerCase()) {
          borrowerLoansTemp.push(loanData);
        }

        // Check if the logged-in wallet is the lender
        if (address && lender.toLowerCase() === address.toLowerCase()) {
          lenderLoansTemp.push(loanData);
        }
      }

      // Update the state with the fetched loans
      setBorrowerLoans(borrowerLoansTemp);
      setLenderLoans(lenderLoansTemp);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching loans:", error);
      setLoading(false);
    }
  };

  // Trigger loan fetching on component mount
  useEffect(() => {
    fetchLoans();
  }, [address]);

  // Function to format loan status
  const formatStatus = (status: string) => {
    switch (status) {
      case "0":
        return "Active";
      case "1":
        return "Funded";
      case "2":
        return "Repaid";
      case "3":
        return "Defaulted";
      case "4":
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="p-4 bg-gray-900">
      {loading ? (
        <p className="text-gray-300 text-center">Loading loan information...</p>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Borrower's Loans Section */}
          <div className="border border-gray-700 rounded-lg p-4 shadow-lg bg-gray-800 break-words overflow-hidden whitespace-normal">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              Borrower Loans
            </h2>
            {borrowerLoans.length > 0 ? (
              borrowerLoans.map((loan: any) => (
                <div
                  key={loan.loanId}
                  className="border-b border-gray-700 pb-2 mb-2 whitespace-normal"
                >
                  <p className="text-gray-400">
                    <strong className="text-gray-200">Loan ID:</strong>{" "}
                    {loan.loanId}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">Amount:</strong>{" "}
                    {loan.amount} tokens
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">NFT Contract:</strong>{" "}
                    {loan.nftContract}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">NFT Token ID:</strong>{" "}
                    {loan.nftTokenId}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">Status:</strong>{" "}
                    {formatStatus(loan.status)}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">Due Date:</strong>{" "}
                    {loan.dueDate}
                  </p>
                </div>
              ))
            ) : (
              <p>No loans as a borrower.</p>
            )}
          </div>

          {/* Lender's Loans Section */}
          <div className="border border-gray-700 rounded-lg p-4 shadow-lg bg-gray-800 break-words overflow-hidden whitespace-normal">
            <h2 className="text-2xl font-bold mb-4 text-gray-200 ">
              Lender Loans
            </h2>
            {lenderLoans.length > 0 ? (
              lenderLoans.map((loan: any) => (
                <div
                  key={loan.loanId}
                  className="border-b border-gray-700 pb-2 mb-2"
                >
                  <p className="text-gray-400">
                    <strong className="text-gray-200">Loan ID:</strong>{" "}
                    {loan.loanId}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">Amount:</strong>{" "}
                    {loan.amount} tokens
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">NFT Contract:</strong>{" "}
                    {loan.nftContract}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">NFT Token ID:</strong>{" "}
                    {loan.nftTokenId}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">Status:</strong>{" "}
                    {formatStatus(loan.status)}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-200">Due Date:</strong>{" "}
                    {loan.dueDate}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No loans as a lender.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanInfo;
