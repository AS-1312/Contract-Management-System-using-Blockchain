const DAI = artifacts.require("DAI");
const ContractFactory = artifacts.require("ContractFactory");

module.exports = async function(deployer) {
    await deployer.deploy(DAI);
    let dai = await DAI.deployed();
    await deployer.deploy(ContractFactory, dai.address);
}