import React from 'react';

export default function Navigation(props) {
    return (
        <nav className="gh-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <a href="/" className="gh-nav-brand">
                    {/* GitHub-style octicon placeholder */}
                    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    CMSB
                </a>
                <div className="gh-nav-links">
                    <a href="/">Home</a>
                    <a href="/initiation">Initiate</a>
                    <a href="/contracts">Contracts</a>
                </div>
            </div>

            <div className="gh-nav-actions">
                {props.account === undefined ? (
                    <button className="gh-btn gh-btn-primary" onClick={props.connectWallet}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M14 3H2a1 1 0 00-1 1v8a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1zm-1 7h-2a1 1 0 010-2h2a1 1 0 010 2z" />
                        </svg>
                        Connect Wallet
                    </button>
                ) : (
                    <>
                        <div className="gh-account-pill">
                            <span className="gh-account-dot"></span>
                            {props.account.substring(0, 6)}...{props.account.substring(props.account.length - 4)}
                        </div>
                        <button className="gh-btn gh-btn-danger gh-btn-sm" onClick={props.disconnectWallet}>
                            Disconnect
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}