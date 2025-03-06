/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express')
//const jsdom = require("jsdom");
//const { JSDOM } = jsdom;
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
//const fs = require("fs");
const busboy = require('connect-busboy');
//const database = require("./database.json");
//const pricedata = require("./price.json"); //10dayPrice - pricedata
//const Moralis = require("moralis-v1/node"); // /node in v1
const Moralis = require("moralis").default; // new moralis v2
//import Moralis from 'moralis';

const AWS = require('aws-sdk');
const nfetch = require('node-fetch')
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken');
const AES = require('crypto-js/aes')
const enc = require('crypto-js/enc-utf8.js')
const crypto = require("crypto");

const forge = require('node-forge');

const {ethers} = require('ethers')

const { shopify_app_secret } = require('./apikeyStorer.js')

const secretsManager = new AWS.SecretsManager();

async function getSecretKey() {
    try {
        const data = await secretsManager.getSecretValue({ SecretId: 'privatekey2' }).promise();
        if ('SecretString' in data) {
            const secret = JSON.parse(data.SecretString);
            return secret.privatekey;
        }
        throw new Error('Secret not found in SecretString');
    } catch (error) {
        console.error('Error retrieving secret:', error);
        throw error;
    }
}

async function getApikey() {
  try {
      const data = await secretsManager.getSecretValue({ SecretId: 'apikey' }).promise();
      if ('SecretString' in data) {
          const secret = JSON.parse(data.SecretString);
          return secret.apikey;
      }
      throw new Error('Secret not found in SecretString');
  } catch (error) {
      console.error('Error retrieving secret:', error);
      throw error;
  }
}

async function verifyShopifyWebhook(req) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const shopKey =  await getApikey()
  const generatedHmac = crypto
      .createHmac('sha256', shopKey)
      .update(JSON.stringify(req.body))
      .digest('base64');

  return hmac === generatedHmac;
}

function convertBase64ToPEM(base64Key) {
  return `-----BEGIN PUBLIC KEY-----\n${base64Key.match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;
}

function encryptWithPublicKey(publicKey, secret) {
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);

    // Encrypt message
    const encrypted = publicKeyObj.encrypt(secret, "RSA-OAEP", {
        md: forge.md.sha256.create(),
    });
    return forge.util.encode64(encrypted)
}

//const schedule = require('node-schedule');

/* Moralis information to start server (hide at release) */
/*
const serverUrl = "https://a7p1zeaqvdrv.usemoralis.com:2053/server";
const appId = "N4rINlnVecuzRFow0ONUpOWeSXDQwuErGQYikyte";
const masterKey = "ctP77IRXmuuWvPaubv7OZVvMNk4M9lmbZoqX7heB";
*/

//import Moralis from 'moralis';


async function getProofData(topic) {
  try {
    await Moralis.start({
      apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImUxYTlmOGQ4LWYwNGUtNGY5Yi1hYjBkLWEwNTZlZTc5NzNjNSIsIm9yZ0lkIjoiMjI3NTYzIiwidXNlcklkIjoiMjI4MDc5IiwidHlwZUlkIjoiNzFhYWJmNjEtMzNjMi00MjMxLTgwMzAtOGQxZDA0OWMzMmVkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODg1NzkyMDQsImV4cCI6NDg0NDMzOTIwNH0.nBgu238SNYZ3XvLwpKkTIoM6qZ5ZLj4LtomEr03tHro"
    });

    const abi = {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "itemId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "indexed": true,
        "name": "nft",
        "type": "address",
        "internalType": "address"
      },
      {
        "indexed": false,
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "indexed": true,
        "name": "seller",
        "type": "address",
        "internalType": "address"
      },
      {
        "indexed": false,
        "name": "proof",
        "type": "string",
        "internalType": "string"
      }
    ],
    "name": "Prooved",
    "type": "event",
  }

    const response = await Moralis.EvmApi.events.getContractEvents({
      "chain": "0x5",
      "topic": topic,
      "address": "0x1d1db5570832b24b91f4703a52f25d1422ca86de",
      "abi": abi
    });

    console.log(response.raw);

    return response.raw;
  } catch (e) {
    console.error(e);
  }
}
const apiKey = "9GnfDHnyN7W9ptwQiXbWiOk5qPoJJQUDNMhgio8INcbhTspaTtBIRbWyoUFTTxsk" // migration to moralis v2
const chain = "0x5"; //change for arbitrum
const dynamodb = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();
let priceName = "pricedata-dev"
let tableName = "pricedata2-dev";
let ItemName = "itemdb-dev"
// helper function for Moralis api

//get a token live price
async function getLivePrice() {
  await Moralis.start({ apiKey: apiKey, });

  const options = {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    chain: chain,
  };
  
  const price = await Moralis.EvmApi.token.getTokenPrice(options);
  return price
}


//get a list of all user's transactions
async function getTransList(address) {
  await Moralis.start({ apiKey: apiKey, });


  const options = {
    address: address,
    from_block: "0",
  };
  const transfers = await Moralis.EvmApi.token.getTokenTransfers(options);
  return transfers
}


//get block number (historical)
const fetchDateToPrice = async (somedate, price) => {
  await Moralis.start({ apiKey: apiKey, });
  const options = { chain: chain, date: somedate};
  const date = await Moralis.EvmApi.block.getDateToBlock(options);
  price = await hitoricalFetchPrice(date["block"], price)
  return price
};


//get the price for a particular block
const hitoricalFetchPrice = async (block, price) => {
  await Moralis.start({ apiKey: apiKey, });
  const options = {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      chain: chain,
      to_block: block

  };
  const tokenprice = await Moralis.EvmApi.token.getTokenPrice(options);
  price.push(tokenprice["usdPrice"])
  return price
};


//function to get the price for the past X days
async function getInfofordays(numdays) {
  await Moralis.start({ apiKey: apiKey, });
  var price = []

  const getfordays = async (numdays) => {
    let date0 = new Date();
    let date1 = new Date(date0)
    for (let i = 0; i < numdays; i++) {
        date1.setDate(date1.getDate() - 1)
        
        price = await fetchDateToPrice(date1, price)
    }
  
  }

  await getfordays(numdays);
  return price
}

async function getNftByWallet(address) {
  await Moralis.start({ apiKey: apiKey, });
  const option = {
    address,
    chain
  }

  const nft = await Moralis.EvmApi.nft.getWalletNFTs(option)
  return nft.toJSON() //.result
}

async function getMetaData(address, tokenId) {
  await Moralis.start({ apiKey: apiKey, });
  const option = {
    address,
    chain,
    tokenId
  }

  const meta = await Moralis.EvmApi.nft.getNFTMetadata(option)
  return meta.toJSON() //.metadata
}


//save information to json database
function saveInfo(price, mesure) {
  const params = {
    TableName: priceName,
    Key: {
      id: 0, //val
    },
    ExpressionAttributeNames: { '#price10day': 'price10day' },
    ExpressionAttributeValues: {},
    ReturnValues: 'UPDATED_NEW',
  };
  params.UpdateExpression = 'SET '
  params.ExpressionAttributeValues[':price10day'] = price;
  params.UpdateExpression += '#price10day = :price10day, ';
  try {
    dynamodb.update(params, (error, result) => {
      if (error) {
        console.log(error.message);
      }
      else {
        return result
      }
    });
  } catch (error) {
    return error
  }
  

  /*
  if(mesure == 10) {
    pricedata[0].price10days = price
  }
  

  fs.writeFile('server/price.json', JSON.stringify(pricedata), err => {
      if (err) {
        throw err
      }

  });
  */
}


//getInfofordays(10).then(res => {
// 
//})


async function NumDaysInvest(address, creditAddress) {
  var translist = await getTransList(address)
  var rTranslist = translist.result.reverse()
  var creditTrans = []
  var res = []
  
  //loop to get num transaction
  for(let i=0; i < rTranslist.length; i++) {
    if(rTranslist[i].address == creditAddress) {
      creditTrans.push(rTranslist[i].block_timestamp)
    }
  }

  //calculate the profite since 
  var date = new Date(creditTrans[0])
  let fprice = await fetchDateToPrice(date, [])
  let lprice = await getLivePrice()

  var profit = ((lprice['usdPrice'] / fprice[0]) * 100) - 100

  res[0] = creditTrans[0]
  res[1] = creditTrans.length;
  res[2] = profit;
  return res

}


async function calculateMoney(numToken) {
  lprice = await getLivePrice()
  var money = (numToken * lprice['usdPrice'])
  return money
}

// express server 
// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())
app.use(busboy())

// Enable CORS for all methods

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

const possible_bg = ["blue", "red", "green", "aqua", "purple"]
const possible_img = ["blue", "red", "green", "aqua", "purple"]

app.post('/connection', (req, res) => {
  const data = req.body;
  //var exist = 0;
  console.log(data.privatekey)

  
  let params = {
      TableName: tableName,
      Key: {
        users: data.address
      }
    }
    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        if(result.Item) {
          res.json({ bg: result.Item.bg, img: result.Item.img, cust_img: result.Item.cust_img, name: result.Item.name, friend: result.Item.friend, request: result.Item.request, privatekey: result.Item.walletkey, description: result.Item.description, pay: result.Item.payment, realPurchase: result.Item.realPurchase, level: result.Item.level})
        }
        else {
          console.log("[DEBUG -connection] new user added: " + data.address)
          var newbg = possible_bg[Math.floor(Math.random() * possible_bg.length)]
          var newimg =  possible_img[Math.floor(Math.random() * possible_img.length)]

          let create_params = {
            TableName: tableName,
            Item: {
              walletkey: data.privatekey, //if metamask profile, set as "" else set as real PK
              users: data.address,
              name: data.address, //default username store is the address
              bg: newbg,
              img: newimg,
              cust_img: false,
              friend: [],
              request: [],
              description: "",
              level: 0, //set as basic
              payment: [],
              realPurchase: [],
              device_id: ""
            }
          }
          console.log(create_params)

          dynamodb.put(create_params, (error, result) => {
            if (error) {
              res.json({error: error.message});
            } else {
              console.log(result)
              res.json({bg: newbg, img: newimg, cust_img: false, name: data.address});
          }})
        }

        
        

      }
    })



    
  /*
  for (let i = 0; i < database.length; i++) {
    if(database[i].address == data.address) {
      console.log("[DEBUG -connection] already a user...")
      var bg = database[i].bg
      var img = database[i].img
      var cust_img = database[i].cust_img

      res.json({bg: bg, img: img, cust_img: cust_img});
      exist = 1;
      break;
    }
  }
  

  if(exist == 0){
    
  

    
    let newuser = {
      address: data.address,
      bg: newbg,
      img: newimg,
      cust_img: false
    }
    database.push(newuser);

    fs.writeFile('amplify/backend/functions/mylambda/src/database.json', JSON.stringify(database), err => {
        if (err) {
          throw err
        }

    });

    console.log(newuser)
    
        
    //res.json({bg: newbg, img: newimg, cust_img: false});
    */
    
});

const provider = new ethers.InfuraProvider("sepolia")

app.post("/partnerConnection", async (req, res) => {
  const data = req.body;
  //var exist = 0;
  //console.log(data.email)

  if (data.seamless) {
    const token = data.token.split(" ")[1];

    try {
      let apikey = await getApikey()
      
        // Decode the Shopify JWT
        const decoded = jwt.verify(token, apikey, { algorithms: ["HS256"] });
        if ( decoded.dest.split(".")[1] == "myshopify" ) {
          let params = {
            TableName: "partnerlogin",
            Key: {
              email: data.email
            }
          }
          dynamodb.get(params, async (error, result) => {
            if (error) {
              console.log(error)
              //res.json({ statusCode: 500, error: error.message })
            } else {
              
              let secretKey = await getSecretKey()
              let poolWallet = new ethers.Wallet(secretKey, provider)
              const poolPublicKey =  new ethers.SigningKey(poolWallet.privateKey)
              
              let sharedSecret = poolPublicKey.computeSharedSecret(result.Item.publickey)
              sharedSecret = sharedSecret.toString().replace("0x04", "")
              sharedSecret = "0x" + sharedSecret.slice(0, -64)
              let finalmessage = AES.decrypt(result.Item.password.toString(), sharedSecret)

              console.log(enc.stringify(finalmessage))

              const encryptedFinalMessage = encryptWithPublicKey(data.publicKey, enc.stringify(finalmessage))

              res.json({ password: encryptedFinalMessage, bg: result.Item.bg, img: result.Item.img, name: result.Item.name, address: result.Item.address, publickey: result.Item.publickey, website: result.Item.website, dds: result.Item.dds, device_id: result.Item.device_id, partner_api_access: result.Item.partner_api_access, tier: result.Item.tier, transfer_data: result.Item.transfer_data})
              }
          })
        } else {
          res.status(401).json({ error: "Invalid token" });
        }
  
        //const shopDomain = decoded.dest.replace("https://", ""); // Get store URL
        //const merchantEmail = decoded.email; // Get merchant email from the token


        // data.email //got from localstorage when user signed in

        
        // Generate a session for the user (e.g., set a cookie or return a token)
        //const sessionToken = jwt.sign({ shop: shopDomain, email: merchantEmail }, "YOUR_SECRET_KEY", { expiresIn: "1h" });

    } catch (error) {
        console.log(error)
        res.status(401).json({ error: "Invalid token" });
    }

  } else {

  
  let params = {
      TableName: "partnerlogin",
      Key: {
        email: data.email
      }
    }
    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        if(result.Item) {
          if(result.Item.password==data.password) {
            res.json({ bg: result.Item.bg, img: result.Item.img, cust_img: result.Item.cust_img, name: result.Item.name, address: result.Item.address, publickey: result.Item.publickey, website: result.Item.website, dds: result.Item.dds, device_id: result.Item.device_id, partner_api_access: result.Item.partner_api_access, tier: result.Item.tier, transfer_data: result.Item.transfer_data})
          } else {
            if (data.shopify) {
              res.json({ address: result.Item.address, dds: result.Item.dds, publickey: result.Item.publickey})
            } else {
              res.send("error, bad password")
            }
            
          }
          
        }
        else {
          console.log("[DEBUG -connection] new user added: " + data.email)
          var newbg = possible_bg[Math.floor(Math.random() * possible_bg.length)]
          var newimg =  possible_img[Math.floor(Math.random() * possible_img.length)]

          let create_params = {
            TableName: "partnerlogin",
            Item: {
              email: data.email, //if metamask profile, set as "" else set as real PK
              password: data.password,
              name: data.name,
              address: data.address, //default username store is the address
              bg: newbg,
              img: newimg,
              cust_img: false,
              dds: data.dds,
              partner_api_access: data.api_access,
              device_id: "",
              transfer_data: [],
              website: data.website,
              tier: data.tier,
              publickey: data.publickey
            }
          }
          console.log(create_params)

          dynamodb.put(create_params, (error, result) => {
            if (error) {
              res.json({error: error.message});
            } else {
              console.log(result)
              res.json({bg: newbg, img: newimg, cust_img: false, name: data.name});
          }})
        }

        
        

      }
    })
  }
})

async function deleteUserByWebsite(website) {
  try {
      // Step 1: Retrieve the user by username using the GSI
      const queryParams = {
          TableName: "partnerlogin",
          IndexName: "website-index", 
          KeyConditionExpression: "#webiste = :websiteValue",
          ExpressionAttributeNames: {
              "#website": "website"
          },
          ExpressionAttributeValues: {
              ":usernameValue": website
          }
      };

      const queryResult = await dynamodb.query(queryParams).promise();

      if (queryResult.Items.length === 0) {
          console.log("User not found");
          return 0;
      }

      const user = queryResult.Items[0]; // Assuming username is unique

      // Step 2: Delete the user using the primary key (email, id)
      const deleteParams = {
          TableName: "partnerlogin",
          Key: {
              "email": user.email,
          }
      };

      await dynamodb.delete(deleteParams).promise();
      console.log(`Client ${website} deleted successfully`);
      return 1

  } catch (error) {
      console.error("Error deleting user:", error);
      return 0
  }
}

app.post('/webhooksRedact', async (req, res) => {
  if (!verifyShopifyWebhook(req)) {
      return res.status(401).send('Unauthorized');
  }

  if (req.body.customer) {
    res.status(200).send('No customner data!');
  }

  const { shop_id, shop_domain } = req.body;
  console.log(`Deleting data for shop: ${shop_id}`);
  const response = await deleteUserByWebsite(shop_domain)
  if (response == 1) {
    res.status(200).send('Data deleted');
  } else {
    res.status(404).send('Data not found');
  }
});

app.put("/uploadFile", (req, res) => {
  
  if (req.body.is_cust) {
    const params = {
      TableName: tableName,
      Key: {
        users: req.body.account
      }
    }

    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        //see if the user already have a custom image
        if (result.Item.cust_img != true) {
          //if no cust_img, set the property to true 
          const params = {
            TableName: tableName,
            Key: {
              users: req.body.account
            },
            //ExpressionAttributeNames: { '#cust_img': 'cust_img' },
            ExpressionAttributeValues: {},
            ReturnValues: 'UPDATED_NEW',
          };
          params.UpdateExpression = 'SET '
          params.ExpressionAttributeValues[':cust_img'] = true;
          params.UpdateExpression += 'cust_img = :cust_img';
          dynamodb.update(params, (error, result) => {
            if (error) {
              console.log(error.message);
            }
          });
        }
        else {
          console.log("already a custom image")
        }
        

      }
    })
    
  }
  //set background
  if (req.body.background) {
    if (req.body.background != "") {
      const backparams = {
          TableName: tableName,
          Key: {
            users: req.body.account,
          },
          //ExpressionAttributeNames: { '#bg': 'bg' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
      };
      backparams.UpdateExpression = 'SET '
      backparams.ExpressionAttributeValues[':bg'] = req.body.background;
      backparams.UpdateExpression += 'bg = :bg'

      dynamodb.update(backparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: backparams})
          }
          else {
            res.send("done")
          }
      });
      
    }
  }
  //update the name of an account
  if (req.body.name) {
    if (req.body.name != "") {
      const nameparams = {
        TableName: tableName,
        Key: {
          users: req.body.account,
        },
        ExpressionAttributeNames: { '#nm': 'name' },
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW',
    };
    nameparams.UpdateExpression = 'SET '
    nameparams.ExpressionAttributeValues[':name'] = req.body.name;
    nameparams.UpdateExpression += '#nm = :name'

    dynamodb.update(nameparams, (error, result) => {
        if (error) {
          console.log(error.message);
          res.json({error: error.message, params: nameparams})
        }
        else {
          res.send("done")
        }
    });
     
    }
  
  }

  if (req.body.description) {
    if (req.body.description != "") {
      const nameparams = {
        TableName: tableName,
        Key: {
          users: req.body.account,
        },
        ExpressionAttributeNames: { '#ds': 'description' },
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW',
      };
      nameparams.UpdateExpression = 'SET '
      nameparams.ExpressionAttributeValues[':description'] = req.body.description;
      nameparams.UpdateExpression += '#ds = :description'

      dynamodb.update(nameparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: nameparams})
          }
          else {
            res.send("done")
          }
      });
     
    }
  }
  if (req.body.level) {
    if (req.body.level != "") {
      const nameparams = {
        TableName: tableName,
        Key: {
          users: req.body.account,
        },
        ExpressionAttributeNames: { '#lv': 'level' },  //0: basic, 1: premium, 2: expert, 3: verify
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW',
      };
      nameparams.UpdateExpression = 'SET '
      nameparams.ExpressionAttributeValues[':level'] = req.body.level;
      nameparams.UpdateExpression += '#lv = :level'

      dynamodb.update(nameparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: nameparams})
          }
          else {
            res.send("done")
          }
      });
     
    }
  }

  if (req.body.pay) {
    if (req.body.pay != []) { //["card", "date", "cvv"]
      const params = {
        TableName: tableName,
        Key: {
          users: req.body.account
        }
      }
  
      dynamodb.get(params, (error, result) => { //get payment method
        if (error) {
          console.log(error)
          //res.json({ statusCode: 500, error: error.message })
        } else {
          if(result.Item.payment) {
            let newPay = []
            newPay = result.Item.payment // new payment
            newPay.push(req.body.pay)
            const payparams = {
              TableName: tableName,
              Key: {
                users: req.body.account,
              },
              ExpressionAttributeNames: { '#py': 'payment' },
              ExpressionAttributeValues: {},
              ReturnValues: 'UPDATED_NEW',
            };
            payparams.UpdateExpression = 'SET '
            payparams.ExpressionAttributeValues[':payment'] = newPay;
            payparams.UpdateExpression += '#py = :payment'

            dynamodb.update(payparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: payparams})
                }
                else {
                  res.send("done")
                }
            });
          }
          else{
            let newPay = [req.body.pay]
            const payparams = {
              TableName: tableName,
              Key: {
                users: req.body.account,
              },
              ExpressionAttributeNames: { '#py': 'payment' },
              ExpressionAttributeValues: {},
              ReturnValues: 'UPDATED_NEW',
            };
            payparams.UpdateExpression = 'SET '
            payparams.ExpressionAttributeValues[':payment'] = newPay;
            payparams.UpdateExpression += '#py = :payment'

            dynamodb.update(payparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: payparams})
                }
                else {
                  res.send("done")
                }
            });
          }
          
        }
      })
     
    }
  }
  if (req.body.realPurchase) {
    if (req.body.realPurchase != []) { //["NFTaddress", itemID]
      const params = {
        TableName: tableName,
        Key: {
          users: req.body.account
        }
      }
  
      dynamodb.get(params, (error, result) => { //get payment method
        if (error) {
          console.log(error)
          //res.json({ statusCode: 500, error: error.message })
        } else {
          if(result.Item.realPurchase) {
            let newReal = []
            newReal = result.Item.realPurchase // new payment
            newReal.push(req.body.realPurchase)
            const payparams = {
              TableName: tableName,
              Key: {
                users: req.body.account,
              },
              ExpressionAttributeNames: { '#rp': 'realPurchase' },
              ExpressionAttributeValues: {},
              ReturnValues: 'UPDATED_NEW',
            };
            payparams.UpdateExpression = 'SET '
            payparams.ExpressionAttributeValues[':realPurchase'] = newReal;
            payparams.UpdateExpression += '#rp = :realPurchase'

            dynamodb.update(payparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: payparams})
                }
                else {
                  res.send("done")
                }
            });
          }
          else{
            let newReal = [req.body.realPurchase]
            const payparams = {
              TableName: tableName,
              Key: {
                users: req.body.account,
              },
              ExpressionAttributeNames: { '#rp': 'realPurchase' },
              ExpressionAttributeValues: {},
              ReturnValues: 'UPDATED_NEW',
            };
            payparams.UpdateExpression = 'SET '
            payparams.ExpressionAttributeValues[':realPurchase'] = newReal;
            payparams.UpdateExpression += '#rp = :realPurchase'

            dynamodb.update(payparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: payparams})
                }
                else {
                  res.send("done")
                }
            });
          }
          
        }
      })
     
    }
  }
  if (req.body.transfer_data) {
    
    const transferparams = {
      TableName: "partnerlogin",
      Key: {
        email: req.body.email,
      },
      ExpressionAttributeNames: { '#td': 'transfer_data' },
      ExpressionAttributeValues: {},
      ReturnValues: 'UPDATED_NEW',
    };
    payparams.UpdateExpression = 'SET '
    payparams.ExpressionAttributeValues[':transferData'] = req.body.transfer_data;
    payparams.UpdateExpression += '#td = :transferData'

    dynamodb.update(transferparams, (error, result) => {
        if (error) {
          console.log(error.message);
          res.json({error: error.message, params: transferparams})
        }
        else {
          res.send("done")
        }
    });

  }
  if (req.body.square_access) {
    
    const transferparams = {
      TableName: "partnerlogin",
      Key: {
        email: req.body.email,
      },
      ExpressionAttributeNames: { '#paa': 'partner_api_access' },
      ExpressionAttributeValues: {},
      ReturnValues: 'UPDATED_NEW',
    };
    payparams.UpdateExpression = 'SET '
    payparams.ExpressionAttributeValues[':partnerApiAccess'] = req.body.square_access;
    payparams.UpdateExpression += '#paa = :partnerApiAccess'

    dynamodb.update(transferparams, (error, result) => {
        if (error) {
          console.log(error.message);
          res.json({error: error.message, params: transferparams})
        }
        else {
          res.send("done")
        }
    });

  } if (req.body.website) {
    
    const transferparams = {
      TableName: "partnerlogin",
      Key: {
        email: req.body.email,
      },
      ExpressionAttributeNames: { '#wb': 'website' },
      ExpressionAttributeValues: {},
      ReturnValues: 'UPDATED_NEW',
    };
    payparams.UpdateExpression = 'SET '
    payparams.ExpressionAttributeValues[':website'] = req.body.website;
    payparams.UpdateExpression += '#wb = :website'

    dynamodb.update(transferparams, (error, result) => {
        if (error) {
          console.log(error.message);
          res.json({error: error.message, params: transferparams})
        }
        else {
          res.send("done")
        }
    });

  }
  
  
})

app.get("/livePrice", (req, res) => {
  getLivePrice().then( lprice => {
    res.json({lprice: lprice['usdPrice']})
  })
  
})


app.get("/historicalPrice", (req, res) => {
  let params = {
    TableName: priceName,
    Key: {
      id: 0
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      res.json({ hprice: result.Item.price10day }) //.10dayPrice
    }
  });
  
});

app.post("/liveMoney", (req, res) => {
  calculateMoney(req.body.numToken).then( money => {
    res.json({ money: money });
  }
  )
});

app.post("/timeInvest", (req, res) => {
  console.log(req.body)
  const data = req.body

  NumDaysInvest(data.address, data.tokenAddress).then( results => {
    res.json({ timeInvest: results[0], numTrans: results[1], profit: results[2]})
  })
  
})

//listing an item using the api
//params: address, itemid, name

//address: {
//  itemid: [] //all items that an account has listed
//  name: [] //all names corresponding for each new listed item
//}



app.post("/listItem", (req, res) => {
  let params = {
    TableName: ItemName,
    Key: {
      address: req.body.address
    }
  }

  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      if(result.Item) {
        let newItem = []
        newItem = result.Item.itemid // new id
        newItem.push(req.body.itemid)
        let newName = []
        newName = result.Item.name // new name
        newName.push(req.body.name)
        let newScore = []
        newScore = result.Item.score //new score
        newScore.push(req.body.score)
        let newTag = []
        newTag = result.Item.tag //new tag for item
        newTag.push(req.body.tag)
        let newDescription = []
        newDescription = result.Item.description //new description for item
        newDescription.push(req.body.description)
        let newImage = []
        newImage = result.Item.images //new image for item
        newImage.push(req.body.image)
        
        const newItems_params = {
          TableName: ItemName,
          Key: {
            address: req.body.address,
          },
          ExpressionAttributeNames: { '#nm': 'name' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        newItems_params.UpdateExpression = 'SET '
        newItems_params.ExpressionAttributeValues[':itemid'] = newItem;
        newItems_params.UpdateExpression += 'itemid = :itemid, '
        newItems_params.ExpressionAttributeValues[':name'] = newName;
        newItems_params.UpdateExpression += '#nm = :name, '
        newItems_params.ExpressionAttributeValues[':score'] = newScore;
        newItems_params.UpdateExpression += 'score = :score, '
        newItems_params.ExpressionAttributeValues[':tag'] = newTag;
        newItems_params.UpdateExpression += 'tag = :tag, '
        newItems_params.ExpressionAttributeValues[':description'] = newDescription;
        newItems_params.UpdateExpression += 'description = :description, '
        newItems_params.ExpressionAttributeValues[':images'] = newImage;
        newItems_params.UpdateExpression += 'images = :images'

        dynamodb.update(newItems_params, (error, result) => {
            if (error) {
              console.log(error.message);
              res.json({error: error.message, params: newItems_params})
            }
            else {
              res.send("success")
            }
        });
      }
      else {
        //if no items are listed yet, create the first
        let list_params = {
          TableName: ItemName,
          Item: {
            address: req.body.address,
            itemid: [req.body.itemid], //list of item ids
            name: [req.body.name], //list of names
            score: [req.body.score],  //list of score for different item id 
            tag: [req.body.tag],
            description: [req.body.description],
            images: [req.body.image]
          }
        }
      
        dynamodb.put(list_params, (error, result) => {
          if (error) {
            res.json({error: error.message});
          } else {
            res.json({itemid: result});
        }})
      }
    }
  });
  
})

app.post("/getItems", (req, res) => {
  let params = {
    TableName: ItemName,
    Key: {
      address: req.body.address
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      if(result.Item) {
        res.json({ ids: result.Item.itemid, names: result.Item.name, scores: result.Item.score, tags: result.Item.tag, descriptions: result.Item.description, image: result.Item.images}) //multiple itemids
      }
      else{
        res.send("bruh")
      }
    }
  });
})

app.post("/updateScore", (req, res) => {
  let params = {
    TableName: ItemName,
    Key: {
      address: req.body.address
    }
  }

  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
        const itemId = result.Item.itemid
        const oldScore = result.Item.score //list of all scores
        var newScore = oldScore //copy that list

        for (var i = 0; i < itemId.length; i++) { //loop over itemId
          if(req.body.itemid === itemId[i]) {
            newScore[i] = (oldScore[i] + 1) //add one to the partiular score
          }
        }
        

        const newItems_params = {
          TableName: ItemName,
          Key: {
            address: req.body.address,
          },
          ExpressionAttributeNames: { '#sc': 'score' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        newItems_params.UpdateExpression = 'SET '
        newItems_params.ExpressionAttributeValues[':score'] = newScore;
        newItems_params.UpdateExpression += '#sc = :score'

        dynamodb.update(newItems_params, (error, result) => {
            if (error) {
              console.log(error.message);
              res.json({error: error.message, params: newItems_params})
            }
            else {
              res.send("success")
            }
        });
      }
  })
})


//request the friendship of another acount
//params: requested, sender
app.post("/requestFriend", (req, res) => {
  let params = {
    TableName: tableName,
    Key: {
      users: req.body.requested
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      let alreadyRequested = false
      let newarray = []
      newarray = result.Item.request
      console.log(newarray)
      for (let i=0; i<=newarray.length; i++){
        if (newarray[i] === req.body.sender) {
          alreadyRequested = true;
        }
      }
      if (alreadyRequested) {
        res.send("already requested")
      }
      else {
        newarray.push(req.body.sender)
        console.log(newarray)
  
        let postparams = { //load the database of the dude you want to be friend with
          TableName: tableName,
          Key: {
            users: req.body.requested,
          },
          ExpressionAttributeNames: { '#rq': 'request' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        postparams.UpdateExpression = 'SET '
        postparams.ExpressionAttributeValues[':request'] = newarray;
        postparams.UpdateExpression += '#rq = :request'
  
        dynamodb.update(postparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: postparams})
          }
          else {
            res.send("success")
          }
        });
      }
     
    }
  })
})

//accept a friend request
//params: address, accepted, is_accepeted
app.post("/acceptFriend", (req, res) => {
  //first get old request list and delete the accepted
  //second, if the accepted is really accepted, add him to the address friend list
  //else, return 
  //once the accepted is on the address friend list, 
  //update the accepted friend list so they create a friendship
  let params = {
    TableName: tableName,
    Key: {
      users: req.body.address
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
        let oldFriendList = []
        oldFriendList = result.Item.friend
        let oldRequestList = []
        oldRequestList = result.Item.request
        let newRequestList = []
        newRequestList = oldRequestList.filter(e => e !== req.body.accepted) //remove the guy who is accepted
        let postparams = { //load the database of the dude you want to be friend with
          TableName: tableName,
          Key: {
            users: req.body.address,
          },
          ExpressionAttributeNames: { '#rq': 'request' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        postparams.UpdateExpression = 'SET '
        postparams.ExpressionAttributeValues[':request'] = newRequestList; //remove your address from there
        postparams.UpdateExpression += '#rq = :request'
  
        dynamodb.update(postparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: postparams})
          }
          else {
            //if the accepeted is successfully removed, add him to your friend list
            if (req.body.is_accepted) {
              
              oldFriendList.push(req.body.accepted) //add the guy who is accepted

              let friendparams = { //load the database of the dude you want to be friend with
                TableName: tableName,
                Key: {
                  users: req.body.address,
                },
                ExpressionAttributeNames: { '#fr': 'friend' },
                ExpressionAttributeValues: {},
                ReturnValues: 'UPDATED_NEW',
              };
              friendparams.UpdateExpression = 'SET '
              friendparams.ExpressionAttributeValues[':friend'] = oldFriendList;
              friendparams.UpdateExpression += '#fr = :friend'

              dynamodb.update(friendparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: friendparams})
                }
                else {
                  //update the friend list for the guy who is accepted
                  let params2 = {
                    TableName: tableName,
                    Key: {
                      users: req.body.accepted
                    }
                  }
                  dynamodb.get(params2, (error, result) => {
                    if (error) {
                      res.json({ statusCode: 500, error: error.message });
                    } else {
                      let oldFriendList2 = []
                      oldFriendList2 = result.Item.friend
                      oldFriendList2.push(req.body.address) //add the guy who is accepting 

                      let friendparams2 = { //load the database of the dude you want to be friend with
                        TableName: tableName,
                        Key: {
                          users: req.body.accepted,
                        },
                        ExpressionAttributeNames: { '#fr': 'friend' },
                        ExpressionAttributeValues: {},
                        ReturnValues: 'UPDATED_NEW',
                      };
                      friendparams2.UpdateExpression = 'SET '
                      friendparams2.ExpressionAttributeValues[':friend'] = oldFriendList2;
                      friendparams2.UpdateExpression += '#fr = :friend'

                      dynamodb.update(friendparams2, (error, result) => {
                        if (error) {
                          console.log(error.message);
                          res.json({error: error.message, params: friendparams2})
                        }
                        else {
                          res.send("New Friendship!")
                        }
                      })
                    }

                  })
                }
              })
            }
            else {
              res.send("successfully deleted")
            }
          }
        });

    } 

  })
  

})

//delete a friend
//params: address, unwanted
app.post("/manageFriend", (req, res) => {
  let params = {
    TableName: tableName,
    Key: {
      users: req.body.address
    }
  }

  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      let oldFriendList = []
      oldFriendList = result.Item.friend
      oldFriendList.filter(e => e !== req.body.unwanted) //remove the unwanted friend

      let friendparams = { //load the database of the dude you want to be friend with
        TableName: tableName,
        Key: {
          users: req.body.address,
        },
        ExpressionAttributeNames: { '#fr': 'friend' },
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW',
      };
      friendparams.UpdateExpression = 'SET '
      friendparams.ExpressionAttributeValues[':friend'] = oldFriendList;
      friendparams.UpdateExpression += '#fr = :friend'

      dynamodb.update(friendparams, (error, result) => {
        if (error) {
          console.log(error.message);
          res.json({error: error.message, params: friendparams})
        }
        else {
          res.send("successfully deleted unwanted friend.")
        }
      })
    }
  })

})

app.post("/updateWebsite", async(req,res)=> {
  //const bucketName = '';
  const key = 'index.html'; // file name in the root level
  

  const params = {
      Bucket: req.body.bucketName,
      Key: key,
      Body: req.body.html,
      ContentType: 'text/html'
  };

  try {
      const data = await s3.putObject(params).promise();
      console.log('File uploaded successfully', data);

      // Invalidate the CloudFront cache
      const invalidationParams = {
        DistributionId: req.body.distributionId,
        InvalidationBatch: {
            CallerReference: `my-invalidation-${Date.now()}`,
            Paths: {
                Quantity: 1,
                Items: [`/${key}`] // Specify the path(s) to invalidate
            }
        }
    };

    const invalidationData = await cloudfront.createInvalidation(invalidationParams).promise();
    console.log('Invalidation created successfully', invalidationData);
      res.json({
          statusCode: 200,
          body: JSON.stringify('File uploaded successfully'),
      });
  } catch (err) {
      console.error('Error uploading file', err);
      res.send("error")
  }
})

//handler to get metadata of a listed nft
app.post("/metadata", async(req, res) => {
  try {
    const meta = await getMetaData(req.body.address, req.body.tokenid)
    res.json(meta)

  } catch(error) {
    console.log(error)
    res.send("error code - 332")
  }
  
})

//handler to get all nfts from a user
app.post("/nftbyaddress", async(req, res) => {
  try {
    console.log(req.body.address)
    const meta = await getNftByWallet(req.body.address)
    res.json(meta) //result.metadata

  } catch(error) {
    console.log(error)
    res.send("error code - 332")
  }
  
})

app.post("/getproofdata", async(req, res) => {
  try {
    console.log(req.body.topic)
    const response = await getProofData(req.body.topic)
    res.json(response) //result.metadata

  } catch(error) {
    console.log(error)
    res.send("error code - 332")
  }
  
})

app.post("/getcode", async(req, res) => {
  console.log(req.body)
  console.log(req.body.data)
 
  nfetch(req.body.url, req.body.data).then((response) => {
    console.log(response)
    response.json().then((jsonres) => {
      console.log(jsonres)
      res.json(jsonres)
    })

  }
  )
  
})


//webhook 1
app.post("/connectterminal", (req, res) => {
  //webhook
  /**{
      "merchant_id": "7NZR58EPNGNPC",
      "location_id": "AR63EC48VXVBN",
      "type": "device.code.paired",
      "event_id": "84ccdb8a-da90-4b14-b6b0-c5a5abbccfe6",
      "created_at": "2020-04-10T14:41:58.036Z",
      "data": {
        "type": "device_code",
        "id": "05NK80TRSC2ZF",
        "object": {
          "device_code": {
            "code": "ABCDEF",
            "created_at": "2020-04-10T14:41:20.000Z",
            "device_id": "907CS13101300122",
            "id": "05NK80TRSC2ZF",
            "location_id": "AR63EC48VXVBN",
            "name": "Terminal API Device created on Apr 10, 2020",
            "paired_at": "2020-04-10T14:41:50.000Z",
            "product_type": "TERMINAL_API",
            "status": "PAIRED",
            "status_changed_at": "2020-04-10T14:41:50.000Z"
          }
        }
      }
    } */
  //save this
  console.log(req.body.data.device_code.device_id)
  const backparams = {
    TableName:  "partnerlogin",
    Key: {
      email: "elizbeth71@yahoo.ca",
    },
    //ExpressionAttributeNames: { '#bg': 'bg' },
    ExpressionAttributeValues: {},
    ReturnValues: 'UPDATED_NEW',
    };
    backparams.UpdateExpression = 'SET '
    backparams.ExpressionAttributeValues[':device_id'] = req.body.data.device_code.device_id;
    backparams.UpdateExpression += 'device_id = :device_id'

    dynamodb.update(backparams, (error, result) => {
        if (error) {
          console.log(error.message);
          res.json({error: error.message, params: backparams})
        }
        else {
          res.send("done")
        }
    });
})

//webhook 2:
app.post("/checkoutUpdate", (req, res) => {
  //webhook
  /**{
  "merchant_id": "7NZR58EPNGNPC",
  "type": "terminal.checkout.updated",
  "event_id": "1c3ef831-670d-4f4c-b59c-f0bb2d2fc872",
  "created_at": "2020-04-10T14:44:06.039Z",
  "data": {
    "type": "checkout",
    "id": "dhgENdnFOPXqO",
    "object": {
      "checkout": {
        "amount_money": {
          "amount": 111,
          "currency": "USD"
        },
        "app_id": "sq0idp-734Md5EcFjFmwpaR0Snm6g",
        "created_at": "2020-04-10T14:43:55.262Z",
        "deadline_duration": "PT5M",
        "device_options": {
          "device_id": "907CS13101300122",
          "skip_receipt_screen": false,
          "tip_settings": {
            "allow_tipping": false
          }
        },
        "id": "dhgENdnFOPXqO",
        "note": "A simple note",
        "payment_ids": [
          "dgzrZTeIeVuOGwYgekoTHsPouaB"
        ],
        "reference_id": "id72709",
        "status": "COMPLETED",
        "updated_at": "2020-04-10T14:44:06.039Z"
      }
    }
  }
} */
  //save this
  if (req.body.data.status == "COMPLETED") { // update inventory
    console.log(req.body)
    let params = {
      TableName:  ItemName,
      Key: {
        address: "0x3190b9754f22dd2b0514feff6bd299ee7514c777"
      }
    }
    dynamodb.get(params, (error, result) => {
      if (error) {
        res.json({ statusCode: 500, error: error.message });
      } else {
          const itemId = result.Item.itemid
          const oldScore = result.Item.score //list of all scores
          var newScore = oldScore  //copy that list
          //var newIds = itemId
  
          for (var i = 0; i < itemId.length; i++) { //loop over itemId
            if(parseInt(req.body.data.note) === itemId[i]) {
              newScore[i] = (oldScore[i]-1)
              
            }
          }
          
  
          const newItems_params = {
            TableName: ItemName,
            Key: {
              address: "0x3190b9754f22dd2b0514feff6bd299ee7514c777",
            },
            ExpressionAttributeNames: { '#sc': 'score' },
            ExpressionAttributeValues: {},
            ReturnValues: 'UPDATED_NEW',
          };
          newItems_params.UpdateExpression = 'SET '
          newItems_params.ExpressionAttributeValues[':score'] = newScore;
          newItems_params.UpdateExpression += '#sc = :score'
          
  
          dynamodb.update(newItems_params, (error, result) => {
              if (error) {
                console.log(error.message);
                //res.json({error: error.message, params: newItems_params})
              }
              else {
                console.log("success")
              }
          });
        }
    })

  }
  
  
})

app.post('/oauthCallbackShopify', async (req, res) => {
  const authorizationCode = req.body.code;

  if (req.body.itemCallback) {
    let params = {
      TableName: "partnerlogin",
      Key: {
        email: req.body.email
      }
    }
    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        if(result.Item) {
          console.log(req.body)
          let lineItems = []
          if (req.body.variantId.includes(",")) {
            for (let i=0;i<req.body.variantId.split(",").length;i++) {
              lineItems.push({ "variantId": req.body.variantId.split(",")[i], "quantity": parseInt(req.body.quantities.split(",")[i]) })
           }
          } else {
            lineItems.push({ "variantId": req.body.variantId, "quantity": parseInt(req.body.quantities) })
          } //{ "variantId": req.body.variantId, "quantity": 1 } //add "gid://shopify/ProductVariant/ to variant id 
      fetch(`https://${req.body.store}/admin/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': `${result.Item.partner_api_access}` //.access_token
        },
        body: JSON.stringify({
    "query": "mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) { orderCreate(order: $order, options: $options) { userErrors { field message } order { id note lineItems(first:5) { nodes { variant { id } quantity } } } } }",
        "variables": {
            "order": {
                //email: 'customer@example.com',
                "lineItems": lineItems,
                "financialStatus": "PAID",
                "note": req.body.note
            }
        }})
    }).then( async (response) => {
      //unfullfilled order

      const order = await response.json()
      res.json({id: order})
    })
  }}})
} else if (req.body.loadOrder) {
  //load order by id
  let params = {
    TableName: "partnerlogin",
    Key: {
      email: req.body.email
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      console.log(error)
      //res.json({ statusCode: 500, error: error.message })
    } else {
      if(result.Item) {
    fetch(`https://${req.body.store}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': `${result.Item.partner_api_access}` //.access_token
      },
      body: JSON.stringify({
   "query": "query { order(id: \""+ "gid://shopify/Order/" + req.body.id + "\") { confirmed } }"
      })
  }).then( async (response) => {
    //unfullfilled order

    const order = await response.json()
    res.json({confirmed: order.data.order.confirmed})
  })
}}})

  } else if (req.body.loadByStore) {
    //console.log(req.body)
    let params = {
      TableName: "partnerlogin",
      Key: {
        email: req.body.email
      }
    }
    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        if(result.Item) {
      fetch(`https://${req.body.store}/admin/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': `${result.Item.partner_api_access}` //.access_token
        },
        body: JSON.stringify({
    "query": "query { orders(first: 10, query: \"updated_at:>2024-12-01\") { edges { node { id name note fulfillments { order { displayFulfillmentStatus } } } } } }"})
  }).then( async (response) => {
    //unfullfilled order
    
    const orders = await response.json()
    //console.log(orders)
    res.json({orders: orders.data.orders.edges})
  })}}})

  } else if (req.body.giftCard) {
    let params = {
      TableName: "partnerlogin",
      Key: {
        email: req.body.email
      }
    }
    dynamodb.get(params, async (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        if(result.Item) {

    const query = {
      "query": "query { giftCards(first: 10, query: \"status:enabled\") { edges { node { id enabled balance { amount } maskedCode } } } }"
    }
  
      try {
          const response = await fetch(`https://${req.body.store}/api/2023-10/graphql.json`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Storefront-Access-Token': result.Item.partner_api_access,
              },
              body: JSON.stringify(query),
          });
  
          const data = await response.json();

          const giftCafdList = data.data.giftCards.edges
          let stop = false;
          //check gift card
          for (let i =0; i<giftCafdList.length; i++) {
            if (giftCafdList[i].node.maskedCode.slice(-4) == req.body.id.slice(-4)) {
              if (giftCafdList[i].node.enabled) {
                const balance = parseFloat(giftCafdList[i].node.balance.amount);
                let remainingBalance = req.body.totalAmount - balance;
                const query2 = {
                  "query": "mutation giftCardDebit($id: ID!, $debitInput: GiftCardDebitInput!) { giftCardDebit(id: $id, debitInput: $debitInput) { giftCardDebitTransaction { id amount { amount currencyCode } giftCard { id balance { amount currencyCode } } } userErrors { message field code } } }",
                  "variables": {
                    "id": giftCafdList[i].node.id,
                    "debitInput": {
                      "debitAmount": {
                        "amount": remainingBalance<0 ? req.body.totalAmount : balance,
                        "currencyCode": "CAD"
                      },
                    
                    }
                  }
                }
                const response2 = await fetch(`https://${req.body.store}/api/2023-10/graphql.json`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token':  result.Item.partner_api_access,
                  },
                  body: JSON.stringify(query2),
                });
            
                const data2 = await response2.json();

                if (remainingBalance<0) {
                  res.json({
                    message: data2.giftCardDebit.giftCardDebitTransaction.id,
                    status: 'paid',
                })
                } else {
                  res.json({
                    message: data2.giftCardDebit.giftCardDebitTransaction.id,
                    status: 'partially_paid',
                    remainingBalance: remainingBalance,
                })
                }
                stop=true //break
              }
              

            } else {
              if (i==giftCafdList.length && !stop) { //last iteration and gift card not found
                res.json({ message: 'Gift card not found or invalid.', status: 'error' })
              }
            }
          }
      } catch (error) {
          console.error(error);
          return { message: 'An error occurred while processing the payment.', status: 'error' };
      }
    }}})
  
  } else if (req.body.validate){
    let params = {
      TableName: "partnerlogin",
      Key: {
        email: req.body.email
      }
    }
    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        if(result.Item) {
        const query = {"query": "query { appInstallation { activeSubscriptions { name status lineItems { id plan { pricingDetails { ... on AppRecurringPricing { price { amount } } } } } } } }"}
         
        fetch(`https://${req.body.store}/admin/api/2024-10/graphql.json`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': `${result.Item.partner_api_access}` //.access_token
          },
          body: JSON.stringify({query})
      }).then( async (response) => {
        //unfullfilled order

        const plan = await response.json()
        res.json({plan: plan.data.appInstallation.activeSubscriptions}) //list of active subs
      })
  }}})

  }
  else {

  try {
    fetch(`https://${req.body.shop}/admin/oauth/access_token?client_id=${req.body.clientId}&client_secret=${req.body.clientSecret}&code=${authorizationCode}`, {
      method: 'POST',
    }).then( async (response) => {
      console.log(response)

      const accessToken = await response.json()
      console.log(accessToken)
      
      // Save the access token securely, e.g., in a database
      console.log('Access Token:', accessToken.access_token);

      res.json({'access_token': accessToken.access_token})

      // get storefront access token
      /*fetch(`https://${req.body.shop}/admin/api/2024-10/graphql.json`, {
        method: 'POST',
        body: JSON.stringify({
          "query": "mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) { storefrontAccessTokenCreate(input: $input) { userErrors { field message } shop { id } storefrontAccessToken { accessScopes { handle } accessToken title } } }",
           "variables": {
              "input": {
                "title": "CPL Access Token"
              }
            }
          }),
   
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken.access_token,
        },
      
      }).then( async (response2) => {
        console.log(response2)
        const storefrontToken = await response2.json()
        console.log(storefrontToken)
        res.json({'access_token': storefrontToken.storefrontAccessTokenCreate.storefrontAccessToken.accessToken})
      })*/
  
      //res.redirect('/success');
      
    })

   
  } catch (error) {
    console.error('Error exchanging authorization code for access token:', error);
    res.status(500).send('Something went wrong');
  }}
});

app.post('/oauthCallback', async (req, res) => {
  const authorizationCode = req.body.code;
  const headers = {
    'Square-Version': '2025-02-20',
    'Authorization': `Bearer EAAAlnDI3enkFLK0vaVLsFnlZAwi5K2aqAqnrMG_d_vBzyGR13Rh04Ik8lNSH9Py`, //remove
    'Content-Type': 'application/json',
  };

  try {
    fetch('https://connect.squareup.com/oauth2/token', {
      method: 'POST',
      headers: headers,
      body:  JSON.stringify({
        client_id: req.body.clientId,
        client_secret: req.body.clientSecret,
        code: authorizationCode,
        grant_type: 'authorization_code',
        
      })
    }).then( async (response) => {
      console.log(response)

      const accessToken = await response.json()
      console.log(accessToken)
      
      // Save the access token securely, e.g., in a database
      console.log('Access Token:', accessToken.access_token);

      //use the sites api
     
      fetch('https://connect.squareup.com/v2/sites', {
        method: 'GET',
        headers: {
          'Square-Version': '2025-02-20',
          'Authorization': `Bearer ${accessToken.access_token}`, //access token ?
          'Content-Type': 'application/json',
        }})
      }).then( async (response) => {
        const content = "<button onClick={()=>{window.location.replace('https://privaxis.ca')}}>Buy<button>"

        fetch(`https://connect.squareup.com/v2/sites/${response.sites[0].id}/snippet`, {
          method: 'POST',
          headers: {
            'Square-Version': '2025-02-20',
            'Authorization': `Bearer ${accessToken.access_token}`, //access token ?
            'Content-Type': 'application/json',
          },
          body:  JSON.stringify({
           snippet: {
              content: content,
            }
            
          })
        }).then( async (response) => {
          res.json({'access_token': accessToken.access_token})
      })

      //inject the snippet to square site
  
      //res.redirect('/success');
      
    })

   
  } catch (error) {
    console.error('Error exchanging authorization code for access token:', error);
    res.status(500).send('Something went wrong');
  }
});


//square tools for 3 types of actions: transfer sales data, transfer Items data (copy inventory) and transfer gift cards (balance and gan)
app.post('/squareTools', async (req, res) => {
    async function loadSalesData(key, email) {
      const headers = {
        'Square-Version': '2023-07-26',
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
    };
      let dataLastYear = Array(12).fill(0);
      let moneyLastYear = Array(12).fill(0);

      // Specify the date range (last 12 months)
      const beginTime = '2023-08-01T19:34:33.524Z';
      const endTime = '2024-08-01T19:34:33.524Z';

      let sales = [];
      let cursor = null;

      while (true) {
          try {
              const paymentUrl = `${baseUrl}/payments?cursor=${cursor}&begin_time=${beginTime}&end_time=${endTime}`;
              const response = await nfetch(paymentUrl, {method: "POST",
                headers: headers});
              const responseData = response.data;
              sales = [...sales, ...responseData.payments];
              cursor = responseData.cursor;

              if (!cursor) break;
          } catch (error) {
              console.error("Error fetching sales data:", error);
              break;
          }
      }

      sales.forEach(sale => {
          const date = DateTime.fromISO(sale.updated_at);
          const month = date.month;
          dataLastYear[month - 1] += 1;
          moneyLastYear[month - 1] += sale.amount_money.amount;
      });

      const transferparams = {
          TableName: "partnerlogin",
          Key: {
            email: email,
          },
          ExpressionAttributeNames: { '#td': 'transfer_data' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        payparams.UpdateExpression = 'SET '
        payparams.ExpressionAttributeValues[':transferData'] = [dataLastYear, moneyLastYear];
        payparams.UpdateExpression += '#td = :transferData'
    
        dynamodb.update(transferparams, (error, result) => {
            if (error) {
              console.log(error.message);
              res.json({error: error.message, params: transferparams})
            }
            else {
              res.send("done")
            }
        });

      return { dataLastYear, moneyLastYear };
  }

  async function fetchGiftCards(key) {
    const headers = {
      'Square-Version': '2023-07-26',
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
  };
    let giftCards = [];
    let cursor = null;

    while (true) {
        try {
            const giftCardsUrl = `${baseUrl}/gift-cards?cursor=${cursor}`;
            const response = await nfetch(giftCardsUrl, { headers: headers });
            const responseData = response.data;

            giftCards = [...giftCards, ...responseData.gift_cards];

            cursor = responseData.cursor;
            if (!cursor) break;
        } catch (error) {
            console.error("Error fetching gift cards:", error);
            break;
        }
    }

    return giftCards;
}

async function createGiftCard(type, amount, gan) {
  let key =''
  const headers = {
    'Square-Version': '2023-07-26',
    'Authorization': `Bearer ${key}`, //cpl app key
    'Content-Type': 'application/json',
};
    const url = `${baseUrl}/gift-cards`;
    const data = {
        idempotency_key: gan,
        type: type,
        balance_money: {
            amount: amount,
            currency: 'CAD' // Replace with the appropriate currency if needed
        },
        gan: gan
    };

    try {
        const response = await nfetch(url, data, { headers: headers });
        return response.data;
    } catch (error) {
        console.error("Error creating gift card:", error.response ? error.response.data : error.message);
        throw error;
    }
}
async function fetchItems(key) {
  const headers = {
    'Square-Version': '2023-07-26',
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
};
  const itemsUrl = `${baseUrl}/catalog/list`;
  const imagesUrl = `${baseUrl}/catalog/list?types=image`;
  let items = [];
  let images = [];
  let cursor = null;

  while (true) {
      try {
          const params = cursor ? { cursor: cursor } : {};
          const response1 = await nfetch(itemsUrl, { headers: headers, params: params });
          const response2 = await nfetch(imagesUrl, { headers: headers, params: params });

          items = [...items, ...response1.data.objects];
          images = [...images, ...response2.data.objects];

          cursor = response1.data.cursor;
          if (!cursor) break;
      } catch (error) {
          console.error("Error fetching items:", error);
          break;
      }
  }
  return { items, images };
}

async function listNewImage(file, name) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const form = new FormData();
  
  // If the file is a file path
  form.append('file', file); //fs.createReadStream(filePath)
  let key =''
  
  // Alternatively, if `file` is a buffer or a file object directly, you can do:
  // form.append('file', file);

  const headers = {
      ...form.getHeaders(),
      "Authorization": key, // Replace `key` with your actual authorization key
  };

  try {
      const response = await nfetch(url, { headers: headers, body: form });
      return response.data;
  } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      throw error;
  }
}

async function loadItems(key, address) {
  console.log("DEBUG: Fetching Items and Images");
  const headers = {
    'Square-Version': '2023-07-26',
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
};
  const { items, images } = await fetchItems(); // Assuming `fetchItems` is an async function in Node.js

  let names = [];
  let descriptions = [];
  let categories = [];
  let categoryIndex = {};
  let prices = [];
  let scores = [];
  let responses = [];

  console.log("DEBUG: Processing Categories");
  items.forEach(item => {
      const categoryData = item.category_data;
      if (categoryData) {
          if (!categoryIndex[categoryData.name]) {
              categoryIndex[item.id] = categoryData.name;
          }
      }
  });

  console.log("DEBUG: Processing Items");
  for (const item of items) {
      const itemData = item.item_data || {};
      if (itemData.name) {
          names.push(itemData.name);
          try {
              const response = await nfetch(`https://connect.squareup.com/v2/inventory/${itemData.variations[0].id}`, { headers: headers });
              const res = response.data;
              scores.push(parseInt(res.counts[0].quantity, 10));
          } catch (error) {
              console.error("Error fetching inventory:", error);
          }
      }
      if (itemData.description) {
          descriptions.push(itemData.description);
      }
      if (itemData.category_id) {
          categories.push(categoryIndex[itemData.category_id]);
      }
      if (itemData.variations) {
          prices.push(itemData.variations[0].item_variation_data.price_money.amount / 100);
      }
  }

  let last_id = 0

  console.log("DEBUG: Processing Images");
  for (const image of images) {
      const imageData = image.image_data || {};
      if (imageData.url) {
          try {
              const response = await nfetch(imageData.url, { responseType: 'arraybuffer' });
              
              const ipfsHash = await listNewImage(response.data, '');

              const price = prices[images.indexOf(image)];
              const fee = parseFloat((price * 0.029 + 4.6).toFixed(2));

              if (!last_id) {
                //pull the last id
              }

             /* const mintUrl = 'https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/oracleMint';
              const body1 = {
                  address: address,
                  uri: `https://ipfs.io/ipfs/${ipfsHash.IpfsHash}`,
                  MaxPrice: parseFloat((price - fee).toFixed(2)),
                  numDays: 10,
                  mintingAddress: "0x666f393A06285c3Ec10895D4092d9Dc86aeFD45b",
                  ddsAddress: "0xa244B3e1e6Bd2ccf1D226F3E269D0Af88Ef86CEE",
              };

              const responseMint = await nfetch(mintUrl, {body:body1});
              const mintData = responseMint.data;*/

              const cloudUrl = 'https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/listItem';
              const body2 = {
                  address: address,
                  itemid: parseInt(mintData.hex, 16),
                  name: names[images.indexOf(image)],
                  score: scores[images.indexOf(image)],
                  tag: categories[images.indexOf(image)],
                  price: parseInt((price - fee).toFixed(2) * 100000),
                  description: descriptions[images.indexOf(image)],
                  image: `https://ipfs.io/ipfs/${ipfsHash.IpfsHash}`,
              };

              const responseCloud = await nfetch(cloudUrl, {body:body2});
              responses.push(responseCloud.data);
              last_id+=1
          } catch (error) {
              console.error("Error processing image or minting:", error);
          }
      }
  }

  console.log("DEBUG logs: ", responses);
  console.log("DEBUG: Finished (code 0)");
}

  if (req.body.type === "sales") {
    let salesData = await loadSalesData()
    console.log(salesData)
    res.send("success")

  } else if (req.body.type === "giftCards") {
    let giftCards = await fetchGiftCards(req.body.key)
    //upload them to our square app (one day delete them and replace with our decentralized gift cards)
    for (let i=0;i<giftCards.length; i++) {
      let newGiftCard = createGiftCard(giftCards[i].type, giftCards[i].balance_money.amount, giftCards[i].gan)
    }
    res.send("success")
  } else if (req.body.type === "items") {
   await loadItems(req.body.key, req.body.address)
  }

  //all tested square tools
})




app.post("/get-website", async(req, res) => {
  const puppeteer = require("puppeteer-core");
  const chromium = require("@sparticuz/chromium");

  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    defaultViewport: chromium.defaultViewport,
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
  });
  const page = await browser.newPage();
  
  // Navigate to the URL
  await page.goto(req.body.url, { waitUntil: 'networkidle2' });
  
  // Capture the content of the page
  const htmlString = await page.content();
  
  await browser.close();
  res.json({"dom":htmlString}) 
  
 
 
 
 
  /*nfetch(req.body.file).then((res) => res.text()).then((text) => {
   
    //const parts2 = text.split(`<script defer="defer" src="/static/js/main.aec6b021.js"></script><link href="/static/css/main.8dcbcb75.css" rel="stylesheet">`)
    nfetch(req.body.file2).then((res) => res.text()).then((text2) => {
        nfetch(req.body.file3).then((res) => res.text()).then((text3) => {
          const dom = new JSDOM(text, { runScripts: 'dangerously' });

          // Insert the CSS into the document
          const styleElement = dom.window.document.createElement('style');
          styleElement.textContent = text3;
          dom.window.document.head.appendChild(styleElement);
        
          // Execute the JavaScript
          const scriptElement = dom.window.document.createElement('script');
          scriptElement.textContent = text2;
          dom.window.document.body.appendChild(scriptElement);
        
          // Function to wait for React to finish rendering
          function waitForReactToRender() {
              return new Promise((resolve) => {
                  const checkInterval = setInterval(() => {
                      if (dom.window.document.querySelector('#root').innerHTML.trim() !== '') {
                          clearInterval(checkInterval);
                          resolve();
                      }
                  }, 100);
              });
          }
        
          // Function to generate HTML string for a specific route
          async function generateHtmlString(route) {
              dom.window.history.pushState({}, '', route);
              await waitForReactToRender();
              return dom.window.document.documentElement.outerHTML;
          }
        
          // Example usage
          generateHtmlString(req.body.url).then((htmlString) => {
              //console.log(htmlString);
            res.json({"dom":htmlString})
              // You can save the HTML string to a file or use it as needed
              //fs.writeFileSync('output_market.html', htmlString);
          });



        })})})*/
 
 
    
  })

  function calculateAmountAutomaticTransfer(time, time_set, avg_amount_by_day, min_amount, number_of_iteration, participation_token, competitor_generates, first_participation, max_iteration, res) {  //834
    //params explained:
    //time: amount of time between withdraws
    //time_set: days, weeks, months
    //avg_amount_by_day: average amount put in the FRS by day
    //min_amount: min amount for transac to be full
    //number_of_iteration: the number of payment
    //participation_token: based on how much their participation generated, an amount of token is redistribuded to augment their generating (regive half to seller)
    

    //constants
    const avg_transac_fee = 0.0169
    const partner_fee = 0.006
    const avg_lend_rate = 0.07 //pull from aave
    const cpl_flat_fee = 0.01 + avg_transac_fee // the fee that we are always keeping

    //const competitor_fee = 0.0265

    if (time_set==="days") {
        let total_earnings = 0
        let money_awaiting = 0
        let lending_record = [] // [{"amount": 00, "time": 00}]
        if (participation_token) {
            lending_record.push({"amount": parseFloat(participation_token), "time": parseInt(time)})
        }
        for (let i=0; i<time; i++) { //loop over all days 
            money_awaiting += (avg_amount_by_day - (avg_amount_by_day*avg_transac_fee))
            if (money_awaiting >= min_amount) { //enough to activate FRS
                let percentage_of_year_lended = parseInt(time-i)/365
                let estimated_earnings = (parseFloat(money_awaiting - (money_awaiting*partner_fee)) + (parseFloat(money_awaiting - (money_awaiting*partner_fee)) * avg_lend_rate * percentage_of_year_lended))
                estimated_earnings = estimated_earnings - (estimated_earnings*partner_fee) // remove fees
                //flat_earning = parseFloat(money_awaiting - (money_awaiting*avg_transac_fee))
                if (estimated_earnings > money_awaiting) { //worth staking 
                    lending_record.push({"amount": parseFloat(money_awaiting - (money_awaiting*partner_fee)), "time": parseInt(time-i)})
                    money_awaiting = 0
                }
                
                
            }
        }
        //calculate overall worth at the end of the month 
        for (let i=0; i<lending_record.length; i++) {
            let percentage_of_year_lended = lending_record[i].time/365
            if (lending_record[i].time === time) { //if participation token, do not calculate fee on exit
                let earnings = (lending_record[i].amount + (lending_record[i].amount * avg_lend_rate * percentage_of_year_lended))
                //earnings = earnings - (earnings*partner_fee) // remove fees
                total_earnings += earnings

            } else {
                let earnings = (lending_record[i].amount + (lending_record[i].amount * avg_lend_rate * percentage_of_year_lended))
                earnings = earnings - (earnings*partner_fee) // remove fees
                total_earnings += earnings

            }
            

        }
        total_earnings += money_awaiting //add money not staked 
       // console.log("Total earnings: " + total_earnings)
       // console.log("Total volume: " + (avg_amount_by_day*time *(max_iteration-number_of_iteration)))

        let cpl_outcome = (avg_amount_by_day*time) - (avg_amount_by_day*time*cpl_flat_fee)
        //console.log(total_earnings-cpl_outcome)

        //console.log(((total_earnings-cpl_outcome)/(avg_amount_by_day*time *(max_iteration-number_of_iteration)))*100)
        //let normal_outcome = ((avg_amount_by_day*time) - (avg_amount_by_day*time*avg_transac_fee)) //max amount of money without frs
        
       

        /*let money_left_over = (total_earnings-(avg_amount_by_day*time))
        console.log(money_left_over)
        total_earnings = total_earnings-money_left_over
        total_earnings = total_earnings-cpl_outcome*/

        //let percentage_of_year_lended = parseInt(time)/365
        //let estimated_earnings = (parseFloat(money_left_over) + (parseFloat(money_left_over * avg_lend_rate * percentage_of_year_lended)))
        //console.log((avg_lend_rate * percentage_of_year_lended-0.002))

        //cpl_outcome = cpl_outcome + (money_left_over/2)//amount that grows slower than the reinvested left overs until zero
        let participation_reward = 0//parseFloat(((total_earnings-cpl_outcome) - ((max_iteration-number_of_iteration + 1) * first_participation )) * 0)// (210 - 208) * 0.5 = 1 to reinvest: 209
        //let participation_reward_reinvested = parseFloat(((total_earnings-cpl_outcome) - ((max_iteration-number_of_iteration + 1) * first_participation )) * 0.7)// (210 - 208) * 0.5 = 1 to reinvest: 209

        if (first_participation) {
           
            //console.log("merchant get paid: " + parseFloat(cpl_outcome+participation_reward))
        

            
            //console.log("Interest generated: " + parseFloat(total_earnings-normal_outcome))
            //console.log("Money left out: " +parseFloat((total_earnings-cpl_outcome)-participation_reward))
        } else {
                
            //console.log("merchant get paid: " + parseFloat(cpl_outcome))
        

            
            //console.log("Interest generated: " + parseFloat(total_earnings-normal_outcome))
            //console.log("Money left out: " +parseFloat(total_earnings-cpl_outcome))
        }
        
        
        /*let half_genrated =(total_earnings-cpl_outcome) * 0.7
        console.log(half_genrated)
        cpl_outcome = cpl_outcome
        let feepaid_cpl = (((avg_amount_by_day*time) - cpl_outcome) /(avg_amount_by_day*time)) * 100

        let outcome_competitor = (avg_amount_by_day*time) - (avg_amount_by_day*time*competitor_fee)
       // console.log("Iteration number: " + number_of_iteration)
        
        //console.log("Total earnings (competitor): " + outcome_competitor.toString())
        //console.log("total earnings (FRS): " + total_earnings.toString())
        console.log("merchant get paid: " + cpl_outcome.toString())
        //console.log("Competitor generates: " + competitor_generates)
        //console.log("FRS generates: " + (total_earnings -outcome_competitor))
        //console.log("Fee paid with cpl: " + feepaid_cpl)

        competitor_generates +=  (avg_amount_by_day*time*competitor_fee)*/

        if (number_of_iteration) {
            if (!participation_token) {
                calculateAmountAutomaticTransfer(time, time_set, avg_amount_by_day, min_amount, number_of_iteration-1, parseFloat((total_earnings-cpl_outcome)), competitor_generates, parseFloat((total_earnings-cpl_outcome)), max_iteration, res,)

            } else {
                const data = calculateAmountAutomaticTransfer(time, time_set, avg_amount_by_day, min_amount, number_of_iteration-1, parseFloat(((total_earnings-cpl_outcome)-participation_reward)), competitor_generates, first_participation, max_iteration, res) //if 50/50
                if (data) {
                  return data

                }
            }   
           
           
            
            
        } else {
          res.json({"earnings": total_earnings, "merchant_paid": ((1- (parseFloat(cpl_outcome+participation_reward)/parseFloat(time*avg_amount_by_day))) *100), "generated": parseFloat((total_earnings-cpl_outcome)-participation_reward)})
          return {"earnings": total_earnings, "merchant_paid": ((1- (parseFloat(cpl_outcome+participation_reward)/parseFloat(time*avg_amount_by_day))) *100), "generated": parseFloat((total_earnings-cpl_outcome)-participation_reward)}
            //console.log(`Total money made after ${max_iteration} month: ${parseFloat((total_earnings-cpl_outcome)-participation_reward)} \n This represents ${(parseFloat((total_earnings-cpl_outcome)-participation_reward)/parseFloat(time*avg_amount_by_day*max_iteration)) *100} % of the transactions of that time period`)
            //console.log(`The merchant paid: ${cpl_flat_fee*100} % fee at the beginning and ${(1- (parseFloat(cpl_outcome+participation_reward)/parseFloat(time*avg_amount_by_day))) *100} % at the end (- ${(cpl_flat_fee*100) -((1- (parseFloat(cpl_outcome+participation_reward)/parseFloat(time*avg_amount_by_day))) *100)} % fee) `)
        }


    } else if (time_set ==="weeks") {

    } else if (time_set === "years") {

    }
    
}

function calculateAmountxdays(time, avg_amount_by_day, min_amount, time_period) { //receive payment x days after receiving

  /**
   * every day: x $ in volume
   * fees: partner_fee of x - avg_transac_fee 
   * cpl fee: 1% of x
   * get earnings for y days - partner_fee
   * money (no earnings or as low as possible) is transfered to merchant
   * earnings make interest
   * 
   */

    const avg_transac_fee = 0.0169
    const partner_fee = 0.006
    const avg_lend_rate = 0.07 //pull from aave
    const cpl_flat_fee = 0.01 + avg_transac_fee // the fee that we are always keeping
    let owed = (avg_amount_by_day - (avg_amount_by_day*cpl_flat_fee))


    let waiting_amount = 0
    let greater = 0
    //let total_earnings = 0
    let lending_record = [] // [{"amount": 00, "time": 00}]
    //set lending record
    /*for(let i=0; i<time_period;i++) {
        waiting_amount+=(avg_amount_by_day - (avg_amount_by_day*avg_transac_fee))
        //greater +=(avg_amount_by_day - (avg_amount_by_day*cpl_flat_fee))
        
        if (waiting_amount > min_amount) {
          let percentage_of_year_lended = time/365
          let estimated_earnings = (parseFloat(waiting_amount - (waiting_amount*partner_fee)) + (parseFloat(waiting_amount - (waiting_amount*partner_fee)) * avg_lend_rate * percentage_of_year_lended))
          estimated_earnings = estimated_earnings - (estimated_earnings*partner_fee) 
          estimated_earnings+= ((estimated_earnings-owed) * avg_lend_rate * ((time_period-i)/365))
          if (estimated_earnings > waiting_amount) { //Make sure its worth it
            lending_record.push({"amount": parseFloat((waiting_amount - (waiting_amount*partner_fee))), "time": parseInt(time), "time_passed": parseInt(i)})
            waiting_amount = 0
            //greater = 0
           
          }
            
        }
    }

    //calcute generated profits
    //console.log(lending_record.length)
    for (let i=0; i<lending_record.length; i++) { //
        let percentage_of_year_lended = lending_record[i].time/365
        let earnings = (lending_record[i].amount + (lending_record[i].amount * avg_lend_rate * percentage_of_year_lended))
        earnings = earnings - (earnings*partner_fee)
        earnings+= ((earnings-owed) * avg_lend_rate * ((time_period-lending_record[i].time_passed)/365)) //apply earnings on cpl generated income
        total_earnings += earnings
    }*/
   /**f\left(x\right)=1-\frac{\left(\left(182500-\left(182500\cdot\left(n+v\right)\right)\right)+\left(\left(t\left(p-\left(vp\right)\right)\right)\left(1+r\right)^{\frac{x}{365}}-\left(t\left(p-\left(vp\right)\right)\right)\right)\right)}{182500} */
    let initial_value = (avg_amount_by_day-(avg_amount_by_day*avg_transac_fee))//-((avg_amount_by_day-(avg_amount_by_day*avg_transac_fee))*partner_fee)
    //console.log(initial_value)
    //console.log(initial_value-(initial_value*partner_fee))
    //console.log(parseInt(time))
    let fullPool = parseInt(time)*(initial_value-(initial_value*partner_fee))
    //console.log(fullPool)
    //console.log(time_period)
    //console.log(1+avg_lend_rate)
    let lendingFactor = (1+avg_lend_rate)**(parseInt(time_period)/365)
    //console.log(lendingFactor)
    let total_earnings = fullPool*lendingFactor
    //console.log(total_earnings)
    total_earnings = total_earnings - (total_earnings*partner_fee)
    total_earnings = total_earnings - (parseInt(time)*(avg_amount_by_day-(avg_amount_by_day*avg_transac_fee)))
    //console.log(total_earnings)

    //console.log("Total earnings: " + total_earnings)
    return {"earnings": total_earnings}//, "merchant_paid": parseFloat((avg_amount_by_day*time_period)-(avg_amount_by_day*time_period*cpl_flat_fee)), "generated": (total_earnings-parseFloat((avg_amount_by_day*time_period)-(avg_amount_by_day*time_period*cpl_flat_fee)))
    //console.log("Merchant receives: " + parseFloat((avg_amount_by_day*time_period)-(avg_amount_by_day*time_period*cpl_flat_fee)))
    //console.log("Made " + (total_earnings-parseFloat((avg_amount_by_day*time_period)-(avg_amount_by_day*time_period*cpl_flat_fee))) + " $ over " + time_period + " days. That represents a " + ((total_earnings-parseFloat((avg_amount_by_day*time_period)-(avg_amount_by_day*time_period*cpl_flat_fee)))/(avg_amount_by_day*time_period)*100) + "% profit.")

    

}

app.post("/calculateAlgo", (req, res) => {

  if (req.body.xdays) {
    const algo_res = calculateAmountxdays(req.body.time, req.body.avg_amount_by_day, 834, req.body.time_period) // add % redistributed
    res.json(algo_res)
  } else {
    calculateAmountAutomaticTransfer(req.body.time, "days", req.body.avg_amount_by_day, 834, req.body.number_of_iteration, 0, 0, 0, req.body.number_of_iteration, res)
    
  }

})
// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
