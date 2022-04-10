const DAI = artifacts.require("DAI");

module.exports = async function(callback) {
    let dai = await DAI.deployed();
    await dai.mint("0x61d5eDd2eC22F190dC9c05a1F07185E9c1f95684", web3.utils.toWei("100"));
    callback();
}