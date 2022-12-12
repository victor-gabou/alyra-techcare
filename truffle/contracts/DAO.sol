// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Oracle.sol";

/// @title TechCare DAO
/// @author Victor G
/// @notice TechCare DAO smart contract works with a TechCare Oracle smart contract that will be used to handle risk & subscription
/// @dev TechCare DAO smart contract works with a TechCare Oracle smart contract that will be used to handle risk & subscription
contract DAO {

  struct Premium {
      address subscriber;
      string flightNumber;
      uint256 amount;
      uint256 price;
      uint256 validUntil;
      bool contracted;
      bool refunded;
  }

  struct Subscription {
      address subscriber;
      uint256 premiumId;
  }

  Oracle oracle;

  bytes32 emptyStringHash = _hashString("");

  uint256 minAmount = 10;
  uint256 maxAmount = 100;

  uint256 defaultTimeToSubscribe = 5 minutes;

  Premium[] premiums;
  mapping(string => Subscription[]) subscriptions;

  event PremiumCreated(address subscriber, uint256 premiumID);
  event PremiumUpdated(address subscriber, uint256 premiumID);

  /// @notice Restrict call to DAO
  /// @dev DAO not implemented yet
  modifier onlyDAO() {
      require(false, "daoNotReady");
      _;
  }

  /// @notice Restrict call to oracle
  modifier onlyOracle() {
      require(msg.sender == address(oracle), "onlyOracle");
      _;
  }

  constructor(address _oracleAddress) {
    oracle = Oracle(_oracleAddress);
  }

  /// @notice Get Premium by ID
  /// @dev Only subscriber
  /// @param _premiumID Premium's ID
  /// @return Premium
  function getPremium(uint256 _premiumID) external view returns (Premium memory) {
    require(_premiumID < premiums.length, "premiumNotExists");
    require(premiums[_premiumID].subscriber == msg.sender, "wrongSubscriber");
    return premiums[_premiumID];
  }

  /// @notice Create premium and ask oracle for risk based on flight number and amount
  /// @dev Use oracle to request risk
  /// @param _flightNumber Insurance flight number
  /// @param _amount Insurance amount
  function createPremium(string calldata _flightNumber, uint256 _amount) external {
    require(_hashString(_flightNumber) != emptyStringHash, "emptyFlightNumber");

    Premium memory premium;
    premium.subscriber = msg.sender;
    premium.flightNumber = _flightNumber;
    premium.amount = _amount;
    premiums.push(premium);

    oracle.requestRisk(premiums.length - 1, _flightNumber, _amount);

    emit PremiumCreated(premium.subscriber, premiums.length - 1);
  }

  /// @notice Set premium price
  /// @dev Only TechCare oracle
  /// @param _premiumID Premium's ID
  /// @param _price Premium's price
  function setPremiumPrice(uint256 _premiumID, uint256 _price) external onlyOracle {
    premiums[_premiumID].price = _price;
    premiums[_premiumID].validUntil = block.timestamp + defaultTimeToSubscribe;
    emit PremiumUpdated(premiums[_premiumID].subscriber, _premiumID);
  }


  /// @notice Contract premium
  /// @dev If first user to contract premium for this flight number, subscribe to oracle
  /// @dev Oracle's requestCancel is called instantly for testing purposes, it should be called by Oracle
  /// @param _premiumID Premium's ID
  function contractPremium(uint256 _premiumID) external {
    require(_premiumID < premiums.length, "premiumNotExists");
    require(premiums[_premiumID].subscriber == msg.sender, "wrongSubscriber");
    require(premiums[_premiumID].price != 0, "premiumPriceNotSet");
    require(!premiums[_premiumID].contracted, "premiumAlradyContacted");
    premiums[_premiumID].contracted = true;

    Subscription memory subscription;
    subscription.subscriber = msg.sender;
    subscription.premiumId = _premiumID;
    subscriptions[premiums[_premiumID].flightNumber].push(subscription);

    if(subscriptions[premiums[_premiumID].flightNumber].length == 1) {
      oracle.subscribe(premiums[_premiumID].flightNumber);
    }

    /// @dev Should be moved to Oracle
    oracle.requestCancel(premiums[_premiumID].flightNumber);

    emit PremiumUpdated(subscription.subscriber, subscription.premiumId);
  }

  /// @notice Set subscription status
  /// @dev Only TechCare oracle
  /// @param _flightNumber Subscription's flight number
  /// @param _canceled Subscription's canceled status
  function setStatus(string calldata _flightNumber, bool _canceled) external onlyOracle {
    if (_canceled) {
      for (uint256 i = 0; i < subscriptions[_flightNumber].length; i++) {
        if (!premiums[subscriptions[_flightNumber][i].premiumId].refunded) {
          premiums[subscriptions[_flightNumber][i].premiumId].refunded = true;
          emit PremiumUpdated(premiums[subscriptions[_flightNumber][i].premiumId].subscriber, subscriptions[_flightNumber][i].premiumId);
        }
      }
    }
  }

  /// @notice Get DAO min insurance amount
  /// @return uint256
  function getMinAmount() external view returns (uint256) {
    return minAmount;
  }

  /// @notice Set DAO min insurance amount
  /// @dev Only DAO
  /// @param _minAmount DAO min insurance amount
  function setMinAmount(uint256 _minAmount) external onlyDAO {
    minAmount = _minAmount;
  }

  /// @notice Get DAO max insurance amount
  /// @return uint256
  function getMaxAmount() external view returns (uint256) {
    return maxAmount;
  }

  /// @notice Set DAO max insurance amount
  /// @dev Only DAO
  /// @param _maxAmount DAO max insurance amount
  function setMaxAmount(uint256 _maxAmount) external onlyDAO {
    maxAmount = _maxAmount;
  }

  /// @notice Set DAO oracle
  /// @dev Only DAO
  /// @param _oracleAddress DAO oracle address
  function setOracle(address _oracleAddress) external onlyDAO {
    oracle = Oracle(_oracleAddress);
  }

  /// @notice Hash string to bytes32
  /// @dev Helper
  /// @param _string String
  /// @return bytes32
  function _hashString(string memory _string) private pure returns(bytes32) {
    return keccak256(abi.encodePacked(_string));
  }
}
