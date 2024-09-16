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

export const CreateLoan = () => {
  const [loading, setLoading] = useState(false);
};
