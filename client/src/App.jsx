import React from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'

import Account from './components/account/account';
import Home from './components/home';
import Token from './components/token'
import Upcoming from './components/upcoming'
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import NewNavBar from './components/navbar';
import Tutorial from './components/tutorial'
import Faq from './components/blog'
import BugReport from './components/bugreport';
import EndOfPage from './components/endofpage'
import Liquidity from './components/liquidity';
import Community from './components/community';
import Whitepaper from './components/whitepaper';
import Products from './components/products';
import WebsiteBuilder from './components/websitebuilder';

import Market from './components/market/market'
import Seller from './components/friend/seller';
import Subscription from './components/Subs/subscription';

import F2C from './components/F2C/F2C';


//Amplify
import { Amplify, Auth, Storage} from 'aws-amplify'; //import { Amplify, Auth, Storage } from 'aws-amplify'; - see manual config using auth and storage
import awsmobile from './aws-exports';

Amplify.configure(awsmobile);
//
Amplify.configure({
  Auth: {
    identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952',
    region: 'ca-central-1',
    userPoolId: 'ca-central-1_PpgocuiOa',
    userPoolWebClientId: '3e5qk8i1f53cp415ou2h26lpn9'
    
  },
  Storage: {
    AWSS3: {
      bucket: "clientbc6cabec04d84d318144798d9000b9b3205313-dev",
      region: "ca-central-1",
    }
    
  }
})

function getLibrary(provider) {
  return new Web3(provider)
}


function App() {
    //<Market />
    // <Whitepaper />
    /* <Route path="/FAQ" element={<Faq />}/>
    <Route path="/Upcoming" element={<Upcoming />}/>
    <Route path="/Tutorial" element={<Tutorial />}/>
    <Route path="/Bug" element={<BugReport />}/>
    <Route path="/Market" element={<Market />}/>
    <Route path="/Liquidity" element={<Liquidity />}/>
    <Route path="/Community" element={<Community />}/>
    <Route path="/Whitepaper" element={<Upcoming />}/>
    <Route path="/Seller/:account2" element={<Seller />}/>
    <Route path="/subs/:account" element={<Subscription />}/>
    <Route path="/Account" element={<Account />} /> partner login */
    return(
      <div>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Router>
            <NewNavBar />
            <Routes>
              <Route path="/" element={<Home />}/>
              
              <Route path="/about" element={<Token/>}/>
              <Route path="/contact" element={<Community />} />
              <Route path="/whitepaper" element={<Whitepaper/>}/>
              <Route path="/products" element={<Products/>}/>
              <Route path="/websitebuilder" element={<WebsiteBuilder/>}/>
              

            </Routes>
            <EndOfPage />
          </Router>
        </Web3ReactProvider>
        
      </div>
    ); //home

     
}

export default App;
