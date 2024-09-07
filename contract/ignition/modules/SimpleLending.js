const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const lendingToken = "0x692f50c2fb942B6cadB8f65E7717Ae40F1e1ba87";
const nftContract = "0xc1EF9b45Cd110ad11bae39A173BDaE161E240557";

module.exports = buildModule("SimpleLendingModule", (m) => {
  const token = m.getParameter("lendingToken", lendingToken);
  const nft = m.getParameter("nftContract", nftContract);

  const simpleLending = m.contract("SimpleLending", [token, nft]);

  return { simpleLending };
});
