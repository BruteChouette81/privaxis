import "./css/profile.css"
import "./css/controle.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';
import {useState, useEffect } from 'react';
import { ethers } from "ethers";
import { API } from 'aws-amplify';
import {DAppProvider, useLogs} from '@usedapp/core'

import ReactLoading from "react-loading";
import PayGas from "../F2C/gas/payGas";

//import * as IPFS from 'ipfs-core';  //IPSF to list nft metadata


import Chart2 from '../chart'

import erc721ABI from '../../artifacts/contracts/nft.sol/nft.json'
import erc1155ABI from '../../artifacts/contracts/nft.sol/erc1155.json'
import realabi from '../../artifacts/contracts/Real.sol/Real.json'
import Credit from '../../artifacts/contracts/token.sol/credit.json';
import abi from '../../artifacts/contracts/market.sol/market.json'
import TicketABI from '../../artifacts/contracts/ticket.sol/ticket.json'
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'

import default_profile from "./profile_pics/default_profile.png"
import getGasPriceUsd from "../F2C/gazapi";
import injected from "./connector";
import PayGasList from "../F2C/gas/payGasList";
import PayGasRetrieve from "../F2C/gas/payGasRetrieve";
import PayGasSubmit from "../F2C/gas/payGasSubmit";

const MarketAddress = '0x710005797eFf093Fa95Ce9a703Da9f0162A6916C'; //goerli test contract for listing from account
const DDSAddress = '0x2F810063f44244a2C3B2a874c0aED5C6c28D1D87'
const NftAddress = '0x3d275ed3B0B42a7A3fCAA33458C34C0b5dA8Cc3A';
const TicketAddress = '0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565' //goerli test contract
const ImperialRealAddress = '0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a'

const IPFS = {}

const connectContract = (address, abi, injected_prov) => { //for metamask
    const provider = new ethers.providers.Web3Provider(injected_prov);

    // get the end user
    const signer = provider.getSigner();

    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}

const getContract = (address, abi, signer ) => { //for Imperial Account
    // get the end user
    //console.log(signer)
    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}
//const contractAddress = '0xD3afbEFD991776426Fb0e093b1d9e33E0BD5Cd71';
const list = async ( nftAddress, nftABI, tokenid, price, account, tag, name, description, image, signer) => {
    // price is in credit (5 decimals)
    try {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const nft = connectContract(nftAddress, nftABI, provider) //check if erc1155 for abi (response.contractType)
                const market = connectContract(MarketAddress, abi.abi, provider)
                console.log(nft)

                //make the market approve to get the token
                await(await nft.approve(MarketAddress, tokenid)).wait()
                //add pending screem
                
                //create a new item with a sell order
                await(await market.listItem(nft.address, tokenid, (price * 10000))).wait()
                const marketCountIndex = await market.itemCount()
                var data = {
                    body: {
                        address: account,
                        itemid: parseInt(marketCountIndex), //market item id
                        name: name, //get the name in the form
                        score: 0, //set score to zero
                        tag: tag, 
                        description: description,
                        image: image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('server', url, data).then((response) => {
                    console.log(response)
                    alert("token listed!")
                })
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const nft = getContract(nftAddress, nftABI, signer) //check if erc1155 for abi (response.contractType)
                const market = getContract(MarketAddress, abi.abi, signer)
                console.log(nft)

                //make the market approve to get the token
                await(await nft.approve(MarketAddress, tokenid)).wait()
                //add pending screem
                
                //create a new item with a sell order
                await(await market.listItem(nft.address, tokenid, (price* 10000))).wait()
                const marketCountIndex = await market.itemCount()
                var data = {
                    body: {
                        address: account,
                        itemid: parseInt(marketCountIndex), //market item id
                        name: name, //get the name in the form
                        score: 0, //set score to zero
                        tag: tag, 
                        description: description,
                        image: image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('server', url, data).then((response) => {
                    console.log(response)
                    alert("token listed!")
                })
            }
    
        }
        catch {
            alert("Unable to connect to: " + nftAddress + ". Please make sure you are the nft owner! Error code - 1")
        }
    
   

}

const listDDS = async (tokenid, price, account, name, description, image, numDays, signer) => { // already know what addess and abi are 
    // price is in credit (5 decimals)
    try {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const nft = connectContract(ImperialRealAddress, realabi.abi, provider) //check if erc1155 for abi (response.contractType)
                const DDS = connectContract(DDSAddress, DDSABI.abi, provider)
                console.log(DDS)
                console.log(parseInt(tokenid))
                console.log(parseInt(price))
                console.log(parseInt(numDays))

                //make the market approve to get the token
                await(await nft.approve(DDSAddress, tokenid)).wait()
                //add pending screem
                
                //create a new item with a sell order
                await(await DDS.listItem(nft.address, parseInt(tokenid), parseInt(price * 10000), parseInt(numDays))).wait()
                const marketCountIndex = await DDS.itemCount()
                var data = {
                    body: {
                        address: account,
                        itemid: parseInt(marketCountIndex), //market item id
                        name: name, //get the name in the form
                        score: 0, //set score to zero
                        tag: "real", 
                        description: description,
                        image: image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('server', url, data).then((response) => {
                    console.log(response)
                    alert("token listed!")
                })
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const nft = getContract(ImperialRealAddress, erc721ABI.abi, signer) //check if erc1155 for abi (response.contractType)
                const DDS = getContract(DDSAddress, DDSABI.abi, signer)
                console.log(nft)

                //make the market approve to get the token
                await(await nft.approve(DDSAddress, tokenid)).wait()
                //add pending screem
                
                //create a new item with a sell order
                await(await DDS.listItem(nft.address, parseInt(tokenid), parseInt(price * 10000), parseInt(numDays))).wait() //IERC721 _nft, uint _tokenId, uint _price, uint _numDays
                const DDSCountIndex = await DDS.itemCount()
                var data = {
                    body: {
                        address: account,
                        itemid: parseInt(DDSCountIndex), //market item id
                        name: name, //get the name in the form
                        score: 0, //set score to zero
                        tag: "real", 
                        description: description,
                        image: image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('server', url, data).then((response) => {
                    console.log(response)
                    alert("token listed!")
                })
            }
    
        }
        catch(e) {
            console.log(e)
            alert("Unable to connect to: " + DDSAddress + ". Please make sure you are the nft owner! Error code - 1")
        }
    
   

}

const mintNFT = async (account, uri, signer) => {
    if (window.localStorage.getItem("usingMetamask") === "true") {
        let provider = await injected.getProvider()
        const nft = connectContract(NftAddress, erc721ABI.abi, provider)
        const id = await nft.mint(account, uri)
        console.log(id)
        const transac = await nft.ownerOf(id)
        console.log(transac)
    } else {
        //const provider  = new ethers.providers.InfuraProvider("goerli")
        const nft = getContract(NftAddress, erc721ABI.abi, signer)
        const id = await nft.mint(account, uri)
        console.log(id)
        const transac = await nft.ownerOf(id)
        console.log(transac)
    }
    
}

const mintTicket = async (account, uri, ticket, signer) => {
    if (window.localStorage.getItem("usingMetamask") === "true") {
        let provider = await injected.getProvider()
        const nft = connectContract(TicketAddress, TicketABI.abi, provider)
        const id = await nft.safeMint(account, uri, ticket)
        console.log(id)
        const transac = await nft.ownerOf(id)
        console.log(transac)
    } else {
        //const provider  = new ethers.providers.InfuraProvider("goerli")
        const nft = getContract(TicketAddress, TicketABI.abi, signer)
        const id = await nft.safeMint(account, uri, ticket)
        console.log(id)
        const transac = await nft.ownerOf(id)
        console.log(transac)
    }
}

const mintReal = async (account, uri, signer) => {
    if (window.localStorage.getItem("usingMetamask") === "true") {
        let provider = await injected.getProvider()
        const nft = connectContract(ImperialRealAddress, realabi.abi, provider)
        console.log(nft)
        const id = await nft.safeMint(account, uri)
    } else {
        //const provider  = new ethers.providers.InfuraProvider("goerli")
        const nft = getContract(ImperialRealAddress, erc721ABI.abi, signer)
        const id = await nft.safeMint(account, uri)
        console.log(id)
        const transac = await nft.ownerOf(id)
        console.log(transac)
    }
}

function dealWithFriend(address, accepted, is_accepted) {
    console.log(address)
    console.log(accepted)
    console.log(is_accepted)
    
    var data = {
        body: {
            address: address.toLowerCase(),
            accepted: accepted.toLowerCase(),
            is_accepted: is_accepted
        }
        
    }

    var url = "/acceptFriend"

    API.post('server', url, data).then((response) => {
        console.log(response)
    })
}
function Request(props) {
    const newDeal = () => {
        dealWithFriend(props.address, props.accepted, true)
    }

    const newDeny = () => {
        dealWithFriend(props.address, props.accepted, false)
    }
    return (<div> 
        <h6>Address: {props.accepted} </h6> <button onClick={newDeal} class="btn btn-success">Accept</button> <button onClick={newDeny} class="btn btn-danger">Deny</button>
    </div>)
}

function Friend(props) {
    /*
    <div class="container">
        <div class="row">
            <div class="col">
                {props.address}
            </div>
        </div>
    </div>
    */
    return (
        <div>
            <img id="friendimg" src={default_profile} alt="" />      <h6>address: <a href={`/Seller/${props.address}`}>{props.address}</a> </h6>
        </div>
        
    )
}
function ListOfFriends(props) {
    //const friendList = ["0xDBC05B1ECB4FDAEF943819C0B04E9EF6DF4BABD6","0x721B68FA152A930F3DF71F54AC1CE7ED3AC5F867","0xB3B66043A8F1E7F558BA5D7F46A26D1B41F5CA2A"]
    return(<div class="friendList">
                {props.friendList?.map(i => {
                return <Friend address={i} />
                })}
                {props.friendList?.length === 0 ? ( <p>You have no friend! Go request friendship to users in the market!</p> ) : ""}
            </div>     
    ) //
}

function ListOfRequests(props) {
    
    return(<div class="friendList">
                {props.request?.map(i => {
                    return <Request accepted={i} address={props.account} />
                })}
                {props.request?.length === 0 ? ( <p>You have no request!</p> ) : ""}
            </div>     
    ) //
}

function DisplayFriends(props) {
    return(
        <div class="friends">
            <h4>Friend List: </h4>
            <ListOfFriends friendList={props.friendList} />
            <br />
            <h4>Requests: </h4>
            <ListOfRequests request={props.request} account={props.account}/>
        </div>
    )
}


function PaymentCard(props) {
    return (
        <div class="paymentcard">
            <div class="paymentinfo">
                <h5 id="cardnum" >Card Number: <strong>{props.card}</strong></h5>
                <p>expiration date: {props.date}</p>
                <br />
                <div class="separator">

                </div>
                <br />
                <button class="btn btn-danger">Delete</button>
            </div>
            

        </div>
    )
}

function ListPaymentMethod(props) {
    const paymentid = window.localStorage.getItem("paymentid")
    if (paymentid) {
        return (
            <div class="payList">
                {props.paymentMethod?.map(i => {
                    return <PaymentCard card={i[0]} date={i[1]} cvv={i[2]}/>
                })}
            </div>
        )
    }
    else {
        return (
            <div class="payList">
                <p>No payment</p>
            </div>
        )
    }
    
}


function DisplayNoToken() {
    return(
        <div className="notoken">
            <h2>Unlock the Control Panel by becoming an holder!</h2>
        </div>
    )
}
function DisplayInfo(props) {
    return(
        <div class="info">
            <h4 style={{padding: 10 + "px"}}>Personnal Info:</h4>
            <p style={{color: 'white'}}>information about transactions of your $CREDIT</p>
            <table class="table table-dark">
                <thead>
                    <tr class="table-dark">
                        <th class="table-dark" scope="col">Info</th>
                        <th class="table-dark" scope="col">User</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="table-dark">
                        <th class="table-dark" scope="row">Transaction</th>
                        <td class="table-dark">{props.numtrans}</td>                         
                    </tr>
                    <tr class="table-dark">
                        <th class="table-dark" scope="row">Holder since</th>
                        <td class="table-dark">{props.numdays} days</td>                         
                    </tr>
                    <tr class="table-dark">
                        <th class="table-dark" scope="row">Profit/loss</th>
                        <td class="table-dark" style={{color: props.color}}>{props.profit} % (<a href='#'>see charts</a>)</td>                         
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
function DisplayActions(props) {
	const [numtrans, setNumtrans] = useState();
    const [profit, setProfit] = useState();
    const [numdays, setNumdays] = useState(0);
    const [price, setPrice] = useState([]);
    const [colors, setColors] = useState("green");
    const [date, setDate] = useState([]);

    const [card, setCard] = useState("");
    const [eDate, setEdate] = useState("")
    const [cvv, setCvv] = useState("");
    const [account, setAccount] = useState("")

    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [country, setCountry] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [street, setStreet] = useState("")
    const [code, setCode] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")

    const [payingGas, setPayingGas] = useState(false)
    const [loading, setLoading] = useState(false)

    const [usdprice, setUsdprice] = useState(0)
    const [tokenuri, setTokenuri] = useState()
    const [nft, setNft] = useState()
    const [metadata, setMetadata] = useState()

    const [tag, setTag] = useState("nft")
    const [price2, setPrice2] = useState(0)
    const [nftname, setNftname] = useState("")
    const [description, setDescription] = useState("")
    const [real, setReal] = useState(false)
    const [image_file, setImage] = useState(null);
    const [images, setImages] = useState(null);
    const [day, setDay] = useState(0) ///////chnage
    let day2 = 0;
    let price3 = 0;

    const [tickets, setTickets] = useState(null);

    const [numAttribute, setNumAttribute] = useState(0)
    const [values, setValues] = useState([])
    const [keys, setKeys] = useState([])

    const [ynft, setYnft] = useState()
    const [dds, setDds] = useState()
    const [gasItemId, setGasItemId] = useState()

    const [proof, setProof] = useState("")
    const [orderID, setOrderID] = useState(0)
    const [proofPrice, setProofPrice] = useState(0)

    const dates = [];
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

    const onCardChanged = (event) => {
        setCard(event.target.value)
    }

    const onDateChanged = (event) => {
        setEdate(event.target.value)
    }

    const onCvvChanged = (event) => {
        setCvv(event.target.value)
    }
    const onChangeTags = (event) => {

        switch (event.target.value) {
            case "1": 
                setTag("nft")
                console.log("nft")
                break;
            case "2": 
                setTag("tickets")
                console.log("tickets")
                break;
            case "3":
                setTag("vp")
                console.log("vp")
                break;
            default:
                console.log("400: Bad request error code - 5")
                break;
        }
    }

    const onAddedAttribute = () => {
        setNumAttribute(numAttribute+1)
    }
    const onRemoveAttribute = (event) => {
        setNumAttribute(numAttribute-1)
        const oldValues = values
        oldValues.splice(parseInt(event.target.id), 1)
        setValues(oldValues)
        const oldKeys = keys
        oldKeys.splice(parseInt(event.target.id), 1)
        setKeys(oldKeys)
    }

    const onAddedValue = (event) => {
        const oldValues = values
        oldValues[parseInt(event.target.id)] = event.target.value
        setValues(oldValues)
        console.log(oldValues)
    }
    const onAddedKey = (event) => {
        const oldKeys = keys
        oldKeys[parseInt(event.target.id)] = event.target.value
        setKeys(oldKeys)
        console.log(oldKeys)
        console.log(event)
    }
    //payment architecture: 
    /*[
        ["card", "date", "cvv"], //each list is a payment method
        [],
        []
    ]
    */

    const onProofChanged = (event) => {
        setProof(event.target.value)
    }

    const onOrderIDChanged = (event) => {
        setOrderID(event.target.value)
    }

    const createNft = async(event) => {
        event.preventDefault()
       if (nftname !== "" && description !== "" && image_file !== null) {

            async function postImage() { 
                const node = await IPFS.create();
                console.log(image_file)
                
                const fileAdded = await node.add({
                  path: `${nftname}.png`,
                  content: image_file,
                });
                console.log("Added image:", "https://ipfs.io/ipfs/" + fileAdded.cid.toString()); //fileAdded.cid => save
                console.log("Added image:", fileAdded); //fileAdded.cid => save
                return ["https://ipfs.io/ipfs/" + fileAdded.cid.toString(), node]
            }

            async function uploadToIpfs(image, node) {
                //const node = await IPFS.create();
                let attributes = []
                if (numAttribute > 0) {
                    for (let i=0; i < numAttribute; i++) {
                        attributes.push({"key": keys[i], "value": values[i]})
                    }
                    
                }

                const metadata = {
                        "image": image,
                        "name": nftname,
                        "description": description,
                        attributes
                }

                setMetadata(metadata)
    
                //let time wait until creating the URI
            
                const jsonAdded = await node.add({
                    path: `testattribute.json`, //nft address + token Id ${props.account}
                    content: JSON.stringify(metadata),
                });

                console.log("Added file:", "https://ipfs.io/ipfs/" + jsonAdded.cid.toString()); //fileAdded.cid => save
                return "https://ipfs.io/ipfs/" + jsonAdded.cid.toString()
            }

            async function uploadTicketToIpfs(image, node) {
                //const node = await IPFS.create();

                const fileAdded = await node.add({  //upload secret ticket
                    path: `tickets.png`, //nft address + token Id 
                    content: tickets,
                });
                  
                let attributes = []
                if (numAttribute > 0) {
                    for (let i=0; i < numAttribute; i++) {
                        attributes.push({"key": keys[i], "value": values[i]})
                    }
                    
                }

                const metadata = {
                        "image": image,
                        "name": nftname,
                        "description": description,
                        attributes
                }

                setMetadata(metadata)
    
                //let time wait until creating the URI

                const jsonAdded = await node.add({
                    path: `${props.account}.json`, //nft address + token Id
                    content: JSON.stringify(metadata),
                });

                console.log("Added file:", "https://ipfs.io/ipfs/" + jsonAdded.cid.toString()); //fileAdded.cid => save
                return ["https://ipfs.io/ipfs/" + jsonAdded.cid.toString(), "https://ipfs.io/ipfs/" + fileAdded.cid.toString()]
            }

            if(tag==="tickets") {
                const image = await postImage()
                const URI = await uploadTicketToIpfs(image[0], image[1])
                setTokenuri(URI[0])
                //console.log(tokenURI)
                try {
                    if (props.signer) {
                        await mintTicket(props.account, URI[0], URI[1], props.signer)
                    }
                    else {
                        await mintTicket(props.account, URI[0], URI[1], "")
                    }
                    
                    alert("You can see your items in the Market.")
                } catch(e) {
                    if (window.localStorage.getItem("usingMetamask") === "true") {
                        alert("You need ethereum gas fee to pay for item creation.")
                        let provider = await injected.getProvider()
                        const nft = connectContract(TicketAddress, TicketABI.abi, provider)
                        setNft(nft)

                        const gasPrice = await provider.getGasPrice();
                        let gas = await nft.estimateGas.safeMint(props.address, URI[0], URI[1])
                        let price = gas * gasPrice


                        //get the ether price and a little bit more than gaz price to be sure not to run out
                        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                                setUsdprice(usdPrice)
                                setReal(false)
                            })
                        })
                        
                        /*
                        const id = await nft.safeMint(props.account, URI[0], URI[1])
                        console.log(id)
                        const transac = await nft.ownerOf(id)
                        console.log(transac)
                        */

                    } else {

                        alert("You need ethereum gas fee to pay for item creation.")
                        //const provider  = new ethers.providers.InfuraProvider("goerli")
                        const nft = getContract(NftAddress, TicketABI, props.signer)
                        setNft(nft)

                        const gasPrice = await nft.provider.getGasPrice();
                        let gas = await nft.estimateGas.safeMint(props.address, URI[0], URI[1])
                        let price = gas * gasPrice


                        //get the ether price and a little bit more than gaz price to be sure not to run out
                        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                                setUsdprice(usdPrice)
                                setReal(false)
                            })
                        })
                    }
                }
                alert("You can see your items in the Market.")
              
            }
            else {
                const image = await postImage()
                const tokenURI = await uploadToIpfs(image[0], image[1])
                setTokenuri(tokenURI)
                console.log(tokenURI)
                try {
                    if (props.signer) {
                        await mintNFT(props.account, tokenURI, props.signer)
                    } else {
                        await mintNFT(props.account, tokenURI, "")
                    }
                    
                    alert("You can see your items in the Market.")
                } catch(e) {
                    if (window.localStorage.getItem("usingMetamask") === "true") {
                        alert("You need ethereum gas fee to pay for item creation.")
                        let provider = await injected.getProvider()
                        const nft = connectContract(NftAddress, erc721ABI.abi, provider)

                        setNft(nft)

                        const gasPrice = await provider.getGasPrice();
                        let gas = await nft.estimateGas.mint(props.account, tokenURI)
                        let price = gas * gasPrice


                        //get the ether price and a little bit more than gaz price to be sure not to run out
                        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                                setUsdprice(usdPrice)
                                setReal(false)
                            })
                        })
                       
                    } else {
                        alert("You need ethereum gas fee to pay for item creation.")
                        //const provider  = new ethers.providers.InfuraProvider("goerli")
                        const nft = getContract(NftAddress, erc721ABI.abi, props.signer)
                        setNft(nft)

                        const gasPrice = await nft.provider.getGasPrice();
                        let gas = await nft.estimateGas.mint(props.account, tokenURI)
                        let price = gas * gasPrice


                        //get the ether price and a little bit more than gaz price to be sure not to run out
                        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                                setUsdprice(usdPrice)
                                setReal(false)
                            })
                        })
                    }
                }
                
            }
           

            
       }
       else {
           alert("Need to fill out the whole form!")
       }
    }

    const cancelPayGas = () => {
        setUsdprice(0)
    }
    const createReal = async(event) => {
        event.preventDefault()
        if (nftname !== ""  && description !== "" && image_file !== null) {
            alert("You can see your items in Your Items. You will receive a notification on what are the procedure concerning the Proof of Sending.")
            async function postImage() { 
                const node = await IPFS.create();
                console.log(image_file)
                
                const fileAdded = await node.add({
                  path: `${nftname}.png`,
                  content: image_file,
                });
                console.log("Added image:", "https://ipfs.io/ipfs/" + fileAdded.cid.toString()); //fileAdded.cid => save
                console.log("Added image:", fileAdded); //fileAdded.cid => save
                return ["https://ipfs.io/ipfs/" + fileAdded.cid.toString(), node]
            }

            async function uploadToIpfs(image, node) {
                //const node = await IPFS.create();
                let attributes = []
                if (numAttribute > 0) {
                    for (let i=0; i < numAttribute; i++) {
                        attributes.push({"key": keys[i], "value": values[i]})
                    }
                    
                }

                const metadata = {
                        "image": image,
                        "name": nftname,
                        "description": description,
                        attributes
                }

                setMetadata(metadata)
    
                //let time wait until creating the URI
            
                const jsonAdded = await node.add({
                    path: `testattribute.json`, //nft address + token Id ${props.account}
                    content: JSON.stringify(metadata),
                });

                console.log("Added file:", "https://ipfs.io/ipfs/" + jsonAdded.cid.toString()); //fileAdded.cid => save
                return "https://ipfs.io/ipfs/" + jsonAdded.cid.toString()
            }
            const image = await postImage()
            const tokenURI = await uploadToIpfs(image[0], image[1])
            setTokenuri(tokenURI)
            console.log(tokenURI)
            try {
                if (props.signer) {
                    await mintReal(props.account, tokenURI, props.signer)
                } else {
                    await mintReal(props.account, tokenURI, "")
                }
                    
                    alert("You can see your items in the Market.")
                } catch(e) {
                    if (window.localStorage.getItem("usingMetamask") === "true") {
                        console.log(e)
                        alert("You need ethereum gas fee to pay for item creation.")
                        let provider = await injected.getProvider()
                        const nft = connectContract(ImperialRealAddress, erc721ABI.abi, provider)

                        setNft(nft)

                        const gasPrice = await nft.provider.getGasPrice();
                        let gas = await nft.estimateGas.safeMint(props.account, tokenURI)
                        let price = gas * gasPrice


                        //get the ether price and a little bit more than gaz price to be sure not to run out
                        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                                setUsdprice(usdPrice)
                                setReal(true)
                            })
                        })
                        
                    } else {
                        alert("You need ethereum gas fee to pay for item creation.")
                        //const provider  = new ethers.providers.InfuraProvider("goerli")
                        const nft = getContract(ImperialRealAddress, erc721ABI.abi, props.signer)
                        setNft(nft)

                        const gasPrice = await nft.provider.getGasPrice();
                        let gas = await nft.estimateGas.safeMint(props.account, tokenURI)
                        let price = gas * gasPrice


                        //get the ether price and a little bit more than gaz price to be sure not to run out
                        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                                setUsdprice(usdPrice)
                                setReal(true)
                            })
                        })
                        
                    }
                }
        }
        else {
            alert("Need to fill our the whole form!")
        }
    }

    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => {
                setImages(e.target.result)
            };
            reader.readAsDataURL(event.target.files[0]);
            setImage(event.target.files[0])
        }
    }

    const onTicketChange = (event) => {
        setTickets(event.target.files[0])
    }
    const onDayChange = async(event) => {
        setDay(event.target.value)
        //console.log(event.target.value)
    }

    const onDay2Change = (event) => {
        day2 = event.target.value
    }
    const onPrice3Change = (event) => {
        price3 = event.target.value
    }
    const onPriceChange = async(event) => {
        setPrice2(event.target.value)
    }
    const onNameChange = (event) => {
        setNftname(event.target.value)
    }
    const onDescriptionChange = (event) => {
        setDescription(event.target.value)
    }

    const onSelectedReal = (event) => {
        setReal(true)
    }
    const onSelectedNFT = (event) => {
        setReal(false)
    }

    function DisplayCreate() {
        return (
            <div class="create" >
                <h3>Create an NFT:</h3> <br />
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop5">NFT Item!</button>
                <br /> <br />
                <h3>List a Real Item:</h3> <br /> 
                 
                 <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop6">List Real Item!</button>
               
                
            </div>
        )
    }
    function PaymentMethod(props) {
        //const id = window.localStorage.getItem("id") //check if users have an ID

        
        
        return (
            <div class="pay">
                <h4>Payment Methods:</h4>
                <p>
                <a class="btn btn-info" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                    Learn more about Payment Method
                </a>
                </p>
                <div class="collapse" id="collapseExample">
                <div class="card card-body" style={{color: "black"}}>
                    Payment method are used to buy $CREDIT when you purchased an item in the Market. All of your information are encrypted in your wallet in order to keep them secret. 
                </div>
                </div>
                <br />
                <ListPaymentMethod paymentMethod={props.paymentMethod} />
                <div><button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#staticBackdrop" >Add new Card</button></div>
                <br />
                <DisplayDiD />
                
            </div>
        )
    }

    function DisplayDiD() {
        const paymentid = window.localStorage.getItem("paymentid")
        const id = window.localStorage.getItem("id") //check if users have an ID
    
        return (
            <div class="did">
                <h4>Decentralized Identification: </h4>
                <p>
                    <a class="btn btn-info" data-bs-toggle="collapse" href="#collapseExample1" role="button" aria-expanded="false" aria-controls="collapseExample1">
                        Learn more about DiD
                    </a>
                </p>
                <div class="collapse" id="collapseExample1">
                    <div class="card card-body" style={{color: "black"}}>
                        DiD stands for Decentralized IDentification. All of your information are securly stored in a program in order for them to stay private and decentralized.
                    </div>
                </div>
                <br />
                {id ? ( <div><button onClick={getdId} data-bs-toggle="modal" data-bs-target="#staticBackdrop3" class="btn btn-primary" >See ID</button> <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#staticBackdrop2" >Change ID</button></div> ) : 
                paymentid ? (<button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#staticBackdrop2" >Add ID</button>) : ( <h6>Need to add a payment method to complete your DiD</h6> )}
            </div>
        )
    }

    const getdId = async () => {
        let res = await props.did.getId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("key")), parseInt(window.localStorage.getItem("id")))
        //console.log(res)
        setCity(res.city)
        setCode(res.postalCode)
        setCountry(res.country)
        setEmail(res.email)
        setFname(res.name)
        setLname(res.lastname)
        setPhone(res.phone)
        setStreet(res.street1)
        setState(res.state)
    }

    const payGas = async () => {
        setLoading(true)
        //getdId()
        const gasPrice = await props.did.provider.getGasPrice();
        let gas = await props.did.estimateGas.newId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("id")), city, state, code, country, street, phone, email, fname, lname)
        let price = gas * gasPrice
        let usdPrice = 0
        //get the ether price and a little bit more than gaz price to be sure not to run out
        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
            res.json().then(jsonres => {
                usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                                
            })
        })
        if (props.pay) {
            let mounthDate = props.pay[0][1].split("/")
            let paymentList = [props.pay[0][0], mounthDate[0], "20" + mounthDate[1], props.pay[0][2]]

            //let completed = false
            const completed = await getGasPriceUsd(usdPrice, props.did.signer.address, paymentList, city, state, code, country, street, phone, email, fname, lname) //"+" + phone
            if (completed) {
                await ( await props.did.newId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("id")), city, state, code, country, street, phone, email, fname, lname)).wait()
               
                alert("New Decentralized Identity. You are now free to use the F2C prrotocol to buy and sell Items!")
                setLoading(false)
                setPayingGas(false)
    
            }
            else {
                alert("something went wrong..." + completed)
                setLoading(false)
                setPayingGas(false)
            }
        } else {
            let mounthDate = eDate.split("/")
            let paymentList = [card, mounthDate[0], "20" + mounthDate[1], cvv]
    
            //let completed = false
            const completed = await getGasPriceUsd(usdPrice, props.did.signer.address, paymentList, city, state, code, country, street, phone, email, fname, lname) //"+" + phone
            if (completed) {
                await ( await props.did.newId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("id")), city, state, code, country, street, phone, email, fname, lname)).wait()
               
                alert("New Decentralized Identity. You are now free to use the F2C prrotocol to buy and sell Items!")
                setLoading(false)
                setPayingGas(false)
    
            }
            else {
                alert("something went wrong..." + completed)
                setLoading(false)
                setPayingGas(false)
            }
        }

       
    }

    const cancel = () => {
        setPayingGas(false)
    }

    const DisplayPayGas = () => {
        return (
            <div class="payGas">
            {loading ? (<div style={{paddingLeft: 25 + "%"}}><ReactLoading type="spin" color="#0000FF"
        height={200} width={200} /><h5>Transaction loading...</h5></div>) : (<div>
                <h4>F2C Checkout</h4>
                <p><a href="">Learn about F2C</a></p>
                <p>This Ethereum fee allow your data to be securly store in the BlockChain</p>
                <br />
                <h6>Payment method: <strong>{card}</strong></h6>
                <h5>Total USD price: 0.004$</h5>

                <button onClick={payGas} class="btn btn-primary">Approve</button> <button onClick={cancel} class="btn btn-danger">Cancel</button>
            </div>)}
            

        </div>
        )
    }

    function HandleRealForm(props) {
        
        return (
            <div>
                <form onSubmit={props.handleRealList}>
                                            
                                            <h5>Name: {props.name}</h5> 
                                            <br />  
                                            <h5>Description: {props.description}</h5>     
                        
                                            <br />
                                                <label for="days" class="form-label">Number of days for sending:</label><br />
                                                <a href="">More information on what is the number of days</a>
                                                <div class="input-group mb-3">
                                                    <input type="number" class="form-control" id="days" name="days" aria-describedby="basic-addon2" onChange={onDay2Change} />
                                                    <span class="input-group-text" id="basic-addon2">Days</span>
                                            </div>
                                            <br />

                                            <label for="price" class="form-label">Price:</label><br />
                                            <div class="input-group mb-3">
                                                <input type="number" class="form-control" id="price" name="price" aria-describedby="basic-addon2"  onChange={onPrice3Change} />
                                                <span class="input-group-text" id="basic-addon2">$CREDIT</span>
                                            </div>
                                            <input type="submit" class="btn btn-primary" value="Submit" />
                    </form>
            </div>
        )
    }

    function HandleForm(props) {
        return (
            <div>
                <form onSubmit={props.handleList}>
                                            
                                            <h5>Name: {props.name}</h5> 
                                            <br />  
                                            <h5>Description: {props.description}</h5>     
                                            <br />
                                            <div class="form-floating">
                                                                <select onChange={onChangeTags} class="form-select" id="floatingSelect" aria-label="Floating label select example">
                                                                    <option selected>Categorize your digital item </option>
                                                                    <option value="1" >NFT</option>
                                                                    <option value="2" >Tickets</option>
                                                                    <option value="3" >Virtual Property</option>
                                                                </select>
                                                                <label for="floatingSelect">Tag</label>
                                            </div>
                                            <br />
                                            <label for="price" class="form-label">Price:</label><br />
                                            <div class="input-group mb-3">
                                                <input type="number" class="form-control" id="price" name="price" aria-describedby="basic-addon2" onChange={onPrice3Change} />
                                                <span class="input-group-text" id="basic-addon2">$CREDIT</span>
                                            </div>
                                            <input type="submit" class="btn btn-primary" value="Submit" />
                    </form> 
            </div>
        )
    }

    //account, did, pay, RealPurchase 
    function YnftCard(props) {
        const [listingItem, setListing] = useState(false)
        const [usdPrice2, setUsdPrice2] = useState(0)
        const [usdPrice3, setUsdPrice3] = useState(0)


        const [status, setStatus] = useState("Not prooved")
        const [trackingCode, setTrackingCode] = useState()
        const [numdaysToRetrieve, setNumdaysToRetrieve] = useState()

        const logs = useLogs(
            {
              contract: dds, // DDSAddress,
              event: "Prooved",//'Prooved',
              args: [],
            },
            {
              fromBlock: 0, //check if change using item.numDays
              toBlock:  'latest',
            }
        )
        

        const pollStatus = async() => {

            //first get itemID using database
                //first option get the address of the owner before ( buyer => contract => seller)
                //second option get a map in users database of real item purchase => get it in props

            //second, get item by itemID
            
            //third if prooved == true get event with moralis or uselogs
            for (let i=0; i<props.realPurchase.length; i++) {
                if(props.realPurchase[i][0] === props.tokenid) { //if we match nft address
                    const item = await dds.items(parseInt(props.realPurchase[i][1]))
                    const blocknumber = await dds.provider.getBlock()
                    console.log(parseInt(item.numBlock))
                    console.log(parseInt(item.startingBlock))
                    setNumdaysToRetrieve(parseFloat((parseInt(item.startingBlock) + parseInt(item.numBlock) - parseInt(blocknumber.number) ) / 5760).toFixed(3))
                    if (item.proof === true) {
                        setStatus("prooved")
                        logs?.value?.forEach((log) => {
                            //console.log(log.transactionHash)
                            console.log(log.data.proof) //get the proof
                            setTrackingCode(log.data.proof)
                        })

                    }
                }
            }
            //return logs
        }

        const handleList = async(e) => {
            e.preventDefault()
            try {
                if (props.signer) {
                    if(props.abi === 'ERC721') {
                        list(props.address, erc721ABI.abi, props.tokenid, price3, props.account, tag, props.name, props.description, props.image, props.signer) //check for abi
                    }
                    else {
                        list(props.address, erc1155ABI, props.tokenid, price3, props.account, tag, props.name, props.description, props.image, props.signer) //check for abi
                    }
                    
                } else {
                    if (props.abi === 'ERC721') {
                        list(props.address, erc721ABI.abi, props.tokenid, price3, props.account, tag, props.name, props.description, props.image, "") //check for abi

                    } else {
                        list(props.address, erc1155ABI, props.tokenid, price3, props.account, tag, props.name, props.description, props.image, "") //check for abi
                    }
                    
                }
                
                alert("Success")

            } catch (error) {
                if (window.localStorage.getItem("usingMetamask") === "true") {
                    let provider = await injected.getProvider()
                    const nft = connectContract(props.address, erc721ABI.abi, provider) //check if erc1155 for abi (response.contractType)
                    const market = connectContract(MarketAddress, abi.abi, provider)
                    console.log(nft)

                    const gasPrice = await nft.provider.getGasPrice();
                    let gas1 = await nft.estimateGas.approve(MarketAddress, props.tokenid)
                    let price1 = gas1 * gasPrice
                    let gas2 = await market.estimateGas.listItem(nft.address, props.tokenid, price3)
                    let price4 = gas2 * gasPrice
                    //get the ether price and a little bit more than gaz price to be sure not to run out
                    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                        res.json().then(jsonres => {
                            let usdPrice = (ethers.utils.formatEther(price1) * jsonres.USD) + (ethers.utils.formatEther(price4) * jsonres.USD)
                            setPrice2(usdPrice)
                        })
                    })
                    
                } else {
                    //const provider  = new ethers.providers.InfuraProvider("goerli")
                    const nft = getContract(props.address, erc721ABI.abi, props.signer) //check if erc1155 for abi (response.contractType)
                    const market = getContract(MarketAddress, abi.abi, props.signer)
                    console.log(nft)

                    const gasPrice = await nft.provider.getGasPrice();
                    let gas1 = await nft.estimateGas.approve(MarketAddress, props.tokenid)
                    let price1 = gas1 * gasPrice
                    let gas2 = await market.estimateGas.listItem(nft.address, props.tokenid, price3)
                    let price4 = gas2 * gasPrice
                    //get the ether price and a little bit more than gaz price to be sure not to run out
                    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                        res.json().then(jsonres => {
                            let usdPrice = (ethers.utils.formatEther(price1) * jsonres.USD) + (ethers.utils.formatEther(price4) * jsonres.USD)
                            setPrice2(usdPrice)
                        })
                    })
                    
                }
    
            }
            
        }

        const handleRealList = async(e) => {
            e.preventDefault()
            try {
                if (props.signer) {
                    listDDS(props.tokenid, price3, props.account, props.name, props.description, props.image, day2, props.signer) //check for abi
                }
                else {
                    listDDS(props.tokenid, price3, props.account, props.name, props.description, props.image, day2, "") //check for abi
                }
                
                alert("Success")

            } catch (error) {
                if (window.localStorage.getItem("usingMetamask") === "true") {
                    let provider = await injected.getProvider()
                    const nft = connectContract(props.address, erc721ABI.abi, provider) //check if erc1155 for abi (response.contractType)
                    const DDS = connectContract(DDSAddress, DDSABI.abi, provider)
                    console.log(nft)

                    const gasPrice = await nft.provider.getGasPrice();
                    let gas1 = await nft.estimateGas.approve(DDSAddress, props.tokenid)
                    let price1 = gas1 * gasPrice
                    let gas2 = await DDS.estimateGas.listItem(nft.address, props.tokenid, price3, day2) //&& day > 0
                    let price2 = gas2 * gasPrice
                    //get the ether price and a little bit more than gaz price to be sure not to run out
                    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                        res.json().then(jsonres => {
                            let usdPrice = (ethers.utils.formatEther(price1) * jsonres.USD) + (ethers.utils.formatEther(price2) * jsonres.USD)
                            setReal(true)
                            setPrice2(usdPrice)
                        })
                    })
                } else {
                    //const provider  = new ethers.providers.InfuraProvider("goerli")
                    const nft = getContract(props.address, erc721ABI.abi, props.signer) //check if erc1155 for abi (response.contractType)
                    const DDS = getContract(DDSAddress, DDSABI.abi, props.signer)
                    console.log(nft)


                    const gasPrice = await nft.provider.getGasPrice();
                    let gas1 = await nft.estimateGas.approve(DDSAddress, props.tokenid)
                    let price1 = gas1 * gasPrice
                    let gas2 = await DDS.estimateGas.listItem(nft.address, props.tokenid, price3, day2)
                    let price2 = gas2 * gasPrice
                    //get the ether price and a little bit more than gaz price to be sure not to run out
                    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                        res.json().then(jsonres => {
                            let usdPrice = (ethers.utils.formatEther(price1) * jsonres.USD) + (ethers.utils.formatEther(price2) * jsonres.USD)
                            setReal(true)
                            setPrice2(usdPrice)
                        })
                    })
                }
    
            }
            
        }

        const revealTicket = async () => {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const nft = connectContract(TicketAddress, erc721ABI.abi, provider)
                const url = await nft.getMyTicket(props.tokenid)
                window.open(url, '_blank', 'width=300,height=500')

            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const nft = getContract(TicketAddress, erc721ABI.abi, props.signer)
                const url = await nft.getMyTicket(props.tokenid)
                window.open(url, '_blank', 'width=300,height=500')
            }
        }
        const cancelListing = () => {
            setListing(false)
            setUsdPrice2(0)
            setUsdPrice3(0)
        }

        const activateListing = () => {
            setListing(true)
            
        }

        const retrieve = async() => {
            for (let i=0; i<props.realPurchase.length; i++) {
                if(props.realPurchase[i][0] === props.tokenid) { //if we match nft token id
                    try {
                        await dds.retrieveCredit(parseInt(props.realPurchase[i][1]))
                    } catch {
                        //alert("Need to wait until Number of days equal 0")
                        const gasPrice = await dds.provider.getGasPrice();
                        
                        let gas2 = await dds.estimateGas.retrieveCredit(parseInt(props.realPurchase[i][1]))
                        setGasItemId(parseInt(props.realPurchase[i][1]))
                        let price2 = gas2 * gasPrice
                        //get the ether price and a little bit more than gaz price to be sure not to run out
                        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price2) * jsonres.USD
                                setUsdPrice3(usdPrice)
                            })
                        })
                        
                    }
                    
                    
                }
            }
        } 


        const Listing = () => {
            if (props.address === ImperialRealAddress) {
                return (
                    <div class="listing">
                        <HandleRealForm handleRealList={handleRealList} name={props.name} description={props.description}/>
                        <br /> <br />
                        <button onClick={cancelListing} class="btn btn-danger">Cancel</button> 
                    </div>
                )
            }
            else {
                return (
                    <div class="listing">
                        <HandleForm handleList={handleList} name={props.name} description={props.description} /> 
                        <br /> <br />
                        <button onClick={cancelListing} class="btn btn-danger">Cancel</button> 
                    </div>
                )
            }

            
        }

       
        return (
            real ? usdPrice2 > 0 ? (<PayGasList real={true} account={props.account} day={day2} total={usdPrice2} pay={props.pay} cancel={cancelListing} listItem={listDDS} did={props.did} nftAddress={props.address} tokenid={props.tokenid} name={props.name} description={props.description} image={props.image} tag={"real"} price={price3}/>) :
                listingItem === true ? (<Listing/>) : (<div class="ynftcard">
                
                {props.image?.includes("ipfs://") ? <img id='cardimg' src={"https://ipfs.io/ipfs/" + props.image?.split("//").pop()} alt="" /> : <img id='cardimg' src={props.image} alt="" />}
            
                <br />
                <br />
                <h4> Name:  <a href="">{props.name}</a></h4>
                <p>description: {props.description?.slice(0, 20)}...</p>
                <button type="button" onClick={activateListing} class="btn btn-secondary">Sell</button>
                {props.address === TicketAddress ? ( <button onClick={revealTicket} class="btn btn-success">Reveal Secret Ticket</button> ) : "" }
            </div>) : usdPrice2 > 0 && usdPrice3 === 0 ? (<PayGasList real={false} day={day2} account={props.account} total={usdPrice2} pay={props.pay} cancel={cancelListing} listItem={list} did={props.did} nftAddress={props.address} tokenid={props.tokenid} name={props.name} description={props.description} image={props.image} tag={tag} price={price3}/>) :
                usdPrice3 > 0 && usdPrice2 === 0 ? ( <PayGasRetrieve account={props.account} total={usdPrice3} pay={props.pay} cancel={cancelListing} dds={dds} did={props.did} itemId={gasItemId} />) : listingItem === true ? (<Listing  />) : (<div class="ynftcard">
                
                {props.image?.includes("ipfs://") ? <img id='cardimg' src={"https://ipfs.io/ipfs/" + props.image?.split("//").pop()} alt="" /> : <img id='cardimg' src={props.image} alt="" />}
            
                <br />
                <br />
                <h4> Name:  <a href="">{props.name}</a></h4>
                <p>description: {props.description?.slice(0, 20)}...</p>
                <button type="button" onClick={activateListing} class="btn btn-secondary">Sell</button>
                {props.address === TicketAddress ? ( <button onClick={revealTicket} class="btn btn-success">Reveal Secret Ticket</button> ) : "" }
                {props.address === ImperialRealAddress ? ( <button onClick={pollStatus} class="btn btn-primary"> Get status</button> ) : ""}
                {props.address === ImperialRealAddress ? status === "Not prooved" ? numdaysToRetrieve > 0 ? ( <h5 style={{color: "yellow"}}>Pending</h5> ) : ( <h5 style={{color: "red"}}>Not Prooved</h5> ) : ( <h5 style={{color: "green"}}>Prooved</h5> ) : ""}
                {props.address === ImperialRealAddress ? ( <button onClick={retrieve} class="btn btn-primary"> Retrieve $CREDITs</button> ) : ""}
                { props.address === ImperialRealAddress ? numdaysToRetrieve > 0 ? ( <h6>Item Prooved in {numdaysToRetrieve} days</h6> ) : ( <h6>Item Not prooved in time</h6> ) : ""  }
                {trackingCode ? ( <h5>Tracking Code: {trackingCode}</h5> ) : ""}
            </div>)
        )
    }

    function CusNftCard(props) {
        
        return (
            <div>
                <p>preview:</p>
                <div class="ynftcard">
                <img id='cardimg' src={props.image} alt="" />
               
                <br />
                <br />
                <h4> Name:  <a href="">{props.name}</a></h4>
                <p>Description: {props.description}</p>
                <p>Price: {props.price}</p>
                <button type="button" class="btn btn-secondary">Sell</button> 
            </div>
            </div>
            
        )
    }

    function ListYnftCard(props) {
        return (
            <div class="CardList">
                <div class="row">
                    <div class="col">
                        {props.ynft?.map(i => {
                         return <YnftCard name={i?.name} abi={i?.contractType} description={i.metadata?.description} image={i.metadata?.image} signer={props.signer} address={i?.tokenAddress} tokenid={i?.tokenId} account={props.account} did={props.did} pay={props.pay} realPurchase={props.realPurchase} />
                        })}
                    </div>
                </div>
               
            </div>
        )
    }

    function DisplayYnft () {
        const loadNft = async() => {
            //get nft using moralis
            
            let data = {
                body: {
                    address: "0x7675CF4abb1A19F7Bd5Ed23d132F9dFfA0C9587D"
                }
            }
            let url ="/nftbyaddress"
            API.post('server', url, data).then((response) => {
                console.log(response[0])
                setYnft(response)
            })

            /*
            let nftlist = {
                name: "name",
                tokenAddress: "0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a",
                tokenId: 0, //put to int
                metadata: {
                    description: "epic",
                    image: ""
                }
            }
            setYnft([nftlist])
            */
            


            //load DDS contract 
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const contract = connectContract(DDSAddress, DDSABI.abi, provider)
                setDds(contract)
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const contract = getContract(DDSAddress, DDSABI.abi, props.signer)
                setDds(contract)
            }
           
        }

        return (
            <div class="ynft">
                <h1>list of your NFTs</h1>
                <ListYnftCard ynft={ynft} signer={props.signer} account={props.account} did={props.did} pay={props.pay} realPurchase={props.realPurchase}/>

                <button class="btn btn-primary" onClick={loadNft}>Scan your account!</button>
            </div>
        )
    }

    const GetClient = (props) => { //account, did

        const [numItems, setNumItems] = useState(0)
        const [orderIds, setOrderIds] = useState([])
        const [orderNames, setOrderNames] = useState(["epic"])

        const OrderToComplete = (props) => {
            const [gettingID, setGettingID] = useState(false)
            const [clientId, setClientId] = useState()

            const getClientInfo = async() => {
                console.log("activated")
                let key, id = await dds.getClientInfos(props.orderid - 1, props.orderid) //itemID, order ID or let keyid = ... keyid[0], keyid[1], keyid[0]
                console.log(key)
                const res = await props.did.getId(id, key, id) 
                setClientId(res)
                setGettingID(true)

            }
            const cancel = () => {
                setGettingID(false)
            }
            return ( //res.city, res.state, res.postalCode, res.country, res.street1
                gettingID ? ( <div class="ordercard" >
                    <h6>Name: {clientId.name}</h6>
                    <h6>Last Name: {clientId.lastname}</h6>
                    <h6>Country: {clientId.country}</h6>
                    <h6>State: {clientId.state}</h6>
                    <h6>City: {clientId.city}</h6>
                    <h6>Street: {clientId.street1}</h6>
                    <h6>Postal Code: {clientId.postalCode}</h6>
                    <button class="btn btn-danger" onClick={cancel}>Cancel</button>

                </div> ) : (
                <div class="ordercard" >
                    <h6>Item Name: {props.name}</h6>
                    <h6>Order ID: {props.orderid}</h6>
                    <br />
                    <br />
                    <button class="btn btn-primary" onClick={getClientInfo} >Get Client Information</button>
                </div>)
            )
        }



        const loadDDS = async() => {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const contract = connectContract(DDSAddress, DDSABI.abi, provider)
                setDds(contract)
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const contract = getContract(DDSAddress, DDSABI.abi, props.signer)
                setDds(contract)
            }
        }
        
        const getNumItems = async () => {
            var data = {
                body: {
                    address: props.address.toLowerCase(),
                }
            }

            var url = "/getItems"

            //console.log(typeof(item))
            //console.log(item)
            let numItem = 0
            let orderIdToComplete = []
            let names = []
    
            await API.post('server', url, data).then(async (response) => {
                for(let i=0; i<=response.ids.length; i++) { //loop trought every listed item of an owner 
                    if (response.tags[i] === "real") { // once you got the item we want to display:
                       numItem ++
                       const item = await dds.items(parseInt(response.ids[i])) //get the DDS item
                       if (item.sold === true && item.prooved === false) {
                           orderIdToComplete.push(parseInt(item.itemId) + 1) //orderID
                           names.push(response.names[i])
                       }
                    }
                }
            })

            setOrderIds(orderIdToComplete)
            setNumItems(numItem)

            
        }
        useEffect(()=> {
            getNumItems()
        })

        return (
            <div>
                <h4>You have listed {numItems} Real Items </h4>
                <h4>You need to confirm {orderIds?.length} purchase</h4>
                <h5>Order Ids of command to verify: {orderIds.map(ids => ( <OrderToComplete orderid={ids} did={props.did}/> ))}</h5>
            </div>
        )
    }

    const cancelProofPay = () => {
        setProofPrice(0)
    }
    const handleProof = async(e) => {
        e.preventDefault()
        //load DDS contract 
        console.log(dds)
        try {
            await dds.submitProof(orderID, proof)
        } catch (error) {
            const gasPrice = await dds.provider.getGasPrice();
                        
            let gas2 = await dds.estimateGas.submitProof(orderID, proof)
            let price2 = gas2 * gasPrice
            //get the ether price and a little bit more than gaz price to be sure not to run out
            fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price2) * jsonres.USD
                                setProofPrice(usdPrice)
                            })
            })
            
        }
        
    }

    const saveId = async(event) => {
        event.preventDefault()
        //create a user ID. For now it will be IdCount
        const id = parseInt( await props.did.idCount()) + 1
        let key = Math.floor(Math.random() * 10000001); //0-10,000,000
        window.localStorage.setItem("key", key)
        window.localStorage.setItem("id", parseInt(id))
        //console.log(parseInt(id), 1, city, state, code, country, street, phone, email, fname, lname)
        //params: uint id, uint _key, string memory _city, string memory _state, string memory _postalCode, string memory _country, string memory _street1, string memory _phone, string memory _email, string memory _name, string memory _lastname
        if (city !== "" && state !== "" && code !== "" && country !== "" && street !== "" && phone !== "" && email !== "" && fname !== "" && lname !== "") {
            try {
                await ( await props.did.newId(parseInt(id), parseInt(key), city, state, code, country, street, phone, email, fname, lname)).wait()
                alert("New Decentralized Identity. You are now free to use the F2C protocol to buy and sell Items!")
            } catch (error) {
                alert("Need Ethereum to add Decentralized Identity. Ethereum Fees of 0,004$.")
                setPayingGas(true)
               
                
    
            }
        }
        else {
            alert("Information of DiD not well written... Try again...")
        }
        
        
        
    }

    const savePay = (event) => {
        event.preventDefault()
        console.log(card.length)
        const paymentid = window.localStorage.getItem("paymentid")
        if (card !== "" && eDate !== "" && cvv !== "" && card.length === 16 && eDate.length === 5 && cvv.length === 3) { //requirement
            if (paymentid) {
                let intpaymentids = parseInt(paymentid)
                window.localStorage.setItem("paymentid", intpaymentids+1)
                const url = '/uploadFile';
                var config = {
                    body: {
                        account: props.account?.toLowerCase(),
                        pay: [card, eDate, cvv],
                        is_cust: false
                    }
                };
                API.put('server', url, config).then((response) => {
                    console.log(response);
                    alert("successfully added new payment method")
                });
            }
            else {
                window.localStorage.setItem("paymentid", 0)
                const url = '/uploadFile';
                var config = {
                    body: {
                        account: props.account?.toLowerCase(),
                        pay: [card, eDate, cvv],
                        is_cust: false
                    }
                };
                API.put('server', url, config).then((response) => {
                    console.log(response);
                });
            }
        }
        else {
            alert("All field are required... Please ensure you have written the good information.")
        }
    }

    const getPrice10Days = () => {
        let url = '/historicalPrice';
        var pPrice = []

        let date0 = new Date();
        dates.push(date0.getDate())
        let date1 = new Date(date0)
        for (let i = 0; i < 9; i++) {
            date1.setDate(date1.getDate() - 1)
            dates.push(date1.getDate())
        }
        setDate(dates.reverse())

        API.get('server', url).then((response) => {

            for (let i=0; i < 10; i++) {
                //console.log(response.data.hprice[i] * props.balance)
                pPrice.push((response.data.hprice[i] * props.balance))
            }
            //console.log(pPrice)
            setPrice(pPrice.reverse())

        });
    }
    
    const getTimeInvest = async() => {
        let url = '/timeInvest';
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        //console.log(account)
        let data = {
            body: {
                address: "0x51F29a5c52EAbFCcc5231954Ad154bf19d4BFD5b", //account,
                tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7" //contractAddress
            }
            
        }

        API.post('server', url, data).then((response) => {
            //console.log(response.data.profit)
            var date1 = new Date(response.timeInvest)
            var date2 = new Date()

            //calculate time difference  
            var time_difference = date2.getTime() - date1.getTime();
            //calculate days difference by dividing total milliseconds in a day
            var days_difference = time_difference / (1000 * 60 * 60 * 24);
            setNumdays(parseInt(days_difference))
            setNumtrans(response.numTrans)
            setProfit(response.profit)
            if (response.profit < 0) {
                setColors("red")
            }

        });
    }
    const data = {
		labels: date, //['6/12/22', '6/13/22', '6/14/22', '6/15/22', '6/16/22', '6/17/22', '6/18/22', '6/19/22', '6/20/22', '6/21/22'],
		datasets:[
			{
				label: 'Price',
				data: price,
			}
		]

	}
    useEffect(() => {
        if (props.balance > 0) { // >
            getPrice10Days()
            getTimeInvest()
        }
        const loadDDS = async() => {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const contract = connectContract(DDSAddress, DDSABI.abi, provider)
                setDds(contract)
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const contract = getContract(DDSAddress, DDSABI.abi, props.signer)
                setDds(contract)
            }
        }
        loadDDS()

        
        console.log(props)

    }, [])

    if (props.balance === 0) { // >
    
        //<button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseInfo" aria-expanded="false" aria-controls="collapseInfo"> Info </button>
        return(
            <div class="control-panel">
                <ul class="nav nav-pills" id="pills-tab" role="tablist">
    
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="pills-info-tab" data-bs-toggle="pill" data-bs-target="#pill-info" type="button" role="tab" aria-controls="pill-info" aria-selected="true">Info</button>
                    </li>
    
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-chart-tab" data-bs-toggle="pill" data-bs-target="#pill-chart" type="button" role="tab" aria-controls="pill-chart" aria-selected="false">Charts</button>
                    </li>

                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-friends-tab" data-bs-toggle="pill" data-bs-target="#pill-friends" type="button" role="tab" aria-controls="pill-friends" aria-selected="false">Friends</button>
                    </li>

                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-pay-tab" data-bs-toggle="pill" data-bs-target="#pill-pay" type="button" role="tab" aria-controls="pill-pay" aria-selected="false">Decentralized ID</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-create-tab" data-bs-toggle="pill" data-bs-target="#pill-create" type="button" role="tab" aria-controls="pill-create" aria-selected="false">Create !</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-ynft-tab" data-bs-toggle="pill" data-bs-target="#pill-ynft" type="button" role="tab" aria-controls="pill-ynft" aria-selected="false">Your NFTs</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-pos-tab" data-bs-toggle="pill" data-bs-target="#pill-pos" type="button" role="tab" aria-controls="pill-pos" aria-selected="false">Proof of Sending</button>
                    </li>
                            
                </ul>
                <div class="tab-content" id="pills-tabContent">
                    <div class="tab-pane fade show active" id="pill-info" role="tabpanel" aria-labelledby="pills-info-tab">
                        <DisplayInfo numtrans={numtrans} numdays={numdays} profit={profit} color={colors}/>
                    </div>
                    <div class="tab-pane fade" id="pill-chart" role="tabpanel" aria-labelledby="pills-chart-tab">
                        <div class="charts">
                            <h4 style={{padding: 10 + "px"}}>Personnal Chart:</h4>
                            <p style={{color: colors}}>{profit} %, ({parseInt(props.livePrice)} USD)</p>
                            <div class="dropdown" style={{paddingBottom: 10+"px"}}>
                                <a class="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                                    Duration (10 days)
                                </a>
    
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                    <li><a class="dropdown-item disabled" href="#">1 day</a></li>
                                    <li><a class="dropdown-item " href="#">10 days</a></li>
                                    <li><a class="dropdown-item disabled" href="#">All</a></li>
                                </ul>
                            </div>
                            <Chart2 data={data}/>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="pill-friends" role="tabpanel" aria-labelledby="pills-friend-tab">
                        <DisplayFriends account={props.account} request={props.request} friendList={props.friendList} />
                    </div>
                    <div class="tab-pane fade" id="pill-pay" role="tabpanel" aria-labelledby="pills-pay-tab">
                    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{color:"black"}}>
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdropLabel">New Payment Method</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>You can always delete any payment method ( <a href=""> see our security policy</a>) </p>
                                <form onSubmit={savePay}>
                                    <input type="text" id="card" name="card" class="form-control" placeholder="Card Number" onChange={onCardChanged}/>
                                    <br />
                                    <input type="text" id="date" name="date" class="form-control" placeholder="expiration date" onChange={onDateChanged}/>
                                    <br />
                                    <input type="text" id="cvv" name="cvv" class="form-control" placeholder="cvv" onChange={onCvvChanged}/>
                                    <br />
                                    <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade" id="staticBackdrop2" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdrop2Label" aria-hidden="true" style={{color:"black"}}>
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdropLabel">New Decentralized Identification</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
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
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade" id="staticBackdrop3" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdrop3Label" aria-hidden="true" style={{color:"black"}}>
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdropLabel">Your Id</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>You can always delete or change your decentralized Identification ( <a href=""> see our security policy</a>) </p>
                                
                                <h4>Name: <strong>{fname}</strong></h4> <br />
                                <h4>Last Name: <strong>{lname}</strong></h4> <br />
                                <h4>Email: <strong>{email}</strong></h4> <br />
                                <h4>Phone: <strong>{phone}</strong></h4> <br />
                                <h4>Address:</h4>
                                <h6>Country: <strong>{country}</strong></h6>
                                <h6>State: <strong>{state}</strong></h6>
                                <h6>City: <strong>{city}</strong></h6>
                                <h6>Street: <strong>{street}</strong></h6>
                                <h6>Postal code: <strong>{code}</strong></h6>
                               
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {payingGas ? (<DisplayPayGas />) : (<div><PaymentMethod paymentMethod={props.pay} did={props.did}/></div>)}
                        
                    </div>
                    <div class="tab-pane fade" id="pill-create" role="tabpanel" aria-labelledby="pills-create-tab">
                        <h1>create!</h1>
                        <div class="modal fade" id="staticBackdrop5" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdrop5Label" aria-hidden="true" style={{color:"black"}}>
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdrop5Label">New NFT Listing</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                            <form class="test1" onSubmit={createNft}>
                                                
                                                <div class="mb-3">
                                                    <label for="formFile" class="form-label">Image of the NFT</label>
                                                    <input class="form-control" type="file" accept='image/png, image/jpeg' id="formFile" onChange={onImageChange}/>
                                                </div>
                                                <br />
                                                <input class="form-control" type="text" placeholder="Name" onChange={onNameChange}/>    
                                                <br />  
                                                <input class="form-control" type="text" placeholder="Description" onChange={onDescriptionChange}/>    
                                                <br />
                                                <div class="form-floating">
                                                    <select onChange={onChangeTags} class="form-select" id="floatingSelect" aria-label="Floating label select example">
                                                        <option selected>Categorize your digital item </option>
                                                        <option value="1" >NFT</option>
                                                        <option value="2" >Tickets</option>
                                                        <option value="3" >Virtual Property</option>
                                                        <option value="4" disabled>Subscription</option>
                                                        <option value="5" disabled>Music</option>
                                                        <option value="6" disabled>Books</option>
                                                        <option value="7" disabled>Access card</option>
                                                        <option value="8" disabled>Other virtual Contract</option>
                                                    </select>
                                                    <label for="floatingSelect">Tag</label>
                                                </div>
                                                <br />
                                                {tag === "tickets" ? <div class="mb-3">
                                                    <label for="formFile" class="form-label">QR code of your Ticket</label>
                                                    <input class="form-control" type="file" accept='image/png, image/jpeg' id="formFile" onChange={onTicketChange}/>
                                                </div> : ""}
                                                <br />
                                                <div>
                                                    <input type="button" class="btn btn-secondary" value="Add attribute" onClick={onAddedAttribute}/><br />
                                                    <p>
                                                        <a class="btn btn-info" data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample2">
                                                            Learn more about attributes
                                                        </a>
                                                    </p>
                                                    <div class="collapse" id="collapseExample2">
                                                        <div class="card card-body" style={{color: "black"}}>
                                                            An attribute is caracteristic of an NFT. It can be used in games or in virtual properties ( such as: number of room in a house, etc...)
                                                        </div>
                                                    </div>
                                                    
                                                    <br /> <br />
                                                    {Array(numAttribute).fill(true).map((_, i) =><div key={i}> <input class="form-control" id={i} type="text" onChange={onAddedKey} placeholder={`key ${i}`}/> <input class="form-control" type="text" id={i} onChange={onAddedValue} placeholder={`value ${i}`}/> <br /> <input type="button" class="btn btn-danger" value="Remove" onClick={onRemoveAttribute}/> <br /> <br /></div>)}
                                                </div>
                                                <input type="submit" class="btn btn-primary" value="Submit" />
                                                
                                </form>
                                <CusNftCard image={images} name={nftname} description={description} price={price2}/>
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade" id="staticBackdrop6" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdrop6Label" aria-hidden="true" style={{color:"black"}}>
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdrop6Label">New Real Item Listing</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                            <form class="test1" onSubmit={createReal}>
                                                
                                                <div class="mb-3">
                                                    <label for="formFile" class="form-label">Image of the item you are selling</label>
                                                    <input class="form-control" type="file" id="formFile" accept='image/png, image/jpeg' onChange={onImageChange}/>
                                                </div>
                                                <br />
                                                <input class="form-control" type="text" placeholder="Name" onChange={onNameChange}/>    
                                                <br />  
                                                <input class="form-control" type="text" placeholder="Description" onChange={onDescriptionChange}/>    
                                                <br />
                                                
                                                <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {usdprice > 0 ? (<PayGas account={props.account} total={usdprice} nft={nft} metadata={metadata} pay={props.pay} cancel={cancelPayGas} tokenuri={tokenuri} did={props.did}/> ) : (<DisplayCreate />) }
                        
                    </div>
                    <div class="tab-pane fade" id="pill-ynft" role="tabpanel" aria-labelledby="pills-ynft-tab">
                        <DisplayYnft />
                    </div>
                    <div class="tab-pane fade" id="pill-pos" role="tabpanel" aria-labelledby="pills-pos-tab">
                        <div class="pos">
                            <GetClient address={props.account} did={props.did}/>
                            <div class="submitPos">
                            <h4>Proof submition:</h4>
                            <form onSubmit={handleProof}>
                                <input type="text" id="order" name="order" class="form-control" placeholder="0" onChange={onOrderIDChanged}/>
                                <br />
                                <input type="text" id="proof" name="proof" class="form-control" placeholder="QQ XXX XXX XXX QQ" onChange={onProofChanged}/>
                                <br />
                                <input type="submit" class="btn btn-primary" value="Submit" />
                            </form>
                            
                        </div>
                            {proofPrice > 0 ? <PayGasSubmit account={props.account} total={proofPrice} pay={props.pay} cancel={cancelProofPay} dds={dds} did={props.did} orderID={orderID} proof={proof}/> : "" }
                        </div>
                        
                    </div>
                </div>
            </div>
            );
    }

    else {
        return (
            <div>
                <DisplayNoToken />
            </div>
        )
    }
	
	
}

export default DisplayActions;