import React, { useEffect, useState } from "react";
import { useRouteMatch } from 'react-router-dom';
import { ethers } from 'ethers';

export default function Contract (props) {

    const match = useRouteMatch();
    const [contractDetails, setContractDetails] = useState();

    useEffect(() => {
        async function fetchData() {
            const contracts = await props.getMyContracts();
            if (!contracts.includes(match.params.id)) {
                window.alert("Invalid Contract...redirecting");
                window.location.href='/contracts';
            } else {
                const contractDetails = await props.getContractDetails(match.params.id);
                setContractDetails(contractDetails);
            }
            props.setLoading(false);
        }
        
        fetchData();
    }, []);

    const handlerejectContract = async () => {
        try {
            props.setLoading(true);
            await props.rejectContract(match.params.id);
            props.setLoading(false);
        }
        catch(error) {
            console.log(error)
        }
    };

    const handleapproveContract = async () => {
        try {
            props.setLoading(true);
            await props.approveContract(match.params.id);
            props.setLoading(false);
        }
        catch(error) {
            console.log(error)
        }
    };

    const handlevalidateContract = async () => {
        try{
            props.setLoading(true);
            const tx = await props.validateContract();
            props.setLoading(false);
        }
        catch(error){
            console.log(error);
        }  
    };      

    return(
        <React.Fragment>
            {
                contractDetails !== undefined ?
                <React.Fragment>
                    <br/>
                    <div class="flex flex-row justify-center items-center">
                        <h2 class="text-2xl font-semibold text-sky-900">Contract {match.params.id}</h2>
                    </div>
                    <br/><br/>
                    <div class="flex flex-row h-full justify-center">
                    <div style={{width: 800}} class="px-6 py-6 max-w-full mx-auto bg-slate-50 shadow-lg rounded-sm"> 
                        <h1>{contractDetails.data.contractName}</h1>
                        <br/>
                        {
                            contractDetails.data.initiatingParty === props.account ?
                            <h1>You have Initiated this Contract</h1>
                            :
                            <h1>Initiating Party: {contractDetails.data.initiatingParty}</h1>
                        }
                        <br/>
                        <h1>Date of Expiration: {(new Date(parseInt(contractDetails.data.expiryTime.toString()))).toDateString()}</h1>
                        <br/>
                        <h1>Second Party</h1>
                        {
                            contractDetails.data.parties.map((party, key) => {
                                return(
                                    <h1>{party}</h1>
                                );
                            })
                        }
                        <br/>
                        {
                            contractDetails.data.isPayable === true ?
                            <React.Fragment>
                                <h1>Funds Transfer Involved</h1>
                                {
                                    contractDetails.data.fundDistribution.map((fund, key) => {
                                        return(
                                            <h1>{ethers.utils.formatEther(fund)} DAI</h1>
                                        );
                                    })
                                }
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <h1>Not a Payable Contract</h1>
                            </React.Fragment>
                        }
                        <br/>
                        <div class="flex flex-wrap justify-center space-x-2">
                            <a href={contractDetails.data.document} target="_blank" rel="noreferrer">
                                <span class="px-4 py-2 rounded-full border border-gray-300 text-slate-900 font-semibold text-lg flex align-center w-max cursor-pointer bg-sky-400 hover:bg-sky-300">
                                View Document
                                </span>
                            </a>
                        </div>
                        <br/>
                        {
                            contractDetails.stage == 0 &&
                            <React.Fragment>
                                <h1>Pending Approval from Parties</h1>
                                <button onClick={handleapproveContract}>Approve Contract </button>
                                <button onClick={handlerejectContract}>Reject Contract </button>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 1 &&
                            <React.Fragment>
                                <h1>Pending Final Validation from Initiating Party</h1>
                                <button onClick={handlevalidateContract}>Validate Contract</button>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 2 &&
                            <React.Fragment>
                                <h1>Validated Contract</h1>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 3 &&
                            <React.Fragment>
                                <h1>Expired Contract</h1>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 4 &&
                            <React.Fragment>
                                <h1>Rejected Contract</h1>
                            </React.Fragment>
                        }
                    </div>
                    </div>
                </React.Fragment>
                :
                <React.Fragment>
                    <div class="flex flex-row justify-center items-center">
                        <h2 class="text-4xl font-bold text-sky-900">Invalid Contract</h2>
                    </div>
                </React.Fragment>
            }
        </React.Fragment>
    );
};