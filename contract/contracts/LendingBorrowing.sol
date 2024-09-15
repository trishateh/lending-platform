// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LendingBorrowing is ReentrancyGuard, Ownable, IERC721Receiver {
    using SafeERC20 for IERC20;

    IERC20 public lendingToken;
    uint256 public loanCount;
    uint256 public constant LOAN_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
    uint16 private interestRate; // Annual interest rate

    enum LoanStatus {
        ACTIVE,
        FUNDED,
        REPAID,
        DEFAULTED,
        CANCELED
    }

    struct Loan {
        address borrower;
        uint256 amount;
        address nftContract;
        uint256 nftTokenId;
        address payable lender;
        uint256 dueDate;
        LoanStatus status;
    }

    mapping(uint256 => Loan) public loans;

    event LoanCreated(
        uint256 indexed loanId,
        uint256 amount,
        address indexed borrower,
        address indexed nftContract,
        uint256 nftTokenId
    );
    event LoanFunded(
        uint256 indexed loanId,
        address indexed funder,
        uint256 amount
    );
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount
    );
    event CollateralClaimed(
        address lender,
        address nftContract,
        uint256 tokenId
    );

    constructor(
        address _lendingToken,
        uint16 _interestRate
    ) Ownable(msg.sender) {
        lendingToken = IERC20(_lendingToken);
        interestRate = _interestRate;
    }

    /**
     * @notice Creates a new loan using an NFT as collateral.
     * @param _amount The loan amount requested.
     * @param _nftAddress The address of the NFT contract.
     * @param _nftTokenId The NFT token ID used as collateral.
     * @param _nftPrice The price of the NFT used as collateral. Retrieved from oracle or API.
     * @return loanId The ID of the loan transaction.
     */
    function createLoan(
        uint256 _amount,
        address _nftAddress,
        uint256 _nftTokenId,
        uint256 _nftPrice
    ) external nonReentrant returns (uint256) {
        require(
            IERC721(_nftAddress).ownerOf(_nftTokenId) == msg.sender,
            "Not owner of NFT."
        );

        require(
            _amount > 0 && _amount <= _nftPrice,
            "NFT collateral value less than loan."
        );

        require(
            IERC721(_nftAddress).getApproved(_nftTokenId) == address(this),
            "Contract not approved for handling NFT."
        );

        // Transfer NFT to contract
        IERC721(_nftAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _nftTokenId
        );

        uint256 loanId = loanCount++;
        Loan storage loan = loans[loanId];
        loan.borrower = msg.sender;
        loan.amount = _amount;
        loan.nftContract = _nftAddress;
        loan.nftTokenId = _nftTokenId;
        loan.lender = payable(address(0));
        loan.status = LoanStatus.ACTIVE;

        emit LoanCreated(loanId, _amount, msg.sender, _nftAddress, _nftTokenId);

        return loanId;
    }

    /**
     * @notice Funds the loan.
     * @param _loanId The ID of the loan.
     */
    function fundLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.ACTIVE, "Loan is not active");

        require(
            IERC20(lendingToken).balanceOf(msg.sender) >= loan.amount,
            "Insufficient funds"
        );

        // Transfer loan amount to borrower.
        lendingToken.safeTransferFrom(msg.sender, loan.borrower, loan.amount);

        loan.dueDate = block.timestamp + LOAN_DURATION;
        loan.lender = payable(msg.sender);
        loan.status = LoanStatus.FUNDED;

        emit LoanFunded(_loanId, msg.sender, loan.amount);
    }

    /**
     * @notice Borrower repays the loan and gets back NFT collateral.
     * @param _loanId The ID of the loan being repaid.
     */
    function repayLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];

        require(
            msg.sender == loans[_loanId].borrower,
            "Only the borrower can perform this action"
        );

        require(loan.status == LoanStatus.FUNDED, "Invalid loan status.");

        require(loan.dueDate >= block.timestamp, "Past loan due date.");

        uint256 repaymentAmount = getRepaymentAmount(loan.amount);

        require(
            IERC20(lendingToken).balanceOf(msg.sender) >= repaymentAmount,
            "Insufficient funds"
        );

        lendingToken.safeTransferFrom(msg.sender, loan.lender, repaymentAmount);

        IERC721(loan.nftContract).transferFrom(
            address(this),
            msg.sender,
            loan.nftTokenId
        );

        loan.status = LoanStatus.REPAID;

        emit LoanRepaid(_loanId, msg.sender, loan.amount);
    }

    /**
     * @notice Allows borrower to take back NFT if loan not yet funded. If borrower defaults on the loan, the NFT can be claimed by the lender.
     * @param _loanId The ID of the loan.
     */
    function claimCollateral(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];

        if (loan.status == LoanStatus.ACTIVE) {
            require(msg.sender == loan.borrower, "Not borrower.");
            IERC721(loan.nftContract).transferFrom(
                address(this),
                msg.sender,
                loan.nftTokenId
            );
            loan.status = LoanStatus.CANCELED;
        } else if (
            loan.status == LoanStatus.FUNDED && block.timestamp > loan.dueDate
        ) {
            require(msg.sender == loan.lender, "Not lender.");

            IERC721(loan.nftContract).transferFrom(
                address(this),
                msg.sender,
                loan.nftTokenId
            );
            loan.status = LoanStatus.DEFAULTED;
        }

        emit CollateralClaimed(msg.sender, loan.nftContract, loan.nftTokenId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /* Setter Functions */
    function setInterestRate(uint16 _newInterestRate) public onlyOwner {
        interestRate = _newInterestRate;
    }

    /* Getter Functions */
    function getRepaymentAmount(uint256 _amount) public view returns (uint256) {
        return _amount + ((_amount * interestRate) / 100);
    }

    function getLoanInfo(uint256 _loanId) external view returns (Loan memory) {
        Loan memory loan = loans[_loanId];
        return loan;
    }
}
