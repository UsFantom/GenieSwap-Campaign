import logo from './logo.svg';
import './App.css';
import './Header.css';
import './Main.css';
import './Responsive.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3 from 'web3';
import Campaign from './components/campaign';

function App() {

  // 0 not connected, 1 connecting, 2 connected
  const [status, setStatus] = useState(0);
  const [address, setAddress] = useState('');
  const [rootWallets, setRootWallets] = useState([]);
  const [search, setSearch] = useState('');



  const connectToMetaMask = async () => {
    setStatus(1);
    if (window.ethereum) {
      try {
        // Request access to MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Create an ethers provider using the MetaMask provider
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Create a Web3 instance using the MetaMask provider
        const web3 = new Web3(window.ethereum);

        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length === 0) {
            // User disconnected, handle accordingly
            setAddress('');
            setStatus(0);
          } else {
            // Account changed, update the current account
            const currentAccount = newAccounts[0];
            setAddress(currentAccount);
          }
        });

        // Now you can use the provider and web3 for interacting with Ethereum
        // For example, you can get the current account address
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        // You can also use ethers for interacting with Ethereum
        const balance = await provider.getBalance(currentAccount);

        console.log('Connected to MetaMask');
        console.log('Current Account:', currentAccount);
        console.log('Balance:', ethers.formatEther(balance));
        setAddress(currentAccount);
        setStatus(2);
        return;
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('MetaMask not detected');
    }
    setStatus(0);
  };

  useEffect(() => {
    connectToMetaMask();
  }, []);

  useEffect(() => {
    if (address) {
      getRootWallets();
    }
  }, [address]);

  const getRootWallets = () => {
    fetch(`${process.env.REACT_APP_BACKEND_API_ENDPOINT}/root-wallets`).then((res) => res.json()).then((response) => {
      setRootWallets(response);
    }).catch((error) => {
      console.log(error)
    }).finally(() => { })
  };

  const isAdminWallet = () => {
    return address.toLocaleLowerCase() === process.env.REACT_APP_ADMIN_ADDRESS.toLocaleLowerCase();
  };

  const isAllowed = () => {
    return address.toLocaleLowerCase() === process.env.REACT_APP_ADMIN_ADDRESS.toLocaleLowerCase() || rootWallets.includes(address.toLocaleLowerCase());
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        {/* <div className="buttons-container">
          <a className="round-button green-button" href="https://launch.genieswap.com/" target="_blank">Mint</a>
          <a className="round-button purple-button swap-button" href="https://app.genieswap.com/#/swaptokens" target="_blank">Swap</a>
          <a className="round-button transparent-button token-button" href="https://app.genieswap.com/#/tokens/ethereum" target="_blank">Tokens</a>
          <a className="round-button transparent-button pool-button" href="https://app.genieswap.com/#/pool" target="_blank">Pool</a>
        </div> */}
        {
          isAdminWallet() && (
            <div className='search-container'>
              <input type='text' placeholder='Search address' value={search} onChange={(e) => { setSearch(e.target.value) }} />
            </div>
          )
        }
        <div className="connect-container">
          <button className="connect-button" onClick={() => {
            if (status === 0) {
              connectToMetaMask()
            }
          }}>
            {status === 0 ? 'Connect' : (status === 1 ? 'Connecting' : (isAllowed() ? 'Connected' : 'Unauthorized'))}
          </button>
          <span></span>
          <button className="dropdown-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-testid="navbar-wallet-dropdown"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </header>
      {
        address && isAllowed() ?
          <div className="main">
            <div className="campaigns-container campaigns-container-top">
              <div className="campaign-title">Campaigns</div>
              {
                isAdminWallet() ?
                  rootWallets.map((item) => <Campaign search={search} key={item} address={item} />)
                  :
                  <Campaign address={address} />

              }
            </div>
          </div>
          :
          <div className='center-container'>
            <div className='connect-title'>
              {status !== 2 ? 'Connect Wallet' : ""}
            </div>
            <div className="connect-container">
              <button className="connect-button" onClick={() => {
                if (status === 0) {
                  connectToMetaMask()
                }
              }}>
                {
                  status === 0 ? 'Connect' : (status === 1 ? 'Connecting' : (isAllowed() ? 'Connected' : 'Unauthorized'))
                }
              </button>
            </div>
          </div>
      }
      <div id="background-radia-gradient"></div>
    </div>
  );
}

export default App;
