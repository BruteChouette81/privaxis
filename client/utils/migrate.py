#python file to extract and migrate important customer informations
# covers: items, sales history and gift cards

import pandas
import os
from datetime import datetime
import requests
#from requests import Request, Session
from tqdm import tqdm

#items: 
# Set up your Square API access token
access_token = 'EAAAlnDI3enkFLK0vaVLsFnlZAwi5K2aqAqnrMG_d_vBzyGR13Rh04Ik8lNSH9Py'
old_access_token = ''
key = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNjhjNmRmZi1mOGRmLTQzNzUtYjA5Ny1mMTNmNDk0OTk3ODIiLCJlbWFpbCI6ImhiYXJpbDFAaWNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2ODFmYTNmZThmY2JmZTI5OTJmZSIsInNjb3BlZEtleVNlY3JldCI6IjcxOGRhMWFjMTRkZmNmMjVjMzM2YmZlYTI0MWUzODU2M2U1ZjJjOWNjOGJkNzdiY2RlMWE1OTY4YWQ4ZWJmNmEiLCJpYXQiOjE2ODUyODk0NDZ9.dheuwiicVcI3mM7yMo9voga4Bis7nDu7g5TJocC_xkc"
headers = {
    'Square-Version': '2023-07-26',
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

# Base URL for Square API
base_url = 'https://connect.squareup.com/v2'

# Create a folder to save images
#image_folder = 'item_images'
#os.makedirs(image_folder, exist_ok=True)

def fetch_items():
    items_url = f'{base_url}/catalog/list'
    items = [];
    images_url = f'{base_url}/catalog/list?types=image'
    images = [];
    cursor = None

    while True:
        params = {'cursor': cursor} if cursor else {}
        response1 = requests.get(items_url, headers=headers, params=params)
        response2 = requests.get(images_url, headers=headers, params=params)
        response_data1 = response1.json()
        response_data2 = response2.json()
        
        items.extend(response_data1['objects'])
        images.extend(response_data2['objects'])
        cursor = response_data1.get('cursor')
        
        if not cursor:
            break
    
    return items, images

''' #print(file)
    
    ------WebKitFormBoundarymaRyYrhuiH8dFi83
Content-Disposition: form-data; name="file"; filename="s632364203791441578_p1289_i1_w236.png"
Content-Type: image/png


------WebKitFormBoundarymaRyYrhuiH8dFi83
Content-Disposition: form-data; name="pinataMetadata"

{"name":"test","keyvalues":{"description":"test description","tag":"Bouteilles & thermos"}}
------WebKitFormBoundarymaRyYrhuiH8dFi83
Content-Disposition: form-data; name="pinataOptions"

{"cidVersion":0}
------WebKitFormBoundarymaRyYrhuiH8dFi83--
    
    #--6a31b283c314f2bb4c1bbcb94feb6b1e\r\nContent-Disposition: form-data; name="pinataMetadata"; filename="pinataMetadata"\r\n\r\n{\n  "name": "Casse-t\xc3\xaate "Mushroom" - Cavallini & Co."\n}\r\n--6a31b283c314f2bb4c1bbcb94feb6b1e\r\nContent-Disposition: form-data; name="pinataOptions"; filename="pinataOptions"\r\n\r\n{\n  "cidVersion": "0"\n}\r\n
    payload = '--6a31b283c314f2bb4c1bbcb94feb6b1e\r\nContent-Disposition: form-data; name="file";' +  str(file) + '\r\n--6a31b283c314f2bb4c1bbcb94feb6b1e--\r\n'
    #request = Request('POST', url,headers,files = data).prepare()
    "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"\r\n\r\nreadstream\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"pinataMetadata\"\r\n\r\n{\n  \"name\": \"test.png\"\n}\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"pinataOptions\"\r\n\r\n{\n  \"cidVersion\": 1\n}\r\n-----011000010111000001101001--\r\n\r\n"
    #print(payload)

    #s = Session()
    #response = s.send(request)
    '''

def list_new_image(file, name): 
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    data = {'file': file,}
    headers = { # "Content-Type": 'multipart/form-data' #; boundary=------WebKitFormBoundarymaRyYrhuiH8dFi83
        "Authorization": key,
    }

    response = requests.post( url, files=data, headers=headers)
    return response.json()

def fetch_gift_cards():
    old_headers = {
        'Square-Version': '2023-07-26',
        'Authorization': f'Bearer {old_access_token}',
        'Content-Type': 'application/json'
    }
    gift_cards_url = f'{base_url}/gift-cards'
    gift_cards = []
    cursor = None

    while True:
        params = {'cursor': cursor} if cursor else {}
        response = requests.get(gift_cards_url, headers=old_headers, params=params)
        response_data = response.json()

        gift_cards.extend(response_data['gift_cards'])
        cursor = response_data.get('cursor')

        if not cursor:
            break

    return gift_cards

# Fetch and save gift card data


def create_gift_card(type, balance, gan):
    gift_card_url = f'{base_url}/gift-cards'
    payload = {
        'idempotency_key': gan,  # Using GAN as idempotency key for uniqueness
        'type': type,
        'gan': gan,
        'balance_money': {
            'amount': balance,
            'currency': 'CAD'
        }
    }

    response = requests.post(gift_card_url, headers=headers, json=payload)
    return response.json()

def load_items_csv():

    #important categories: 
    """ 1: Item Name
        2: Description
        3: Category
        4: Price
        5: Current Quantity Ma Maison Rose
        6: image : https://139611306.cdn6.editmysite.com/uploads/1/3/9/6/139611306/ + image id
    """
    
    #df = pandas.read_csv('items.csv')
    #print(df['Item Name'])
    items, images = fetch_items()
    #print(items[0])
    #print(images)
    names = []
    descriptions = []
    categories = []
    category_index = {}
    prices = []
    scores = [] #stock or quantity

    responses = []

    #deal with items
    print("DEBUG: Processing Categories")
    for item in tqdm(items):
        category_data = item.get('category_data')
        if category_data:
            if category_data['name'] not in category_index:
                category_index[item['id']] = category_data['name']
   

    print("DEBUG: Processing Items")
    for item in tqdm(items):
        item_data = item.get('item_data', {})
        if 'name' in item_data:
            names.append(item_data["name"])
            response = requests.get(f"https://connect.squareup.com/v2/inventory/{item_data['variations'][0]['id']}", headers=headers)
            res = response.json()
            scores.append(int(res['counts'][0]["quantity"]))
        if 'description' in item_data:
            descriptions.append(item_data['description'])
        if 'category_id' in item_data:
            categories.append(category_index[item_data['category_id']])
        if 'variations' in item_data:
            prices.append(item_data['variations'][0]['item_variation_data']['price_money']['amount']/100)
    

    

        

    #deal with images
    print("DEBUG: Processing Images")
    for image in tqdm(images):
        image_data = image.get('image_data', {})
        if 'url' in image_data:
            image_url = image_data['url']

            #load image
            response = requests.get(image_url)

            #pin it 
            ipfsHash = list_new_image(response.content, '')

            #mint it to block chain
            mint_url = 'https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/oracleMint'
            price = prices[images.index(image)]
            fee =  float(price *0.029 + 4.6)
            body1 = {
                "address": "0x3190b9754f22dd2b0514feff6bd299ee7514c777",
                "uri": "https://ipfs.io/ipfs/" + ipfsHash['IpfsHash'],
                "MaxPrice": float(f'{float(price - fee):.2f}'),
                "numDays": 10,
                "mintingAddress": "0x666f393A06285c3Ec10895D4092d9Dc86aeFD45b",
                "ddsAddress": "0xa244B3e1e6Bd2ccf1D226F3E269D0Af88Ef86CEE",
            }
         
            response_mint = requests.post(mint_url, json=body1)
            #print(response_mint.text)
            response_mint = response_mint.json()

            #update the cloud
            cloud_url = 'https://f5auzuxklj.execute-api.ca-central-1.amazonaws.com/dev/listItem'
            body2 = {
                "address": "0x3190b9754f22dd2b0514feff6bd299ee7514c777",
                "itemid": int(response_mint['hex'], 16),
                "name": names[images.index(image)],
                "score": scores[images.index(image)],
                "tag": categories[images.index(image)],
                "price": int(float(f'{float(price - fee):.2f}') *100000), #parseInt((itemPrice - itemFee).toFixed(2)*100000) 
                "description": descriptions[images.index(image)],
                "image": "https://ipfs.io/ipfs/" + ipfsHash['IpfsHash']
            }
            response_cloud = requests.post(cloud_url, json=body2)
            responses.append(response_cloud.text)
    print("DEBUG logs: ")
    print(responses)
    print("DEBUG: Finished (code 0)")
            

def load_sales_data():
    #get both number of sales by month and value of does sales
    data_last_year = [0] * 12
    money_last_year = [0] * 12
    #start_date = '2023-08-01T19:34:33.524Z'
    #end_date = '2024-08-01T19:34:33.524Z'
  

           
    old_headers = {
            'Square-Version': '2023-07-26',
            'Authorization': f'Bearer {old_access_token}',
            'Content-Type': 'application/json'
    }
    
    sales = []
    cursor = None
    while True:
        
        payment_url = f'{base_url}/payments?cursor={cursor}&begin_time=2023-08-01T19%3A34%3A33.524Z&end_time=2024-08-01T19%3A34%3A33.524Z'
        response = requests.get(payment_url, headers=old_headers, params={})
        response_data = response.json()
        sales.extend(response_data['payments'])
        cursor = response_data.get('cursor')

        if not cursor:
            break

    for sale in tqdm(sales):
    
        date = datetime.fromisoformat(sale['updated_at'])
        month = date.month
        data_last_year[month-1] += 1
        money_last_year[month-1] += sale['amount_money']['amount']

        '''
        var date = new Date(Date.parse(list_of_buying_ip_transac[i]));
                    let month = date.getMonth()
                    let index = labels_index[month-1]
                    let position = labels.indexOf(index)
                    data.datasets[1].data[position] +=1
                    data2.datasets[0].data[position] += list_of_buying_ip_transac_value[i]'''


    
  

           

#read the csv, gets the properties and upload them using the real upload item (using both aws and ipfs for file storage)


#sales data:

#gift cards / customers


if __name__ == '__main__':
    #deal with items
    #print(int('0x14', 16))
    #load_items_csv()

    #deal with gift cards
    print("DEBUG: Starting gift cards")
    #gift_cards = fetch_gift_cards()
    #if this doesnt work: https://squareup.com/help/us/en/article/6355-send-an-egift-card
    #for card in tqdm(gift_cards):
    #    res = create_gift_card(card['type'], card['balance_money']['amount'], card['gan'])

    #deal with sales data
    load_sales_data()