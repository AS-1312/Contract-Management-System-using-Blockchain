const ContractController = require("../build/contracts/ContractController.json");

module.exports = async function(callback) {
    let contractMain = new web3.eth.Contract(ContractController.abi, "0xaabC5C7737Ed9e3b91e9864Be22E0e31e99C58b6");
    const isExpired = await contractMain.methods.hasContractExpired().call();
    console.log(isExpired);
    await contractMain.methods.checkExpired()
    .send()
    .on("transactionHash", function (hash) {})
    .on("receipt", function (receipt) {})
    .on("confirmation", (confirmationNumber, receipt) => {
      console.log("success", receipt);
    })
    .on("error", (error, receipt) => {
      console.log("error", error)
    });
    callback();
}