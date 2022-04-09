import React, { useState, useEffect } from 'react';

export default function Contracts(props) {
    const [myContracts, setMyContracts] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const contracts = await props.getMyContracts();
            if (contracts) {
                setMyContracts(contracts);
            }
        }
        fetchData();
    }, [myContracts.length]);
    

    return(
        <React.Fragment>
            {myContracts.length === 0 &&
                <h2 style={{textAlign: 'center'}}>You do not have any contracts to be displayed</h2>
            }
        </React.Fragment>
    );
}