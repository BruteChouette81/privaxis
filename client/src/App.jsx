import React , {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"

import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css'

import Home from "./components/home";
import NavBar from "./components/home_components/components/Navbar/NavBar";
import Footer from "./components/home_components/components/Footer";
import SellerAccount from './components/account/sellerAccount';
import Community from './components/contact';
import About from './components/about'
import Products from './components/license';
import Checkout from './components/hosted_checkout/checkout';
import Legal from './components/legal';

import AOS from "aos";
import "aos/dist/aos.css";
import { useDocTitle } from "./components/home_components/components/CustomHook";
//import ScrollToTop from "./components/home_components/components/ScrollToTop";

//Amplify
import { Amplify } from 'aws-amplify'; //import { Amplify, Auth, Storage } from 'aws-amplify'; - see manual config using auth and storage
import awsmobile from './aws-exports';

Amplify.configure(awsmobile);
/*  {
  "name": "serverv2",
  "endpoint": "https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev",
  "region": "ca-central-1"
} 
 "aws_user_files_s3_bucket": "didtransfer",
    "aws_user_files_s3_bucket_region": "ca-central-1",

walletAddress: 0x3190b9754f22dd2b0514feff6bd299ee7514c777

did: U2FsdGVkX19Kmf5w58WgwURvczW1RZ5EFoq3syUn+BKleRjyqDe3TuglWoaBEX8AIVcZbnhgnlGoejmTc6BYb87IPOobFRpnCStGztqXqxdQ1ln74UMadMN2iqIQqOhKYyvoM8vXoz9ROOefsNgnYzieObGF4I0hxrbO98VFBLYB4TgxTQwQXqVTrO3G6DBrA1sxGVdhpRoZs2Qr6fz0lOEDRMbzS4075IMx6HwJVOyf0NOGPqAEv+npVRNKdXEneyEuZqXHzlVr7VQVX9eN68OW+PgbDwzw4a4efyo4nwbSU80NKblUtctEef+zbkVtdl3C5PokyLdjiQL109o8uxVBMWN/yx0bB2FDrNlkVgfujaUv5xddH6XuGIlB7cts5UN8dnX8Q5pGGYhpYpNh/ojKWrILwS0zeF+S6V9tvbMITxe+MHD+Yt7+VNeTMhlQE85wYcazgRaW+Yl+RPONtMHZSt/uTPs18ptVdW9m/td6JvyQ8fD+7/vts5G0pbfnLD22tQ3APFyeLYRkFUODNf1ozmNk6wEgmhuSwH0okJxiQh+H23XHNiUNkgve2tvH0srSrIF+Ykt42XN8Rx/cQg==

*/
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
    
  },
  API: {
    endpoints: [
      {
        name: "server",
        endpoint: "https://6pvpjdu5ue.execute-api.ca-central-1.amazonaws.com/dev",
        region: "ca-central-1"
    },
    {
        name: "serverv2",
        endpoint: "https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev",
        region: "ca-central-1"
    }
    ]
  }
})

const sandbox = true

const name = "Privaxis" //"CPL Technologies" //privaxis

//test account: 0x54DAe66D61F6B5B5e5d1Cb6f179401c10aecAa24
//did: U2FsdGVkX19fk/CgWzA6e49aJO99csTvqE5HexY4NyfQ7CZxyJ4TESttoOpW99mkoy1+NqrzGg88k4ur42xIK2RCGQBkAE2v3/MQ1DoE3xROdAgq5lWnfnQVB3XZWVUU3HE3WDP/YfTp9ySrPrEp7KXY0SEc/X/gZaltxVut61bdvt3nehEhlcR3airDewwYzDnv6FXy3HkY5Dvt054bviy5UlGYCkvkArJFr+DlG+gmQKxRSURnn72EH/KLUJG3FUTK0W3j8evzZigbRPobDKrADnFAFJ4/RgrBD3UBmFBQPrKanYKjtpSZIWlit84JhACgVFuMd06sHab8cYf25YjTmGcCuZMeh/LZBCQqZvPVxrnXx+Arag4W0Ti+6jm7CXCynQs/5gH3FjwVufZHFWNhORxPd15PtMrLunsE06R2aloUgyj6GI4b2DuWIkHmx9eJoV1UcyWVZBTSeO8U9LX/6r2JW1J/K48fs8DM6j6MfeXECxrsv8sy3YloaSm59exe51pnaBvMkGl8+uIJ3OE8nubHE7LY2E+Hz2+dMn7lKYuRtwAXOLIUJBwcO1+X13+A9HdQVPeP+mUlnxsxbw==


function App() {
  useEffect(() => {
    const aos_init = () => {
     if (!window.localStorage.getItem("language")) {window.localStorage.setItem("language", "fr")}
      AOS.init({
        once: true,
        duration: 1000,
        easing: "ease-out-cubic",
      });
    };

    window.addEventListener("load", () => {
      aos_init();
    });
  }, []);

  useDocTitle(name);
    //<Market /> <Web3ReactProvider getLibrary={getLibrary}>   </Web3ReactProvider>
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
    <Route path="/Account" element={<Account />} /> partner login 
    <Route path="/websitebuilder" element={<WebsiteBuilder/>}/>
    <Route path="/websitebuilderbypage/:page" element={<WebsiteBuilderByPage/>}/>
     <NewNavBar />
     <EndOfPage />*/
    return(
      <div>
        

              <NavBar name={name} />
             
                <Routes>
                  <Route path="/" element={<Home name={name}/>}/>
                  
                  <Route path="/about" element={<About name={name}/>}/>
                  <Route path="/contact" element={<Community name={name}/>} />
                  <Route path="/license" element={<Products sandbox={sandbox}  name={name}/>}/>
                  <Route path="/checkout" element={<Checkout sandbox={sandbox}/>}/>
                  <Route path="/legal" element={<Legal name={name}/>}/>
                  <Route path="/seller/:id" element={<SellerAccount sandbox={sandbox}/>}/>
                </Routes>
              
              <Footer name={name}/>
              
            
           
      
        
      </div>
    );

     
}

export default App;
