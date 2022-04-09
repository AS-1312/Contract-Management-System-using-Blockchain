import React, { useState, useEffect } from 'react';
import DatePicker from 'react-date-picker'; 
import { create } from 'ipfs-http-client';

const client = create('https://ipfs.infura.io:5001/api/v0');

export default function Initiate(props) {

    const [isPayable, setIsPayable] = useState(false);
    const [expiryTime, setExpiryTime] = useState(new Date());
    const [parties, setParties] = useState([]);
    const [fundDistribution, setFundDistribution] = useState([0]);
    const [contractName, setContractName] = useState('');
    const [selectedFile, setSelectedFile] = useState();

    const handleSubmit = async (event) => {
      event.preventDefault();
      const timestamp = Date.parse(expiryTime);
      try {
        const added = await client.add(selectedFile);
        const pathUrl = `https://ipfs.infura.io/ipfs/${added.path}`;
        const contractData = {
          isPayable: isPayable,
          expiryTime: timestamp,
          fundDistribution: fundDistribution,
          initiatingParty: props.account,
          parties: parties,
          contractName: contractName,
          document: pathUrl
        }
        await props.initiateNewContract(contractData);
      } catch(error) {
        console.log("Error:", error);
      }
    }

    useEffect(() => {

    }, [props.account]);

    return(
      <React.Fragment>
        <h1>Contract Initiation</h1>
        <div  class="flex flex-row min-h-screen justify-center items-center">
          <br/><br/>
          <div style={{width: 600}}>
            <form onSubmit={handleSubmit} class="bg-gray-100 shadow-sm rounded-md p-8">
              <div class="mb-3">
                  <br/>
                  <label for="contract-name-field" class="mb-3 block text-gray-700">Contract Name</label>
                  <input 
                    type="text" 
                    class="bg-white rounded-md border border-gray-200 p-3 focus:outline-none w-full" 
                    id="contract-name-field"
                    value={contractName} 
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="Enter the name of the contract" 
                    required 
                  />
              </div>
              <br/>

              <div class="mb-3">
                <br/>
                <label for="parties-field" class="mb-3 block text-gray-700">Parties Addresses</label>
                <input 
                  type="text" 
                  class="bg-white rounded-md border border-gray-200 p-3 focus:outline-none w-full" 
                  id="parties-field" 
                  value={parties} 
                  onChange={(e) => setParties(e.target.value)}
                  placeholder="Enter the addresses of the parties" 
                  required 
                />
              </div>
              <br/>

              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  value={isPayable} 
                  id="flexCheckDefault" 
                  onChange={(e) =>  {console.log(e.target.value); setIsPayable(!isPayable)}}
                />
                <label class="form-check-label" for="flexCheckDefault">
                  Payable Contract?
                </label>
              </div>
              <br/>

              { isPayable &&
                <React.Fragment>
                <div class="mb-3">
                  <br/>
                  <label for="funds-field" class="mb-3 block text-gray-700">Parties Fund Distribution</label>
                  <input 
                    type="text" 
                    class="bg-white rounded-md border border-gray-200 p-3 focus:outline-none w-full" 
                    id="funds-field" 
                    value={fundDistribution} 
                    onChange={(e) => setFundDistribution(e.target.value)}
                    placeholder="Enter the funds distribution for the parties" 
                    required 
                  />
                </div>
                <br/>
                </React.Fragment>
              }

              <div class="flex flex-row item-center justify-center">
                <label for="et-field" class="rounded-md border border-gray-200 p-3 focus:outline-none w-full">Choose Contract Expiry Date</label>
                <DatePicker i="et-field" minDate={new Date()} value={expiryTime} onChange={(value) => {console.log(value);setExpiryTime(value)}} />
              </div>
              <br/><br/>

              <div class="mb-3">
                <label for="formFile" class="form-label"><h3 style={{ color: "Navy" }}>Upload Contract Document</h3></label>
                <input 
                  type="file" 
                  class="form-control" 
                  id="formFile" 
                  onChange={(e) =>{
                    if (e.target.files[0].type == 'application/pdf') {
                      setSelectedFile(e.target.files[0])
                    }
                  }} 
                />
              </div>
              <br/><br/>
              <div class="flex flex-row item-center justify-center">
                <button type="submit" class="relative py-3 px-12 bg-sky-600 hover:bg-sky-700 mr-5 rounded-md text-white text-lg focus:outline-none w-half">Initiate New Contract</button>
              </div>
              <br/>
            </form>
            <br/>
          </div>
      </div>
      </React.Fragment>
    );
}