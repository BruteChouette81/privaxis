
import { useParams, useSearchParams } from 'react-router-dom'
import {ethers} from 'ethers'
import {useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

import { AES, enc } from "crypto-js"

import { getSessionToken } from "@shopify/app-bridge/utilities";
import createApp from "@shopify/app-bridge";
//import { useAppBridge} from "@shopify/app-bridge-react";

import ReactLoading from "react-loading";

import ItemsAccount from './items_account';
import {Buffer} from 'buffer';

import square_logo from './css/images/square-logo.png'
import default_profile from "./css/images/default_profile.png"


import { CLIENT_ID, APP_SECRET, square_client, square_client_secret, cpl_private_key, shopify_app_client, shopify_app_secret, square_secret } from '../../apikeyStorer';

import {dds_bytecode, buying_bytecode, minting_bytecode, prooving_bytecode} from'../../artifacts/contracts/bytecodes'


import './css/sellerprofile.css'
import './css/profile.css'
import './css/account.css'


import {
    Chart as ChartJS,
    CategoryScale,
    BarElement,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
  } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';

import PaymentsAccount from "./payments_account"
//import crypto
import forge from 'node-forge';
//import Credit from '../../artifacts/contracts/token.sol/credit.json';
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
import buying_abi from '../../artifacts/contracts/buying.sol/buying.json'
import minting_abi from '../../artifacts/contracts/minting.sol/minting.json'
import prooving_abi from '../../artifacts/contracts/prooving.sol/prooving.json'

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}
  
  /*
  Export the given key and write it into the "exported-key" space.
  */
async function exportCryptoKey(key) {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
    return pemExported;
}

async function exportPrivateCryptoKey(key) {
    const exported = await window.crypto.subtle.exportKey("pkcs8", key);
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = window.btoa(exportedAsString);
    const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
  
   return pemExported
}

async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]), // 65537
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    // Export the keys in PEM format
    const publicKey = await exportCryptoKey(keyPair.publicKey)
    const privateKey = await exportPrivateCryptoKey(keyPair.privateKey);

    return {
        publicKey: publicKey,
        privateKey: privateKey,
    };
}



async function decryptPassword(encryptedKey, secretKey) {
   
    const privateKeyObj = forge.pki.privateKeyFromPem(secretKey);
    const encryptedBytes = forge.util.decode64(encryptedKey);

    return privateKeyObj.decrypt(encryptedBytes, "RSA-OAEP", {
        md: forge.md.sha256.create(),
    });

}

const baseURL = "https://api-m.paypal.com";
//const sandURL = "https://api-m.sandbox.paypal.com"

//function to create new contracts 
const publishContracts = async () => {
    //need dds, dds_buying, dds_minting and dds_prooving abis
    //need credit and real_nft addresses
    //need to connect to pool account for creation
   
    console.log(dds_bytecode.length)
    console.log(buying_bytecode.length)
    console.log(minting_bytecode.length)
    console.log(prooving_bytecode.length)
    
    //credit address
    const credit_addr = "0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565"
    const nft_addr = "0xf70221aA45de1736944c2B7d033B0714E321fb1e"

    //let pk = ""
    const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")
    const signer = new ethers.Wallet(cpl_private_key, provider)
    
    /*const gasLimit = await provider.estimateGas({
        to: null, // Since we're deploying a new contract
        data: dds_bytecode, 
    });
    console.log(gasLimit)*/

    const dds_factory = new ethers.ContractFactory(DDSABI, dds_bytecode, signer)
    const dds_contract = await dds_factory.deploy(credit_addr, nft_addr); //{gasLimit:parseInt(21000 +  68 * buying_bytecode.length)}
    const dds_receipt = await dds_contract.deployTransaction.wait();
    console.log(dds_receipt)
   

    const dds_buy_factory = new ethers.ContractFactory(buying_abi, buying_bytecode, signer)
    const dds_buy_contract = await dds_buy_factory.deploy(dds_contract.address, credit_addr);  //{gasLimit:parseInt(21000 +  68 * buying_bytecode.length)}
    const dds_buy_receipt = await dds_buy_contract.deployTransaction.wait();
    console.log(dds_buy_receipt)

    const dds_mint_factory = new ethers.ContractFactory(minting_abi, minting_bytecode, signer)
    const dds_mint_contract = await dds_mint_factory.deploy(dds_contract.address, credit_addr, nft_addr); //{gasLimit:parseInt(21000 +  68 * minting_bytecode.length)}
    const dds_mint_receipt = await dds_mint_contract.deployTransaction.wait();
    console.log(dds_mint_receipt)

    const dds_proove_factory = new ethers.ContractFactory(prooving_abi, prooving_bytecode, signer)
    const dds_proove_contract = await dds_proove_factory.deploy(dds_contract.address, credit_addr); //{gasLimit:parseInt(21000 +  68 * prooving_bytecode.length)}
    const dds_proove_receipt = await dds_proove_contract.deployTransaction.wait();
    console.log(dds_proove_receipt)

    // settings
    // set _buyer, _proover and _minter, pool in DDS

    await (await dds_contract.setBuyer(dds_buy_contract.address)).wait()
    await (await dds_contract.setProover(dds_proove_contract.address)).wait()
    await (await dds_contract.setMinter(dds_mint_contract.address)).wait()
    await (await dds_contract.setPool(signer.address)).wait()

    //set _buyer, _pool in minting.sol
    await (await dds_mint_contract.setBuyer(dds_buy_contract.address)).wait()
    await (await dds_mint_contract.setPool(signer.address)).wait()

    //set pools:
    await (await dds_buy_contract.setPool(signer.address)).wait()
    await (await dds_proove_contract.setPool(signer.address)).wait()


    return {"dds": dds_contract.address, "buying":dds_buy_contract.address, "minting":dds_mint_contract.address, "prooving": dds_proove_contract.address}


}



ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Amount of product sold by month',
    },
  },
};

let labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septembre', 'November', 'December'];
const labels_index = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septembre', 'November', 'December'];


const NoDataDisplay = () => {
    return (
        window.localStorage.getItem("language") == "fr" ?
        <div class="itemsold">
            <h1>Aucune Donnée</h1>
            <p>Assurer vous d'avoir des commandes pour voir les données</p>
        </div> :
        <div class="itemsold">
        <h1>No data</h1>
        <p>When an order it placed, you will see data in this section</p>
       
    </div>
    )
}


const ItemChart = (props) => {
    //const [finishUpload, setFinishUpload] = useState(false)
    
    return (
        props.tier>=1 ? props.dds ? <div class="itemsold">
            <p>{window.localStorage.getItem("language") == "fr" ? "Nombre total de commande:" : "Total orders:"} <strong>{props.numOrders}</strong> <button type="button" class="btn btn-link" onClick={() => {props.setDisplay(true)}}>{window.localStorage.getItem("language") == "fr" ? "commandes" : "orders"}</button></p>
            <Line options={options} data={props.dds} /> 
        </div>
         : <div class="itemsold">
        <h5>{window.localStorage.getItem("language") == "fr" ? "Voire vos " : "See your "}  <button type="button" class="btn btn-link" onClick={() => {props.setDisplay(true)}}>{window.localStorage.getItem("language") == "fr" ? "commandes" : "orders"}</button></h5> </div> : <NoDataDisplay/>
    
    )
}

const UpgradePopup = (props) => {
    const [storeInp, setStoreInp] = useState(false)
    const [storeName, setStoreName] = useState("")

    const onStoreNameChange = (event) => {
        setStoreName(event.target.value)
    }

    const connectShopify = () => {
        if (!storeName) {
            setStoreInp(true)
        } if (storeName) {
            window.location.replace("https://"+storeName+".myshopify.com/admin/oauth/authorize?client_id=" + shopify_app_client + "&scope=read_orders,write_orders,write_products,read_gift_cards,write_gift_card_transactions&redirect_uri=https://cpltechnologies.com/seller/0")
        }
    }
   
    return (
        <div class="upgradepopup">
            <h4>Services</h4>
            {props.apikey ? props.apikey.length == 38 ? <div><h5>{window.localStorage.getItem("language") == "fr" ? "Votre boutique Shopify est connectée" : "Your Shopify Store is connected"}</h5>
            <p>API key: <strong>{props.apikey}</strong></p>
            </div> : ( <div><h5>{window.localStorage.getItem("language") == "fr" ? "Vous êtes connecté via Square" : "You are connected using Square"}</h5>
            <p>{window.localStorage.getItem("language") == "fr" ? "Pour continuer" : "To continue your setup:"} <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">{window.localStorage.getItem("language") == "fr" ? "contacter le service commercial" : "contact sales"}</a></p>
            </div> ) : ( <div>
                <h5>{window.localStorage.getItem("language") == "fr" ? "Afin de vous connecter à votre site Web, connectez-vous en utilisant nos partenaires suivants:" : "In order to connect to your Website, sign in using our following partners:"}</h5>
                <button class="btn btn-dark" onClick={()=> {window.location.replace("https://connect.squareup.com/oauth2/authorize?client_id=sq0idp-v0x4MOYX8evTej5RON3BvA")}}>Square</button>
                <br />
                <br />
                {storeInp ? ( <form>
                    <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Store Name</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputPassword" onChange={onStoreNameChange}/>
                    </div>
                </div>
                </form> ) : ""}
                <button class="btn btn-success" onClick={()=> {connectShopify()}}>{storeInp ? "Go!" :"Shopify Storefront"}</button>
                <br />
                <br />
                <button class="btn btn-primary" disabled>Wix</button>
                <br />
                <br />
                {window.localStorage.getItem("language") == "fr" ? <p>Ou <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">contacter le service commercial</a> pour une configuration personnalisée</p> : <p>Or <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">contact sales</a> for a custom setup</p>}
            </div> )}
           
        </div>
    )
}

const WebsiteChecker = (props) => {
    const [liveCheck, setLiveCheck] = useState(true)
    const [website1, setWebsite1] = useState()
    let website = props.website

    useEffect(() => {
        async function getWebsite() {
            try { //
                const response = await fetch(`https://${website}`, {
                    method: "GET", // *GET, POST, PUT, DELETE, etc.
                    mode: "no-cors", // no-cors, *cors, same-origin
                    headers: {
                        "Content-Type": "application/json"
                },
                });
                console.log(response)
            } catch (error) {
                try {
                    const response = await fetch(`${website}`, {
                        method: "GET", // *GET, POST, PUT, DELETE, etc.
                        mode: "no-cors", // no-cors, *cors, same-origin
                        headers: {
                            "Content-Type": "application/json"
                    },
                    });
                    console.log(response)

                } catch(error) {
                    setLiveCheck(false)
                }              
            }
        }

        getWebsite()

    }, [setLiveCheck])
    const onWebsiateisUpdated = (event) => {
        setWebsite1(event.target.value)

    }

    const updateWebsite = () => {

       

        API.post("server", '/uploadFile', { body: {
            email: props.email,
            website: website1
        }})

    }
    return (
        website ? <div class="webChecker">
            {liveCheck ?<p style={{"color":"green"}}>{window.localStorage.getItem("language") == "fr" ? "Votre site web est en ligne" : "Your website is live"}</p> : <p style={{"color":"red"}}>{window.localStorage.getItem("language") == "fr" ? "Votre site web n'est pas en ligne" : "Your website is down"}</p> }
            <a href={`https://${website}`}>{website}</a> {liveCheck ? <img src="http://clipart-library.com/images_k/green-check-mark-icon-transparent-background/green-check-mark-icon-transparent-background-10.png" alt="" style={{"float":"right", "height":"20px", "width":"auto"}}/>: <img src="https://cdn.picpng.com/exit/x-exit-button-icon-symbol-66209.png" alt="" style={{"float":"right", "height":"20px", "width":"auto"}} />}
            <br />
            <p> <strong> {window.localStorage.getItem("language") == "fr" ? "Explorer et modifier les pages de votre site" : "Explore and modify your pages"}</strong></p>
            <a href="/websitebuilderbypage/home">{`https://${website}`}/home </a>
           
           

           
        </div> : 
        <div class="webChecker">
            <h1>No connected websites</h1>

            <p>Link an existing website to your account</p>
            <form onSubmit={updateWebsite}>
                <input class="form-control" type="text" name="website" id="website" placeholder='https://mysite.com' onChange={onWebsiateisUpdated}/>
                <br />
               
                <input class="btn btn-primary" type="submit" value="Link" />
            </form>

            <p>Or <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">contact sales</a></p>



        </div>
    )
}

const options2 = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your payments by month',
      },
    },
  };
  

const PaymentChart = (props) => {
    return (
        props.tier>1 ? props.data ? <div class="payChart">
            {window.localStorage.getItem("language") == "fr" ? (<p><button type="button" class="btn btn-link" onClick={() => {props.setDisplay(true)}}>Fonds</button>reçu: <strong>{props.total}</strong> $</p>) : (<p><button type="button" class="btn btn-link" onClick={() => {props.setDisplay(true)}}>Money</button>received: <strong>{props.total}</strong>  $</p>)}
            {window.localStorage.getItem("language") == "fr" ? <p>Frais payés: {props.total *0.027} $</p> : <p>Fee paid: {props.total *0.027} $</p> }
            <Bar options={options2} data={props.data} />
        </div> : <NoDataDisplay /> : <div  class="itemsold">
            <h1>{window.localStorage.getItem("language") == "fr" ? "L'abonnement de niveau 1 ne peut pas accéder à l'analyse des données" :"Tier 1 subscription can't access data analysis"}</h1>
            {window.localStorage.getItem("language") == "fr" ? <p>Pour accéder à l'analyse des données, <a href="/license">mettez à niveau votre licence</a></p> : <p>To access data analysis, <a href="/license">upgrade your license</a></p> }
        </div>
    )
}

const Bills = (props) => {
    // <button class="btn btn-primary">Change Billing Infos</button>
    /**
     *  props.data ? <div class="bills">
            {window.localStorage.getItem("language") == "fr" ? <h4>Liste de vos factures</h4>: <h4>list of your bills</h4> }
            <p>Hosting:             0$</p>
            <p>Services:            0$</p>
            <p>CPL fees:            {props.total*0.027}$</p>
            <p> <strong>Total: {props.total*0.027}$</strong></p>
           
        </div> : <div class="bills">
        {window.localStorage.getItem("language") == "fr" ? <h4>Liste de vos factures</h4>: <h4>list of your bills</h4> }
            <p>CPL payment is not connected to your Website nor your POS.</p>
            <p>Select a connection option to continue!</p>
        </div>
     */
    return (
       <div class="bills">
          {window.localStorage.getItem("language") == "fr" ? <h4>Vos paiements</h4>: <h4>Your payments</h4> }
          {window.localStorage.getItem("language") == "fr" ? <h5>Vos paiements sont traités via Paypal</h5>: <h5>Your payments are processed using Paypal</h5> }
          {window.localStorage.getItem("language") == "fr" ? <p>Connecté à <strong>{props.email}</strong></p>: <p>Connected to <strong>{props.email}</strong></p> }
          {window.localStorage.getItem("language") == "fr" ? <p>Pour modifier ou en savoir plus sur les méthodes de paiements, <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">contactez nous</a></p>: <p>To change or learn more about payment methods, <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">contact us</a></p> }


       </div>
    )
}

const CPLWallet = () => {
    return (
        <div class="wallet">
            <h6>{window.localStorage.getItem("language") == "fr" ? "Votre Portefeuille:" : "Your wallet:"}</h6>
            <p>Total: <strong>0 $</strong> <p style={{"color":"green", "float":"right"}}></p></p>
            <p>{window.localStorage.getItem("language") == "fr" ? "Frais de transaction moyen:" : "Average fee paid:"} <strong style={{"color":"red"}}>2.7%</strong></p>
        </div>
    )
}


//https://admin.shopify.com/store/cplpayment-store/charges/cpl-payment/pricing_plans

//1: redirected with a id for "account creation"
//2: create password protected decentralized accound (fix bug with ipfs-node)
//3: dashboard with website: buy the domain or import one (depending on the provenance)

function SellerAccount(props) {
    let { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams()
    //const app = useAppBridge()
    
    //info to display
    const [dds, setDds] = useState()
    const [paymentData, setPaymentData] = useState()
    const [totalMoneyReceived, setTotalMoneyeceived] = useState()
    const [numOrders, setNumOrders] = useState()
    const [contracts, setContracts] = useState()
    const [displayPayments, setDisplaypayments] = useState(false)
    const [displayItems, setDisplayItems] = useState(false)
   
    //login info
    const [ needPassword, setNeedPassword ] = useState(true)
    const [ profileLoading, setProfileLoading ] = useState(true)
    const [password, setPassword] = useState("")
    const [generateContracts, setGenerateContracts] = useState(false)
    let emailInp = ""
    let passwordInp = ""
    let confirm = false

    let dds_addresses = {}
    let recovery_Account_address = ""
    let recoveryDid = ""

    

    //css infos
    const [back, setBack] = useState('white')
    const [img, setImg] = useState('white')

    //seller infos
    const [signer, setSigner] = useState()
    const [device_id, setDevice_id] = useState()
    const [api_key, setApi_key] = useState("")
    const [license, setLicense] = useState("")
    const [tier, setTier] = useState(0)
    const [website, setWebsite] = useState("")
    
    //connect process
    const [firstConnect, setFirstConnect] = useState(false)
    const [firstConnect2, setFirstConnect2] = useState(false)
    const [firstConnect3, setFirstConnect3] = useState(false)
    const [customInstall, setCustomInstall] = useState(false)

    //did
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [country, setCountry] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [street, setStreet] = useState("")
    const [code, setCode] = useState("")
    const [phone, setPhone] = useState("")
    const [avg_volume, setAvg_volume] = useState(0)
    const [scodeforapi, setScodeforapi] = useState()
    const [shopify, setShopify] = useState("")

    const type = "spin"
    const color = "#0000FF"

    const onFnameChanged = (event) => {
        setFname(event.target.value)
    }
    const onLnameChanged = (event) => {
        setLname(event.target.value)
    }
    const onCountryChanged = (event) => {
        setCountry(event.target.value)
    }
    const onCityChanged = (event) => {
        setCity(event.target.value)
    }
    const onStateChanged = (event) => {
        setState(event.target.value)
    }
    const onStreetChanged = (event) => {
        setStreet(event.target.value)
    }
    const onCodeChanged = (event) => {
        setCode(event.target.value)
    }
    const onEmailChanged = (event) => {
        setEmail(event.target.value)
    }
    const onPhoneChanged = (event) => {
        setPhone(event.target.value)
    }

    const changePass = (event) => {
        //setPassword(event.target.value)
        passwordInp = event.target.value;
    }

    const changePassSC = (event) => {
        //setPassword(event.target.value)
       setPassword(event.target.value)
    }

    const changeConfirmPass = (event) => {
        if (event.target.value == passwordInp) {
            confirm = true
        }
    }
    const changeEmail = (event) => {
        //setPassword(event.target.value)
        emailInp = event.target.value;
    }

    const changeEmailSC = (event) => {
        //setPassword(event.target.value)
        setEmail(event.target.value)
    }

    const changeActivationKey = (event) => {
        setScodeforapi(event.target.value)
    }

    const onDdsChange = (event) => {
        dds_addresses.dds = event.target.value
    }
    const onBDdsChange = (event) => {
        dds_addresses.buying = event.target.value
    }
    const onMDdsChange = (event) => {
        dds_addresses.minting = event.target.value
    }
    const onPDdsChange = (event) => {
        dds_addresses.prooving = event.target.value
    }

    const onWebsiteChange = (event) => {
        setWebsite(event.target.value)
    }

    const onCustomInstallChange = () => {
        setPassword(passwordInp)
        setEmail(emailInp)
        setCustomInstall(!customInstall)
    }

    const onLicenseChange = (event) => {
        setLicense(event.target.value)
    }

    const connectUsingPassword = async (e) => {
        e.preventDefault()

        if (passwordInp !== "" && emailInp !== "") {
            const hasWallet = window.localStorage.getItem("hasWallet")
            if (hasWallet !== "true") {
                if (!confirm) {
                    alert("Error: make sure both passwords are the same")

                } else {
                   
                    setPassword(passwordInp)
                    setEmail(emailInp)
                
                    //setAddress(window.localStorage.getItem("walletAddress"))
                    await connection(hasWallet);
                }
            } else {
                console.log(passwordInp)
                setPassword(passwordInp)
                setEmail(emailInp)
            
                //setAddress(window.localStorage.getItem("walletAddress"))
                await connection(hasWallet);
            }
            
        } else {
            alert("Error: you need to fill to form in order to continue")
        }
        
        
    }

    const connectUsingCustomInstall = async (e) => {
        e.preventDefault()
        if (dds_addresses.dds && dds_addresses.buying && dds_addresses.minting && dds_addresses.prooving) {
         
            if (password !== "" && email !== "") {
                if (recoveryDid && recovery_Account_address) {
                    window.localStorage.setItem("walletAddress", recovery_Account_address)
                    window.localStorage.setItem("did", recoveryDid)
                }
                      
                setDds(dds_addresses)
            
                //setAddress(window.localStorage.getItem("walletAddress"))
                await connection(false);
                  
                
            } else {
                alert("Error: you need to fill to form in order to continue")
            }


        } else {
            alert("Error: You need to enter the appropriate contract addresses")
        }

    }

    /**/

    function GetPassword() {
        const [storeInp, setStoreInp] = useState(false)
        const [storeName, setStoreName] = useState("")

        const onStoreNameChange = (event) => {
            setStoreName(event.target.value)
        }

        const connectShopify = () => {
           
            if (!storeInp) {setStoreInp(true)} else {
                
                window.location.replace("https://"+storeName+".myshopify.com/admin/oauth/authorize?client_id=" + shopify_app_client + "&scope=read_orders,write_orders,read_gift_cards,write_gift_card_transactions&redirect_uri=https://www.cpltechnologies.com/seller/0")
            }
        }

       
        return ( <div class="getPassword">
             {window.localStorage.getItem("hasWallet") ?
            <form onSubmit={connectUsingPassword}> 
            <h3>{window.localStorage.getItem("language") == "en" ? "Enter your partner informations" :"Entrez vos informations de partenaire"}</h3>
                
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Email</label>
                    <div class="col-sm-10">
                        <input type="email" class="form-control" id="inputPassword" onChange={changeEmail}/>
                    </div>
                </div>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changePass}/>
                    </div>
                </div>
                <br />
                <button type="submit" class="btn btn-primary mb-3">Continue</button>
                
            </form> : customInstall ? <form onSubmit={connectUsingCustomInstall}>
            <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >DDS</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputPassword" onChange={onDdsChange}/>
                    </div>
                </div>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >BDDS</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputPassword" onChange={onBDdsChange}/>
                    </div>
                </div>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >MDDS</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputPassword" onChange={onMDdsChange}/>
                    </div>
                </div>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >PDDS</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputPassword" onChange={onPDdsChange}/>
                    </div>
                </div>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Account</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputPassword" onChange={onPDdsChange}/>
                    </div>
                </div>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >DID</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputPassword" onChange={onPDdsChange}/>
                    </div>
                </div>
                <br />
                <button type="submit" class="btn btn-primary mb-3">Continuer</button>
                <br />
                <button class="btn btn-danger" onClick={() => {onCustomInstallChange()}}>Back</button>

            </form> : <div> <form onSubmit={connectUsingPassword}> 
            <h3>{window.localStorage.getItem("language") == "en" ? "Create a partner account in less than 5 mins" :"Créer un compte partenaire en moins de 5 minutes"}</h3>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style={{width: "0%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                
                {/**<br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Email</label>
                    <div class="col-sm-10">
                        <input type="email" class="form-control" id="inputPassword" onChange={changeEmail}/>
                    </div>
                </div>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changePass}/>
                    </div>
                </div>
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Confirm password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changeConfirmPass}/>
                    </div>
                </div>
                <br />
                <button type="submit" class="btn btn-primary mb-3">Continuer</button>
                <br />
                <p> {window.localStorage.getItem("language") == "en" ?"Or" : "Ou"} </p> */}
              
              
            </form>
            <br />
            <h4>Select a partner:</h4>
                {storeInp ? ( <form>
                    <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Store Name</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputPassword" onChange={onStoreNameChange}/>
                    </div>
                </div>
                </form> ) : ""}
                <button id="signin-button" class="btn btn-success" onClick={()=> {connectShopify()}}>{storeInp ? "Go!" : <img id="signin-img" src={"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Shopify_Logo.png/640px-Shopify_Logo.png"}/>}</button>
                
                <br />
                <br />
            
                <button id="signin-button" class="btn btn-light" onClick={()=> {window.location.replace("https://connect.squareup.com/oauth2/authorize?client_id=sq0idp-v0x4MOYX8evTej5RON3BvA")}}><img id="signin-img" src={square_logo} /></button>
                <br />
                
                <br />
                <button id="signin-button" class="btn btn-dark" onClick={()=> {window.location.replace("https://connect.squareup.com/oauth2/authorize?client_id=sq0idp-v0x4MOYX8evTej5RON3BvA")}} disabled><img id="signin-img" src={"https://logosmarcas.net/wp-content/uploads/2020/11/Wix-Logo.png"}/></button>
                <br />
            </div>}

           
          
        </div> )
    }


    const validateLicense = async (shopify, shop) => {
        if (shopify) {
            var data = {
                body: {
                    validate: true,
                    email: email,
                    store: shop 
                }
            }
    
            var url = "/oauthCallbackShopify"
            const response = await API.post('server', url, data)
            if (response.plan) {
                for (var i = 0; i < response.plan.length; i++) {
                    if (response.plan[i].name == "Bronze" || response.plan[i].status == "active") {
                        return 1
                    }
                    else if (response.plan[i].name == "Silver" || response.plan[i].status == "active") {
                        return 2
                    } 
                }
                alert("Invalid license")
                window.location.replace("https://privaxis.ca/license")
            } else {
                if (props.sandbox) {
                    return 3
                } else {
                    alert("Invalid license")
                    window.location.replace("https://privaxis.ca/license")
                }
            }
            
        } else {
            const planId1 = "P-4MG9748233399803AM6ETTXQ" //"P-02U60226SN022074CM56B6FY" 
            const planId2 = "P-32727078E9467440BM56UNTA"
            const response = await API.post('serverv2', '/validateLicense', { body: {
                license: license,
                email: email,
                sandbox: props.sandbox
            }})

            if (response.ok) {
                switch (response.tier) {
                    case planId1:
                        return 1
                    case planId2:
                        return 2
                    default:
                        return 3
                }
                
            } else {
                return {"error": "Bad License"}
            }

        }
        

    }


    async function getPublicKey() { //fct to get public key from server
        const response = await API.get('serverv2', '/getOracleAddr', {})
        return response.publicKey
    }

    

    const writedId = async () => {
        //alert("writting your DID")
        if (window.localStorage.getItem("usingMetamask") === "true") {
            alert("Error... deconnecter votre compte Metamask...")
        }
        else {
            setFirstConnect(false)
            setFirstConnect2(false)
            setProfileLoading(true)
            setFullname(fname + " " + lname)
            window.localStorage.setItem("clientId", email)
            const NewWallet = ethers.Wallet.createRandom()
            const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")
            let newConnectedWallet = NewWallet.connect(provider)

            //get the public key of server and encrypt the password using shared secret
            let poolPublicKey = await getPublicKey()
            let clientPublicKey = new ethers.utils.SigningKey(newConnectedWallet.privateKey)
            let shareSecret = clientPublicKey.computeSharedSecret(poolPublicKey)
           
           
            let key = AES.encrypt(password, shareSecret)
            window.localStorage.setItem("clientId", email)
            
            //console.log(newConnectedWallet.privateKey)
            let dds_addresses = dds ? dds : generateContracts ? await publishContracts() : {} //custom install and generating contract checked
            //console.log(scodeforapi)
            const api_access = !searchParams.get("admin") ?  scodeforapi ? await API.post('server', '/oauthCallback', { body: {
                code: scodeforapi,
                clientId: square_client,
                clientSecret: square_client_secret,
                redirectUri: "https://privaxis.ca/seller/0"
            }}) : "" : scodeforapi

            const tier = searchParams.get("admin") ? await validateLicense(true, searchParams.get("shop")) : 3 //set tier 3 if custom store
            
            if (tier.error) {
                alert("In order to access this product, you need a license. Get one at https://privaxis.com/license.")
                window.location.replace("https://privaxis.ca/license")
                throw tier.error;
            }

            //console.log(props.signer)
            if (!window.localStorage.getItem("walletAddress")) { // set dds if not imported 
                
                writePrivateKey(newConnectedWallet.address, newConnectedWallet.privateKey, dds_addresses, api_access, tier, newConnectedWallet.publicKey, key.toString())
                window.localStorage.setItem("hasWallet", true)
                window.localStorage.setItem("walletAddress", newConnectedWallet.address)

                const data = {
                    Waddress: newConnectedWallet.address,
                    pk: newConnectedWallet.privateKey,
                    first_name: fname,
                    last_name: lname,
                    email: email,
                    website_id: id,
                    mobileNumber: phone, //"+19692154942"
                    dob: "1994-11-26", // got to format well
                    address: {
                        addressLine1: street,
                        city: city,
                        state: state,
                        postCode: code,
                        countryCode: country
                    }
                }
                //console.log(data)
        
                let stringdata = JSON.stringify(data)
                //let bytedata = ethers.utils.toUtf8Bytes(stringdata)
        
                //console.log(props)
                var encrypted = AES.encrypt(stringdata, password)
                //hash the data object and store it in user storage
                //ethers.utils.computeHmac("sha256", key, bytedata)
                
                  
                window.localStorage.setItem("did", encrypted);

                alert("Compte enregistré ! Bienvenue sur les Technologies CPL!")

            } else {
                setFirstConnect2(false)
                let did = window.localStorage.getItem("did")
                let res1 = AES.decrypt(did, password) //props.signer.privateKey
                let res = JSON.parse(res1.toString(enc.Utf8));

                writePrivateKey(res.Waddress, res.pk, dds_addresses, api_access, tier, newConnectedWallet.publicKey, key.toString())
            }
           
        }

        
    }

    const formAdvance = async(event) => {
        event.preventDefault()

        if(firstConnect2) {
            setFirstConnect2(false)
            setFirstConnect3(true)
        }if (firstConnect) {
            setFirstConnect(false)
            setFirstConnect2(true)
        } 
    }

    const saveId = async(event) => {
        event.preventDefault()
       
        if (city !== "" && state !== "" && code !== "" && country !== "" && street !== "" && phone !== "" && email !== "" && fname !== "" && lname !== "") {
            writedId()
        }
        else {
            alert("Vous devez entrer vos informations... Veuiller réessayer...")
        }  
    }

    const writePrivateKey = (account, privatekey, dds_addresses, api_access, tier, pubkey, password) => { //function to write a privatekey to aws dynamo server
        //console.log(privatekey)


        var data = {
            body: {
                address: account.toLowerCase(),
                email: email,
                password:password,
                name: fullname,
                dds: dds_addresses,
                api_access: api_access,
                device_id: "", //square infos
                tier: tier,
                website: website,
                publickey: pubkey
    
            }
        }
        //setPrivatekey(privatekey)

        var url = "/partnerConnection"
        const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")

        API.post('server', url, data).then(async (response) => {
            console.log(response)
            setBack(response.bg);
            setImg(response.img);
            //setCustimg(response.cust_img);
            //setName(response.name)
    
            //change user privatekey to the json
            let userwallet = new ethers.Wallet(privatekey, provider) //response.privatekey
            console.log(userwallet)
            setSigner(userwallet)
           
            //let userwallet = new ethers.Wallet.fromEncryptedJson(response.privatekey, password)

            /*let contract = getContract(userwallet, Credit.abi, contractAddress)
            

           
            //getBalance(account, setBalance, setMoney, contract); only connected to mainnet
            setCredit(contract)
            //let diD = getContract(userwallet, DiD.abi, DiDAddress)
            //console.log(diD)
            //setDid(diD)

            let AMMContract = getContract(userwallet, DDSABI.abi, DDSADDr)
            setAmm(AMMContract)*/
           
            setProfileLoading(false)
            //alert("Bienvenue sur L'Atelier de Simon! Il ne vous reste qu'à vous créer une Identité Decentralizée pour accèder à l'Atelier!")

        })
    }

    const generateAccessToken = async () => {
        const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
        const response = await fetch(`${baseURL}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
            Authorization: `Basic ${auth}`,
            },
        });
        const data = await response.json();
        //console.log(data.access_token)
        return data.access_token;
      };

    const getPrivateKey = async(email, privatekey, password) => { //function to get privatekey from aws dynamo server
        var data = {
            body: {
                email: email,
                password: password
            }
        }

        var url = "/partnerConnection"

        const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")
        //const binanceProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")

        API.post('server', url, data).then(async (response) => {
            console.log(response)
            setContracts(response.dds)
            setBack(response.bg);
            setImg(response.img);
            setWebsite(response.website)
            setDevice_id(response.device_id)
            setApi_key(response?.partner_api_access) //.access_token
            setTier(response?.tier)
            
        
            
            //setDds(response.dds)
            let square_data = response.transfer_data ? response.transfer_data : new Array(12).fill(0)
            let last_month_square_data = 6 //august
            let list_of_buying_transac = []
            let list_of_buying_ip_transac = []
            let list_of_buying_transac_value = []
            let list_of_buying_ip_transac_value = []
            let liveDate = new Date()
            labels = labels.slice(liveDate.getMonth()+1, 12).concat(labels.slice(0, liveDate.getMonth()+1))
            square_data = square_data.slice(liveDate.getMonth()+1, 12).concat(square_data.slice(0, liveDate.getMonth()+1)) //right order based on the month
            square_data = square_data.slice(((liveDate.getMonth()+1) -last_month_square_data), 12)
            square_data = square_data.concat(Array(12-square_data.length).fill(0))
            //console.log(square_data)
            let data = {
                labels,
                datasets: [
                  {
                    fill: true,
                    label: ' Online sales',
                    data: [0,0,0,0,0,0,0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                  },
                  {
                    fill: false,
                    label: ' In-person sales',
                    data: [0,0,0,0,0,0,0, 0, 0, 0, 0, 0],
                    borderColor: 'red',
                    backgroundColor: 'red',
                  },
                ],
              };
              const data2 = {
                labels,
                datasets: [
                  {
                    label: 'Payments',
                    data: square_data,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                  },
                ],
              };

            
              

            console.log(response.dds)
            console.log(contracts)
            //get the device code from either decentralized profile or server
            
            var params = {
                    body: {
                        url: "https://connect.squareup.com/v2/payments",
                        data: {
                            method:"get",
                            headers: {
                               
                                'Authorization': `Bearer ${square_secret}`,
                                'Content-Type': 'application/json',
                                'Square-Version': '2024-06-04',
                                
                                }
                    }
                }
            }
            let start_date = ""
            let end_date = ""
            const paypalBearer = await generateAccessToken()
           

           
            
            API.post('server',"/getcode", params).then((res) => {
                console.log(res)
                for (let i=0; i<res?.payments?.length; i++) { //if (location_id == "") {}
                    list_of_buying_ip_transac.push(res?.payments[i]?.updated_at)
                    list_of_buying_ip_transac_value.push(res?.payments[i]?.amount_money.money)
                }
                //https://developer.squareup.com/reference/square/payments-api/list-payments
                
            }).then(()=> {
                for(let i = 0; i<list_of_buying_ip_transac.length;i++) {

                       
                    var date = new Date(Date.parse(list_of_buying_ip_transac[i]));
                    let month = date.getMonth()
                    let index = labels_index[month-1]
                    let position = labels.indexOf(index)
                    data.datasets[1].data[position] +=1
                    data2.datasets[0].data[position] += list_of_buying_ip_transac_value[i] //push payment value into the payment data
                    if ((i+1)==list_of_buying_ip_transac.length) {
                        console.log(data)
                        //setDds(data)
        
                    }
        
        
                    //identify the month
                    //find the equivalent index in data.datasets.data using labels
                    // replace the index with data.datasets.data +=1
                }}).then(() => {
            
            fetch("https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=" + response.dds?.buying + "&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=RCJJXRYSTIJT7NAAJA2IQKTQQCPBZ4ZGK4").then((res) => {
                res.json().then((res2) => {
                    console.log(res2)
                   
                   
                    //loop throught all the transactions 
                    for(let i=0;i<res2.result.length; i++) {
                        if (res2.result[i].methodId === "0x001b374b") {
                            list_of_buying_transac.push(res2.result[i].timeStamp)
                        }
                    }
                }).then(() => {  

                    setNumOrders(list_of_buying_transac.length + list_of_buying_ip_transac.length)
                    for(let i = 0; i<list_of_buying_transac.length;i++) {

                       
                        var date = new Date(list_of_buying_transac[i] * 1000);
                        let month = date.getMonth()
                        //console.log(date.toDateString())
                        let index = labels_index[month-1]
                        let position = labels.indexOf(index)
                        data.datasets[0].data[position+1] +=1
                        if ((i+1)==list_of_buying_transac.length) {
                            console.log(data)
                            setDds(data)
                            for (let i=0; i<data.datasets[0].data.length; i++) {
                                if(data.datasets[0].data[i] !== 0) {//if their was a transaction in that month, load the month from paypal
                                
                                    let starting_month = labels_index.indexOf(labels[i])
                                    console.log(starting_month)
                                    //let newdate = new Date(2024, starting_month, 1)
                                    if ((starting_month+1).toString().length > 1) {
                                        start_date = `2024-0${starting_month+1}-01T00:00:00-0700`
                                       
                                    } else {
                                        start_date = `2024-0${starting_month+1}-01T00:00:00-0700`//${starting_month+1}
                                        
                                    }

                                    if ((starting_month + 2).toString().length > 1) {
                                         end_date =  `2024-${starting_month+2}-01T00:00:00-0700`
                                    } else {
                                         end_date =  `2024-0${starting_month+2}-01T00:00:00-0700`
                                    }
                                    
                                    var params2 = {
                                        body: {
                                            url: `${baseURL}/v1/reporting/transactions?start_date=` + start_date +"&end_date=" + end_date,
                                            data: {
                                                method:"get",
                                                headers: {
                                                   
                                                    'Authorization': `Bearer ${paypalBearer}`,
                                                    'Content-Type': 'application/json',
                                                    
                                                    }
                                        }
                                    }
                                    }
                                    console.log(params2)
                                    
                                    API.post('server',"/getcode", params2).then((res) => {
                                        console.log(res)
                                        for (let j=0; j<res.transaction_details.length; j++) {

                                            //check for note to validate the transaction origin
                                            if (res.transaction_details[j].transaction_note === email) { //https://developer.paypal.com/docs/api/payments/v1/#payment_list note_to_payer //for now: email
                                                data2.datasets[0].data[i] += parseInt(res.transaction_details[j].transaction_info.transaction_amount.value)
                                            }
                                            
                                            
                                            
                                            
                                        }
                                      
                                    })

                                }
                                if ((i+1)==data.datasets[0].data.length) {
                                    console.log(data2)
                                    let total = 0;
                                    data2.datasets[0].data.forEach((number) => (total += number));
                                    setTotalMoneyeceived(total)
                                    
                                    setPaymentData(data2)
                                }
                            }
            
                        }
            
            
                        //identify the month
                        //find the equivalent index in data.datasets.data using labels
                        // replace the index with data.datasets.data +=1
                    }
                   
                })
            })})
    
            //change user privatekey to the json
            let userwallet = new ethers.Wallet(privatekey, provider) //response.privatekey
            setSigner(userwallet)
            //console.log(userwallet.mnemonic)
            //let userwallet = new ethers.Wallet.fromEncryptedJson(response.privatekey, password)
           
            //user side  // 
            //let testsing = new ethers.utils.SigningKey(privatekey)
            //let testsig = testsing.signDigest(digest)
            //


            //let contract = getContract(userwallet, Credit.abi, contractAddress)
            

           
            //getBalance(account, setBalance, setMoney, contract); only connected to mainnet
            //setCredit(contract)
            //let diD = getContract(userwallet, DiD.abi, DiDAddress)
            //console.log(diD)
            //setDid(diD)

            //let AMMContract = getContract(userwallet, DDSABI.abi, DDSADDr)
            //setAmm(AMMContract)
            setProfileLoading(false)

            //let test = await AMMContract.isPool();

            //gas tests:

           

            
            
            
            //const gasdds = getContract(DDSGasContract, DDSABI.abi, props.signer)
            //let gas2 = await gasdds.estimateGas.purchaseItem(1, 1, props.pk)

                    

           
        }).catch((e) => {
            console.log(e)
            alert("No account connect to Privaxis. To create an account, go to https://privaxis.ca/license")
            window.location.replace("https://privaxis.ca/license")
        })
        /*
        try {
            API.get('serverv2', "/getOracleAddr").then((response) => {
                console.log(response);
            }).catch((e) => {
                console.log(e)
            })
        } catch (e) {
            console.log(e)
        }*/
       
    
    }

    const connection = async(haswallet) => {
        if (haswallet !== "true") {
            
            setFirstConnect(true)
            setNeedPassword(false)
        }
        else {
            window.localStorage.setItem("usingMetamask", false)
            let did = window.localStorage.getItem("did")
            document.cookie = 'did=' + did + '; max-age:31536000; Secure'
            let res1 = AES.decrypt(did, passwordInp) //props.signer.privateKey
            try {
                let res = JSON.parse(res1.toString(enc.Utf8));
                if (res.pk) {
                    
                    if (!window.sessionStorage.getItem("password")) {
                        window.sessionStorage.setItem("password", passwordInp)
                        window.location.reload()
                    }
                    
                    let NewWallet = new ethers.Wallet(res.pk)
                    let poolPublicKey = await getPublicKey()
                    let clientPublicKey = new ethers.utils.SigningKey(NewWallet.privateKey)
                    let shareSecret = clientPublicKey.computeSharedSecret(poolPublicKey)
                    let key = AES.encrypt(passwordInp, shareSecret)
                    window.sessionStorage.setItem("password", passwordInp)
                   
                    getPrivateKey(res.email, res.pk, key.toString())
                    if (res.email) {
                        setEmail(res.email)
                        setFullname(res.first_name + " " + res.last_name)
                    }
                    setNeedPassword(false)
                    if (id != res.website_id) {
                        //console.log(res.website_id)
                        window.location.replace("/seller/"+ res.website_id)
                        //id = res.website_id
                        //console.log(res.website_id)
                        //reload_for_id()
                    }
                    

                } else {
                    alert("mauvais mot de passe")
                }
            } catch(e) {
                alert("mauvais mot de passe");
            }
            
            
            //
            
            //console.log("already a wallet")
        }
    }

    useEffect(() => {
        
        async function boot() {
            console.log("OK")
            
            let scode = searchParams.get("code")
            let shopify_confirmation = searchParams.get("shop")
            let admin_app = searchParams.get("admin") //if this is true, then the user is logging in as an admin in shopify
            if (shopify_confirmation && searchParams.get("charge_id")) { //complete log in with license
                window.location.replace("https://admin.shopify.com/store/"+ shopify_confirmation.split(".")[0] +"/apps/cpl-payment")
            }

            if (scode && !shopify_confirmation) { // square
                //extract square info using square tools ==> get this from api
                /**
                 * 
                 * const response = await axios.post('https://connect.squareup.com/oauth2/token', {
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: authorizationCode,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri
                });

                const accessToken = response.data.access_token;
                
                 */
                if (window.localStorage.getItem("did")) { //upload a square account after creating an account
                    //update db
                    let password = window.sessionStorage.getItem("password")
                    let did = window.localStorage.getItem("did")
                    let res1 = AES.decrypt(did, password) //props.signer.privateKey
                  
                    let res = JSON.parse(res1.toString(enc.Utf8));
                    const api_access = await API.post('server', '/oauthCallback', { body: {
                        code: scode,
                        clientId: square_client,
                        clientSecret: square_client_secret,
                        redirectUri: "https://privaxis.ca/seller/0"
                    }})
                    API.post('server', '/uploadFile', { body: {
                        square_access: api_access,
                        email: res.email
                    }} ).then((response) => {
                        console.log(response)
                        alert("connected to Square")
                        setNeedPassword(false);
                        passwordInp = window.sessionStorage.getItem("password");
                        setPassword(passwordInp)
                        connection("true")
                    })

                } else { //first connect
                    
                    setScodeforapi(scode)
                    setNeedPassword(false)
                    setFirstConnect(true)
                    
                }
                
              

            } if (scode && shopify_confirmation) {
                if (window.localStorage.getItem("did")) { //upload a shopify api key after creating an account
                    //update db
                    let password = window.sessionStorage.getItem("password")
                    let did = window.localStorage.getItem("did")
                    let res1 = AES.decrypt(did, password) //props.signer.privateKey
                  
                    let res = JSON.parse(res1.toString(enc.Utf8));
                    const api_access = await API.post('server', '/oauthCallbackShopify', { body: {
                        code: scode,
                        shop: shopify_confirmation,
                        clientId: shopify_app_client,
                        clientSecret: shopify_app_secret,
                        
                    }}) //this returns storefront access token

                    console.log(api_access)

                    //let storefrontkey = connectClientShopify(shopify_confirmation, scode)
                    API.post('server', '/uploadFile', { body: {
                        square_access: api_access,
                        email: res.email
                    }} ).then((response) => {
                        console.log(response)
                        alert("connected to Shopify")
                        setNeedPassword(false);
                        passwordInp = window.sessionStorage.getItem("password");
                        setPassword(passwordInp)
                        connection("true")
                    })

                }
                 else { //display activation key
                    setShopify(shopify_confirmation)
                    setNeedPassword(false)
                    setFirstConnect(true)
                    const api_access = await API.post('server', '/oauthCallbackShopify', { body: {
                        code: scode,
                        shop: shopify_confirmation,
                        clientId: shopify_app_client,
                        clientSecret: shopify_app_secret,
                        
                    }}) //this returns storefront access token

                    console.log(api_access)
                    setScodeforapi(api_access.access_token)
                    
                    
                }
                
            }
            if (admin_app && !window.localStorage.getItem("did")) { //when connecting in embedded app
                setNeedPassword(false)
                setFirstConnect(true)
            }

            if (window.localStorage.getItem("did") && admin_app && !window.sessionStorage.getItem("password")) { //seamless log in
                setNeedPassword(false);
                //let apikey = await getApikey()
                const { publicKey, privateKey } = await generateKeyPair();
                console.log(searchParams.get('host'))
                const app = createApp({
                    apiKey: shopify_app_client, // API key from the Partner Dashboard
                    host: searchParams.get('host'), 
                    forceRedirect: true,
                })
                console.log(app)
                
                getSessionToken(app).then((token) => {
                    console.log(token)
                    API.post("server", '/partnerConnection', { body: {
                        seamless: true,
                        publicKey: publicKey,
                        token: "Bearer " + token,
                        email: window.localStorage.getItem("clientId")
                    }}).then(async (response) => {
                        passwordInp = await decryptPassword(response.password, privateKey);
                        setPassword(passwordInp)
                        console.log(passwordInp)
                        let did = window.localStorage.getItem("did")
                        let res1 = AES.decrypt(did, passwordInp) //props.signer.privateKey
                        try {
                            let res = JSON.parse(res1.toString(enc.Utf8));
                            console.log(res)
                            if (res.pk) {
                                //window.sessionStorage.setItem("password", passwordInp)
                                setContracts(response.dds)
                                setBack(response.bg);
                                setImg(response.img);
                                setWebsite(response.website)
                                setDevice_id(response.device_id)
                                setApi_key(response?.partner_api_access) //.access_token
                                setTier(response?.tier)
                                const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")
                                let userwallet = new ethers.Wallet(res.pk, provider) //response.privatekey
                                setSigner(userwallet)
                                
                                if (res.email) {
                                    setEmail(res.email)
                                    setFullname(res.first_name + " " + res.last_name)
                                    const license = await validateLicense(true, shopify_confirmation)
                                    console.log(license)
                                    setProfileLoading(false)
                                }
                                
                                if (id != res.website_id) {
                                    window.location.replace("/seller/"+ res.website_id)
                                }
                                
            
                            } else {
                                alert("mauvais mot de passe")
                            }
                        } catch(e) {
                            alert("mauvais mot de passe");
                        }
                    }).catch(err => console.log(err))
                })
        
            }

            if(window.sessionStorage.getItem("password")) { //auto login
                setNeedPassword(false);
                passwordInp = window.sessionStorage.getItem("password");
                setPassword(passwordInp)
                connection("true")


            }
           
            
        }
        boot()

        
    }, [])
        return(
            displayPayments ? <PaymentsAccount setDisplay={setDisplaypayments} data={paymentData} total={totalMoneyReceived} device_id={device_id}/> : displayItems ? <ItemsAccount setDisplay={setDisplayItems} device_id={device_id} signer={signer} email={email} store={website.replace("https://", "")} contracts={contracts}/> : needPassword ? <GetPassword /> : firstConnect ? 
            shopify ?  scodeforapi ? ( <div class="getPassword">
                <h3>Shopify connection</h3>
                <p>To continue setting up your application, buy a license in your shopify admin <a href={"https://admin.shopify.com/store/"+ shopify.split(".")[0]+"/charges/cpl-payment/pricing_plans"} target="_blank">dashboard</a> and save your license activation key: <strong>{scodeforapi}</strong> for logging in (do not share this key)</p>
            </div> ) : (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>Account loading...</h5></div>) :
            ( <div class="getPassword">
            <h3>Personal information</h3><p>You can always delete any DiD ( <a href=""> see our security policy</a>) </p>
                                <form onSubmit={formAdvance}>
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" style={{width: "33%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <br />
                                <br />
                                {scodeforapi || searchParams.get("admin") ? <div>
                                    <div class="mb-3 row">
                                        <label for="inputPassword" class="col-sm-2 col-form-label" >Email</label>
                                        <div class="col-sm-10">
                                            <input type="email" class="form-control" id="inputPassword" onChange={changeEmailSC}/>
                                        </div>
                                    </div>
                                    <br />
                                    <div class="mb-3 row">
                                        <label for="inputPassword" class="col-sm-2 col-form-label" >Password</label>
                                        <div class="col-sm-10">
                                            <input type="password" class="form-control" id="inputPassword" onChange={changePassSC}/>
                                        </div>
                                    </div>
                                    <br />
                                </div> : ""}
                                { searchParams.get("admin") ? <div><div class="mb-3 row">
                                        <label for="inputPassword" class="col-sm-2 col-form-label" >Activation key</label>
                                        <div class="col-sm-10">
                                            <input type="text" class="form-control" id="inputPassword" onChange={changeActivationKey}/>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                    <label for="inputPassword" class="col-sm-2 col-form-label" >License ID (if you dont have one, visit our <a target="_blank" href="https://cpltechnologies.com/license">license page</a>)</label>
                                    <div class="col-sm-10">
                                        <input type="text" class="form-control" id="inputPassword" onChange={onLicenseChange}/>
                                    </div></div>
                                </div> : ""}
                                <input type="text" id="fname" name="fname" class="form-control" placeholder="First Name : Thomas" onChange={onFnameChanged}/>
                                    <br />
                                    <input type="text" id="lname" name="lname" class="form-control" placeholder="Last Name : Berthiaume " onChange={onLnameChanged}/>
                                    <br />
                                    <input type="text" id="country" name="country" class="form-control" placeholder="country : US " onChange={onCountryChanged}/>
                                    <br />
                                    <input type="text" id="state" name="state" class="form-control" placeholder="state : NY" onChange={onCityChanged}/>
                                    <br />
                                    <input type="text" id="city" name="city" class="form-control" placeholder="city : New York City" onChange={onStateChanged}/>
                                    <br />
                                    <input type="text" id="street" name="street" class="form-control" placeholder="street address : 1 example road" onChange={onStreetChanged}/>
                                    <br />
                                    <input type="text" id="code" name="code" class="form-control" placeholder="Postal code : 000 000" onChange={onCodeChanged}/>
                                    <br />
                                    <input type="text" id="phone" name="phone" class="form-control" placeholder="Phone : 14188889065" onChange={onPhoneChanged}/>
                                    <br />
                                    <input type="text" id="email" name="email" class="form-control" placeholder="Email : thom@example.com" onChange={onEmailChanged}/>
                                    <br />
                                    <input type="text" id="website" name="website" class="form-control" placeholder="website: https://test.myshopify.com" onChange={onWebsiteChange}/>
                                    <br />
                                    <input type="submit" class="btn btn-primary" value="Continue" />
                                   
                                </form>
          </div>) : firstConnect2 ? ( <div class="getPassword">
         <h3>{window.localStorage.getItem("language") == "fr" ? `Contrat de Services`:  `Legal Contract`}</h3>
                                <form onSubmit={saveId}>
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" style={{width: "66%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <br />
                                <br />
                                <iframe src="https://cpltechnologies.com/legal" frameborder="0" style={{"height":"500px", "width": "1000px"}}></iframe>
                                <br />
                                <br />
                                <input type="submit" class="btn btn-primary" value="Accept" />
                                </form>
          </div>):
            profileLoading ? (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>Account loading...</h5></div>) : 
            <div class='selleraccount'>
               
                <div class="container">
                <div class="row">
                    <div class="col">
                        <div class='banner' style={{backgroundColor: back}}>
                            <img alt="" src={default_profile} id="profile_img" style={{backgroundColor: img}} />
                        </div>
                        <div class="profile-info">
                        <h4 id="profile-info-tag">{window.localStorage.getItem("language") == "fr" ? "Information du compte:" : "Account Info:"}</h4>
                       
                        <p>{window.localStorage.getItem("language") == "fr" ? `Bienvenue: ${fullname}`:  `Welcome: ${fullname}`}</p>
                        <p>{window.localStorage.getItem("language") == "fr" ? `License de niveau: ${tier}`:  `License tier: ${tier}`}</p>
                    
                    
                        </div>
                        {searchParams.get("admin") ? "" : <CPLWallet/>}
                        </div>
                        <div class="col-6">
                        <ItemChart tier={tier} setDisplay={setDisplayItems} signer={signer} numOrders={numOrders} dds={dds}/>
                        </div>
                        <div class="col">
                        <UpgradePopup apikey={api_key}/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                        {searchParams.get("admin") ? "" : <WebsiteChecker website={website} email={email}/>}
                        </div>
                        <div class="col-6">
                        <PaymentChart tier={tier} setDisplay={setDisplaypayments} data={paymentData} total={totalMoneyReceived}/>
                        </div>
                        <div class="col">
                        <Bills data={paymentData} email={email} total={totalMoneyReceived}/>
                        </div>
                    
               
               

                </div>
                
               
                
                
               
                </div>
                

                
            </div>
        )
}
    

export default SellerAccount