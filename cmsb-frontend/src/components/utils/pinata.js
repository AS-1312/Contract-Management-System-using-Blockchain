import axios from 'axios';

// ============================================
// Pinata IPFS Integration
// ============================================
// 
// HOW TO GET YOUR API KEYS:
// 1. Go to https://pinata.cloud and create a free account
// 2. Go to API Keys page: https://app.pinata.cloud/developers/api-keys
// 3. Click "New Key"
// 4. Enable "pinFileToIPFS" and "pinJSONToIPFS" permissions
// 5. Copy the API Key and Secret Key
// 6. Add them to your .env file in /cmsb-frontend/:
//
//    REACT_APP_PINATA_API_KEY=your_api_key_here
//    REACT_APP_PINATA_SECRET_KEY=your_secret_key_here
//
// ============================================

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @returns {Object} { success: boolean, ipfsHash: string, url: string, error?: string }
 */
export const uploadToIPFS = async (file) => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        console.warn('Pinata API keys not configured. Set REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY in .env');
        return {
            success: false,
            ipfsHash: null,
            url: `local://${file.name}`,
            error: 'Pinata API keys not configured'
        };
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        // Optional: Add metadata to help organize files in Pinata dashboard
        const metadata = JSON.stringify({
            name: file.name,
            keyvalues: {
                app: 'CMSB',
                type: 'contract-document'
            }
        });
        formData.append('pinataMetadata', metadata);

        const response = await axios.post(
            `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
            formData,
            {
                maxBodyLength: Infinity,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY,
                },
            }
        );

        const ipfsHash = response.data.IpfsHash;
        return {
            success: true,
            ipfsHash: ipfsHash,
            url: `${IPFS_GATEWAY}/${ipfsHash}`,
        };
    } catch (error) {
        console.error('Pinata upload error:', error);
        return {
            success: false,
            ipfsHash: null,
            url: `local://${file.name}`,
            error: error.message
        };
    }
};

/**
 * Upload JSON data to IPFS via Pinata
 * @param {Object} jsonData - JSON object to pin
 * @param {string} name - Name for the pin
 * @returns {Object} { success: boolean, ipfsHash: string, url: string }
 */
export const uploadJSONToIPFS = async (jsonData, name = 'contract-data') => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        return { success: false, ipfsHash: null, url: null, error: 'Keys not configured' };
    }

    try {
        const response = await axios.post(
            `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
            {
                pinataContent: jsonData,
                pinataMetadata: { name }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY,
                },
            }
        );

        const ipfsHash = response.data.IpfsHash;
        return {
            success: true,
            ipfsHash,
            url: `${IPFS_GATEWAY}/${ipfsHash}`,
        };
    } catch (error) {
        console.error('Pinata JSON upload error:', error);
        return { success: false, ipfsHash: null, url: null, error: error.message };
    }
};

/**
 * Test if Pinata connection is working
 * @returns {boolean}
 */
export const testPinataConnection = async () => {
    try {
        const response = await axios.get(
            `${PINATA_BASE_URL}/data/testAuthentication`,
            {
                headers: {
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY,
                },
            }
        );
        console.log('Pinata connected:', response.data.message);
        return true;
    } catch (error) {
        console.error('Pinata connection failed:', error);
        return false;
    }
};
