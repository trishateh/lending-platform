const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const lendingToken = "0x692f50c2fb942B6cadB8f65E7717Ae40F1e1ba87";
const interestRate = 5; // 5% interest

module.exports = buildModule("LendingBorrowingModule", (m) => {
  const token = m.getParameter("lendingToken", lendingToken);
  const interest = m.getParameter("interestRate", interestRate);

  const lendingBorrowing = m.contract("LendingBorrowing", [token, interest]);

  return { lendingBorrowing };
});
