import React from 'react';
// import { Button } from 'react-bootstrap';

function Home (props) {
    return(
        <main class="mt-12 lg:mt-32">
            <section class="container mx-auto px-6">
            <div class="w-full lg:flex items-center">
                <div class="w-full lg:w-1/2">
                    <h2 class="text-md lg:text-2xl text-gray-600">Blockchain Based System to</h2>
                    <h1 class="text-5xl lg:text-6xl font-bold text-teal-600 mb-2 lg:mb-6">Manage Your Contracts</h1>
                    <p class="text-md lg:text-xl font-light text-gray-800 mb-8">Secure Archival storage and Management for Contract Initiation, Execution, Storage and Renewal</p>
                </div>
                <div class="w-full lg:w-1/2 lg:pl-24">
                    <div class="bg-midnight text-tahiti">
                        <h1 className='text-3xl'>Contract Management System using Blockchain</h1>
                        <header className="App-header">
                                                  
                        </header>
                    </div>
                </div>
            </div>
            </section>
        </main>
    );
}

export default Home;