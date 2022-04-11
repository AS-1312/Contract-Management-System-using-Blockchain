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

    return(
        <React.Fragment>
            {
                contractDetails !== undefined ?
                <React.Fragment>
                    <br/>
                    <div class="flex flex-row justify-center items-center">
                        <h2 class="text-2xl font-bold text-sky-900">Contract {match.params.id}</h2>
                    </div>
                    <br/><br/>
                    <div class="flex flex-row h-full justify-center">
                    <div style={{width: 800}} class="px-6 py-6 max-w-full mx-auto bg-zinc-100 shadow-lg rounded-md"> 
                        <h1>Contract Name: {contractDetails.data.contractName}</h1>
                        <br/>
                        <h1>Initiating Party: {contractDetails.data.initiatingParty}</h1>
                        <br/>
                        <h1>Date of Expiration: {(new Date(parseInt(contractDetails.data.expiryTime.toString()))).toDateString()}</h1>
                        <br/>
                        <h1>Parties:</h1>
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
                                <h1>Funds Distribution:</h1>
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
                            <a href={contractDetails.data.document} target="_blank">
                                <span class="px-4 py-2 rounded-full border border-gray-300 text-slate-900 font-semibold text-lg flex align-center w-max cursor-pointer bg-sky-400 transition duration-300 ease">
                                View Document
                                </span>
                            </a>
                        </div>
                        <br/>
                        {
                            contractDetails.stage == 0 &&
                            <React.Fragment>
                                <h1>Pending Approval from Parties</h1>
                            </React.Fragment>
                        }
                        {
                            contractDetails.stage == 1 &&
                            <React.Fragment>
                                <h1>Pending Final Validation from Initiating Party</h1>
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