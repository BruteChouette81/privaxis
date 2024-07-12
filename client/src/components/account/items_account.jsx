
import {ethers} from 'ethers'
import {useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import ReactLoading from "react-loading";
import { AES, enc } from "crypto-js"
import axios from "axios";
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
import realabi from '../../artifacts/contracts/nft.sol/nft.json'

const step = "Processing"
const type = "spin"
const color = "#0000FF"

const key = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNjhjNmRmZi1mOGRmLTQzNzUtYjA5Ny1mMTNmNDk0OTk3ODIiLCJlbWFpbCI6ImhiYXJpbDFAaWNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2ODFmYTNmZThmY2JmZTI5OTJmZSIsInNjb3BlZEtleVNlY3JldCI6IjcxOGRhMWFjMTRkZmNmMjVjMzM2YmZlYTI0MWUzODU2M2U1ZjJjOWNjOGJkNzdiY2RlMWE1OTY4YWQ4ZWJmNmEiLCJpYXQiOjE2ODUyODk0NDZ9.dheuwiicVcI3mM7yMo9voga4Bis7nDu7g5TJocC_xkc"

const getContract = (signer, abi, address) => {
    // get the end user
    console.log(signer)
    // get the smart contract
    const contract = new ethers.Contract(address, abi.abi, signer);
    return contract
}



function ItemsAccount (props) {

    const [displayItemCreator, setDisplayItemCreator] = useState(false)

    const displayCreateForm = () => {
        setDisplayItemCreator(!displayItemCreator)
    }

    const [displayProover, setDisplayProover] = useState(false)

    const displayProoverForm = () => {
        setDisplayProover(!displayProover)
    }

    const [dds, setdds] = useState()


    const [tokenuri, setTokenuri] = useState()
  
    const [tag, setTag] = useState("nft")
    
    const [nftname, setNftname] = useState("")
    const [description, setDescription] = useState("")
    const [itemPrice, setItemPrice] = useState(0)
    const [itemFee, setItemFee] = useState(0)
    const [itemDays, setItemDays] = useState(0)
    const [tags, setTags] = useState([])
    const [itemLink, setItemLink] = useState([])
    const [createLoading, setCreateLoading] = useState(false)
    const [nftnames, setNftnames] = useState([])
    const [descriptions, setDescriptions] = useState([])
    const [itemPrices, setItemPrices] = useState([])
    const [itemsDays, setItemsDays] = useState([])
    
    const [image_file, setImage] = useState(null);
    const [images, setImages] = useState(null);

    const [numAttribute, setNumAttribute] = useState(0)
    const [values, setValues] = useState([])
    const [keys, setKeys] = useState([])

    const [submitLoading, setSubmitLoading] = useState(false)
    const [proof, setProof] = useState("")
    const [orderID, setOrderID] = useState(0)


    const onProofChanged = (event) => {
        setProof(event.target.value)
    }

    const onOrderIDChanged = (event) => {
        setOrderID(event.target.value)
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


    const onNameChange = (event) => {
        setNftname(event.target.value)
    }
    const onDescriptionChange = (event) => {
        setDescription(event.target.value)
    }
    const onItemPriceChange = (event) => {
        setItemPrice(event.target.value)
        //fee policy: 2.9% + 0.6$ + 4$(blockchain fee)
        let quickFee = (event.target.value * 0.029 + 4.6)
        setItemFee(quickFee);
    }
    const onItemDaysChange = (event) => {
        setItemDays(event.target.value)
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
    const GetClient = (props) => { //account, did

        const [numItems, setNumItems] = useState(0)
        const [orderIds, setOrderIds] = useState([])
        

        const OrderToComplete = (props) => {
            const [gettingID, setGettingID] = useState(false)
            const [clientId, setClientId] = useState([])

            const getClientInfo = async() => {
                console.log("activated")
                let key = await dds.getClientInfos(props.orderid - 1, props.orderid) //itemID, order ID or let keyid = ... keyid[0], keyid[1], keyid[0]
                //console.log(key)
                const item = await dds?.items(props.orderid - 1)
                //console.log(item.tokenId)
                
                const nft = getContract(item.nft, realabi, props.signer)
                //console.log(nft)

                const buyer_address = await nft.ownerOf(parseInt(item.tokenId))
               //console.log(buyer_address)
                // go take hash form bucket file then, delete the file
                //setS3Config("didtransfer", "public")
                const file = await Storage.get(`${props.signer.address.toLowerCase()}/${buyer_address.toLowerCase()}.txt`)
                fetch(file).then((res) => res.text()).then((text) => {
                        //console.log(text)
                        let res1 = AES.decrypt(text, key)
                        const res = JSON.parse(res1.toString(enc.Utf8));
                        setClientId(res)
                        setGettingID(true)

                }).catch((e) => {
                    console.log(e)
                })
                
                
                
                
            }
            const cancel = () => {
                setGettingID(false)
            }
            return ( //res.city, res.state, res.postalCode, res.country, res.street1
                gettingID ? ( <div class="ordercard" >
                    <h6>Name: {clientId.first_name}</h6>
                    <h6>Last Name: {clientId.last_name}</h6>
                    <h6>Country: {clientId.address.countryCode}</h6>
                    <h6>State: {clientId.address.state}</h6>
                    <h6>City: {clientId.address.city}</h6>
                    <h6>Street: {clientId.address.addressLine1}</h6>
                    <h6>Postal Code: {clientId.address.postCode}</h6>
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



        
        
        const getNumItems = async () => {
            console.log(props.address?.toLowerCase())
            var data = {
                body: {
                    address: props.address?.toLowerCase(),
                }
            }

            var url = "/getItems"

            //console.log(typeof(item))
            //console.log(item)
            let numItem = 0
            let orderIdToComplete = []
            let names = []
            API.post('serverv2', url, data).then(async (response) => {
                console.log(response)
                    for(let i=0; i<=response.ids?.length; i++) { //loop trought every listed item of an owner 
                        //console.log(response.ids[i])
                        if(response.ids[i] >= 0) {
                            numItem++

                            console.log(response.ids[i])
                            const item = await dds?.items(parseInt(response.ids[i]) + 1) //get the DDS item
                            console.log(item)
                            //console.log(item)
                            if (item?.sold === true && item?.prooved === false) {
                                orderIdToComplete.push(parseInt(item.itemId)) //orderID
                                names.push(response.names[i])
                            }
                        }
                    }
                    if (names.length > 0) {
                        let item = []
                        for (let i=0; i<names.length; i++) {
                            item[i] = {name: names[i], orderId: orderIdToComplete[i]}
                        }
                        setOrderIds(item)
                    }
                    setNumItems(numItem)
                    console.log(numItem)
            }).catch((e) => {
                console.log(e)
            }) 
               
            
            

           
            
            /*
            const response = await API.post('server', url, data)

            for(let i=0; i<=response.ids?.length; i++) { //loop trought every listed item of an owner 
                if (response.tags[i] === "real") { // once you got the item we want to display:
                   numItem ++
                   const item = await dds.items(parseInt(response.ids[i])) //get the DDS item
                   if (item.sold === true && item.prooved === false) {
                       orderIdToComplete.push(parseInt(item.itemId) + 1) //orderID
                       names.push(response.names[i])
                   }
                }
            }
            */


           

            
        }
        //getNumItems()
        
        useEffect(() => {
            
            getNumItems()
            

          
           
            
           
            
        }, [setOrderIds, setNumItems])
    
    

        return (
            <div>
                <h4>You have listed {numItems} Real Items </h4>
                <h4>You need to confirm {orderIds?.lenght > 0 ? orderIds[0]?.length : orderIds?.length} purchase</h4>
                <h5>Order Ids of command to verify: {orderIds.map(ids => ( <OrderToComplete name={ids.name} signer={props.signer} orderid={ids.orderId} did={props.did}/> ))}</h5>
            </div>
        )
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



    const createReal = async(event) => {
        event.preventDefault();
        if (nftname !== ""  && description !== "" && image_file !== null && tag !== "" && itemDays !== 0 && itemPrice !== 0) {
            //function to poat item to ipfs
            async function postMetadataPinata() {

                let attributes = []
                if (numAttribute > 0) {
                    for (let i=0; i < numAttribute; i++) {
                        attributes.push({"key": keys[i], "value": values[i]})
                    }
                    
                }

                const formData = new FormData();
    
                formData.append('file', image_file)
            
                if (numAttribute > 0) {
                    let metadata = {
                        name: nftname,
                        keyvalues: { 
                          description: description,
                          tag: tag,
                        }
                    };
                    for (let i=0; i < numAttribute; i++) {
                        metadata.keyvalues.keys[i] = values[i]
                    }
                    
                    formData.append('pinataMetadata', metadata);
                }
                else {
                    const metadata = JSON.stringify({
                        name: nftname,
                        keyvalues: { 
                          description: description,
                          tag: tag,
                        }
                       
                      });
                      formData.append('pinataMetadata', metadata);
                }
               

                
                
                const options = JSON.stringify({
                  cidVersion: 0,
                })
                formData.append('pinataOptions', options);
            
                try{
                    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                        maxBodyLength: "Infinity",
                        headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                        Authorization: key
                        }
                    });
                    console.log(res.data);

                    return res.data

                } catch (error) {
                  console.log(error);
                }
            };
           
            setCreateLoading(true)
            const res2data = await postMetadataPinata()

            let cid = res2data.IpfsHash
            if (event.nativeEvent.submitter.value === "add") {
                setCreateLoading(false)
                if (tokenuri) {
                    let tokensuris = tokenuri;
                    tokensuris.push("https://ipfs.io/ipfs/" + cid)
                    setTokenuri(tokensuris)
                    let names2 = nftnames;
                    names2.push(nftname)
                    setNftnames(names2)
                    let tags2 = tags;
                    tags2.push(tag)
                    setTags(tags2)
                    let descriptions2 = descriptions;
                    descriptions2.push(description)
                    setDescriptions(descriptions2)
                    let itemsprices2 = itemPrices;
                    itemsprices2.push(itemPrice - itemFee)
                    setItemPrices(itemsprices2)
                    let itemsdays2 = itemsDays;
                    itemsdays2.push(itemDays)
                    setItemsDays(itemsdays2)
                } else {
                    setTokenuri(["https://ipfs.io/ipfs/" + cid])
                    setNftnames([nftname])
                    setTags([tag])
                    setDescriptions([description])
                    setItemPrices([itemPrice])
                    setItemsDays([itemDays])
                }
                
                
            } else {
                setTokenuri("https://ipfs.io/ipfs/" + cid)
                console.log("https://ipfs.io/ipfs/" + cid)
                //mint using oracle
                try {
                        
                        console.log(itemPrice - itemFee)
                        //await mintReal(props.account, "https://ipfs.io/ipfs/" + cid, props.signer)
                        var data = {
                            body: {
                                address: window.localStorage.getItem("walletAddress"),
                                uri: "https://ipfs.io/ipfs/" + cid,
                                MaxPrice: (itemPrice - itemFee).toFixed(2), //Minimum price for item without fees
                                numDays: parseInt(itemDays),
                                mintingAddress: "0x666f393A06285c3Ec10895D4092d9Dc86aeFD45b",
                                ddsAddress: "0xa244B3e1e6Bd2ccf1D226F3E269D0Af88Ef86CEE",
                            }
                            
                        }

                        console.log(data)
            
                        var url = "/oracleMint"
                            
                        
                        API.post('serverv2', url, data).then((response) => {
                            console.log(parseInt(response.hex))
                            if (response.status === 10) {
                                alert("Error code 10, Mint error")
                            } else {
                                var data = {
                                    body: {
                                        address: window.localStorage.getItem("walletAddress").toLowerCase(),
                                        itemid: parseInt(response.hex), //market item id
                                        name: nftname, //get the name in the form
                                        score: 0, //set score to zero
                                        tag: tag, //"real" 
                                        description: description,
                                        image: "https://ipfs.io/ipfs/" + cid
                                    }
                                }
                    
                                var url = "/listItem"
                    
                                API.post('serverv2', url, data).then((response) => {
                                    console.log(response)
                                    setCreateLoading(false)
                                    alert("Your Item is Created and Listed")
                                    setItemLink(["/item/" +  data.body.itemid])
                                })
                            }
                            
                           
                        }).catch((e) => {
                            setCreateLoading(false)
                            alert("Error while creating the Item... check console for more. Error code: 10")
                            console.log(e)
                        })

            } catch(e) {
                setCreateLoading(false)
                alert("Unable to create, check console for more informations");
                console.log(e)
            }
            
        }
    }
        else {
            alert("Need to fill our the whole form!")
        }
    }
    const handleProof = async(e) => {
        e.preventDefault()
        //load DDS contract
        //console.log(dds)
        setSubmitLoading(true)
        try {
            //await dds.submitProof(orderID, proof)
            let item = await dds.items(orderID-1);
            //console.log((item.price/100000 * 1.36).toFixed(2).toString())
            //let key = AES.encrypt(props.pk, props.signer.publicKey)

            //let digest = ethers.utils.hashMessage(proof) //digest the encoded key

            let sig1 = await props.signer.signMessage(proof) //create signature 1 for address
                        
                        //let pubkey = new ethers.utils.SigningKey(props.signer.privateKey)
                       
                        //let sig2 = pubkey.signDigest(digest) //create signature 2 for public key
            
            let data = {
                body: {
                    address: props.signer.address,
                    amount: (((item.price/100000) / (1 - 0.029) + 4.6) - (((item.price/100000) / (1 - 0.029) + 4.6)*0.15)).toFixed(2).toString(), //(item.price/100000 * 1.36).toFixed(2).toString()
                    email: "",//window.localStorage.getItem("MoneyAddress"),
                    id: orderID,
                    proof: proof,
                    signature1: sig1,
                    sandbox: true,
                    transferMoney: false //only confirm 
                }
            
            }
            //console.log(data)

            var url = "/get-payed"
        
            API.post('serverv2', url, data).then((response) => {
                console.log(response)
                if (response.status === 40) {
                    alert("Error while submitting proof. Error code 40")
                } else {
                    alert("successfully submited proof!")
                    setSubmitLoading(false)
                }
            }).catch((e) => {
                alert("Error while submitting proof. Error code 40")
                console.log(e)
            })
            
        } catch (error) {
            alert("Unable to submit Proof");
            setSubmitLoading(false)
            
        }
        
    }

    useEffect(() => {
            const contract = getContract(props.signer, DDSABI, props.contracts.dds)
            setdds(contract)
        
    }, [setdds])

    const return_to_home = () => {
        props.setDisplay(false)
    }
    return(
        <div class="itemsaccount">
            <button type="button" class="btn-close" aria-label="Close" onClick={() => {return_to_home()}} style={{"float":"right"}}></button>
             <div class="container">
                <div class="row">
                    <div class="col">
                    <h1>Manage your items</h1>
                    <button class="btn btn-primary" onClick={() => {displayCreateForm()}}>Create a new item</button>
                        {displayItemCreator ? (
                        <form class="test1" onSubmit={createReal}>                              
                            <div class="mb-3">
                                <label for="formFile" class="form-label">Image of the Item</label>
                                <input class="form-control" type="file" accept='image/png, image/jpeg' id="formFile" onChange={onImageChange}/>
                            </div>
                            <br />
                            <input class="form-control" type="text" placeholder="Name" onChange={onNameChange}/>    
                            <br />  
                            <input class="form-control" type="text" placeholder="Description" onChange={onDescriptionChange}/>    
                            <br />
                            <input class="form-control" type="number" placeholder="Price of the Item (in $)" onChange={onItemPriceChange}/>    
                            <br />
                            <p>*Price in Canadian Dollars (CAD)</p>
                            <p>Total Fee: {parseFloat(itemFee).toFixed(2)} $ or {parseFloat(itemFee/itemPrice*100).toFixed(2)}%</p>
                            <p>Total received: {itemPrice - itemFee} $</p>
                            <p>Staking Program: 3-9 months to <strong>refund</strong> your fees and even make a profit using our staking program!</p>
                            <br />
                            <input class="form-control" type="number" placeholder="Number of day to send the Item" onChange={onItemDaysChange}/>    
                            <br />
                            <div class="form-floating">
                                <select onChange={onChangeTags} class="form-select" id="floatingSelect" aria-label="Floating label select example">
                                    <option selected>Categorize your digital item </option>
                                    <option value="1" >Imperssionisme</option>
                                    <option value="2" >Nature Morte</option>
                                    <option value="3" >Realisme</option>
                                </select>
                                <label for="floatingSelect">Tag</label>
                            </div>
                            <br />
                            <div>
                                <input type="button" class="btn btn-secondary" value="Add attribute" onClick={onAddedAttribute}/><br />
                                <br />
                                <br />
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
                            <input type="submit" class="btn btn-primary" value="Submit" /> <input type="submit" class="btn btn-warning" value="add" />
                                                            
                        </form>) : ""}
                        
                    </div>
                    <div class="col">
                        <h1>Orders to complete</h1>
                        <button class="btn btn-primary" onClick={() => {displayProoverForm()}}>See orders</button>
                        {displayProover ?  submitLoading ? (<div style={{paddingLeft: 25 + "%"}}><ReactLoading type={type} color={color}
        height={200} width={200} /><h5>{step} loading...</h5></div>) :(
                            <div>
                                <GetClient address={window.localStorage.getItem("walletAddress")} did={window.localStorage.getItem("did")} signer={props.signer} dds={props.contracts.dds}/>
                                <form onSubmit={handleProof}>
                                        <input type="text" id="order" name="order" class="form-control" placeholder="0" onChange={onOrderIDChanged}/>
                                        <br />
                                        <input type="text" id="proof" name="proof" class="form-control" placeholder="QQ XXX XXX XXX QQ" onChange={onProofChanged}/>
                                        <br />
                                        <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
                            </div>
                        ) : ""}
                       
                    </div>
                </div>
            </div>
           
        </div>
    )
}

export default ItemsAccount;