"use client";

import { useState, useEffect } from "react";
import tokenAbi from "../../../abi/tokenAbi.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";

const { ethers } = require("ethers");

export const TokenList = () => {
  const [token, setToken] = useState<any>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const { address, chainId, isConnected } = useWeb3ModalAccount();

  const tokenContract = process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "";
  const infuraProvider = new ethers.JsonRpcProvider(
    `https://linea-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
  );

  const contract = new ethers.Contract(tokenContract, tokenAbi, infuraProvider);

  useEffect(() => {
    if (address && isConnected) {
      fetchTokens();
    }
  }, [address, isConnected]);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const balance = await contract.balanceOf(address);
      const formatBal = ethers.formatEther(balance);
      const symbol = await contract.symbol();
      const name = await contract.name();
      const rawUri = await contract.contractURI();
      const res = await fetch(convertIpfsUrl(rawUri));
      const metadata = await res.json();
      const image = convertIpfsUrl(metadata.image);
      setToken({ name, symbol, formatBal, image });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setLoading(false);
    }
  };

  const convertIpfsUrl = (url: string) => {
    if (url.startsWith("ipfs://")) {
      return url.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return url; // Return the original URL if it's not an IPFS URL
  };
  return (
    <>
      {!isConnected && !loading ? (
        <div className="text-center text-lg text-gray-400">
          Please connect your wallet
        </div>
      ) : loading ? (
        <div className="text-center text-lg text-gray-400">
          Loading tokens...
        </div>
      ) : (
        <div className="container mx-auto py-10 flex justify-start items-center">
          <div className="bg-gray-800 shadow-md rounded-lg p-6 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gray-700 rounded-full p-4 flex items-center justify-center">
                  {/* <img className="w-40" src={token.image} alt="token image" /> */}

                  <span className="text-3xl font-bold text-blue-500">
                    {token?.symbol[0]}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-white">
                    {token?.name}
                  </h3>
                  <p className="text-gray-400">{token?.symbol}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <span className="text-2xl font-bold text-white">
                {token.formatBal}
              </span>
              <span className="ml-2 text-gray-400">{token?.symbol}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
