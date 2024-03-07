//It only serves the purpose of connecting to the blockchain throughout our application

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import Web3 from 'web3';

import { contractABI, contractAddress } from '../utils/constants';

//creating react context
export const TransactionContext = React.createContext();

//getting access to ethereum object provided by installing metamask
const {ethereum} = window;  //destructuring ethereum object from window (its there in window only because we installed metamask)
console.log(ethereum);

//object to fetch our ethereum contract
const getEthereumContract = () => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    const provider = new ethers.BrowserProvider(window.ethereum);  //window.
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;

}

//creating context for getEthereumContract
export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '', message: ''});
    const [isLoading, setIsLoading] = useState(false)
    //the value of transactionCount is reset every time we reload our browser so we store transaction count into localStorage
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))

    const handleChange = (e, name) =>{
        setFormData((prevState)=> ({ ...prevState, [name]: e.target.value}));
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");

            //getting metamask connected account
            const accounts = await ethereum.request({method: 'eth_accounts'});
            console.log(accounts)

            if(accounts.length){
                setCurrentAccount(accounts[0]);
            }else{
                console.log("No accounts found!");
            }
        } catch (error) {
            console.log(error);

            throw new Error ("No ethereum object.");
        }
    }

    //function to connect to the wallet
    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);

            throw new Error ("No ethereum object.");
        };
    };

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
                // get the data from the form
                const { addressTo, amount, keyword, message} = formData;
                const transactionContract = getEthereumContract();
                //converting decimal to hexadecimal for sending transaction to the blockchain
                const parsedAmount = ethers.parseEther(amount);

                //sending ethereum from one addess to another
                await ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: currentAccount,
                        to: addressTo,
                        gas: '0x5208',  //hexadecimal amount of 21000 GWEI -> 0.000021 ETH
                        value: parseInt(Web3.utils.toWei(amount,"ether")).toString(16),    //parsedAmount._hex
                    }]

                })

                //storing the transaction that happened
                const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword)

                setIsLoading(true);
                console.log(`Loading - ${transactionHash.hash}`)
                await transactionHash.wait();
                setIsLoading(false);
                console.log(`Sucess - ${transactionHash.hash}`)

                const transactionCount = await transactionContract.getTransactinCount();

                setTransactionCount(transactionCount.toNumber())

            } catch (error) {
                console.log(error);

                throw new Error ("No ethereum object.");
            }
        }

    //calling the function to check if the wallet is connected, it will load once when the page is loaded
    useEffect(() => {
        checkIfWalletIsConnected();
    }, [])

    return(
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, setFormData, sendTransaction, handleChange}}>
            {children}
        </TransactionContext.Provider>
    )
}



// ```javascript
// const getEthereumContract = () => {
//     // Create a new Web3Provider instance using the 'ethereum' object
//     const provider = new ethers.providers.Web3Provider(ethereum);

//     // Get the signer object from the provider
//     const signer = provider.getSigner();

//     // Create a new Contract instance using the contract address, ABI, and signer
//     const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
// }
// ```

// 1. **`getEthereumContract` Function**: This function is declared using an arrow function syntax `() => {...}`. It's named `getEthereumContract` and is responsible for fetching and creating a contract instance using the provided `ethereum` object.

// 2. **`Web3Provider`**: The `Web3Provider` class is provided by the ethers.js library. It's used to create a provider object that connects to an Ethereum network. In this case, it's being initialized with the `ethereum` object, which is typically provided by MetaMask or a similar Ethereum provider injected into the browser.

// 3. **`provider.getSigner()`**: Once the provider is created, the `getSigner()` method is called on it to obtain a signer object. A signer is necessary for signing transactions, and it's typically associated with the current user's Ethereum account.

// 4. **`new ethers.Contract(contractAddress, contractABI, signer)`**: This line creates a new instance of the `Contract` class from ethers.js. It requires three parameters:
//    - `contractAddress`: The address of the deployed smart contract on the Ethereum network.
//    - `contractABI`: The ABI (Application Binary Interface) of the smart contract, which defines its interface and available functions.
//    - `signer`: The signer object obtained previously, which will be used to sign transactions sent to the contract.

// Overall, this code is a part of a React application (or any JavaScript application) that interacts with an Ethereum smart contract deployed on the Ethereum network. It uses the ethers.js library to create a contract instance, which allows the application to call functions and interact with the smart contract from the frontend.