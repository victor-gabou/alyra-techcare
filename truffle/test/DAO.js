// const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const DAO = artifacts.require("DAO.sol");

contract("DAO", accounts => {

  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const cyril = accounts[3]

  let daoInstance
  beforeEach(async function() {
    daoInstance = await DAO.new({ from: owner });
  })

  // -------------------------
  // setMinAmount
  // -------------------------
  // describe("... setMinAmount", () => {
  //
  //   it("... should prevent updating minAmount", async () => {
  //     await expectRevert(
  //       daoInstance.setMinAmount(1000, { from: owner }),
  //       'daoNotReady'
  //     )
  //   })
  //
  // })

  // -------------------------
  // setMaxAmount
  // -------------------------
  // describe("... setMaxAmount", () => {
  //
  //   it("... should prevent updating maxAmount", async () => {
  //     await expectRevert(
  //       daoInstance.setMaxAmount(1000, { from: owner }),
  //       'daoNotReady'
  //     )
  //   })
  //
  // })

});
