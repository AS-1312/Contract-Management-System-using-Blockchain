import React, { useEffect, useState, useRef } from "react";
import { useRouteMatch } from 'react-router-dom';
import { ethers } from 'ethers';
import DatePicker from 'react-date-picker';

// Helper: format a duration in ms to human-readable countdown
function formatTimeRemaining(ms) {
    if (ms <= 0) return null;

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
}

export default function Contract(props) {

    const match = useRouteMatch();
    const [contractDetails, setContractDetails] = useState();
    const [newExpiryTime, setNewExpiryTime] = useState(new Date());
    const [isExpiredLocally, setIsExpiredLocally] = useState(false);
    const [renewalSuccess, setRenewalSuccess] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            const contracts = await props.getMyContracts();
            if (!contracts.includes(match.params.id)) {
                window.alert("Invalid Contract...redirecting");
                window.location.href = '/contracts';
            } else {
                const contractDetails = await props.getContractDetails(match.params.id);
                setContractDetails(contractDetails);

                // Start the countdown timer for Active contracts
                if (contractDetails.stage === '2') {
                    const expiryMs = parseInt(contractDetails.data.expiryTime.toString());
                    const remaining = expiryMs - Date.now();
                    if (remaining <= 0) {
                        setIsExpiredLocally(true);
                        setTimeRemaining(null);
                    } else {
                        setTimeRemaining(remaining);
                    }
                }
            }
            props.setLoading(false);
        }
        fetchData();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Live countdown timer
    useEffect(() => {
        if (contractDetails && contractDetails.stage === '2' && !isExpiredLocally) {
            const expiryMs = parseInt(contractDetails.data.expiryTime.toString());

            timerRef.current = setInterval(() => {
                const remaining = expiryMs - Date.now();
                if (remaining <= 0) {
                    setTimeRemaining(null);
                    setIsExpiredLocally(true);
                    clearInterval(timerRef.current);
                } else {
                    setTimeRemaining(remaining);
                }
            }, 1000);

            return () => clearInterval(timerRef.current);
        }
    }, [contractDetails, isExpiredLocally]);

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

    const handleCheckAndTransitionExpired = async () => {
        try {
            props.setLoading(true);
            const result = await props.checkExpired(match.params.id);
            if (result) {
                const updatedDetails = await props.getContractDetails(match.params.id);
                setContractDetails(updatedDetails);
                setIsExpiredLocally(false);
            }
            props.setLoading(false);
        } catch (error) {
            console.log(error);
            props.setLoading(false);
        }
    };

    const handleRenewContract = async () => {
        try {
            props.setLoading(true);
            const timestamp = Date.parse(newExpiryTime);
            const result = await props.renewContract(match.params.id, timestamp);
            if (result) {
                setRenewalSuccess(true);
                const updatedDetails = await props.getContractDetails(match.params.id);
                setContractDetails(updatedDetails);
            }
            props.setLoading(false);
        } catch (error) {
            console.log(error);
            props.setLoading(false);
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

    const getDisplayStatus = () => {
        if (contractDetails.stage === '2' && isExpiredLocally) {
            return { label: 'Expired (pending update)', dotClass: 'expired', badgeClass: 'gh-badge-red' };
        }
        return getStatusInfo(contractDetails.stage);
    };

    // Refresh icon SVG reused across buttons
    const refreshIcon = (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M1.705 8.005a.75.75 0 01.834.656 5.5 5.5 0 009.592 2.97l-1.204-1.204a.25.25 0 01.177-.427h3.646a.25.25 0 01.25.25v3.646a.25.25 0 01-.427.177l-1.38-1.38A7.001 7.001 0 011.05 8.84a.75.75 0 01.656-.834zM8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7.002 7.002 0 0114.95 7.16a.75.75 0 11-1.49.178A5.5 5.5 0 008 2.5z" />
        </svg>
    );

    return (
        <div className="gh-container-sm" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
            {contractDetails !== undefined ? (
                <>
                    {/* Page Header */}
                    <div className="gh-page-header">
                        <div>
                            <h1 className="gh-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {contractDetails.data.contractName}
                                <span className={`gh-badge ${getDisplayStatus().badgeClass}`}>
                                    {getDisplayStatus().label}
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

                    {/* Stage 2: Active — with countdown timer and renewal preview */}
                    {contractDetails.stage === '2' && (
                        <div className="gh-card">
                            {isExpiredLocally ? (
                                <>
                                    {/* Contract has expired but on-chain state hasn't updated */}
                                    <div className="gh-alert gh-alert-warning" style={{ marginBottom: '16px' }}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754z" />
                                        </svg>
                                        This contract has passed its expiration date. Update the on-chain status to proceed with renewal.
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="gh-btn gh-btn-danger" onClick={handleCheckAndTransitionExpired}>
                                            {refreshIcon}
                                            Mark as Expired
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Contract is active — show success + countdown */}
                                    <div className="gh-alert gh-alert-success" style={{ marginBottom: '16px' }}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L7 8.94 5.28 7.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" />
                                        </svg>
                                        This contract is active — approved by all parties and successfully validated.
                                    </div>

                                    {/* Countdown + disabled Renew button */}
                                    <div className="gh-renewal-preview">
                                        <hr className="gh-divider" />
                                        <div className="gh-countdown-row">
                                            <div className="gh-countdown-info">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0, marginTop: '2px' }}>
                                                    <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.37.65l2.5 1.5a.75.75 0 00.76-1.3L8.5 7.87V4.75z" />
                                                </svg>
                                                <div>
                                                    <div className="gh-countdown-label">Time remaining until expiry</div>
                                                    <div className="gh-countdown-timer">
                                                        {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="gh-btn gh-btn-primary" disabled title="Available after contract expires">
                                                {refreshIcon}
                                                Renew Contract
                                            </button>
                                        </div>
                                        <p className="gh-text-subtle" style={{ fontSize: '12px', marginTop: '8px' }}>
                                            The renewal option will become available once the contract expires.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Stage 3: Expired — Renewal UI */}
                    {contractDetails.stage === '3' && (
                        <div className="gh-card">
                            <div className="gh-alert gh-alert-warning" style={{ marginBottom: '16px' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754z" />
                                </svg>
                                This contract has expired
                            </div>

                            {renewalSuccess && (
                                <div className="gh-alert gh-alert-success" style={{ marginBottom: '16px' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                    </svg>
                                    Contract has been successfully renewed!
                                </div>
                            )}

                            {contractDetails.data.initiatingParty === props.account ? (
                                <div className="gh-renewal-section">
                                    <h3 className="gh-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {refreshIcon}
                                        Renew Contract
                                    </h3>
                                    <p className="gh-text-muted" style={{ fontSize: '13px', marginBottom: '12px' }}>
                                        As the initiating party, you can renew this expired contract by selecting a new expiration date below.
                                    </p>
                                    <label className="gh-label">New Expiration Date</label>
                                    <div style={{ marginBottom: '12px' }}>
                                        <DatePicker minDate={new Date()} value={newExpiryTime} onChange={(value) => setNewExpiryTime(value)} required />
                                    </div>
                                    <button className="gh-btn gh-btn-primary" onClick={handleRenewContract}>
                                        {refreshIcon}
                                        Renew Contract
                                    </button>
                                </div>
                            ) : (
                                <div className="gh-alert" style={{ background: 'rgba(139, 148, 158, 0.1)', borderColor: 'rgba(139, 148, 158, 0.3)', color: 'var(--color-fg-muted)' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z" />
                                    </svg>
                                    Only the initiating party can renew this contract.
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