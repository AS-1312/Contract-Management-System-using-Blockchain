import React, { useEffect, useState } from "react";
import { useRouteMatch } from 'react-router-dom';
import { ethers } from 'ethers';
import DatePicker from 'react-date-picker';

export default function Contract(props) {

    const match = useRouteMatch();
    const [contractDetails, setContractDetails] = useState();
    const [newExpiryTime, setNewExpiryTime] = useState(new Date());

    useEffect(() => {
        async function fetchData() {
            const contracts = await props.getMyContracts();
            if (!contracts.includes(match.params.id)) {
                window.alert("Invalid Contract...redirecting");
                window.location.href = '/contracts';
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
        } catch (error) {
            console.log(error);
        }
    };

    const handleapproveContract = async () => {
        try {
            props.setLoading(true);
            await props.approveContract(match.params.id);
            props.setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handlevalidateContract = async () => {
        try {
            props.setLoading(true);
            await props.validateContract(match.params.id);
            props.setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    const handleRenewContract = async () => {
        try {
            props.setLoading(true);
            const timestamp = Date.parse(newExpiryTime);
            await props.renewContract(match.params.id, timestamp);
            props.setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    const getStatusInfo = (stage) => {
        switch (stage) {
            case '0': return { label: 'Pending Approval', dotClass: 'pending', badgeClass: 'gh-badge-yellow' };
            case '1': return { label: 'Pending Validation', dotClass: 'pending', badgeClass: 'gh-badge-yellow' };
            case '2': return { label: 'Active', dotClass: 'active', badgeClass: 'gh-badge-green' };
            case '3': return { label: 'Expired', dotClass: 'expired', badgeClass: 'gh-badge-red' };
            case '4': return { label: 'Rejected', dotClass: 'rejected', badgeClass: 'gh-badge-red' };
            default: return { label: 'Unknown', dotClass: 'expired', badgeClass: 'gh-badge-yellow' };
        }
    };

    return (
        <div className="gh-container-sm" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
            {contractDetails !== undefined ? (
                <>
                    {/* Page Header */}
                    <div className="gh-page-header">
                        <div>
                            <h1 className="gh-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {contractDetails.data.contractName}
                                <span className={`gh-badge ${getStatusInfo(contractDetails.stage).badgeClass}`}>
                                    {getStatusInfo(contractDetails.stage).label}
                                </span>
                            </h1>
                            <p className="gh-text-muted gh-mono" style={{ fontSize: '12px', marginTop: '4px' }}>
                                {match.params.id}
                            </p>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="gh-card" style={{ marginBottom: '16px' }}>
                        <div className="gh-detail-grid">
                            <div>
                                <div className="gh-detail-label">Initiating Party</div>
                                <div className="gh-detail-value mono">
                                    {contractDetails.data.initiatingParty === props.account
                                        ? 'You'
                                        : contractDetails.data.initiatingParty}
                                </div>
                            </div>
                            <div>
                                <div className="gh-detail-label">Expiration Date</div>
                                <div className="gh-detail-value">
                                    {(new Date(parseInt(contractDetails.data.expiryTime.toString()))).toDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="gh-detail-label">Second Party</div>
                                {contractDetails.data.parties.map((party, key) => (
                                    <div className="gh-detail-value mono" key={key}>{party}</div>
                                ))}
                            </div>
                            <div>
                                <div className="gh-detail-label">Payment</div>
                                {contractDetails.data.isPayable ? (
                                    <>
                                        {contractDetails.data.fundDistribution.map((fund, key) => (
                                            <div className="gh-detail-value" key={key}>
                                                {ethers.utils.formatEther(fund)} DAI
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="gh-detail-value gh-text-muted">Non-payable</div>
                                )}
                            </div>
                        </div>

                        <hr className="gh-divider" />

                        {/* View Document */}
                        <a href={contractDetails.data.document} target="_blank" rel="noreferrer" className="gh-btn">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-8.5A1.75 1.75 0 0012.25 2h-8.5zM3.5 3.75a.25.25 0 01.25-.25h8.5a.25.25 0 01.25.25v8.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5z" />
                                <path d="M10 8L6.5 10.5v-5L10 8z" />
                            </svg>
                            View Document
                        </a>
                    </div>

                    {/* Stage 0: Pending Approval */}
                    {contractDetails.stage === '0' && (
                        <div className="gh-card">
                            <div className="gh-status" style={{ marginBottom: '12px' }}>
                                <span className="gh-status-dot pending"></span>
                                Pending approval from all parties
                            </div>
                            {contractDetails.data.initiatingParty !== props.account && (
                                <>
                                    {contractDetails.currentApproved ? (
                                        <div className="gh-alert gh-alert-success">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                            </svg>
                                            You have already approved this contract
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <button className="gh-btn gh-btn-primary" onClick={handleapproveContract}>
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                    <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                                </svg>
                                                Sign &amp; Approve
                                            </button>
                                            <button className="gh-btn gh-btn-danger" onClick={handlerejectContract}>
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                                                </svg>
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Stage 1: Pending Final Approval */}
                    {contractDetails.stage === '1' && (
                        <div className="gh-card">
                            <div className="gh-status" style={{ marginBottom: '12px' }}>
                                <span className="gh-status-dot pending"></span>
                                Pending final approval from the initiating party
                            </div>
                            {contractDetails.data.initiatingParty === props.account && (
                                <button className="gh-btn gh-btn-primary" style={{ marginTop: '8px' }} onClick={handlevalidateContract}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                    </svg>
                                    Sign &amp; Validate Contract
                                </button>
                            )}
                        </div>
                    )}

                    {/* Stage 2: Active */}
                    {contractDetails.stage === '2' && (
                        <div className="gh-card">
                            <div className="gh-alert gh-alert-success">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L7 8.94 5.28 7.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" />
                                </svg>
                                This contract is active — approved by all parties and successfully validated.
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Expired */}
                    {contractDetails.stage === '3' && (
                        <div className="gh-card">
                            <div className="gh-alert gh-alert-warning" style={{ marginBottom: '16px' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754z" />
                                </svg>
                                This contract has expired
                            </div>
                            {contractDetails.data.initiatingParty === props.account && (
                                <div>
                                    <label className="gh-label">Choose New Expiration Date</label>
                                    <div style={{ marginBottom: '12px' }}>
                                        <DatePicker minDate={new Date()} value={newExpiryTime} onChange={(value) => setNewExpiryTime(value)} required />
                                    </div>
                                    <button className="gh-btn gh-btn-primary" onClick={handleRenewContract}>
                                        Renew Contract
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stage 4: Rejected */}
                    {contractDetails.stage === '4' && (
                        <div className="gh-card">
                            <div className="gh-alert gh-alert-danger">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                                </svg>
                                This contract has been rejected by the parties.
                            </div>
                        </div>
                    )}

                </>
            ) : (
                <div className="gh-empty-state">
                    <h3>Loading contract...</h3>
                    <p className="gh-text-muted">Fetching data from the blockchain</p>
                </div>
            )}
        </div>
    );
}