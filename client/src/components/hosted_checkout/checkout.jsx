import { useEffect, useState } from 'react';
import {  useSearchParams } from 'react-router-dom'

import {ethers} from 'ethers'
import { AES, enc } from "crypto-js"

import {CLIENT_ID, SAND_CLIENT_ID} from '../../apikeyStorer'
import { API, Storage } from 'aws-amplify';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import ReactLoading from "react-loading";

function decryptData(password) {
    let decrypted = AES.decrypt(window.localStorage.getItem("did"), password)
    let data = JSON.parse(decrypted.toString(enc.Utf8))
    return data

}

//shopify payment

/*
import {ShopPayButton, ShopifyProvider} from '@shopify/hydrogen-react';
function AddVariantQuantity1({variantId}) {
    return <ShopPayButton variantIds={[variantId]} />;
  }

     <ShopifyProvider
            storeDomain="https://cplpayment-store.myshopify.com/"
            storefrontToken="d0342d7eda4263729b4c9b241a3ed44a"
            storefrontApiVersion="2024-10"
            countryIsoCode="CA"
            languageIsoCode="EN"
            >
            <AddVariantQuantity1 variantId={"gid://shopify/ProductVariant/9810801426721"} />
            </ShopifyProvider>
*/

function Checkout(props) {
    //"gid://shopify/ProductVariant/9810801426721"
    /*
     * params: clientId: admin email, itemId: shopify gid, cost: item price, store: shop name
     */
    const [searchParams, setSearchParams] = useSearchParams()
    
    const [email, setEmail] = useState("")
    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [country, setCountry] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [street, setStreet] = useState("")
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [save, setSave] = useState(false)

    const [paypalLoading, setPaypalLoading] = useState(false)
    const type = "spin"
    const color = "#000000"
    const location = "CA"

    const [signer, setSigner] = useState({})

    const [gan, setGan] = useState("")
    const [remainingBalance, setRemainingBalance] = useState()

    const [step, setStep] = useState(0)

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
    const changePassSC = (event) => {
       setPassword(event.target.value)
    }
    const changeGan = (event) => {
        setGan(event.target.value)
    }

    const activateSave = () => {
        setSave(!save)
    }

    function generateRandomPassword(length = 12) {
        const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowerCase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";
        const allCharacters = upperCase + lowerCase + numbers + specialChars;
    
        let password = "";
    
        // Ensure the password includes at least one of each type of character
        password += upperCase[Math.floor(Math.random() * upperCase.length)];
        password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
        // Fill the rest of the password with random characters
        for (let i = password.length; i < length; i++) {
            password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
        }
    
        // Shuffle the password to avoid predictable character placement
        password = password.split('').sort(() => Math.random() - 0.5).join('');
    
        return password;
    }

    const formAdvance = (e) => {
        e.preventDefault()
        const NewWallet = ethers.Wallet.createRandom()
        const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")
        let newConnectedWallet = NewWallet.connect(provider)

        if (password) {//encrypting and saving on device
            const data = {
                Waddress: newConnectedWallet.address,
                pk: newConnectedWallet.privateKey,
                first_name: fname,
                last_name: lname,
                email: email,
                address: {
                    addressLine1: street,
                    city: city,
                    state: state,
                    postCode: code,
                    countryCode: country
                }
            }
           
            let stringdata = JSON.stringify(data)
            var encrypted = AES.encrypt(stringdata, password)
            window.localStorage.setItem("did", encrypted);
            setSigner(newConnectedWallet)
            //connect_merchant(searchParams.get("clientid"))
            //paymentCallback(newConnectedWallet, password, connectedSigner.buyingContract, true, connectedSigner.mintingContract, connectedSigner.ddsContract, connectedSigner.proovingContract, searchParams.get("clientId"), searchParams.get("itemId"), data, searchParams.get("itemId"))
            setStep(1)


        } else { //generating a password and saving in cookies (1h)
            const generated_password = generateRandomPassword()
            setPassword(generated_password)
            const data = {
                Waddress: newConnectedWallet.address,
                pk: newConnectedWallet.privateKey,
                first_name: fname,
                last_name: lname,
                email: email,
                address: {
                    addressLine1: street,
                    city: city,
                    state: state,
                    postCode: code,
                    countryCode: country
                }
            }
           
            let stringdata = JSON.stringify(data)
            var encrypted = AES.encrypt(stringdata, generated_password)
            window.localStorage.setItem("did", encrypted);
            setSigner(newConnectedWallet)
            //connect_merchant(searchParams.get("clientid"))
            setStep(1)

        }


    }

    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }

    async function connect_merchant(email) {
        var data = {
            body: {
                email: email,
                shopify:true
            }
        }

        var url = "/partnerConnection"

        //const provider = new ethers.providers.InfuraProvider("sepolia", "1595c0d504a04055a0c61fb5b2cf4eb6")
        //const binanceProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")

        const response = API.post('server', url, data)
        return response
    }

    async function payGiftCard(e) {
        e.preventDefault()
        //step 1: get the gift card 
        //step 2: verify the balance
        //debit the gift card
        //redirect to payment page if balance isn't enough
        //finish the transaction

        /*let poolPublicKey = await getPublicKey()
        let clientPublicKey = new ethers.utils.SigningKey(signer.privateKey)

        //step 1: get shared secret
        let shareSecret = clientPublicKey.computeSharedSecret(poolPublicKey)

        //step 2: encode the password using shared secret
        let key = AES.encrypt(password, shareSecret)

        //step 3: compute digest for verification of the provenance of the message
        let digest = ethers.utils.hashMessage(key.toString()) //digest the encoded key
        let sig1 = await signer.signMessage(digest) //create signature 1 for address
        let sig2 = clientPublicKey.signDigest(digest) //create signature 2 for public key
        */

        const body = {
            code: gan,
            totalAmount: parseFloat(searchParams.get("cost")).toFixed(2).toString(),
            store: searchParams.get("store"),
           email: searchParams.get("clientid"),
           variantId: searchParams.get("id"),
           giftCard: true,

        }

        API.post('server', "/oauthCallbackShopify", {body: body}).then(async (response) => {
            if (response.status == "paid") {
                const merchant = await connect_merchant(searchParams.get("clientid"))
                let poolPublicKey = await getPublicKey()
                let clientPublicKey = new ethers.utils.SigningKey(signer.privateKey)
                //step 1: get shared secret
                let shareSecret = clientPublicKey.computeSharedSecret(poolPublicKey)

                //step 2: encode the password using shared secret
                let key = AES.encrypt(password, shareSecret)
           
                const resr = await API.post('serverv2', '/getOracleAddr', {body: {
                    publickey: merchant.publickey,
                    signer_publickey: signer.publicKey,
                    key: key.toString()
                }})
        
                const sellerSharedSecret = AES.decrypt(resr.key, password).toString(enc.Utf8)
                const res = decryptData(password)
                const data = {
                    Waddress: res.Waddress,
                    pk: res.pk,
                    first_name: res.first_name,
                    last_name: res.last_name,
                    email: res.email,
                    mobileNumber: res.mobileNumber, //"+19692154942"
                    dob: "1994-11-26", // got to format well
                    //realPurchase: [parseInt(orderData.tokenId), parseInt(orderData.itemId)], //track items bought
                    address: {
                        addressLine1: res.address.addressLine1,
                        city: res.address.city,
                        state: res.address.state,
                        postCode: res.address.postCode,
                        countryCode: res.address.countryCode
                    }
                }
        
                let stringdata = JSON.stringify(data)
                
                var encrypted = AES.encrypt(stringdata, sellerSharedSecret)                                        
                //window.localStorage.setItem("did", encrypted);
                const variantId = searchParams.get("id") //?.split("ProductVariant/") variantId[1]
                
                setS3Config("didtransfer", "public");
                Storage.put(`${merchant.address.toLowerCase()}/${res.Waddress.toLowerCase()}.txt`, encrypted.toString()).then(async(results) =>  {
                    console.log(results) 
                   
                    //update quantity in shopify
                    API.post('server', "/oauthCallbackShopify", {body: {variantId: parseInt(variantId), email: searchParams.get("clientid"), store: searchParams.get("store"), itemCallback: true, note: signer.address}}).then((response) => {
                        console.log(response)
                        const data2 = {
                            Waddress: res.Waddress,
                            pk: res.pk,
                            first_name: res.first_name,
                            last_name: res.last_name,
                            email: res.email,
                            mobileNumber: res.mobileNumber, //"+19692154942"
                            dob: "1994-11-26", // got to format well
                            realPurchase: [parseInt(response.id), searchParams.get("clientid"), searchParams.get("store")], //track items bought
                            address: {
                                addressLine1: res.address.addressLine1,
                                city: res.address.city,
                                state: res.address.state,
                                postCode: res.address.postCode,
                                countryCode: res.address.countryCode
                            }
                        }
                        let stringdata = JSON.stringify(data2)
         
                        var encrypted = AES.encrypt(stringdata, password)
                        window.localStorage.setItem("did", encrypted);
                        //setPaypalLoading(false)
                       
                        setStep(2)
                        alert("Payment successful")
                    })
                })
               
            } else if (response.status == "partially paid") {
                alert("Payment partially successful, pay the remaining amount using one of the checkout solution provided!")
                //lauch paypal session with remaining amount
                setRemainingBalance(response.remainingBalance)

            } else {
                alert("Gift card payment failed")
            }
        })
    }


    async function getPublicKey() { //fct to get public key from server
        const response = await API.get('serverv2', '/getOracleAddr', {})
        return response.publicKey
    }

    return (
        <div className="checkout"style={{"marginTop": "150px", "iframe": {"display": "ruby"}}}>
           <p>Session ID: {searchParams.get("id")}</p>
           { paypalLoading ? (<div class="getPassword" ><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>{window.localStorage.getItem("language") == "en" ? "Processing payment..." : "Transaction en cours..." }</h5></div>) :step == 0 ? !window.localStorage.getItem("did") ? <form onSubmit={formAdvance}>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style={{width: "33%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                
                <br />
                <br />
                <div class="form-check form-switch" >
                    <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" onChange={()=> {activateSave()}} checked={save} />
                    <label class="form-check-label" for="flexSwitchCheckChecked">Securely save my address</label>
                </div>
                {save ? <div>
                    
                    <div class="mb-3 row">
                        <label for="inputPassword" class="col-sm-2 col-form-label" >Password</label>
                        <div class="col-sm-10">
                            <input type="password" class="form-control" id="inputPassword" onChange={changePassSC}/>
                        </div>
                    </div>
                </div> : ""}
                <br />
                <br />
                <input type="text" id="fname" name="fname" class="form-control" placeholder="First Name : John" onChange={onFnameChanged}/>
                    <br />
                    <input type="text" id="lname" name="lname" class="form-control" placeholder="Last Name : Doe " onChange={onLnameChanged}/>
                    <br />
                    <input type="text" id="country" name="country" class="form-control" placeholder="country : CA " onChange={onCountryChanged}/>
                    <br />
                    <input type="text" id="state" name="state" class="form-control" placeholder="state : QC" onChange={onCityChanged}/>
                    <br />
                    <input type="text" id="city" name="city" class="form-control" placeholder="city : Montreal" onChange={onStateChanged}/>
                    <br />
                    <input type="text" id="street" name="street" class="form-control" placeholder="street address : 100 example road" onChange={onStreetChanged}/>
                    <br />
                    <input type="text" id="code" name="code" class="form-control" placeholder="Postal code : 000 000" onChange={onCodeChanged}/>
                    <br />
                    <input type="text" id="email" name="email" class="form-control" placeholder="Email : johndoe@example.com" onChange={onEmailChanged}/>
                    <br />
                    <input type="submit" class="btn btn-primary" value="Continue" />
                    
            </form> : <form onSubmit={formAdvance}>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style={{width: "33%"}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <br />
                <br />
                <div className="getPassword">
                    <h3>Connect to your account</h3>
                    
                    <div class="mb-3 row">
                        <label for="inputPassword" class="col-sm-2 col-form-label" >Password</label>
                        <div class="col-sm-10">
                            <input type="password" class="form-control" id="inputPassword" onChange={changePassSC}/>
                        </div>
                    </div>
                    <input type="submit" class="btn btn-primary" value="Continue" />
                </div> 
                <br />
                <br />
                
                   
                    
            </form>: step == 1 ? <div className='getPassword' >
            <h3>{window.localStorage.getItem("language") == "fr" ? "Selectionner une méthode de paiement" : "Select a payment method"}</h3>

            <PayPalScriptProvider options={{ clientId: props.sandbox ?  SAND_CLIENT_ID : CLIENT_ID, currency: "CAD" }}>
                <div style={{
  
  width: "50%",
  marginLeft: "25%"
}}>
                <PayPalButtons style={{color: "gold", disableMaxWidth: true}} 
                    createOrder={async () => {
                        let dataoptions = {
                            body: {
                                amount: remainingBalance ? parseFloat(remainingBalance).toFixed(2).toString() : parseFloat(searchParams.get("cost")).toFixed(2).toString(),
                                sandbox: props.sandbox,
                                location: searchParams.get("clientid")
                            }
                        }
                        return API.post('serverv2',  '/create-paypal-order', dataoptions).then((order) => order.id);
                    }}
                    onApprove={async (data) => { 
                        setPaypalLoading(true)
                        const merchant = await connect_merchant(searchParams.get("clientid"))
                        let poolPublicKey = await getPublicKey()
                        let clientPublicKey = new ethers.utils.SigningKey(signer.privateKey)
                        //step 1: get shared secret
                        let shareSecret = clientPublicKey.computeSharedSecret(poolPublicKey)

                        //step 2: encode the password using shared secret
                        let key = AES.encrypt(password, shareSecret)

                        //step 3: compute digest for verification of the provenance of the message
                        let digest = ethers.utils.hashMessage(key.toString()) //digest the encoded key
                        let sig1 = await signer.signMessage(digest) //create signature 1 for address
                        let sig2 = clientPublicKey.signDigest(digest) //create signature 2 for public key
                
                        //shopify checkout
                        let dataoptions = {
                            body: {
                                orderID: data.orderID,
                                key: key.toString(), //is cypher
                                digest: digest,
                                signature1: sig1,
                                signature2: sig2,
                                sandbox: props.sandbox,
                                email: searchParams.get("clientid"),
                                address: signer.address,
                                publickey: merchant.publickey,
                                shopify: true
                
                                }
                            }
                        console.log(dataoptions)
                        return API.post('serverv2', "/capture-paypal-order", dataoptions).then((orderData) => {
                            //console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                            if (orderData.status === 50) {
                                alert("Error while buying. Error code: 50")
                            } else {
                                console.log(orderData)
                                const transaction = orderData.captureData.purchase_units[0].payments.captures[0];
                                console.log(transaction)

                                //step 1 decrypt key with password
                                const sellerSharedSecret = AES.decrypt(orderData.key, password).toString(enc.Utf8)
                                const res = decryptData(password)
                                const data = {
                                    Waddress: res.Waddress,
                                    pk: res.pk,
                                    first_name: res.first_name,
                                    last_name: res.last_name,
                                    email: res.email,
                                    mobileNumber: res.mobileNumber, //"+19692154942"
                                    dob: "1994-11-26", // got to format well
                                    //realPurchase: [parseInt(orderData.tokenId), parseInt(orderData.itemId)], //track items bought
                                    address: {
                                        addressLine1: res.address.addressLine1,
                                        city: res.address.city,
                                        state: res.address.state,
                                        postCode: res.address.postCode,
                                        countryCode: res.address.countryCode
                                    }
                                }
                        
                                let stringdata = JSON.stringify(data)
                                
                                var encrypted = AES.encrypt(stringdata, sellerSharedSecret)                                        
                                //window.localStorage.setItem("did", encrypted);
                                
                                setS3Config("didtransfer", "public");
                                Storage.put(`${merchant.address.toLowerCase()}/${res.Waddress.toLowerCase()}.txt`, encrypted.toString()).then(async(results) =>  {
                                    console.log(results) 
                                    
                                    //update quantity in shopify
                                    API.post('server', "/oauthCallbackShopify", {body: {variantId:  searchParams.get("id"), quantities: searchParams.get("quantity"), email: searchParams.get("clientid"), store: searchParams.get("store"), itemCallback: true, note: signer.address}}).then((response) => {
                                        console.log(response)
                                        const data2 = {
                                            Waddress: res.Waddress,
                                            pk: res.pk,
                                            first_name: res.first_name,
                                            last_name: res.last_name,
                                            email: res.email,
                                            mobileNumber: res.mobileNumber, //"+19692154942"
                                            dob: "1994-11-26", // got to format well
                                            realPurchase: [parseInt(response.id?.data?.orderCreate?.order?.id), searchParams.get("clientid"), searchParams.get("store")], //track items bought
                                            address: {
                                                addressLine1: res.address.addressLine1,
                                                city: res.address.city,
                                                state: res.address.state,
                                                postCode: res.address.postCode,
                                                countryCode: res.address.countryCode
                                            }
                                        }
                                        let stringdata = JSON.stringify(data2)
                            
                                        var encrypted = AES.encrypt(stringdata, password)
                                        window.localStorage.setItem("did", encrypted);
                                        setPaypalLoading(false)
                                        setStep(2)
                                        //wait 2 seconds and close the window
                                        setTimeout(() => {
                                        window.close('','_parent','')}, 2000)
                                    })
                                })
                                
                                
                            }

                            //props.purchase()
                        }).catch((e) => {
                            alert("Error while buying. Error code: 50")
                            setPaypalLoading(false)
                            console.log(e)
                        });

                        }
                       
                    }
                />
                </div>
            </PayPalScriptProvider>

            <form onSubmit={payGiftCard}>
                <div class="mb-3 row">
                    <label for="inputGiftCard" class="col-sm-2 col-form-label">{window.localStorage.getItem("language") == "fr" ? "Numéro de la carte cadeau " : "Gift card number"}</label>
                    <div class="col-sm-6">
                    <input type="text" class="form-control" id="inputGiftCard" onChange={changeGan}/>
                    
                    </div>
                    <div class="col-sm-4">
                    <button type="submit" class="btn btn-primary mb-3">{window.localStorage.getItem("language") == "fr" ? "Payer avec une carte cadeau" : "Pay with gift card"}</button>
                    
                    </div>
                   
                </div>
           
                
            </form>
           
            </div> : <div className='getPassword'>
            <img src="https://webstockreview.net/images/check-clipart-gif-animation-18.gif" alt="" style={{"width":"auto", "height": "10%", "marginLeft": "1%"}}/><h1>{window.localStorage.getItem("language") == "fr" ? "Paiement complété" : "Payment completed"}</h1></div> }
        </div>
    )
}

export default Checkout;