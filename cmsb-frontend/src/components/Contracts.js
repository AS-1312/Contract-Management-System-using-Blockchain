import React, { useState, useEffect } from 'react';

export default function Contracts (props) {
    const [myContracts, setMyContracts] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const contracts = await props.getMyContracts();  
            setMyContracts(contracts);
        }
        props.setLoading(true);
        fetchData();
        props.setLoading(false);
        
    }, [myContracts.length, props.account]);  

    return(
        <React.Fragment>
            <br/>
            {
                myContracts.length === 0 ?
                <div class="flex flex-row justify-center items-center">
                    <h2 class="text-xl font-bold">You do not have any contracts to be displayed</h2>
                </div>
                :
                <div class="flex flex-row justify-center items-center">
                    <h2 class="text-2xl font-bold text-sky-900">Your Contracts</h2>
                </div>
            }
            <br/><br/>
            {
                myContracts.map((contract, key) => {
                    return(
                        <div key={key}>
                            <a href={`/contract/${contract}`}>
                                <h1 class="text-xl text-blue-900">{contract}</h1>
                            </a>
                        </div>
                    );
                })
            }
        </React.Fragment>
    );
};