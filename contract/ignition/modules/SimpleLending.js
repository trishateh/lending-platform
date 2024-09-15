const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const initialOwner = process.env.WALLET_ADDRESS;

module.exports = buildModule("MockTokenModule", (m) => {
  const owner = m.getParameter("initialOwner", initialOwner);

  const mockToken = m.contract("MockToken", [owner]);

  return { mockToken };
});
