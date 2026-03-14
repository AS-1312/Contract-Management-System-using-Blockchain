import React, { useState, useEffect } from 'react';

export default function Contracts(props) {
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

    return (
        <div className="gh-container-sm" style={{ paddingTop: '32px', paddingBottom: '64px' }}>

            {/* Page Header */}
            <div className="gh-page-header">
                <h1 className="gh-page-title">Your Contracts</h1>
                <a href="/initiation" className="gh-btn gh-btn-primary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z" />
                    </svg>
                    New Contract
                </a>
            </div>

            {myContracts.length === 0 ? (
                <div className="gh-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                    </svg>
                    <h3>No contracts yet</h3>
                    <p>Contracts you create or are invited to will appear here.</p>
                    <a href="/initiation" className="gh-btn gh-btn-primary">
                        Create your first contract
                    </a>
                </div>
            ) : (
                <div>
                    <p className="gh-text-muted" style={{ marginBottom: '16px', fontSize: '14px' }}>
                        {myContracts.length} contract{myContracts.length !== 1 ? 's' : ''} found
                    </p>
                    {myContracts.map((contract, key) => (
                        <a href={`/contract/${contract}`} key={key} className="gh-contract-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-fg-subtle)">
                                    <path fillRule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" />
                                </svg>
                                <span className="gh-contract-addr">{contract}</span>
                            </div>
                            <span className="gh-contract-arrow">→</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}