// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

import "./DAO.sol";

/// @title TechCare Oracle
/// @author Victor G
/// @notice TechCare Oracle smart contract can be used by TechCare DAO smart contract to estimate risk & subscribe to an event
/// @dev TechCare Oracle smart contract can be used by TechCare DAO smart contract to estimate risk & subscribe to an event
contract Oracle is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    address private _chainlinkTokenAddress;
    address private _chainlinkOracleAddress;
    bytes32 private jobIdGetUint256;
    bytes32 private jobIdGetBool;
    uint256 private fee;

    struct Request {
      address fromAddress;
      uint256 fromID;
      string fromFlightNumber;
      uint256 fromAmount;
    }

    struct Subscription {
      address addr;
      string flightNumber;
    }

    mapping(bytes32 => Request) requests;
    mapping(string => Subscription[]) subscriptions;

    /// @notice Restrict call to chainlink
    modifier onlyChainlink() {
        require(msg.sender == _chainlinkOracleAddress, "onlyChainlink");
        _;
    }

    /**
     * @notice Initialize the link token and target oracle
     *
     * Goerli Testnet details:
     * Link Token: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Oracle: 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7 (Chainlink DevRel)
     * jobIdGetUint256: ca98366cc7314957b8c012c72f05aeeb
     * jobIdGetBool: ca98366cc7314957b8c012c72f05aeeb
     *
     */
    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        _chainlinkTokenAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
        _chainlinkOracleAddress = 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7;
        jobIdGetUint256 = "ca98366cc7314957b8c012c72f05aeeb";
        jobIdGetBool = "c1c5e92880894eb6b27d3cae19670aa3";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    /// @notice Get risk based on flight number and amount
    /// @param _fromID Premium's ID
    /// @param _flightNumber Premium's flight number
    /// @param _amount Premium's amount
    function requestRisk(uint256 _fromID, string calldata _flightNumber, uint256 _amount) external returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobIdGetUint256, address(this), this.fulfillRisk.selector);

        req.add("get", string.concat("https://api.flights.gabou.cool/flights/flightNumber?flightNumber=", _flightNumber));
        req.add("path", "risk");
        req.addInt("times", 1);

        bytes32 reqId = sendChainlinkRequest(req, fee);

        Request storage request = requests[reqId];
        request.fromAddress = msg.sender;
        request.fromID = _fromID;
        request.fromFlightNumber = _flightNumber;
        request.fromAmount = _amount;

        return reqId;
    }

    /// @notice Return risk based on flight number and amount
    /// @dev Only chainlink
    /// @param _requestId Request's ID
    /// @param _risk Premium's risk
    function fulfillRisk(bytes32 _requestId, uint256 _risk) external onlyChainlink recordChainlinkFulfillment(_requestId) {
        if(_risk > 0) {
          Request memory request = requests[_requestId];
          DAO(request.fromAddress).setPremiumPrice(request.fromID, request.fromAmount * _risk / 100);
        }
    }

    /// @notice Subscribe to flight number status update
    /// @dev Function should set an alarm clock to automatically handle requestCancel once flight should have landed
    /// @param _flightNumber Flight number
    function subscribe(string calldata _flightNumber) external {
      Subscription memory subscription;
      subscription.addr = msg.sender;
      subscription.flightNumber = _flightNumber;
      subscriptions[_flightNumber].push(subscription);
    }

    /// @notice Get cancel status based on flight number
    /// @param _flightNumber Premium's flight number
    function requestCancel(string calldata _flightNumber) external returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobIdGetBool, address(this), this.fulfillCancel.selector);

        req.add("get", string.concat("https://api.flights.gabou.cool/flights/flightNumber?flightNumber=", _flightNumber));
        req.add("path", "canceled");

        bytes32 reqId = sendChainlinkRequest(req, fee);

        Request storage request = requests[reqId];
        request.fromAddress = msg.sender;
        request.fromFlightNumber = _flightNumber;

        return reqId;
    }

    /// @notice Return cancel status based on flight number
    /// @dev Only chainlink
    /// @param _requestId Request's ID
    /// @param _canceled Premium's flight status
    function fulfillCancel(bytes32 _requestId, bool _canceled) external onlyChainlink recordChainlinkFulfillment(_requestId) {
        if(_canceled) {
          Request memory request = requests[_requestId];

          for (uint256 i = 0; i < subscriptions[request.fromFlightNumber].length; i++) {
            DAO(subscriptions[request.fromFlightNumber][i].addr).setStatus(request.fromFlightNumber, _canceled);
          }
        }
    }

    /// @notice Withdraw chainlink
    /// @dev Used to withdraw remaining chainlink tokens locked on smart contract
    function withdrawLink() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
