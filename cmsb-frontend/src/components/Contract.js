import React, { useEffect, useState } from "react";
import { useRouteMatch } from 'react-router-dom';
import { ethers } from 'ethers';
import DatePicker from 'react-date-picker';

export default function Contract (props) {

    const match = useRouteMatch();
    const [contractDetails, setContractDetails] = useState();
    const [newExpiryTime, setNewExpiryTime] = useState(new Date()); 

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
            const tx = await props.validateContract(match.params.id);
            props.setLoading(false);
        }
        catch(error){
            console.log(error);
        }  
    };      

    const handleRenewContract = async () => {
        try{
            props.setLoading(true);
            const timestamp = Date.parse(newExpiryTime);
            const tx = await props.renewContract(match.params.id, timestamp);
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
                    <div style={{width: 800}} class="px-6 py-6 max-w-full mx-auto bg-slate-100 shadow-xl rounded-sm"> 
                        <div class="flex flex-col justify-center">
                            <div class="flex flex-row justify-center">
                                <h1 class="text-4xl text-blue-900 font-semibold">{contractDetails.data.contractName}</h1>
                            </div>
                            <br/>
                            {
                                contractDetails.data.initiatingParty === props.account ?
                                <h1 class="text-lg font-semibold">You have Initiated this Contract</h1>
                                :
                                <h1 class="text-lg font-semibold">Initiating Party: {contractDetails.data.initiatingParty}</h1>
                            }
                            <br/>
                            <h1 class="text-xl font-semibold">Date of Expiration: {(new Date(parseInt(contractDetails.data.expiryTime.toString()))).toDateString()}</h1>
                            <br/>
                            <h1 class="text-xl font-semibold">Second Party</h1>
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
                                    <h1 class="text-xl font-semibold">Funds Transfer Involved</h1>
                                    {
                                        contractDetails.data.fundDistribution.map((fund, key) => {
                                            return(
                                                <h1 class="text-lg">{ethers.utils.formatEther(fund)} DAI</h1>
                                            );
                                        })
                                    }
                                </React.Fragment>
                                :
                                <React.Fragment>
                                    <h1 class="text-xl">Not a Payable Contract</h1>
                                </React.Fragment>
                            }
                        </div>
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
                                <div class="flex flex-col justify-center">
                                    <div class="flex flex-row justify-center">
                                        <h1 class="text-slate-800 text-xl mb-4">Current Status: Pending Approval from Parties</h1>
                                    </div>
                                    {
                                        contractDetails.data.initiatingParty != props.account &&
                                        <React.Fragment>
                                        {
                                            contractDetails.currentApproved ?
                                            <div class="flex flex-row justify-center">
                                                <h1 class="text-slate-800 text-lg">You have already approved this contract</h1>
                                            </div>
                                            :
                                            <div class="flex flex-row justify-center my-5">
                                                <button class="py-2 px-6 mx-3 bg-emerald-500 hover:bg-emerald-400 rounded-md text-white" onClick={handleapproveContract}>Sign and Approve Contract </button>
                                                <button class="py-2 px-6 mx-3 bg-red-500 hover:bg-red-400 rounded-md text-white" onClick={handlerejectContract}>Reject Contract </button>
                                            </div>
                                        }
                                        </React.Fragment>
                                    }
                                </div>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 1 &&
                            <React.Fragment>
                                <div class="flex flex-row justify-center">
                                    <div class="flex flex-col justify-center">
                                        <h1 class="text-slate-800 text-lg font-semibold mb-4">Current Status: Pending Final Approval from the Initiating Party</h1>
                                        {
                                            contractDetails.data.initiatingParty == props.account &&
                                            <button class="py-2 px-6 bg-blue-500 hover:bg-blue-400 rounded-md text-white" onClick={handlevalidateContract}>Sign and Validate Contract</button>
                                            
                                        }
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 2 &&
                            <React.Fragment>
                                <div class="flex flex-row justify-center">
                                    <div class="flex flex-col justify-center">
                                    <h1 class="text-slate-800 text-xl font-semibold mb-4">Current Status: <span class="text-green-800">Active Contract</span></h1>
                                        <h1 class="text-lg">Contract has been approved by the parties and succesfully validated</h1>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 3 &&
                            <React.Fragment>
                                <div class="flex flex-row justify-center">
                                    <div class="flex flex-col justify-center items-center">
                                        <h1 class="text-slate-800 text-lg font-semibold mb-4">!!! This Contract has Expired</h1>
                                    {
                                        contractDetails.data.initiatingParty == props.account &&
                                        <div class="flex flex-col item-center justify-center">
                                            <label for="et-field" class="rounded-md border text-lg border-gray-200 p-3 focus:outline-none w-full">Choose New Contract Expiration Date</label>
                                            <DatePicker i="et-field" minDate={new Date()} value={newExpiryTime} onChange={(value) => {setNewExpiryTime(value)}} required />
                                            <button class="py-2 px-6 bg-blue-500 hover:bg-blue-400 rounded-md text-white mt-5" onClick={handleRenewContract}>Renew Contract</button>
                                        </div>
                                    }
                                    </div>
                                    <br/><br/>
                                </div>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 4 &&
                            <React.Fragment>
                                <div class="flex flex-row justify-center">
                                    <div class="flex flex-col justify-center">
                                        <h1 class="text-red-600 text-lg font-semibold mb-4">This Contract has been rejected by the parties</h1>
                                    </div>
                                </div>
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