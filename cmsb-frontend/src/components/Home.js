import React from 'react';
import logo from './assets/logo.png';

export default function Home () {
    return(
        <main class="mt-12 lg:mt-32">
            <section class="container mx-auto px-6">
            <div class="w-full lg:flex items-center">
                <div class="w-full lg:w-1/2">
                    <h2 class="text-md lg:text-2xl text-medium text-gray-600">Blockchain Based System to</h2>
                    <h1 class="text-5xl lg:text-6xl font-bold text-blue-600 mb-2 lg:mb-6">Manage Your Contracts and Agreements</h1>
                    <p class="text-md lg:text-2xl text-gray-800 mb-8 font-semibold">Secure Archival storage and Management for Contract Initiation, Execution, Storage and Renewal</p>
                </div>
                <div class="w-full lg:w-1/2 lg:pl-24">
                    <div class="bg-midnight text-tahiti">
                        <header className="App-header">
                            <img src={logo} alt="logo" />
                            <br/>
                            <h1 className='text-3xl text-indigo-800'>Contract Management System using Blockchain</h1>             
                        </header>
                    </div>
                </div>
            </div>
            </section>
        </main>
    );
};