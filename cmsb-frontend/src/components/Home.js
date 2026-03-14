import React from 'react';

export default function Home() {
    return (
        <div className="gh-hero">
            <h1>
                Manage Your Contracts on the <span>Blockchain</span>
            </h1>
            <p>
                Secure archival storage and management for contract initiation, execution, storage, and renewal — powered by Ethereum smart contracts.
            </p>
            <div className="gh-hero-actions">
                <a href="/initiation" className="gh-btn gh-btn-primary gh-btn-lg">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z" />
                    </svg>
                    Initiate New Contract
                </a>
                <a href="/contracts" className="gh-btn gh-btn-lg">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
                    </svg>
                    View Contracts
                </a>
            </div>

            <div className="gh-features">
                <div className="gh-feature-card">
                    <div className="gh-feature-icon">🔐</div>
                    <h3>Immutable Security</h3>
                    <p>All contracts are stored on the blockchain, ensuring they cannot be tampered with or altered.</p>
                </div>
                <div className="gh-feature-card">
                    <div className="gh-feature-icon">📝</div>
                    <h3>Smart Initiation</h3>
                    <p>Create and manage contracts with multiple parties, set expiration dates, and configure payment terms.</p>
                </div>
                <div className="gh-feature-card">
                    <div className="gh-feature-icon">💰</div>
                    <h3>DAI Payments</h3>
                    <p>Optionally attach DAI token transfers to your contracts for trustless, automated fund distribution.</p>
                </div>
            </div>
        </div>
    );
}