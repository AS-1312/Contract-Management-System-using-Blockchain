import React from 'react';

export default function Navigation (props) {

    return (
        <header>
            <nav className='flex items-center justify-between p-2 container mx-auto bg-slate-100'>
            <div class="text-lg text-gray-600 hidden lg:flex">
                <a href="/" class="block mt-4 lg:inline-block text-cyan-800 font-bold lg:mt-0 mr-10">
                    Home
                </a>
                <a href="/initiation" class="block mt-4 lg:inline-block hover:text-gray-700 lg:mt-0 mr-10">
                    Initiate New Contract
                </a>
                <a href="/contracts" class="block mt-4 lg:inline-block hover:text-gray-700 lg:mt-0 mr-10">
                    View Your Contracts
                </a>
            </div>
            <div class="flex items-center">
            {
                props.account === undefined ?
                <div class="mr-5 lg:mr-0">
                    <button class="py-2 px-6 bg-teal-500 hover:bg-teal-600 rounded-md text-white text-md" onClick={props.connectWallet}>Connect Wallet</button>
                </div>
                :
                <div class="mr-5 lg:mr-0">
                    <button class="py-2 px-6 rounded-md text-black-600 hover:text-gray-700 text-lg">{ props.account.substring(0, 15) }{ props.account.length >= 10 && `.....` }</button>
                    <button class="py-2 px-6 bg-red-500 hover:bg-red-600 rounded-md text-white text-md" onClick={props.disconnectWallet}>Disconnect Wallet</button>
                </div>
            }
                <div class="block lg:hidden">
                    <button
                        class="flex items-center px-4 py-3 border rounded text-teal-500 border-teal-500 focus:outline-none">
                        <svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <title>Menu</title>
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                        </svg>
                    </button>
                </div>
            </div>
            </nav>
        </header>
    );
};