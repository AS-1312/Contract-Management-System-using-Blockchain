const DAI = artifacts.require("DAI");

module.exports = async function (callback) {
    try {
        console.log("Connecting to DAI contract...");
        let dai = await DAI.deployed();
        console.log("Contract found at:", dai.address);

        const amount = web3.utils.toWei("1000");

        console.log("Minting 1000 DAI to account 1 (0x9F89...)...");
        const tx1 = await dai.mint("0x9F89A08F3df0d60c96Bf082df5C39549FE2bBff0", amount);
        console.log("Transaction 1 confirmed! Hash:", tx1.tx);

        console.log("Minting 1000 DAI to account 2 (0x571f...)...");
        const tx2 = await dai.mint("0x571ff2096d39F32406bf1Da0d78103C77d399585", amount);
        console.log("Transaction 2 confirmed! Hash:", tx2.tx);

        console.log("All minting completed successfully!");
    } catch (error) {
        console.error("Error during minting:", error);
    }

    callback();
};