const Oracle = artifacts.require("Oracle");
const DAO = artifacts.require("DAO");

module.exports = async function (deployer) {
  await deployer.deploy(Oracle);
  const oracle = await Oracle.deployed()
  await deployer.deploy(DAO, oracle.address);
  const dao = await DAO.deployed()
};
