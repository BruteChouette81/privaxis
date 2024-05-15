
import { useParams } from 'react-router-dom'

import {ethers} from 'ethers'
import {useState, useEffect } from 'react';
import { API } from 'aws-amplify';

import { AES, enc } from "crypto-js"
import default_profile from "./profile_pics/default_profile.png"
import ReactLoading from "react-loading";


import Credit from '../../artifacts/contracts/token.sol/credit.json';
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'


const getContract = (signer, abi, address) => {
    // get the end user
    console.log(signer)
    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}

const contractAddress = '0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565';
const DDSADDr = '0x0c50409C167e974e4283F23f10BB21d16BE956A9';




//1: redirected with a id for "account creation"
//2: create password protected decentralized accound (fix bug with ipfs-node)
//3: dashboard with website: buy the domain or import one (depending on the provenance)

function SellerAccount() {
    let { id } = useParams();
    const [credit, setCredit] = useState()
    const [tether, setTether] = useState()
    const [did, setDid] = useState()
    const [amm, setAmm] = useState()
    //const [address, setAddress] = useState()
    const [privatekey, setPrivatekey] = useState()
    const [ needPassword, setNeedPassword ] = useState(true)
    const [ profileLoading, setProfileLoading ] = useState(true)
    const [password, setPassword] = useState("")
    let passwordInp = ""


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

    const [firstConnect, setFirstConnect] = useState(false)
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

    const connectUsingPassword = async (e) => {
        e.preventDefault()
        
        console.log(passwordInp)
        setPassword(passwordInp)
        const hasWallet = window.localStorage.getItem("hasWallet")
        //setAddress(window.localStorage.getItem("walletAddress"))
        await connection(hasWallet);
    }

    function GetPassword() {
        return ( <div class="getPassword">
            <form onSubmit={connectUsingPassword}> 
            {window.localStorage.getItem("hasWallet") ? (<h3>{window.localStorage.getItem("language") == "en" ? "Enter your password" :"Entrer votre Mot de Passe"}</h3>) : ( <div>{window.localStorage.getItem("language") == "en" ? "Enter a new password" :"Entrer un nouveau Mot de Passe"}<h3></h3>
                <p>{window.localStorage.getItem("language") == "en" ? "IMPORTANT: when you enter your password: you cannot change it without losing your account!" :"IMPORTANT: lorsque vous entrez votre mot de passe: vous ne pouvez pas le changer sans perdre votre compte !"}</p></div> )}
                
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changePass}/>
                    </div>
                </div>
                <br />
                <button type="submit" class="btn btn-primary mb-3">Connect</button>
            </form>
        </div> )
    }

    const writedId = async () => {
        //alert("writting your DID")
        if (window.localStorage.getItem("usingMetamask") === "true") {
            alert("Error... deconnecter votre compte Metamask...")
        }
        else {
            const NewWallet = ethers.Wallet.createRandom()
            const provider = new ethers.providers.InfuraProvider("sepolia")
            let newConnectedWallet = NewWallet.connect(provider)
            console.log(newConnectedWallet.privateKey)
            writePrivateKey(newConnectedWallet.address, newConnectedWallet.privateKey) //writting pk to did
            window.localStorage.setItem("hasWallet", true)
            window.localStorage.setItem("walletAddress", newConnectedWallet.address)
            setFullname(fname + " " + lname)

            //console.log(props.signer)
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
    
    

    const writePrivateKey = (account, privatekey) => { //function to write a privatekey to aws dynamo server
        //console.log(privatekey)
        const did_data = {
            address: account,
            pk: privatekey.toString()
        }

        let stringdata = JSON.stringify(did_data)
        var encrypted = AES.encrypt(stringdata, password)
        window.localStorage.setItem("did", encrypted);


        var data = {
            body: {
                address: account.toLowerCase(),
                privatekey: "", //set did to "" for new accounts
                email_c: emailC,
                email: email
            }
        }
        setPrivatekey(privatekey)

        var url = "/connection"
        const provider = new ethers.providers.InfuraProvider("sepolia")

        API.post('server', url, data).then(async (response) => {
            console.log(response)
            setBack(response.bg);
            setImg(response.img);
            setCustimg(response.cust_img);
            setName(response.name)
            setRequest(response.request)
            setFriendList(response.friend)
            setDescription(response.description)
            setPay(response.pay)
            setRealPurchase(response.realPurchase)
            setLevel(response.level)
    
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
            setFirstConnect(false)
            setProfileLoading(false)
            //alert("Bienvenue sur L'Atelier de Simon! Il ne vous reste qu'à vous créer une Identité Decentralizée pour accèder à l'Atelier!")

        })
    }

    const getPrivateKey = async(account, privatekey) => { //function to get privatekey from aws dynamo server
        var data = {
            body: {
                address: account?.toLowerCase()
            }
        }

        var url = "/connection"

        const provider = new ethers.providers.InfuraProvider("sepolia")
        //const binanceProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")

        API.post('server', url, data).then(async (response) => {
            setBack(response.bg);
            setImg(response.img);
            setCustimg(response.cust_img);
            setName(response.name)
            setRequest(response.request)
            setFriendList(response.friend)
            setDescription(response.description)
            setPay(response.pay)
            setRealPurchase(response.realPurchase)
            setLevel(response.level)
    
            //change user privatekey to the json
            let userwallet = new ethers.Wallet(privatekey, provider) //response.privatekey
            //console.log(userwallet.mnemonic)
            //let userwallet = new ethers.Wallet.fromEncryptedJson(response.privatekey, password)
           
            //user side  // 
            //let testsing = new ethers.utils.SigningKey(privatekey)
            //let testsig = testsing.signDigest(digest)
            //


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
                    getPrivateKey(window.localStorage.getItem("walletAddress"), res.pk)
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
            needPassword ? <GetPassword /> : firstConnect ? ( <div class="DidBuilding">
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
                                    <label for="email-check">Me notifé par e-mail des nouvelles oeuvres</label><br />
                                    <input type="checkbox" id="email-check" name="email-check" value="email_check" checked={emailC} onChange={onEmailC} style={{"float": "right"}} />
                                    <br />
                                    <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
          </div>) :
            profileLoading ? (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>Account loading...</h5></div>) : 
            <div class='selleraccount'>
                <div class='settingdiv'>
                </div>
                <div class='banner' style={{backgroundColor: back}}>
                    <img alt="" src={default_profile} id="profile_img" style={{backgroundColor: img}} />
                </div>
                <div class="profile-info">
                    <h4 id="profile-info-tag">Information du compte:</h4>
                    <p>Id: {id}</p>
                    <p>Address: {signer.address}</p>
                    
                    
                </div>
                
                <br />
                

                
            </div>
        )
}
    

export default SellerAccount