"use client";

import { useState, useEffect } from "react";
import nftAbi from "../../../abi/nftAbi.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";

const { ethers } = require("ethers");

export const NftList = () => {
  const [nfts, setNfts] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { address, chainId, isConnected } = useWeb3ModalAccount();

  const nftContract = process.env.NEXT_PUBLIC_NFT_ADDRESS ?? "";
  const infuraProvider = new ethers.JsonRpcProvider(
    `https://linea-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
  );

  const contract = new ethers.Contract(nftContract, nftAbi, infuraProvider);

  useEffect(() => {
    if (infuraProvider && address) {
      fetchNfts();
    }
  }, [address]);

  const fetchNfts = async () => {
    try {
      setLoading(true);
      const balance = await contract.tokensOfOwner(address);
      if (balance && balance.length > 0) {
        const nfts = await Promise.all(
          balance.map(async (tokenId: number) => {
            const metadata = await getNftMetadata(tokenId);
            metadata.image = convertIpfsUrl(metadata.image);
            return {
              tokenId,
              metadata,
            };
          })
        );
        setNfts(nfts);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setLoading(false);
    }
  };

  const getNftMetadata = async (tokenId: number) => {
    try {
      const uri = await contract.tokenURI(tokenId);
      const response = await fetch(convertIpfsUrl(uri));
      const metadata = await response.json();

      return metadata;
    } catch (err) {
      console.error("Error fetching NFT metadata: ", err);
      return null;
    }
  };

  const convertIpfsUrl = (url: string) => {
    if (url.startsWith("ipfs://")) {
      return url.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return url; // Return the original URL if it's not an IPFS URL
  };

  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <div className="text-center text-lg text-gray-200">Loading NFTs...</div>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts.map((nft: any, index: number) => (
            <div
              key={index}
              className="bg-gray-800 shadow-md rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              <img
                src={nft.metadata.image}
                alt={nft.metadata.name}
                className="w-30 object-contain" // object-contain ensures proper sizing without distortion
              />
              <div className="p-4">
                <span className="font-bold text-gray-300">
                  {nft.metadata.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-lg text-gray-200">
          You don't own any NFTs yet.
        </div>
      )}
    </div>
  );
};
