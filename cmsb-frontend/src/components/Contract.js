import React, { useEffect, useState } from "react";
import { useRouteMatch } from 'react-router-dom';

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
        }
        props.setLoading(true);
        fetchData();
        props.setLoading(false);
    }, []);

    return(
        <React.Fragment>
            {
                contractDetails !== undefined ?
                <React.Fragment>
                    <br/>
                    <div class="flex flex-row justify-center items-center">
                        <h2 class="text-xl font-bold text-sky-900">Details of Contract {match.params.id}</h2>
                    </div>
                    <h1>Current stage: {contractDetails.stage}</h1>
                    <h1>Contract Name: {contractDetails.data.contractName}</h1>
                    <h1>Date of Expiration: {(new Date(parseInt(contractDetails.data.expiryTime.toString()))).toDateString()}</h1>
                    <a href={contractDetails.data.document} target="_blank">View Doc</a>
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