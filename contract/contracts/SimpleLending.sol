// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SimpleLending is ReentrancyGuard {
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 dueDate;
        bool repaid;
    }

    IERC20 public lendingToken;
    IERC721 public nftContract;

    mapping(uint256 => Loan) public loans;
    uint256 public constant LOAN_DURATION = 30 days;
    uint256 public constant LOAN_INTEREST_RATE = 5; // 5% interest rate

    event LoanCreated(address borrower, uint256 tokenId, uint256 amount);
    event LoanRepaid(address borrower, uint256 tokenId);
    event CollateralClaimed(address lender, uint256 tokenId);

    constructor(address _lendingToken, address _nftContract) {
        lendingToken = IERC20(_lendingToken);
        nftContract = IERC721(_nftContract);
    }

    function borrowAgainstNFT(
        uint256 tokenId,
        uint256 amount
    ) external nonReentrant {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "You don't own this NFT"
        );
        require(loans[tokenId].amount == 0, "NFT already has an active loan");

        nftContract.transferFrom(msg.sender, address(this), tokenId);
        require(
            lendingToken.transfer(msg.sender, amount),
            "Token transfer failed"
        );

        loans[tokenId] = Loan({
            borrower: msg.sender,
            amount: amount,
            dueDate: block.timestamp + LOAN_DURATION,
            repaid: false
        });

        emit LoanCreated(msg.sender, tokenId, amount);
    }

    function repayLoan(uint256 tokenId) external nonReentrant {
        Loan storage loan = loans[tokenId];
        require(loan.borrower == msg.sender, "You're not the borrower");
        require(!loan.repaid, "Loan already repaid");

        uint256 repaymentAmount = calculateRepaymentAmount(loan.amount);
        require(
            lendingToken.transferFrom(
                msg.sender,
                address(this),
                repaymentAmount
            ),
            "Repayment failed"
        );

        nftContract.transferFrom(address(this), msg.sender, tokenId);
        loan.repaid = true;

        emit LoanRepaid(msg.sender, tokenId);
    }

    /// @dev Improvement: allow only authorized personnel to claim
    function claimCollateral(uint256 tokenId) external nonReentrant {
        Loan storage loan = loans[tokenId];
        require(block.timestamp > loan.dueDate, "Loan is not yet due");
        require(!loan.repaid, "Loan has been repaid");

        nftContract.transferFrom(address(this), msg.sender, tokenId);
        delete loans[tokenId];

        emit CollateralClaimed(msg.sender, tokenId);
    }

    function calculateRepaymentAmount(
        uint256 amount
    ) public pure returns (uint256) {
        return amount + ((amount * LOAN_INTEREST_RATE) / 100);
    }
}
