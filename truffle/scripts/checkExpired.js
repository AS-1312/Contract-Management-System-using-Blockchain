const ContractController = require("../build/contracts/ContractController.json");

module.exports = async function(callback) {
    let contractMain = new web3.eth.Contract(ContractController.abi, "address");
    if (await contractMain.methods.hasContractExpired().call()) {
        await contractMain.methods.checkExpired().send();
    }
    callback();
}