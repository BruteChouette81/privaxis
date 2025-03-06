const axios = require('axios');
const { DateTime } = require('luxon'); // You can use Luxon for better date handling

const oldAccessToken = ''; // Replace with the actual old access token
const oldHeaders = {
    'Square-Version': '2023-07-26',
    'Authorization': `Bearer ${oldAccessToken}`,
    'Content-Type': 'application/json',
};

const accessToken = 'EAAAlnDI3enkFLK0vaVLsFnlZAwi5K2aqAqnrMG_d_vBzyGR13Rh04Ik8lNSH9Py';
const headers = {
    'Square-Version': '2023-07-26',
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
};

const baseUrl = 'https://connect.squareup.com/v2';
const key = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNjhjNmRmZi1mOGRmLTQzNzUtYjA5Ny1mMTNmNDk0OTk3ODIiLCJlbWFpbCI6ImhiYXJpbDFAaWNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2ODFmYTNmZThmY2JmZTI5OTJmZSIsInNjb3BlZEtleVNlY3JldCI6IjcxOGRhMWFjMTRkZmNmMjVjMzM2YmZlYTI0MWUzODU2M2U1ZjJjOWNjOGJkNzdiY2RlMWE1OTY4YWQ4ZWJmNmEiLCJpYXQiOjE2ODUyODk0NDZ9.dheuwiicVcI3mM7yMo9voga4Bis7nDu7g5TJocC_xkc"


//items

async function fetchItems() {
    const itemsUrl = `${baseUrl}/catalog/list`;
    const imagesUrl = `${baseUrl}/catalog/list?types=image`;
    let items = [];
    let images = [];
    let cursor = null;

    while (true) {
        try {
            const params = cursor ? { cursor: cursor } : {};
            const response1 = await axios.get(itemsUrl, { headers: headers, params: params });
            const response2 = await axios.get(imagesUrl, { headers: headers, params: params });

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
    
    // Alternatively, if `file` is a buffer or a file object directly, you can do:
    // form.append('file', file);

    const headers = {
        ...form.getHeaders(),
        "Authorization": key, // Replace `key` with your actual authorization key
    };

    try {
        const response = await axios.post(url, form, { headers: headers });
        return response.data;
    } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        throw error;
    }
}

async function loadItems() {
    console.log("DEBUG: Fetching Items and Images");
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
                const response = await axios.get(`https://connect.squareup.com/v2/inventory/${itemData.variations[0].id}`, { headers: headers });
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

    console.log("DEBUG: Processing Images");
    for (const image of images) {
        const imageData = image.image_data || {};
        if (imageData.url) {
            try {
                const response = await axios.get(imageData.url, { responseType: 'arraybuffer' });
                
                const ipfsHash = await listNewImage(response.data, '');

                const price = prices[images.indexOf(image)];
                const fee = parseFloat((price * 0.029 + 4.6).toFixed(2));

                const mintUrl = 'https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/oracleMint';
                const body1 = {
                    address: "0x3190b9754f22dd2b0514feff6bd299ee7514c777",
                    uri: `https://ipfs.io/ipfs/${ipfsHash.IpfsHash}`,
                    MaxPrice: parseFloat((price - fee).toFixed(2)),
                    numDays: 10,
                    mintingAddress: "0x666f393A06285c3Ec10895D4092d9Dc86aeFD45b",
                    ddsAddress: "0xa244B3e1e6Bd2ccf1D226F3E269D0Af88Ef86CEE",
                };

                const responseMint = await axios.post(mintUrl, body1);
                const mintData = responseMint.data;

                const cloudUrl = 'https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/listItem';
                const body2 = {
                    address: "0x3190b9754f22dd2b0514feff6bd299ee7514c777",
                    itemid: parseInt(mintData.hex, 16),
                    name: names[images.indexOf(image)],
                    score: scores[images.indexOf(image)],
                    tag: categories[images.indexOf(image)],
                    price: parseInt((price - fee).toFixed(2) * 100000),
                    description: descriptions[images.indexOf(image)],
                    image: `https://ipfs.io/ipfs/${ipfsHash.IpfsHash}`,
                };

                const responseCloud = await axios.post(cloudUrl, body2);
                responses.push(responseCloud.data);
            } catch (error) {
                console.error("Error processing image or minting:", error);
            }
        }
    }

    console.log("DEBUG logs: ", responses);
    console.log("DEBUG: Finished (code 0)");
}


//sales

async function loadSalesData() {
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
            const response = await axios.get(paymentUrl, { headers: oldHeaders });
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
          email: req.body.email,
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



//giftcards

async function fetchGiftCards() {
    let giftCards = [];
    let cursor = null;

    while (true) {
        try {
            const giftCardsUrl = `${baseUrl}/gift-cards?cursor=${cursor}`;
            const response = await axios.get(giftCardsUrl, { headers: headers });
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
        const response = await axios.post(url, data, { headers: headers });
        return response.data;
    } catch (error) {
        console.error("Error creating gift card:", error.response ? error.response.data : error.message);
        throw error;
    }
}



//shopify migration: 

//items
//https://shopify.dev/docs/api/admin-graphql/2024-10/queries/products?language=cURL
// Shopify credentials
const SHOPIFY_STORE_URL = 'your-store-name.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = 'your-access-token';

// Base URL for Shopify API
const SHOPIFY_API_URL = `https://${SHOPIFY_STORE_URL}/admin/api/2023-10/products.json`;

// Function to fetch products from Shopify
async function fetchProducts() {
    try {
        const response = await axios.get(SHOPIFY_API_URL, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            }
        });
        return response.data.products;
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return [];
    }
}

// Main function to fetch products and save their images
async function saveProductImages() {
    let names = [];
  let descriptions = [];
  let categories = [];
  let categoryIndex = {};
  let prices = [];
  let scores = [];
  let responses = [];
    const products = await fetchProducts();

    for (const product of products) {
        console.log(`Processing product: ${product.title}`);
        const image = product.media.nodes.preview.image.url; //use media.first

        const response = await nfetch(image, { responseType: 'arraybuffer' });
              
        const ipfsHash = await listNewImage(response.data, '');
        const name = product.title
        const score = product.totalInventory
        const description = product.description
        const category = product.tags[0]
        const price = product.priceRangeV2.maxVariantPrice.amount;
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
            name: name,
            score: score,
            tag: category,
            price: parseInt((price - fee).toFixed(2) * 100000),
            description: description,
            image: `https://ipfs.io/ipfs/${ipfsHash.IpfsHash}`,
        };

        const responseCloud = await nfetch(cloudUrl, {body:body2});
        responses.push(responseCloud.data);
    }

    console.log('All images have been downloaded.');
}

//sales

// Base URL for Shopify Orders API
const SHOPIFY_ORDERS_URL = `https://${SHOPIFY_STORE_URL}/admin/api/2023-10/orders.json`;

// Function to fetch orders from Shopify
async function fetchOrders(email) {
    try {
        let dataLastYear = Array(12).fill(0);
        let moneyLastYear = Array(12).fill(0);
        const response = await axios.get(SHOPIFY_ORDERS_URL, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            },
            params: {
                status: 'any', // Fetch orders with any status (open, closed, or cancelled)
                limit: 250     // Fetch up to 250 orders per request (API maximum)
            }
        });

        response.data.orders.forEach(sale => {
            const date = DateTime.fromISO(sale.closed_at);
            const month = date.month;
            dataLastYear[month - 1] += 1;
            moneyLastYear[month - 1] += sale.currentTotalPriceSet.presentmentMoney.amount;
        });
        dataLastYear = response.data.orders
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
    
      
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        return [];
    }
}

//gift cards

// Base URL for Shopify Gift Cards API
const SHOPIFY_GIFT_CARDS_URL = `https://${SHOPIFY_STORE_URL}/admin/api/2023-10/gift_cards.json`;

// Function to fetch gift cards from Shopify
async function fetchGiftCards() {
    try {
        const response = await axios.get(SHOPIFY_GIFT_CARDS_URL, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            },
            params: {
                limit: 250, // Fetch up to 250 gift cards per request
                status: 'enabled' // Fetch only enabled gift cards (optional)
            }
        });
        return response.data.gift_cards;
    } catch (error) {
        console.error('Error fetching gift cards:', error.message);
        return [];
    }
}

const NEW_SHOPIFY_STORE_URL = 'new-store-name.myshopify.com';
const NEW_SHOPIFY_ACCESS_TOKEN = 'new-access-token';

// Base URL for Shopify Gift Cards API
const SHOPIFY_GIFT_CARD_CREATE_URL = `https://${NEW_SHOPIFY_STORE_URL}/admin/api/2023-10/gift_cards.json`;

// Function to create a gift card
async function createGiftCard(giftCardData) {
    try {
        const response = await axios.post(
            SHOPIFY_GIFT_CARD_CREATE_URL,
            {
                gift_card: {
                    initial_value: giftCardData.initial_value,
                    balance: giftCardData.balance,
                    note: giftCardData.note || `Migrated from old account`,
                    expires_on: giftCardData.expires_on || null
                }
            },
            {
                headers: {
                    'X-Shopify-Access-Token': NEW_SHOPIFY_ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`Gift card created with ID: ${response.data.gift_card.id}`);
    } catch (error) {
        console.error(`Error creating gift card: ${giftCardData.id}`, error.message);
    }
}


async function migrateGiftCard() {
    const gift_cards = await fetchGiftCards()
    for (const gift_card in gift_cards) {
        const amount = gift_card.balance
        const gan = gift_card.customer.email

        createGiftCard(amount, gan)

        
    }
}
