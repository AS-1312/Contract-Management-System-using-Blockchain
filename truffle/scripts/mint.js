const DAI = artifacts.require("DAI");

module.exports = async function (callback) {
    try {
        console.log("Connecting to DAI contract...");
        let dai = await DAI.deployed();
        console.log("Contract found at:", dai.address);

        const amount = web3.utils.toWei("1000");

        console.log("Minting 1000 DAI to account 1 (0x9F89...)...");
        const tx1 = await dai.mint("0xE3D552d93bC2dB8c32A640A37d5Be7d5105c762b", amount);
        console.log("Transaction 1 confirmed! Hash:", tx1.tx);

        console.log("Minting 1000 DAI to account 2 (0x571f...)...");
        const tx2 = await dai.mint("0xC9B17CF9F877B3f6A3AB21975666a06B66036625", amount);
        console.log("Transaction 2 confirmed! Hash:", tx2.tx);

        console.log("All minting completed successfully!");
    } catch (error) {
        console.error("Error during minting:", error);
    }

    callback();
};