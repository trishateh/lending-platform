"use client";

import { useState, useEffect } from "react";
import nftAbi from "../../../abi/nftAbi.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { ethers, BrowserProvider, Contract } from "ethers";

export const NftList = () => {
  const [nfts, setNfts] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { address, chainId, isConnected } = useWeb3ModalAccount();

  const nftContract = process.env.NEXT_PUBLIC_NFT_ADDRESS ?? "";
  const infuraProvider = new ethers.JsonRpcProvider(
    `https://linea-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
  );

  const contract = new Contract(nftContract, nftAbi, infuraProvider);

  useEffect(() => {
    if (address && isConnected) {
      fetchNfts();
    }
  }, [address, isConnected]);

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

  const handleMintNft = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(nftContract, nftAbi, signer);
      const receiver = address;
      const quantity = 1;
      const currency = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      const pricePerToken = 0;
      const allowListProof = {
        proof: [
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ],
        quantityLimitPerWallet: "0",
        pricePerToken: "0",
        currency: "0x0000000000000000000000000000000000000000",
      };
      const tx = await contract.claim(
        receiver,
        quantity,
        currency,
        pricePerToken,
        allowListProof
      );
      await tx.wait();
    } catch (err) {
      alert("Error Minting NFT");
      console.log("Error minting NFT: ", err);
    }
  };

  return (
    <div className="container mx-auto py-10">
      {!isConnected && !loading ? (
        <div className="text-center text-lg text-gray-400">
          Please connect your wallet
        </div>
      ) : loading ? (
        <div className="text-center text-lg text-gray-400">Loading NFTs...</div>
      ) : nfts && nfts.length > 0 ? (
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
        <div className="flex flex-col justify-center items-center text-center text-lg text-gray-200 gap-3">
          You don't own any NFTs yet.
          <button
            onClick={() => handleMintNft()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Claim 1 NFT
          </button>
        </div>
      )}
    </div>
  );
};
