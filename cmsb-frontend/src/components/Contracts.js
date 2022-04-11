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
                    <h2 class="text-2xl font-bold">You do not have any contracts to be displayed</h2>
                </div>
                :
                <div class="flex flex-row justify-center items-center">
                    <h2 class="text-4xl font-semibold text-sky-900">Participating Contracts</h2>
                </div>
            }
            <br/><br/>
            {
                myContracts.map((contract, key) => {
                    return(
                        <div class="px-4 max-w-xl mx-auto" key={key}>
                            <a href={`/contract/${contract}`}>
                                <div class="h-20 my-4 bg-gradient-to-r flex justify-center items-center p-3 rounded-md border-2 border-slate-100 bg-slate-50 shadow-lg transition-all transform-all hover:scale-105 cursor-pointer relative">
                                    <div>
                                        <h1 class="text-xl text-blue-900">{contract}</h1>
                                    </div>
                                </div>
                            </a>
                        </div>
                    );
                })
            }
        </React.Fragment>
    );
};