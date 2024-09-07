"use client";
import { useState, useEffect } from "react";
import { NftList } from "./components/ NftList";
import { TokenList } from "./components/TokenList";
import { Lending } from "./components/Lending";

const ethers = require("ethers");

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pb-20 gap-16 sm:p-20">
      {/* Header Section */}
      <header className="flex flex-row w-full justify-between items-center px-4 py-6 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-2xl font-extrabold tracking-wide">
          DeFi Lending Platform
        </div>
        <div>
          <w3m-button />
        </div>
      </header>

      {/* Main Section */}
      <main className="flex flex-col w-full items-center gap-12 sm:flex-row sm:items-start justify-around">
        {/* Lending Component */}
        <section className="w-full sm:w-1/2 bg-gray-800 p-8 rounded-lg shadow-lg">
          <Lending />
        </section>

        {/* Token List and NFT List */}
        <section className="w-full sm:w-1/2 flex flex-col gap-8">
          {/* Token List */}
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Your Token Balances</h2>
            <TokenList />
          </div>

          {/* NFT List */}
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Your NFTs</h2>
            <NftList />
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="flex gap-6 flex-wrap items-center justify-center w-full py-6 bg-gray-800 rounded-lg shadow-lg">
        <p className="text-gray-400">
          © 2024 DeFi Lending Platform. All rights reserved.
        </p>
        <a href="/privacy" className="text-gray-400 hover:text-white">
          Privacy Policy
        </a>
        <a href="/terms" className="text-gray-400 hover:text-white">
          Terms of Service
        </a>
      </footer>
    </div>
  );
}
