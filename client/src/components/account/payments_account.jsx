
import axios from "axios"
import { useEffect, useState } from "react"
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
import { API } from "aws-amplify";

import testimg from './css/Collection-Terminal-HeroArtwork_2x.png'

import { square_secret } from "../../apikeyStorer";


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
  
const AllPayments = (props) => {
    const [paypalEmail, setPaypalEmail] = useState("")

    const onPaypalEmailChange = (event) => {
        setPaypalEmail(event.target.value)
    }

    const handleNewPaypalEmail = (e) => {
        e.preventDefault()
        window.localStorage.setItem("moneyAddress", paypalEmail)
        alert("Succefully updated your Paypal Address!")
    }

    const updatedPayment = (method) => {
        window.localStorage.setItem("payment_method", method)
        window.location.reload()
    }

    return (<div className="payChart">
                <h2>Total: <strong>{props.total} $</strong></h2>
                <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" onClick={() => {updatedPayment("transfer")}} checked={(window.localStorage.getItem("payment_method") == "transfer")}/>
                <label class="form-check-label" for="flexRadioDefault1">
                Get Paid with transfer
                </label>
                </div>
                <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" onClick={() => {updatedPayment("paypal")}} checked={(window.localStorage.getItem("payment_method") == "paypal")}/>
                <label class="form-check-label" for="flexRadioDefault2">
                Get paid using <img src="https://www.pngall.com/wp-content/uploads/2016/03/Paypal-Logo-PNG.png" alt="" style={{"height":"40px", "width":"auto"}} />
                </label>
                </div>
                
                
                {window.localStorage.getItem("payment_method") == "paypal"? <div><p>Enter a valid paypal-connected email and get payed using paypal.</p>
                <form onSubmit={handleNewPaypalEmail}>
                    {window.localStorage.getItem("moneyAddress") ? <input type="email" id="email" name="email" class="form-control" placeholder={window.localStorage.getItem("moneyAddress")} onChange={onPaypalEmailChange}/>   : <input type="email" id="email" name="email" class="form-control" placeholder="paypal@test.com" onChange={onPaypalEmailChange}/>  }  
                    <br />
                    <input type="submit" class="btn btn-primary" value="Update email" />
                </form></div> : ""}
            </div>)
}

const AllWallet = () => {
    const [feered, setFeered] = useState(false)
    const activateFeeRed = () => {
        console.log("activated")
        setFeered(!feered)
    }
    return (<div className="payChart">
    <h2>Money in App: <strong>0</strong></h2>
    <div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" onChange={()=> {activateFeeRed()}} checked={feered} disabled/>
    <label class="form-check-label" for="flexSwitchCheckChecked">Fee reduction system</label>
    </div>
   
</div>)
}

const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Amount of money received/sent',
      },
    },
  };
  
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  
  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Sales',
        data: [87,115,318,256,308,219,378],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
  
const MoneyInChart = (props) => {
      return (
          <div class="itemsold">
              <p>Money in: <strong>{props.total} $</strong> </p>
              <Line options={options} data={props.data} />
          </div>
      )
}

const MoneyOutChart = (props) => {
    return (
        <div class="itemsold">
            <p>Money out: <strong>{props.total} $</strong> </p>
            <Line options={options} data={props.data} />
        </div>
    )
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
    
        var data = {
            body: {
                url: "https://connect.squareup.com/v2/devices/codes",
                data: {
                    method:"post",
                    headers: {
                       
                        'Authorization': `Bearer ${square_secret}`,
                        'Content-Type': 'application/json',
                        'Square-Version': '2024-06-04',
                        
                        },
                    body: JSON.stringify({ 
                        "idempotency_key": "123-456-789", //uuid
                        "device_code": {
                            "name": "Terminal 1",
                            "location_id": "LY9PJBHERNETY",
                            "product_type": "TERMINAL_API",
                            }
                        })
                    },
            }
        }
        API.post('server',"/getcode", data).then((res) => {
            console.log(res.device_code.code)
            setDcode(res.device_code.code)
            setCreating(false)
        })
        /*
        axios.post("https://connect.squareupsandbox.com/v2/devices/codes", params).then((res) => { //https://connect.squareup.com/v2/devices/codes
            //setDcode(res.code)
            console.log(res)
            setCreating(false)

        })*/
    }

    const get_paired_device = () => {
        //"https://developer.squareup.com/explorer/square_2024-06-04/devices-api/get-device?params=N4XyA&env=sandbox&v=1"
        //get the device code from either decentralized profile or server
        const params = {
            "headers": {
                'content-type': 'application/json',
                'Square-Version': '2024-06-04',
                'Authorization': `Bearer ${square_secret}`
                }
            }
        fetch(`https://connect.squareup.com/v2/devices/${props.device_id}`, params).then((res) => {
            console.log(res.body)
            //setStatus(res.body?.device?.status?.category)
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
                {status == "AVAILABLE" ? <div> <p style={{"color": "green"}}>Status: connected</p> <img src={testimg} alt="" style={{"width": "150px", "height": "auto"}} /></div> : <p style={{"color": "red"}}>Status: No terminal connected</p>}

            </div>
        </div>)
    }


    const CustomersLoyalty = () => {
        return (<div className="payChart">
            <h2>Connect your Gift Cards</h2>
        </div>)
    }

    useEffect(() => {
        get_paired_device()
    })


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
                        <AllPayments total={props.total}/>
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
                        <MoneyInChart total={props.total} data={props.data}/>
                    </div>
                    <div class="col">
                        <MoneyOutChart total={props.total} data={props.data}/>
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