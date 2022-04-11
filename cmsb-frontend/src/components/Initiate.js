import React, { useState, useEffect } from 'react';
import DatePicker from 'react-date-picker'; 
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';

const client = create('https://ipfs.infura.io:5001/api/v0');

export default function Initiate(props) {

    const [message, setMessage] = useState('');
    const [isPayable, setIsPayable] = useState(false);
    const [expiryTime, setExpiryTime] = useState(new Date());
    const [party, setParty] = useState('');
    const [fund, setFund] = useState();
    // const [parties, setParties] = useState([]);
    // const [fundDistribution, setFundDistribution] = useState([]);
    const [contractName, setContractName] = useState('');
    const [selectedFile, setSelectedFile] = useState();
    const [daiBalance, setDAIBalance] = useState(0);

    const handleSubmit = async (event) => {
      event.preventDefault();
      const timestamp = Date.parse(expiryTime);
      try {
        props.setLoading(true);
        const added = await client.add(selectedFile);
        const pathUrl = `https://ipfs.infura.io/ipfs/${added.path}`;
        const contractData = {
          isPayable: isPayable,
          expiryTime: timestamp,
          fundDistribution: [fund],
          initiatingParty: props.account,
          parties: [party],
          contractName: contractName,
          document: pathUrl
        }
        const txStatus = await props.initiateNewContract(contractData);
        if (txStatus) {
          window.location.href="/contracts";
        }
      } catch(error) {
        console.log("Error:", error);
      }
      props.setLoading(false);
    }

    useEffect(() => {
      async function fetchData() {
        const daiBalance = await props.getDAIBalance();
        setDAIBalance(daiBalance.toString());
      }

      fetchData();
    }, []);

    return(
      <React.Fragment>
        <div class="h-20 flex flex-row justify-center items-center">
          <h1 class="text-4xl font-semibold text-sky-900">New Contract Initiation</h1>
        </div>
        <br/>
        {
          message !== '' &&
          <div class="flex flex-row justify-center items-center max-w-screen px-16">
            <div class="bg-yellow-100 py-5 h-12 px-6 mb-3 text-base text-yellow-700 inline-flex items-center w-full" role="alert">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="exclamation-triangle" class="w-4 h-4 mr-2 fill-current" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                <path fill="currentColor" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path>
              </svg>
              {message}
            </div>
          </div>
        }
        <br/>
        <div class="flex flex-row min-h-screen justify-center items-center">
          <br/><br/>
          <div style={{width: 600}}>
            <form onSubmit={handleSubmit} class="bg-gray-100 shadow-xl rounded-md p-8">
              <div class="mb-5">
                  <br/>
                  <label for="contract-name-field" class="mb-3 block text-gray-700 text-xl">Contract Name</label>
                  <input 
                    type="text" 
                    class="bg-white rounded-md border border-gray-200 p-3 focus:outline-none w-full" 
                    id="contract-name-field"
                    value={contractName} 
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="Enter the name of the contract/agreement" 
                    required 
                  />
              </div>
              <br/>

              <div class="flex flex-row item-center justify-center">
                <input 
                  class="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" 
                  type="checkbox" 
                  value={isPayable} 
                  id="payable-check" 
                  onChange={(e) => {setIsPayable(!isPayable)}}
                />
                <label class="form-check-label inline-block text-gray-800 text-lg" for="payable-check">
                  Payable Contract
                </label>
              </div>
              <br/>

              <div class="mb-3">
                <br/>
                <label for="parties-field" class="mb-3 block text-gray-700 text-xl">Party Address</label>
                <input 
                  type="text" 
                  class="bg-white rounded-md border border-gray-200 p-3 focus:outline-none w-full" 
                  id="parties-field" 
                  value={party} 
                  onChange={(e) => {
                    setParty(e.target.value);
                    if (!ethers.utils.isAddress(e.target.value)) {
                      setMessage("Invalid party address");
                    } else {
                      setMessage('');
                    }
                     /*setParties([...parties, e.target.value])*/
                  }}
                  placeholder="Enter the address of the second party" 
                  required 
                />
              </div>
              <br/>

              { isPayable &&
                <React.Fragment>
                <div class="mb-3">
                  <div class="flex flex-row justify-center">
                    <h1>Your DAI Token Balance: {daiBalance}</h1>
                  </div>
                  <br/><br/>
                  <label for="funds-field" class="mb-3 block text-gray-700 text-xl">Fund Transfer</label>
                  <input 
                    type="text" 
                    class="bg-white rounded-md border border-gray-200 p-3 focus:outline-none w-full" 
                    id="funds-field" 
                    value={fund} 
                    onChange={(e) => {
                      setFund(e.target.value);
                      if (!isNaN(e.target.value) || e.target.value === 0) {
                        if (e.target.value > daiBalance) {
                          setMessage('You do not have sufficient DAI balance');
                        } else {
                          setMessage('');
                        }
                      } else {
                        setMessage('Invalid amount or text entered');
                      }
                       /*setFundDistribution(e.target.value)*/
                    }}
                    placeholder="Enter the amount to be transferred to the Party (in USD)" 
                    required 
                  />
                </div>
                <br/>
                </React.Fragment>
              }

              <div class="flex flex-row item-center justify-center">
                <label for="et-field" class="rounded-md border text-lg border-gray-200 p-3 focus:outline-none w-full">Choose Contract Expiration Date</label>
                <DatePicker i="et-field" minDate={new Date()} value={expiryTime} onChange={(value) => {setExpiryTime(value)}} required />
              </div>
              <br/><br/>

              <div class="flex justify-center">
                <div class="mb-3 w-96">
                  <label for="formFile" class="form-label inline-block mb-2 text-gray-700 text-lg">Upload Contract Document (pdf)</label>
                  <input 
                    class="form-control
                    block
                    w-full
                    px-3
                    py-1.5
                    text-base
                    font-normal
                    text-gray-700
                    bg-white bg-clip-padding
                    border border-solid border-gray-300
                    rounded
                    transition
                    ease-in-out
                    m-0
                    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" 
                    type="file" 
                    id="formFile"
                    onChange={(e) => {
                      if (e.target.files[0].type === 'application/pdf') {
                        setSelectedFile(e.target.files[0]);
                        setMessage('');
                      } else {
                        setMessage('Invalid file type, please upload a pdf file');
                      }
                    }} 
                    required
                  />
                </div>
              </div>
              <br/>
              <div class="flex flex-row item-center justify-center">
                {
                  isPayable &&
                  <React.Fragment>
                    <h1>Note: Payable Contracts will have 2 stages of Confirmation - Approval and Initiation</h1>
                    <br/><br/>
                  </React.Fragment>
                }
              </div>
              <div class="flex flex-row item-center justify-center">
                <button type="submit" class="relative py-3 px-12 bg-sky-600 hover:bg-sky-700 mr-5 rounded-md text-white text-lg focus:outline-none w-half disabled:opacity-10" disabled={message !== '' ? true : false}>Initiate New Contract</button>
              </div>
              <br/>
            </form>
            <br/><br/>
          </div>
      </div>
      </React.Fragment>
    );
}