const DAI = artifacts.require("DAI");

module.exports = async function (callback) {
    try {
        const accounts = await web3.eth.getAccounts();
        const dai = await DAI.deployed();
        const amount = web3.utils.toWei("1000", "ether");

        // Using accounts[1] for the second account
        console.log(`Minting 1000 DAI to Account 2: ${accounts[1]}...`);
        await dai.mint(accounts[1], amount);

        const balance = await dai.balanceOf(accounts[1]);
        console.log(`Success! Account 2 DAI balance: ${web3.utils.fromWei(balance)} DAI`);

        callback();
    } catch (error) {
        console.error(error);
        callback(error);
    }
};
