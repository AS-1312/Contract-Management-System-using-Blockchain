import React, { useState, useEffect } from 'react';
import DatePicker from 'react-date-picker';
import { uploadToIPFS } from './utils/pinata';
import { ethers } from 'ethers';

export default function Initiate(props) {

  const [message, setMessage] = useState('');
  const [isPayable, setIsPayable] = useState(false);
  const [expiryTime, setExpiryTime] = useState(new Date());
  const [party, setParty] = useState('');
  const [fund, setFund] = useState(0);
  const [contractName, setContractName] = useState('');
  const [selectedFile, setSelectedFile] = useState();
  const [daiBalance, setDAIBalance] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const timestamp = Date.parse(expiryTime);
    try {
      props.setLoading(true);
      let pathUrl = "local://no-document";

      // Upload document to IPFS via Pinata
      if (selectedFile) {
        const result = await uploadToIPFS(selectedFile);
        if (result.success) {
          pathUrl = result.url;
        } else {
          console.warn("IPFS upload issue:", result.error);
          pathUrl = result.url; // Falls back to local://filename
        }
      }
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
        window.location.href = "/contracts";
      }
    } catch (error) {
      console.log("Error:", error);
    }
    props.setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      if (props.account) {
        const balance = await props.getDAIBalance();
        setDAIBalance(balance.toString());
      }
    }
    fetchData();
  }, [props.account, props.getDAIBalance]);

  return (
    <div className="gh-container-sm" style={{ paddingTop: '32px', paddingBottom: '64px' }}>

      {/* Page Header */}
      <div className="gh-page-header">
        <h1 className="gh-page-title">New Contract Initiation</h1>
      </div>

      {/* Warning Alert */}
      {message !== '' && (
        <div className="gh-alert gh-alert-warning" style={{ marginBottom: '16px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z" />
          </svg>
          {message}
        </div>
      )}

      {/* Form Card */}
      <div className="gh-card">
        <form onSubmit={handleSubmit}>

          {/* Contract Name */}
          <div style={{ marginBottom: '20px' }}>
            <label className="gh-label" htmlFor="contract-name-field">Contract Name</label>
            <input
              type="text"
              className="gh-input"
              id="contract-name-field"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="Enter the name of the contract/agreement"
              required
            />
          </div>

          {/* Payable Checkbox */}
          <div style={{ marginBottom: '20px' }}>
            <label className="gh-checkbox">
              <input
                type="checkbox"
                checked={isPayable}
                id="payable-check"
                onChange={() => setIsPayable(!isPayable)}
              />
              Payable Contract
            </label>
            <p className="gh-input-hint">Enable if this contract involves DAI token transfers</p>
          </div>

          <hr className="gh-divider" />

          {/* Party Address */}
          <div style={{ marginBottom: '20px' }}>
            <label className="gh-label" htmlFor="parties-field">Party Address</label>
            <input
              type="text"
              className="gh-input gh-mono"
              id="parties-field"
              value={party}
              onChange={(e) => {
                setParty(e.target.value);
                if (!ethers.utils.isAddress(e.target.value)) {
                  setMessage("Invalid party address");
                } else {
                  setMessage('');
                }
              }}
              placeholder="0x..."
              required
            />
            <p className="gh-input-hint">Ethereum address of the second party</p>
          </div>

          {/* Fund Distribution (if payable) */}
          {isPayable && (
            <>
              <div style={{ marginBottom: '8px', padding: '12px 16px', background: 'rgba(88, 166, 255, 0.08)', borderRadius: '6px', border: '1px solid rgba(88, 166, 255, 0.2)' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-accent-fg)' }}>
                  💰 Your DAI Balance: <strong>{daiBalance}</strong>
                </span>
              </div>
              <div style={{ marginBottom: '20px', marginTop: '12px' }}>
                <label className="gh-label" htmlFor="funds-field">Fund Transfer Amount</label>
                <input
                  type="text"
                  className="gh-input"
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
                  }}
                  placeholder="Amount in DAI (e.g. 100)"
                  required
                />
              </div>
            </>
          )}

          <hr className="gh-divider" />

          {/* Expiration Date */}
          <div style={{ marginBottom: '20px' }}>
            <label className="gh-label">Contract Expiration Date</label>
            <DatePicker
              minDate={new Date()}
              value={expiryTime}
              onChange={(value) => setExpiryTime(value)}
              required
            />
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '20px' }}>
            <label className="gh-label" htmlFor="formFile">Contract Document (PDF)</label>
            <input
              className="gh-file-input"
              type="file"
              id="formFile"
              onChange={(e) => {
                if (e.target.files[0] && e.target.files[0].type === 'application/pdf') {
                  setSelectedFile(e.target.files[0]);
                  setMessage('');
                } else if (e.target.files[0]) {
                  setMessage('Invalid file type, please upload a pdf file');
                }
              }}
            />
            <p className="gh-input-hint">Optional — upload the contract document as PDF</p>
          </div>

          {isPayable && (
            <div className="gh-alert gh-alert-warning" style={{ marginBottom: '20px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              Payable contracts require 2 confirmations: Approval + Initiation
            </div>
          )}

          <hr className="gh-divider" />

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="gh-btn gh-btn-primary gh-btn-lg"
              disabled={message !== ''}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
              Initiate Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}