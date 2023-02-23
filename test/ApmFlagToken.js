const { ethers } = require("hardhat");
const { expect } = require("chai");
  
describe("Apm Flag Token", function () {
    let owner,user,attacker;
    let contract;

    beforeEach(async function() {
        [owner, user, attacker] = await ethers.getSigners();

        const ERC20Contract = await ethers.getContractFactory("ApmFlagToken", owner);
        contract = await ERC20Contract.deploy();
        await contract.deployed();
    })

    describe("Initialization", function() {
        it("Should be deployed", async function() {
            expect(contract.address).to.be.properAddress
          })
    
        it("Name, symbol, decimals should be set", async function() {
            const name = await contract.name();
            expect(name).to.be.a('string').to.have.lengthOf.at.least(1);

            const symbol = await contract.symbol();
            expect(symbol).to.be.a('string').to.have.lengthOf.at.least(1);

            const decimals = await contract.decimals();
            expect(decimals).to.be.a('number').eq(0);
        })

        it("Total supply is only 1 token", async function() {
            const supply = await contract.totalSupply();
            expect(supply).to.eq(1);
        })

        it("Owner's balance equals exactly 1 token", async function() {
            const balance = await contract.balanceOf(owner.address);
            expect(balance).to.eq(1);
        })
    
        it("Other user's balance is zero", async function() {
            const balance = await contract.balanceOf(user.address);
            expect(balance).to.eq(0);
        })
    })

    describe("Transfer", function() {
        it("Should revert on zero address", async function() {
            await expect(contract.transfer(ethers.constants.AddressZero,0)).to.be.revertedWith(
                "zero address"
              );
        })

        it("Should revert on not enough balance", async function() {
            await expect(contract.transfer(user.address,100)).to.be.revertedWith(
                "not enough balance"
              );
        })

        it("Should emit a Transfer event", async function() {
            await expect(contract.transfer(user.address,1)).to.be.emit(contract,"Transfer").withArgs(owner.address,user.address,1);
        })

        it("Should change token balances", async function() {
            await expect(contract.transfer(user.address,1)).to.changeTokenBalances(contract,[owner,user], [-1,1]);
        })
    })

    describe("Approved transfer", function() {
        it("Approve should revert on zero address", async function() {
            await expect(contract.approve(ethers.constants.AddressZero,0)).to.be.revertedWith(
                "zero address for spender"
              );
        })

        it("Approve should emit an Approval event", async function() {
            await expect(contract.approve(user.address,100)).to.be.emit(contract,"Approval");
        })

        it("Approve should set allowance", async function() {
            const allowance = 100;
            const tx = await contract.approve(user.address,allowance);
            await tx.wait();

            expect(await contract.allowance(owner.address,user.address)).eq(allowance);
        })

        it("transferFrom: should revert on zero from address", async function() {
            await expect(contract.transferFrom(ethers.constants.AddressZero,user.address,0)).to.be.revertedWith(
                "address from is zero"
              );
        })

        it("transferFrom: should revert on zero to address", async function() {
            await expect(contract.transferFrom(owner.address,ethers.constants.AddressZero,0)).to.be.revertedWith(
                "address to is zero"
              );
        })

        it("transferFrom: allow owner of the tokens ignore own allowances", async function() {
            await expect(contract.transferFrom(owner.address,user.address,1)).to.not.be.revertedWith(
                "no allowance"
              );
        })

        it("transferFrom: should revert without allowance", async function() {
            await expect(contract.transferFrom(attacker.address,user.address,1)).to.be.revertedWith(
                "no allowance"
              );
        })

        it("transferFrom: should decrease allowance", async function() {
            // allow user withdraw token from owner account
            const tx = await contract.approve(user.address,1);
            await tx.wait();

            expect(await contract.allowance(owner.address,user.address)).eq(1);
            await expect(contract.connect(user).transferFrom(owner.address,user.address,1)).to.changeTokenBalances(contract,[owner,user], [-1,1]);
            expect(await contract.allowance(owner.address,user.address)).eq(0);
        })

        it("transferFrom: should emit a Transfer event", async function() {
            // allow user withdraw token from owner account
            const tx = await contract.approve(user.address,1);
            await tx.wait();

            await expect(contract.connect(user).transferFrom(owner.address,user.address,1)).to.emit(contract,"Transfer").withArgs(owner.address,user.address,1);
        })
    })
});