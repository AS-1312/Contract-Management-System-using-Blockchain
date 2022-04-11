const DAI = artifacts.require("DAI");

module.exports = async function(callback) {
    let dai = await DAI.deployed();
    await dai.mint("0x61d5eDd2eC22F190dC9c05a1F07185E9c1f95684", web3.utils.toWei("1000"));
    await dai.mint("0x0181AAC1bF91f2C6d34B380638df0497F4c668fd", web3.utils.toWei("1000"));
    await dai.mint("0x09E27534C4e5880cc46D597d44171DdA0c36C156", web3.utils.toWei("1000"));
    await dai.mint("0xB6697fA1ae76aF6860071CC411a8E681743631CC", web3.utils.toWei("1000"));
    callback();
}