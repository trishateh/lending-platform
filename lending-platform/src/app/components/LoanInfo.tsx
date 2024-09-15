"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../../../../contract/artifacts/contracts/LendingBorrowing.sol/LendingBorrowing.json";
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
  const lendingAbi = abi.abi;
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

        // Check if the logged-in wallet is the borrower
        if (loan.borrower.toLowerCase() === address!.toLowerCase()) {
          borrowerLoansTemp.push({ loanId, ...loan });
        }

        // Check if the logged-in wallet is the lender
        if (loan.lender.toLowerCase() === address!.toLowerCase()) {
          lenderLoansTemp.push({ loanId, ...loan });
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
  const formatStatus = (status: number) => {
    switch (status) {
      case 0:
        return "Active";
      case 1:
        return "Funded";
      case 2:
        return "Repaid";
      case 3:
        return "Defaulted";
      case 4:
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading loan information...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Borrower's Loans Section */}
          <div className="border rounded-lg p-4 shadow-lg bg-gray-50">
            <h2 className="text-xl font-bold mb-4">Borrower Loans</h2>
            {borrowerLoans.length > 0 ? (
              borrowerLoans.map((loan: any) => (
                <div key={loan.loanId} className="border-b pb-2 mb-2">
                  <p>
                    <strong>Loan ID:</strong> {loan.loanId}
                  </p>
                  <p>
                    <strong>Amount:</strong> {ethers.formatEther(loan.amount)}{" "}
                    tokens
                  </p>
                  <p>
                    <strong>NFT Contract:</strong> {loan.nftContract}
                  </p>
                  <p>
                    <strong>NFT Token ID:</strong> {loan.nftTokenId}
                  </p>
                  <p>
                    <strong>Status:</strong> {formatStatus(loan.status)}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {new Date(loan.dueDate * 1000).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No loans as a borrower.</p>
            )}
          </div>

          {/* Lender's Loans Section */}
          <div className="border rounded-lg p-4 shadow-lg bg-gray-50">
            <h2 className="text-xl font-bold mb-4">Lender Loans</h2>
            {lenderLoans.length > 0 ? (
              lenderLoans.map((loan: any) => (
                <div key={loan.loanId} className="border-b pb-2 mb-2">
                  <p>
                    <strong>Loan ID:</strong> {loan.loanId}
                  </p>
                  <p>
                    <strong>Amount:</strong> {ethers.formatEther(loan.amount)}{" "}
                    tokens
                  </p>
                  <p>
                    <strong>NFT Contract:</strong> {loan.nftContract}
                  </p>
                  <p>
                    <strong>NFT Token ID:</strong> {loan.nftTokenId}
                  </p>
                  <p>
                    <strong>Status:</strong> {formatStatus(loan.status)}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {new Date(loan.dueDate * 1000).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No loans as a lender.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanInfo;
