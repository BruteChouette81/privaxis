
import { useParams, useSearchParams } from 'react-router-dom'
import { lazy } from 'react';


//import { dds_bytecode, buying_bytecode, minting_bytecode,  } from '../../artifacts/contracts/bytecodes';


import {ethers} from 'ethers'
import {useState, useEffect } from 'react';
import { API } from 'aws-amplify';

import { AES, enc } from "crypto-js"
import default_profile from "./profile_pics/default_profile.png"
//import testWebsite from './test.html'
import ReactLoading from "react-loading";

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { unixfs } from '@helia/unixfs'
import { bootstrap } from '@libp2p/bootstrap'
import { multiaddr } from '@multiformats/multiaddr'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import {all} from '@libp2p/websockets/filters'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'
import { createHelia } from 'helia'
import { createLibp2p } from 'libp2p'

import ItemsAccount from './items_account';
import {Buffer} from 'buffer';


import { CLIENT_ID, APP_SECRET, square_client, square_client_secret } from '../../apikeyStorer';


import './css/sellerprofile.css'

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


import Credit from '../../artifacts/contracts/token.sol/credit.json';
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
import buying_abi from '../../artifacts/contracts/buying.sol/buying.json'
import minting_abi from '../../artifacts/contracts/minting.sol/minting.json'
import prooving_abi from '../../artifacts/contracts/prooving.sol/prooving.json'




import { square_secret } from '../../apikeyStorer';

//const website = "http://atelierdesimon.net/"
//const blockstore = new MemoryBlockstore()

const getContract = (signer, abi, address) => {
    // get the end user
    console.log(signer)
    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}

async function createNode () {
    // the blockstore is where we store the blocks that make up files
    const blockstore = new MemoryBlockstore()
  
    // application-specific data lives in the datastore
    const datastore = new MemoryDatastore()

    //create a websocket server
    //const wss = new WebSocket.Server({ server });

    //let socket = new WebSocket("ws://127.0.0.1");
    //console.log(socket)
  
    // libp2p is the networking layer that underpins Helia
    //addresses: {
    //listen: ['/ip4/127.0.0.1/tcp/3000/ws']
    //},
    /*
    peerDiscovery: [
        bootstrap({
          list: [ //connect to main peers
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
          ]
        })
      ],
      services: {
        identify: identify()
      }
      streamMuxers: [
        yamux()
      ],
       addresses: {
        listen: ['/ip4/127.0.0.1/ws']
        },
    */
    const libp2p = await createLibp2p({ //Websocket(ws://cpltechnologies.com/websocketserver)
      datastore,
      transports: [
        webSockets( {
            filter: all
        }) //{ filter: filters.all}
      ],
      connectionEncryption: [
        noise()
      ],
      connectionGater: {
        denyDialMultiaddr: () => false // this is necessary to dial local addresses at all
      },
      services: {
        identify: identify({protocolPrefix: 'ipfs'})
      }
      
      
      
    })
  
    return await createHelia({
      datastore,
      blockstore,
      libp2p
    })
  }


const connectWIPFS = async(e) => {
    //https://discuss.ipfs.tech/t/how-to-retrieve-content-uploaded-via-helia-using-the-ipfs-gateway/16582
    e.preventDefault()
    // create a Helia node
    console.log("connecting")
    console.log(e.target[0].files[0])
    const reader = new FileReader();
    let array;
    reader.readAsArrayBuffer(e.target[0].files[0]);
    reader.onloadend = async (evt) => {
    if (evt.target.readyState === FileReader.DONE) {
        const arrayBuffer = evt.target.result
        array = new Uint8Array(arrayBuffer);
        //console.log(array)
        const helia = await createNode()
        let ma = multiaddr("/ip4/127.0.0.1/tcp/8080/ws")
        console.log(ma)
        await helia.libp2p.dial(ma)
        console.log(helia.libp2p.getConnections()) //.getMultiaddrs()
        const fs = unixfs(helia)
        const cid = await fs.addBytes(array, {
            onProgress: (evnt) => {
                console.info('add event', evnt.type, evnt.detail)
            }
        })
    
        console.log('Added file:', cid.toString())
    }}
    
    //

    // create a filesystem on top of Helia, in this case it's UnixFS
    //

    // we will use this TextEncoder to turn strings into Uint8Arrays
    //const encoder = new TextEncoder()
    //console.log(encoder.encode('hello world'))

    // add the bytes to your node and receive a unique content identifier
    //
    /**function readFileDataAsBase64(e) {
    const file = e.target.files[0];

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (err) => {
            reject(err);
        };

        reader.readAsDataURL(file);
    });
} 
    const cid = await fs.addBytes(encoder.encode('Hello World 101'), {
        onProgress: (evt) => {
            console.info('add event', evt.type, evt.detail)
        }
    })

    console.log('Added file:', cid.toString())*/
}

const contractAddress = '0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565';
const DDSADDr = '0x0c50409C167e974e4283F23f10BB21d16BE956A9';


//function to create new contracts 
const publishContracts = async () => {
    //need dds, dds_buying, dds_minting and dds_prooving abis
    //need credit and real_nft addresses
    //need to connect to pool account for creation
    const dds_bytecode = lazy(() => import('../../artifacts/contracts/bytecodes'))
    const buying_bytecode = lazy(() => import('../../artifacts/contracts/bytecodes'))
    const minting_bytecode = lazy(() => import('../../artifacts/contracts/bytecodes'))
    const prooving_bytecode = lazy(() => import('../../artifacts/contracts/bytecodes'))
    
    //credit address
    const credit_addr = "0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565"
    const nft_addr = ""

    let pk = ""
    const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")
    const signer = new ethers.Wallet(pk, provider)

    const dds_factory = new ethers.ContractFactory(DDSABI, dds_bytecode, signer)
    const dds_contract = await dds_factory.deploy(credit_addr, nft_addr);
    const dds_receipt = await dds_contract.deployTransaction.wait();

    const dds_buy_factory = new ethers.ContractFactory(buying_abi, buying_bytecode, signer)
    const dds_buy_contract = await dds_buy_factory.deploy(dds_contract.address, credit_addr);
    const dds_buy_receipt = await dds_buy_contract.deployTransaction.wait();

    const dds_mint_factory = new ethers.ContractFactory(minting_abi, minting_bytecode, signer)
    const dds_mint_contract = await dds_mint_factory.deploy(dds_contract.address, credit_addr, nft_addr);
    const dds_mint_receipt = await dds_mint_contract.deployTransaction.wait();

    const dds_proove_factory = new ethers.ContractFactory(prooving_abi, prooving_bytecode, signer)
    const dds_proove_contract = await dds_proove_factory.deploy(dds_contract.address, credit_addr);
    const dds_proove_receipt = await dds_proove_contract.deployTransaction.wait();

    // settings
    // set _buyer, _proover and _minter, pool in DDS

    await dds_contract.setBuyer(dds_buy_contract.address)
    await dds_contract.setProover(dds_proove_contract.address)
    await dds_contract.setMinter(dds_mint_contract.address)
    await dds_contract.setPool(signer.address)

    //set _buyer, _pool in minting.sol
    await dds_mint_contract.setBuyer(dds_buy_contract.address)
    await dds_mint_contract.setPool(signer.address)

    //set pools:
    await dds_buy_contract.setPool(signer.address)
    await dds_proove_contract.setPool(signer.address)


    return [dds_contract.address, dds_buy_contract.address, dds_mint_contract.address, dds_proove_contract.address]


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


const ItemChart = (props) => {
    const [finishUpload, setFinishUpload] = useState(false)
    /**
     * 
     */
    

    
    return (
        <div class="itemsold">
            <p>{window.localStorage.getItem("language") == "fr" ? "Nombre total de commande:" : "Total orders:"} <strong>{props.numOrders}</strong> <button type="button" class="btn btn-link" onClick={() => {props.setDisplay(true)}}>{window.localStorage.getItem("language") == "fr" ? "commandes" : "orders"}</button></p>
            {props.dds ? <Line options={options} data={props.dds} /> : ""}
        </div>
    )
}

const SingleUpgrade = (props) => {
    return (
        <div class="singleUpgrade" style={{"backgroundColor":props.color, "color":"white"}}>
            <a href={props.link} style={{"color":'white'}}>{props.upgrade}</a>

        </div>
    )
}

const UpgradePopup = () => {
    /*<SingleUpgrade color="red" upgrade="Web Designer" link="/" />
            <SingleUpgrade color="blue" upgrade="SEO" link="/" />
            <SingleUpgrade color="green" upgrade="Marketing Specialist" link="/" />*/
    return (
        <div class="upgradepopup">
            <h4>Services</h4>
            <p style={{"color":"red"}}>{window.localStorage.getItem("language") == "fr" ? "Aucun service n'est actuellement disponible pour votre entreprise." : "No services are currently available for your business."}</p>
        </div>
    )
}

const WebsiteChecker = (props) => {
    const [liveCheck, setLiveCheck] = useState(true)
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
                setLiveCheck(false)
                
            }
        }

        
        getWebsite()
            
       
        
       
    }, [setLiveCheck])
    /**
     *  <form onSubmit={connectWIPFS}>
                <input type="file" name="webtester" id="" />
                
            </form>


        plan: 
        - get the pages we can modify (push/retrieve system) ==>  <button  class="btn btn-primary">Add a page</button>
        - get a readble version of the react page ==> {bundle.js and html}
        - options to customize using css only + adding simple things such as text
        - push methot to update amplify once the bundle is updated

         <br />
            <a href="/websitebuilderbypage/market">{`https://${website}`}/market</a>
     */
    return (
        <div class="webChecker">
            {liveCheck ?<p style={{"color":"green"}}>{window.localStorage.getItem("language") == "fr" ? "Votre site web est en ligne" : "Your website is live"}</p> : <p style={{"color":"red"}}>{window.localStorage.getItem("language") == "fr" ? "Votre site web n'est pas en ligne" : "Your website is down"}</p> }
            <a href={`https://${website}`}>{website}</a> {liveCheck ? <img src="http://clipart-library.com/images_k/green-check-mark-icon-transparent-background/green-check-mark-icon-transparent-background-10.png" alt="" style={{"float":"right", "height":"20px", "width":"auto"}}/>: <img src="https://cdn.picpng.com/exit/x-exit-button-icon-symbol-66209.png" alt="" style={{"float":"right", "height":"20px", "width":"auto"}} />}
            <br />
            <p> <strong> {window.localStorage.getItem("language") == "fr" ? "Explorer et modifier les pages de votre site" : "Explore and modify your pages"}</strong></p>
            <a href="/websitebuilderbypage/home">{`https://${website}`}/home </a>
           
           

           
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
        <div class="payChart">
            {window.localStorage.getItem("language") == "fr" ? (<p><button type="button" class="btn btn-link" onClick={() => {props.setDisplay(true)}}>Fonds</button>reçu: <strong>{props.total}</strong> $</p>) : (<p><button type="button" class="btn btn-link" onClick={() => {props.setDisplay(true)}}>Money</button>received: <strong>{props.total}</strong>  $</p>)}
            {window.localStorage.getItem("language") == "fr" ? <p>Frais payés: {props.total *0.027} $</p> : <p>Fee paid: {props.total *0.027} $</p> }
            {props.data ? <Bar options={options2} data={props.data} /> : ""}
        </div>
    )
}

const Bills = (props) => {
    // <button class="btn btn-primary">Change Billing Infos</button>
    return (
        <div class="bills">
            {window.localStorage.getItem("language") == "fr" ? <h4>Liste de vos factures</h4>: <h4>list of your bills</h4> }
            <p>Hosting:             0$</p>
            <p>Services:            0$</p>
            <p>CPL fees:            {props.total*0.027}$</p>
            <p> <strong>Total: {props.total*0.027}$</strong></p>
           
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




//1: redirected with a id for "account creation"
//2: create password protected decentralized accound (fix bug with ipfs-node)
//3: dashboard with website: buy the domain or import one (depending on the provenance)

function SellerAccount() {
    let { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams()
    
    const [credit, setCredit] = useState()
    const [tether, setTether] = useState()
    const [did, setDid] = useState()
    const [amm, setAmm] = useState()
    const [dds, setDds] = useState()
    const [paymentData, setPaymentData] = useState()
    const [totalMoneyReceived, setTotalMoneyeceived] = useState()
    const [numOrders, setNumOrders] = useState()
    const [contracts, setContracts] = useState()
    //const [address, setAddress] = useState()
    const [privatekey, setPrivatekey] = useState()
    const [ needPassword, setNeedPassword ] = useState(true)
    const [ profileLoading, setProfileLoading ] = useState(true)
    const [password, setPassword] = useState("")
    let emailInp = "" //0x3190b9754f22dd2b0514feff6bd299ee7514c777 0xb97c03f2350B55d0796d18ceb57c138Fea407FC1
    let passwordInp = ""
    let confirm = false

    let dds_addresses = {}
    let recovery_Account_address = ""
    let recoveryDid = ""

    const [website, setWebsite] = useState("")


    const [back, setBack] = useState('white')
    const [img, setImg] = useState('white')
    const [custimg, setCustimg] = useState(false)
    const [balance, setBalance] = useState(0);
    const [money, setMoney] = useState(0)
    const [image, setImage] = useState("")
    const [name, setName] = useState("")
    const [request, setRequest] = useState()
    const [friendList, setFriendList] = useState()
    const [description, setDescription] = useState()
    const [pay, setPay] = useState()
    const [realPurchase, setRealPurchase] = useState()
    const [level, setLevel] = useState(0)
    const [signer, setSigner] = useState()
    const [device_id, setDevice_id] = useState()

    const [firstConnect, setFirstConnect] = useState(false)
    const [firstConnect2, setFirstConnect2] = useState(false)
    const [firstConnect3, setFirstConnect3] = useState(false)
    const [customInstall, setCustomInstall] = useState(false)
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
    const [emailC, setEmailC] = useState(true)
    const [connectSquare, setConnectSquare] = useState(false)
    const [avg_volume, setAvg_volume] = useState(0)
    const [scodeforapi, setScodeforapi] = useState()

    const [displayPayments, setDisplaypayments] = useState(false)
    const [displayItems, setDisplayItems] = useState(false)

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

    const onEmailC = (event) => {
        setEmailC(event.target.checked)
        console.log(event.target.checked)
    }

    const changePass = (event) => {
        //setPassword(event.target.value)
        passwordInp = event.target.value;
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

    const changeConnectsquare = () => {
        setConnectSquare(true)
    }

    const changeNoConnectsquare = () => {
        setConnectSquare(false)
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

    const onRecoveryAccountChange = (event) => {
        recovery_Account_address = event.target.value
    }

    const onRecoveryDidChange = (event) => {
        recoveryDid = event.target.value
    }

    const onWebsiteChange = (event) => {
        setWebsite(event.target.value)
    }

    const onCustomInstallChange = () => {
        setPassword(passwordInp)
        setEmail(emailInp)
        setCustomInstall(true)
    }


    const connectUsingPassword = async (e) => {
        e.preventDefault()

        if (passwordInp !== "" && emailInp !== "") {
            const hasWallet = window.localStorage.getItem("hasWallet")
            if (hasWallet !== "true") {
                if (!confirm) {
                    alert("Error: make sure both passwords are the same")

                } else {
                    console.log(passwordInp)
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

    //become partner: 
    /**
     * 1: get email, new password and password confirmation
     * 2: go to firstConnect info form 
     * 3: get where is client comming from (import from square here)
     * 4: get the avg volume per year + what is client going for (simple pay or retail)
     * 5: create 
     * : ( <div>{window.localStorage.getItem("language") == "en" ? "Enter a new password" :"Entrer un nouveau Mot de Passe"}<h3></h3>
                <p>{window.localStorage.getItem("language") == "en" ? "IMPORTANT: when you enter your password: you cannot change it without losing your account!" :"IMPORTANT: lorsque vous entrez votre mot de passe: vous ne pouvez pas le changer sans perdre votre compte !"}</p></div> )}
     */

    function GetPassword() {
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

            </form> :<form onSubmit={connectUsingPassword}> 
            <h3>{window.localStorage.getItem("language") == "en" ? "Create a partner account in less than 5 mins" :"Créer un compte partenaire en moins de 5 minutes"}</h3>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style={{width: "0%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                
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
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Confirm password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changeConfirmPass}/>
                    </div>
                </div>
                <br />
                <button type="submit" class="btn btn-primary mb-3">Continuer</button>
                <br />
                <br />
                <button className='btn btn-danger' onClick={() => {onCustomInstallChange()}}>Custom installation</button>
            </form>}
          
        </div> )
    }

    const writedId = async () => {
        //alert("writting your DID")
        if (window.localStorage.getItem("usingMetamask") === "true") {
            alert("Error... deconnecter votre compte Metamask...")
        }
        else {
            setFullname(fname + " " + lname)
            const NewWallet = ethers.Wallet.createRandom()
            const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")
            let newConnectedWallet = NewWallet.connect(provider)
            console.log(newConnectedWallet.privateKey)
            let dds_addresses = dds ? dds : await publishContracts() //custom install
            const api_access = scodeforapi ? await API.post('/oauthCallback', { body: {
                code: scodeforapi,
                clientId: square_client,
                clientSecret: square_client_secret,
                redirectUri: "cpltechnologies.com/sellers/0"
            }}) : ""    

            //console.log(props.signer)
            if (!window.localStorage.getItem("walletAddress")) { // set dds if not imported 
                setFirstConnect3(false)
                writePrivateKey(newConnectedWallet.address, newConnectedWallet.privateKey, dds_addresses, api_access)
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
                console.log(data)
        
                let stringdata = JSON.stringify(data)
                //let bytedata = ethers.utils.toUtf8Bytes(stringdata)
        
                //console.log(props)
                console.log(password)
                var encrypted = AES.encrypt(stringdata, password)
                //hash the data object and store it in user storage
                //ethers.utils.computeHmac("sha256", key, bytedata)
                
                  
                window.localStorage.setItem("did", encrypted);

                alert("Compte enregistré ! Bienvenue sur les Technologies CPL!")

            } else {
                setFirstConnect3(false)
                let did = window.localStorage.getItem("did")
                let res1 = AES.decrypt(did, password) //props.signer.privateKey
                let res = JSON.parse(res1.toString(enc.Utf8));

                writePrivateKey(res.Waddress, res.pk, dds_addresses, api_access)
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
        //create a user ID. For now it will be IdCount
        //const id = parseInt( await props.did.idCount()) + 1
        //let key = Math.floor(Math.random() * 10000001); //0-10,000,000
        //window.localStorage.setItem("key", key)
        //window.localStorage.setItem("id", parseInt(id))
        //console.log(parseInt(id), 1, city, state, code, country, street, phone, email, fname, lname)
        //params: uint id, uint _key, string memory _city, string memory _state, string memory _postalCode, string memory _country, string memory _street1, string memory _phone, string memory _email, string memory _name, string memory _lastname
        if (city !== "" && state !== "" && code !== "" && country !== "" && street !== "" && phone !== "" && email !== "" && fname !== "" && lname !== "") {
            writedId()  
        }
        else {
            alert("Vous devez entrer vos informations... Veuiller réessayer...")
        }
        
        
        
    }

    function BuildDid() {
        return (
            <div class="DidBuilding">
            <p>You can always delete any DiD ( <a href=""> see our security policy</a>) </p>
                                <form onSubmit={saveId}>
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
                                    <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
          </div>)
    }
    
    

    const writePrivateKey = (account, privatekey, dds_addresses, api_access) => { //function to write a privatekey to aws dynamo server
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
                website: website
    
            }
        }
        setPrivatekey(privatekey)

        var url = "/partnerConnection"
        const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")

        API.post('server', url, data).then(async (response) => {
            console.log(response)
            setBack(response.bg);
            setImg(response.img);
            setCustimg(response.cust_img);
            setName(response.name)
    
            //change user privatekey to the json
            let userwallet = new ethers.Wallet(privatekey, provider) //response.privatekey
            console.log(userwallet)
           
            //let userwallet = new ethers.Wallet.fromEncryptedJson(response.privatekey, password)

            let contract = getContract(userwallet, Credit.abi, contractAddress)
            

            setSigner(userwallet)
            //getBalance(account, setBalance, setMoney, contract); only connected to mainnet
            setCredit(contract)
            //let diD = getContract(userwallet, DiD.abi, DiDAddress)
            //console.log(diD)
            //setDid(diD)

            let AMMContract = getContract(userwallet, DDSABI.abi, DDSADDr)
            setAmm(AMMContract)
           
            setProfileLoading(false)
            //alert("Bienvenue sur L'Atelier de Simon! Il ne vous reste qu'à vous créer une Identité Decentralizée pour accèder à l'Atelier!")

        })
    }
    const generateAccessToken = async () => {
        const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
        const response = await fetch(`https://api-m.paypal.com/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
            Authorization: `Basic ${auth}`,
            },
        });
        const data = await response.json();
        return data.access_token;
      };

    const getPrivateKey = async(email, privatekey) => { //function to get privatekey from aws dynamo server
        var data = {
            body: {
                email: email,
                password: passwordInp
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
            setCustimg(response.cust_img);
            setName(response.name)
            setWebsite(response.website)
            setDevice_id(response.device_id)
        
            
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
            
            fetch("https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=" + response.dds.buying + "&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=RCJJXRYSTIJT7NAAJA2IQKTQQCPBZ4ZGK4").then((res) => {
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
                                    //let newdate = new Date(2024, starting_month, 1)
                                    if (starting_month.toString().length > 1) {
                                        start_date = `2024-${starting_month+1}-01T00:00:00-0700`
                                        end_date =  `2024-${starting_month+2}-01T00:00:00-0700`
                                    } else {
                                        start_date = `2024-0${starting_month+1}-01T00:00:00-0700`
                                        end_date =  `2024-0${starting_month+2}-01T00:00:00-0700`
                                    }
                                    
                                    var params2 = {
                                        body: {
                                            url: "https://api-m.paypal.com/v1/reporting/transactions?start_date=" + start_date +"&end_date=" + end_date,
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
                    window.sessionStorage.setItem("password", passwordInp)
                    getPrivateKey(res.email, res.pk)
                    if (res.email) {
                        setEmail(res.email)
                        setFullname(res.first_name + " " + res.last_name)
                    }
                    setNeedPassword(false)
                    if (id != res.website_id) {
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
            console.log(scode)
            if (scode) {
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
                
                setScodeforapi(scode)
                setNeedPassword(false)
                setFirstConnect3(true)
                

            }
            if(window.sessionStorage.getItem("password")) {
                setNeedPassword(false);
                passwordInp = window.sessionStorage.getItem("password");
                setPassword(passwordInp)
                connection("true")


            }
           
            
        }
        boot()
        
    }, [])
        return(
            displayPayments ? <PaymentsAccount setDisplay={setDisplaypayments} data={paymentData} total={totalMoneyReceived} device_id={device_id}/> : displayItems ? <ItemsAccount setDisplay={setDisplayItems} device_id={device_id} contracts={contracts} signer={signer}/> : needPassword ? <GetPassword /> : firstConnect ? ( <div class="getPassword">
            <h3>Personal information</h3><p>You can always delete any DiD ( <a href=""> see our security policy</a>) </p>
                                <form onSubmit={formAdvance}>
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" style={{width: "25%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <br />
                                <br />
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
                                    <input type="submit" class="btn btn-primary" value="Continue" />
                                </form>
          </div>) : firstConnect2 ? (<div class="getPassword">
            <h3>Information transfer and partner connection</h3>
                                <form onSubmit={formAdvance} style={{"textAlign": "start"}}>
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" style={{width: "50%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <br />
                                <br />
                                <p>Are you transitioning from Square ?</p>
                                <div class="form-check">
                                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" onChange={changeConnectsquare}/>
                                <label class="form-check-label" for="flexRadioDefault1" >
                                  Yes
                                </label>
                                </div>
                                <div class="form-check">
                                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" onChange={changeNoConnectsquare} />
                                <label class="form-check-label" for="flexRadioDefault2">
                                    No
                                </label>
                                </div>
                                <br />
                                <br />
                                    {connectSquare ? <button class="btn btn-dark" onClick={()=> {window.location.replace("https://connect.squareup.com/oauth2/authorize?client_id=sq0idp-v0x4MOYX8evTej5RON3BvA")}}>Connect With Square</button> : <input type="submit" class="btn btn-primary" value="Continue" />}
                                  
                                </form>
          </div> ) : firstConnect3 ? ( <div class="getPassword">
         <h3>Business information</h3>
                                <form onSubmit={saveId}>
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" style={{width: "75%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <br />
                                <br />
                                <select class="form-select" aria-label="Default select example">
                                    <option selected>Select your average transaction volume per year</option>
                                    <option value="1" onSelect={()=> {setAvg_volume(1)}}>0-100k</option>
                                    <option value="2" onSelect={()=> {setAvg_volume(2)}}>100k-250k</option>
                                    <option value="3" onSelect={()=> {setAvg_volume(3)}}>250k-500k</option>
                                    <option value="4" onSelect={()=> {setAvg_volume(4)}}>500k-1M</option>
                                    <option value="5" onSelect={()=> {setAvg_volume(5)}}>1M +</option>
                                </select>
                                <br />
                                <br />
                                <p>What product are you interested in ?</p>
                                <div class="form-check">
                                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" disabled/>
                                <label class="form-check-label" for="flexRadioDefault1" >
                                   CPL Simple Pay
                                </label>
                                </div>
                                <div class="form-check">
                                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked/>
                                <label class="form-check-label" for="flexRadioDefault2">
                                    CPL Retail Solution
                                </label>
                                </div>
                                <br />
                                <input type="text" id="website" name="website" class="form-control" placeholder="website: https://mywebsite.com" onChange={onWebsiteChange}/>
                                <br />
                                <input type="submit" class="btn btn-primary" value="Submit" />
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
                        <p>Id: {id}</p>
                        <p>{window.localStorage.getItem("language") == "fr" ? `Bienvenue: ${fullname}`:  `Welcome: ${fullname}`}</p>
                    
                    
                        </div>
                        <CPLWallet/>
                        </div>
                        <div class="col-6">
                        <ItemChart setDisplay={setDisplayItems} signer={signer} numOrders={numOrders} dds={dds}/>
                        </div>
                        <div class="col">
                        <UpgradePopup/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                        <WebsiteChecker website={website}/>
                        </div>
                        <div class="col-6">
                        <PaymentChart setDisplay={setDisplaypayments} data={paymentData} total={totalMoneyReceived}/>
                        </div>
                        <div class="col">
                        <Bills total={totalMoneyReceived}/>
                        </div>
                    
               
               

                </div>
                
               
                
                
               
                </div>
                

                
            </div>
        )
}
    

export default SellerAccount