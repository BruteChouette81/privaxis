
import {ethers} from 'ethers'
import {useState, useEffect } from 'react';
import { API, Storage } from 'aws-amplify';
import ReactLoading from "react-loading";
import { AES, enc } from "crypto-js"
import axios from "axios";
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
import realabi from '../../artifacts/contracts/nft.sol/nft.json'
import { square_secret } from '../../apikeyStorer';
import './css/items_account.css'
const step = "Processing"
const type = "spin"
const color = "#0000FF"

const key = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNjhjNmRmZi1mOGRmLTQzNzUtYjA5Ny1mMTNmNDk0OTk3ODIiLCJlbWFpbCI6ImhiYXJpbDFAaWNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2ODFmYTNmZThmY2JmZTI5OTJmZSIsInNjb3BlZEtleVNlY3JldCI6IjcxOGRhMWFjMTRkZmNmMjVjMzM2YmZlYTI0MWUzODU2M2U1ZjJjOWNjOGJkNzdiY2RlMWE1OTY4YWQ4ZWJmNmEiLCJpYXQiOjE2ODUyODk0NDZ9.dheuwiicVcI3mM7yMo9voga4Bis7nDu7g5TJocC_xkc"


const tags_list = ["Vases", "Casse-tête", "Soldes", "Produits corporels", "Accessoires", "Bouteilles & thermos", "Papeterie", "Cuisine", "Plantes, jardinage etc.", "Bougies et parfums d'ambiance", "Déco", "Linge de maison"]
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
    const [itemDays, setItemDays] = useState(10)
    const [tags, setTags] = useState([])
    const [itemLink, setItemLink] = useState([])
    const [createLoading, setCreateLoading] = useState(false)
    const [nftnames, setNftnames] = useState([])
    const [descriptions, setDescriptions] = useState([])
    const [itemPrices, setItemPrices] = useState([])
    const [itemsDays, setItemsDays] = useState([])
    const [score, setScore] = useState(1)
    
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

    const onScoreChange = (event) => {
        setScore(event.target.value)
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

    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }

    const GetClient = (props) => { //account, did

        const [numItems, setNumItems] = useState(0)
        const [orderIds, setOrderIds] = useState([])
        

        const OrderToComplete = (props) => {
            const [gettingID, setGettingID] = useState(false)
            const [clientId, setClientId] = useState([])

            const getClientInfo = async() => {
                console.log(props.signer)
                console.log("activated")
                let key = await dds.getClientInfos(props.orderid - 1, props.orderid) //itemID, order ID or let keyid = ... keyid[0], keyid[1], keyid[0]
                //console.log(key)
                const item = await dds?.items(props.orderid - 1)
                //console.log(item.tokenId)
                
                const nft = getContract( props.signer, realabi, item.nft)
                //console.log(nft)

                const buyer_address = await nft.ownerOf(parseInt(item.tokenId))
               //console.log(buyer_address)
                // go take hash form bucket file then, delete the file
                setS3Config("didtransfer", "public")
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
                <h4>{window.localStorage.getItem("language") == "fr" ? `Vous avez mis ${numItems} items en ligne` : `You have listed ${numItems} Real Items`} </h4>
                <h4>{window.localStorage.getItem("language") == "fr" ? `Vous devez confirmer:` : `You need to confirm: `} {orderIds?.lenght > 0 ? orderIds[0]?.length : orderIds?.length} {window.localStorage.getItem("language") == "fr" ? `achats` : `purchases`}</h4>
                <h5>Order Ids of command to verify:</h5>
                {orderIds.map(ids => ( <OrderToComplete name={ids.name} signer={props.signer} orderid={ids.orderId} did={props.did}/> ))}
            </div>
        )
    }

    const onChangeTags = (event) => {

        setTag(tags_list[parseInt(event.target.value)])
        //console.log(tags_list[parseInt(event.target.value)])
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
                        //console.log(test.test.test)
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
                                        score: score, //quantitie tracker
                                        tag: tag, //"real" 
                                        price: parseInt((itemPrice - itemFee).toFixed(2)*100000), 
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
    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
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
                    prooving: props.contracts.prooving,
                    sandbox: false,
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

   

    //goal make a easy loading item
    function BasicLoadItem(props) {
        const [editing , setEditing] = useState(false)
        //console.log(props)
        let newName = ""
        let newDes = ""
        let newPrice = ""
        let newScore = ""

        const onNewNameChange = (event) => {
            newName = event.target.value
        }
        const onNewDesChange = (event) => {
            newDes = event.target.value
        }

        const onNewScoreChange = (event) => {
            newScore = event.target.value
        }

        const onNewPriceChange = (event) => {
            newPrice = event.target.value
        }


        const deleteItem = () => {
            try {
                var url = "/updateScore"
        
                var data = {
                    body: {
                        address: window.localStorage.getItem("walletAddress").toLowerCase(),
                        oldid: parseInt(props.id),
                        newid: parseInt(props.id), //market item id
                        score: 0, //quantitie tracker
                    }
                }
    
                var url = "/updateScore"
    
                API.post('serverv2', url, data).then((response) => {
                    console.log(response)
                    alert('Deleted Item: ' + props.id)
                   
                  
                })
        
                
            }
            catch(error) {
                alert("Unable to delete Item (" + props.id + "). Error code - 60")
                console.log(error)
            }
        }

        const createCheckout = () => {
            var data = {
                body: {
                    url: "https://connect.squareup.com/v2/terminals/checkouts",
                    data: {
                        method:"post",
                        headers: {
                           
                            'Authorization': `Bearer ${square_secret}`,
                            'Content-Type': 'application/json',
                            'Square-Version': '2024-06-04',
                            
                            },
                        body: JSON.stringify({ 
                            "idempotency_key": "id" + Math.random().toString(16).slice(2),
                            "checkout": {
                            "amount_money": {
                                "amount": props.price,
                                "currency": "CAD"
                            },
                            "reference_id": "id11572",
                            "device_options": {
                                "device_id": props.device_id
                            },
                            "note": `${props.id}`,
                            "location_id": "LY9PJBHERNETY",
                                                },
                })
            }}}
            API.post('server',"/getcode", data).then((res) => {
                console.log(res)
            })
        }

        const UpdateItemToDB = (e) => {
            e.preventDefault()
            console.log(newName)
            console.log(newPrice)
            console.log(newDes)
            var url = "/updateScore"
        
            var data = {
                body: {
                    address: window.localStorage.getItem("walletAddress").toLowerCase(),
                    id: parseInt(props.id),
                    score: newScore ? parseInt(newScore) : parseInt(props.score), //quantitie tracker,
                    name: newName ? newName : props.name,
                    des: newDes ? newDes : props.description,
                    price: newPrice ? parseInt((parseFloat(newPrice) - (parseFloat(newPrice) *0.029+4.6)).toFixed(2)*100000) : parseInt((parseFloat(props.price) - (parseFloat(props.price) *0.029+4.6)).toFixed(2)*100000)
                }
            }
            console.log(data.body)

            var url = "/updateScore"

            API.post('serverv2', url, data).then((response) => {
                console.log(response)
                alert('Updated Item: ' + props.id)
                
                
            })


        }

       

        return (
            
            <div class="nftbox">
                <a href={props.image}><img id='itemimg' src={props.image} alt="" /></a>
                <br />
                <br />
                <h4>{props.name}</h4>
                
                
                <p>Description: {props.description}</p>
                <p>Price: {props.price}</p>
                <p>Quantity: {props.score}</p>
                {props.score ? <button class="btn btn-primary" onClick={()=> {createCheckout()}}>Create Checkout</button> : <p>No more items...</p>}
                <br />
                <br />
                {props.score ? <button class="btn btn-danger" onClick={()=> {deleteItem()}}>Delete</button> : ""}
                <br />
                <br />
                <button class="btn btn-info" onClick={()=> {setEditing(!editing)}}>Edit Item</button>
                {editing ? <div>
                    <form class="test1" onSubmit={UpdateItemToDB}>      
                    <label for="Name" class="form-label">Name:</label> <input class="form-control" id="Name" type="text" placeholder={props.name} onChange={onNewNameChange}/>
                                            
                        <div class="mb-3">
                            <label for="exampleFormControlTextarea1" class="form-label">Description</label>
                            <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" onChange={onNewDesChange}>{props.description}</textarea>
                        </div>
                        
                        <label for="Price" class="form-label">Price:</label> <input id="Price" class="form-control" type="text" placeholder={props.price} onChange={onNewPriceChange}/>    

                        <label for="Quantity" class="form-label">Quantity:</label> <input id="Quantity" class="form-control" type="text" placeholder={props.score} onChange={onNewScoreChange}/>    
                        
                        <input type="submit" class="btn btn-primary" value="Update!" /> 
                                                            
                    </form>
                </div> : ""}
                

            </div>
          
        )


    }


    function DisplayAllItems(props) {
        const [numRealItems, setNumRealItems] = useState()
        const [search, setSearch] = useState("")
       
        let searching = ""

        const onSearchChange = (event) => {
            searching = event.target.value

        }

        const OnSearchSubmit = (e) => {
            e.preventDefault()
            setSearch(searching)
        }



        const bootAllItems = () =>{
            var data = {
                body: {
                    address: window.localStorage.getItem("walletAddress"),
                }
            }
            var url = "/getItems"
            API.post('serverv2',  url, data).then((response) => {
                console.log(response)
                setNumRealItems({
                    "names": response.names,
                    "descriptions": response.descriptions,
                    "images": response.image,
                    "ids": response.ids,
                    "prices": response.prices,
                    "scores": response.scores
                })
            })
        }

        useEffect(()=> {
           
            bootAllItems()
           
        }, [setNumRealItems])
        //name={numRealItems?.names[k]} description={numRealItems?.descriptions[k]} image={numRealItems?.images[k]}
        //name={numRealItems?.names} description={numRealItems?.descriptions} image={numRealItems?.images}
        return (
            <div>
                <form class="d-flex" onSubmit={OnSearchSubmit}>
                <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={onSearchChange}/>
                <button class="btn btn-outline-success" type="submit">Search</button>
            </form>
                {numRealItems ? Array.from({ length: numRealItems?.ids?.length }, (_, k) => search ? numRealItems?.names[k].toLowerCase().includes(search) ?(<BasicLoadItem id={parseInt(numRealItems?.ids[k])} device_id={props.device_id} score={numRealItems?.scores[k]} price={parseFloat((numRealItems?.prices[k]/100000) / (1 - 0.029) + 4.6).toFixed(2)} name={numRealItems?.names[k]} description={numRealItems?.descriptions[k]} image={numRealItems?.images[k]} />  ) : "" : (<BasicLoadItem id={parseInt(numRealItems?.ids[k])} score={numRealItems?.scores[k]} device_id={props.device_id} price={parseFloat((numRealItems?.prices[k]/100000) / (1 - 0.029) + 4.6).toFixed(2)} name={numRealItems?.names[k]} description={numRealItems?.descriptions[k]} image={numRealItems?.images[k]} />  )) : <div style={{paddingLeft: 40 + "%"}}><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>Account loading...</h5></div>}
            </div>
        )
    }

    useEffect(() => {
            const contract = getContract(props.signer, DDSABI, props.contracts.dds)
            setdds(contract)
        
    }, [setdds])

    const return_to_home = () => {
        props.setDisplay(false)
    } //0x3190b9754f22dd2b0514feff6bd299ee7514c777 0x0FcB03b5C04AC603680921ac9B1894D0919a767F
    //<br />
    //<input class="form-control" type="number" placeholder="Number of day to send the Item" onChange={onItemDaysChange}/>    
    /**  <div>
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
                            </div> <input type="submit" class="btn btn-warning" value="add" />*/
    return(
        <div class="itemsaccount">
            <button type="button" class="btn-close" aria-label="Close" onClick={() => {return_to_home()}} style={{"float":"right"}}></button>
             <div class="container">
                <div class="row">
                    <div class="col">
                    <h1>{window.localStorage.getItem("language") == "fr" ? "Ajouter des items" : "Manage your Items"}</h1>
                    <button class="btn btn-primary" onClick={() => {displayCreateForm()}}>{window.localStorage.getItem("language") == "fr" ? "Ajouter un nouvel item" : "Create a new item"}</button>
                        {displayItemCreator ? (
                        <form class="test1" onSubmit={createReal}>                              
                            <div class="mb-3">
                                <label for="formFile" class="form-label">{window.localStorage.getItem("language") == "fr" ? "Image de l'item" : "Image of the item"}</label>
                                <input class="form-control" type="file" accept='image/png, image/jpeg' id="formFile" onChange={onImageChange}/>
                            </div>
                            <br />
                            <input class="form-control" type="text" placeholder="Name" onChange={onNameChange}/>    
                            <br />  
                            <input class="form-control" type="text" placeholder="Description" onChange={onDescriptionChange}/>    
                            <br />
                            <input class="form-control" type="text" placeholder="Quantity" onChange={onScoreChange}/>    
                            <br />
                            <input class="form-control" type="number" placeholder="Price of the Item (in $)" onChange={onItemPriceChange}/>    
                            <br />
                            <p>{window.localStorage.getItem("language") == "fr" ? "*Prix en dollars canadiens (CAD)" : "*Price in Canadian Dollars (CAD)"}</p>
                            
                            
                            <br />
                            <div class="form-floating">
                                <select onChange={onChangeTags} class="form-select" id="floatingSelect" aria-label="Floating label select example">
                                    <option selected>{window.localStorage.getItem("language") == "fr" ? "Catégorie" : "Categorize your digital item"} </option>
                                    {Array.from({ length: tags_list.length }, (_, k) => <option value={k} >{tags_list[k]}</option> )}
                                    
                                  
                                </select>
                                <label for="floatingSelect">Tag</label>
                            </div>
                            <br />
                          
                            <input type="submit" class="btn btn-primary" value="Submit" /> 
                                                            
                        </form>) : ""}
                        
                    </div>
                    <div class="col">
                        <h1>{window.localStorage.getItem("language") == "fr" ? "Commande en ligne à compléter" : "Orders to complete"}</h1>
                        <button class="btn btn-primary" onClick={() => {displayProoverForm()}}>{window.localStorage.getItem("language") == "fr" ? "Voir les commandes" : "See orders"}</button>
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
                <div class="row">
                        {displayItemCreator || displayProover ? "" : <DisplayAllItems device_id={props.device_id} /> }

                </div>
            </div>
           
        </div>
    )
}

export default ItemsAccount;