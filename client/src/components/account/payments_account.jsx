
import axios from "axios"
import { useState } from "react"

const AllPayments = () => {
    return (<div className="payChart">
                <h2>Total: <strong>115.3k</strong></h2>
            </div>)
}

const AllWallet = () => {
    return (<div className="payChart">
    <h2>Money in App: <strong>220.1k</strong></h2>
</div>)
}


function PaymentsAccount(props) {
    const [dcode, setDcode] = useState("")
    const [creating, setCreating] = useState(false)
    const [status, setStatus] = useState("")
    // location api
    // create new device code 
    // pair using the square terminal (display code on screen)
    // receive webhook https://6pvpjdu5ue.execute-api.ca-central-1.amazonaws.com/dev/connect_terminal

    const create_device_code = () => {
        // "location_id": "NHT...CGJ" create a real location for each client
        setCreating(true)
        const params = {
            "headers": {
                'content-type': 'application/json',
                'Square-Version': '2024-06-04',
                'Authorization': 'Bearer EAAAlwEUS-f0w6Gclw4A2IYcslFl5teIZyYbTW3JWhyGmfau4av6UpU_koIkCRzX'
                },
            "body":{ 
                "idempotency_key": "123-456-789", //uuid
                "device_code": {
                    "name": "Terminal 1",
                    "product_type": "TERMINAL_API",
                    }
                }
            }
        axios.post("https://connect.squareup.com/v2/devices/codes", params).then((res) => {
            setDcode(res.code)
            console.log(res)
            setCreating(false)

        })
    }

    const get_paired_device = () => {
        //"https://developer.squareup.com/explorer/square_2024-06-04/devices-api/get-device?params=N4XyA&env=sandbox&v=1"
        //get the device code from either decentralized profile or server
        const params = {
            "headers": {
                'content-type': 'application/json',
                'Square-Version': '2024-06-04',
                'Authorization': 'Bearer EAAAlwEUS-f0w6Gclw4A2IYcslFl5teIZyYbTW3JWhyGmfau4av6UpU_koIkCRzX'
                }
            }
        axios.get("https://connect.squareupsandbox.com/v2/devices/{device_id}", params).then((res) => {
            console.log(res.body.device.status)
            setStatus(res.body.device.status)
        })
        //returns: 
        /**
         * {
            "device": {
                "id": "device:995CS397A6475287",
                "attributes": {
                "type": "TERMINAL",
                "manufacturer": "Square",
                "model": "T2",
                "name": "Square Terminal 995",
                "manufacturers_id": "995CS397A6475287",
                "updated_at": "2023-09-29T13:12:22.365049321Z",
                "version": "5.41.0085",
                "merchant_token": "MLCHXZCBWFGDW"
                },
                "components": [
                {
                    "type": "APPLICATION",
                    "application_details": {
                    "application_type": "TERMINAL_API",
                    "version": "6.25",
                    "session_location": "LMN2K7S3RTOU3"
                    }
                },
                {
                    "type": "CARD_READER",
                    "card_reader_details": {
                    "version": "3.53.70"
                    }
                },
                {
                    "type": "BATTERY",
                    "battery_details": {
                    "visible_percent": 5,
                    "external_power": "AVAILABLE_CHARGING"
                    }
                },
                {
                    "type": "WIFI",
                    "wifi_details": {
                    "active": true,
                    "ssid": "Staff Network",
                    "ip_address_v4": "10.0.0.7",
                    "secure_connection": "WPA/WPA2 PSK",
                    "signal_strength": {
                        "value": 2
                    }
                    }
                },
                {
                    "type": "ETHERNET",
                    "ethernet_details": {
                    "active": false
                    }
                }
                ],
                "status": {
                "category": "AVAILABLE"
                }
            }
            }
         */
    }

    const ConnectTerminal = () => {
        return (<div className="payChart" style={{"textAlign": "center"}}>
            <h2>Connect your Terminal</h2>
            <div class="terminal-type">
                {creating ? (<div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                    </div>) : (<div class="row">
                    <div class="col">
                        <button class="btn btn-primary" onClick={()=> {create_device_code()}}>Square</button>
                    </div>
                    <div class="col">
                        <button class="btn btn-secondary">Other</button>
                    </div>
                </div>)}
                
                {dcode.length > 0 ? <h2>Square terminal code: {dcode}</h2> : ""}
                <p style={{"color": "red"}}>Status: No terminal connected</p>
            </div>
        </div>)
    }

    const CustomersLoyalty = () => {
        return (<div className="payChart">
            <h2>Connect your Gift Cards</h2>
        </div>)
    }


    const return_to_home = () => {
        props.setDisplay(false)
    }

    return (
        <div>
        <h1>Payments and Fees</h1>
        <button type="button" class="btn-close" aria-label="Close" onClick={() => {return_to_home()}} style={{"float":"right"}}></button>
        <div class="container">
                <div class="row">
                    <div class="col">
                        <AllPayments/>
                    </div>
                    <div class="col">
                        <AllWallet/>
                    </div>
                    <div class="col">
                        <CustomersLoyalty/>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <ConnectTerminal/>
                    </div>
                    <div class="col">
                        <ConnectTerminal/>
                    </div>
                    <div class="col">
                        <ConnectTerminal/>
                    </div>
                </div>
        </div>
        
        
        </div>
    )
}

export default PaymentsAccount;