import React, { useEffect, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './css/intro.css'
import './css/home.css'
import './css/idea.css'
import './css/pricing.css'
import './css/faq.css'
import Chart2 from './chart'
import DisplayPrice from './gettoken'
import { API } from 'aws-amplify';

import payment from './css/Screenshot 2024-02-10 131201.png'
import hosting from './css/web-hosting.jpg'
import account from './css/user_lock-512.png'

import metaimg from './css/thjpg.jpg'
import uni from './css/uniswap1647861012114.png'


function BuyCredit() {
    // put buy logic here with wyre api

    const buying = () => {
        window.location.replace("/") // https://drive.google.com/file/d/1J0zWu2maYsf6AoP6FMjcIqrLnhg52C-1/view?usp=drive_link url for launchpad https://app.uniswap.org/#/swap?chain=mainnet
    }
    const about = () => {
        window.location.replace("/Token") // url for launchpad 
    }
    const connectOneClick = () => {
        window.location.replace("/Account")
    }
    return (
        <div>
            <div class="d-grid gap-2 d-md-block">
                <button onClick={buying} class="btn btn-primary btn-lg" style={{marginRight: 10 + "px"}}>Whitepaper</button>
                <button onClick={about} class="btn btn-primary btn-lg" style={{marginRight: 10 + "px"}}>What is CPL</button>
            </div>
        </div>
    )
};





function Compatible() {
    return (
        window.localStorage.getItem("language") == "fr" ? <div className='compatible'>
            <h2>Conforme à la norme PCI DSS niveau 4: </h2>
            <div class="container">
                <img id="pcidss" src="https://www.securitycompass.com/wp-content/uploads/pci-dss-logo.png" alt="" />
            </div>
        </div> : <div className='compatible'>
            <h2>PCI DSS level 4 compliant: </h2>
            <div class="container">
                <img id="pcidss" src="https://www.securitycompass.com/wp-content/uploads/pci-dss-logo.png" alt="" />
            </div>
        </div>
    )
}


function Idea() {
    const learn = () => {
        window.location.replace("/about") // change to idea page
    }
    //represents the currency from the famous Sci-Fi movie, Star Wars
    return(
        <div class="idea">
            {window.localStorage.getItem("language") == "fr" ? <h3>L'idée:</h3> : <h3>The idea:</h3> }
            {window.localStorage.getItem("language") == "fr" ? <h5>Le CPL (Centralized Payment Ledger) est un système de paiement `Peer-to-Peer` qui utilise la puissance des réseaux distribués pour permettre le plus haut niveau de sécurité et les frais les plus bas jamais vus. </h5> : <h5>The CPL (Centralized Payment Ledger) is a Peer-to-Peer payment system that uses the power of distributed network to allow the highest level of security and lowest fees ever.  </h5>}
            {window.localStorage.getItem("language") == "fr" ? <button onClick={learn} class="btn btn-primary btn-lg">En savoir plus!</button> : <button onClick={learn} class="btn btn-primary btn-lg">Learn more!</button>}
        </div>
    )
}


function Intro() {
    return(
        //by Star Wars fan for Star Wars fans
        //future of decentralization
        //for movie fans
        //<BuyCredit />
        <section class="intro">
             {window.localStorage.getItem("language") == "fr" ? <h2>Le futur du paiement</h2> : <h2>The next step in payment </h2>}
             {window.localStorage.getItem("language") == "fr" ? <h3>Le tout premier système de paiement semi-centralisé</h3> : <h3>The first Centralized Payment Ledger</h3>}
            
            <Idea />
        </section>
        
    )
}
function Carding({title, text, link, button, image}) {
    //<a href={link} class="btn btn-primary">{button}</a>
    //style={{"height": "300px", "marginLeft": "25%"}}
    return(
        <div class="col">
            
			<div class="card" >
            <img src={image} class="card-img-top" alt=""style={{"height": "auto"}}/>
                <div class="card-body">
                    <h5 class="card-title" style={{color: "black"}}>{title}</h5>
                    <p class="card-text" style={{color: "black"}}>{text}</p>
                   
                </div>
            </div>
        </div>
    )
}

function Update() {
    //<br />
    //<div class="row">
    //  <Carding title="test1" text="test" link="#" button="test"/>
    //</div>

    //<Carding title="Token is out!" text="You can now buy our token on decentralize exchanges" link="" button="Buy!" />
    return(
    <section class="update">
         {window.localStorage.getItem("language") == "fr" ? <h1>Ce que nous avons créé (voir: <a href="/products">nos produits</a> ): </h1> : <h1>What we have created (see: <a href="/products">our products</a> ):</h1>}
        <br />
        {window.localStorage.getItem("language") == "fr" ? <div class="row" style={{leftMargin: 50 + "px"}} >
            <Carding title="Une nouvelle passerelle de paiement" text="La passerelle de paiement CPL permet les transactions de tous les modes de paiement avec les frais les plus bas jamais vus" link="/" button="Connect with us!" image={payment}/>
           
            <Carding title="Hébergement de site Web décentralisé" text="Connecté au CPL, votre site internet peut être hébergé gratuitement grâce à notre système P2P" link="/" button="Connect with us!" image={hosting}/>
           
            <Carding title="Système de compte sécurisé" text="Le CPL protégera les informations et données privées de vos clients" link="/" button="Connect with us!" image={account}/>
            
        </div> : <div class="row" style={{leftMargin: 50 + "px"}} >
            <Carding title="A new payment gateway" text="The CPL payment gateway allows transactions from every payment methods with the lowest fees ever" link="/" button="Connect with us!" image={payment}/>
            <Carding title="Decentralized website hosting" text="Connected to the CPL, your website can be hosted for free using our P2P system" link="/" button="Connect with us!" image={hosting}/>
            <Carding title="Secured Account system" text="The CPL will protect your clients information and private data" link="/" button="Connect with us!" image={account}/>
            
        </div>}
        
    </section>
    )
}
function Pricing() {
    const unreleased = [0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05];
    const [price, setPrice] = useState([]);
    const [date, setDate] = useState([]);
    const dates = [];

    /*
    const getHPrice = () => {
        let url = '/historical_price';

        axios.get(url).then((response) => {

            console.log(response.data.hprice)
            setPrice(response.data.hprice.reverse())

        });
    }
    */

    const getHPrice = () => {
        let date0 = new Date();
        dates.push(date0.getDate())
        let date1 = new Date(date0)
        for (let i = 0; i < 9; i++) {
            date1.setDate(date1.getDate() - 1)
            dates.push(date1.getDate())
        }
        setDate(dates.reverse())
        let url = '/historicalPrice'
        API.get('server', url).then((response) => {
            console.log(response.hprice)
            setPrice(response.hprice.reverse())
          })
    }


    const data = {
		labels: date, //['6/12/22', '6/13/22', '6/14/22', '6/15/22', '6/16/22', '6/17/22', '6/18/22', '6/19/22', '6/20/22', '6/21/22', '6/22/22'],
		datasets:[
			{
				label: 'Price',
				data: unreleased, //price
			}
		]

	}

    useEffect(() => {
        getHPrice();
    }, [])

    return(
        <div class="pricing">
            <h1>$CREDIT price:</h1>
            <DisplayPrice />
            <div class="pricing-chart">
                <Chart2 data={data} />
            </div>
        </div>
    )
}

function Q() {
    return (
        <div class="faq">
            {window.localStorage.getItem("language") == "fr" ? <h3>Intéressé ? <a href="/contact"> Contacter nous</a>!</h3> : <h3>Interested ?  <a href="/contact">Contact us</a> !</h3>}
        </div>

    )
}

function Home() {
    
    return(
        <div class="main">
            <Intro />
            <Update/>
            <Compatible />
			<Q />
        </div>
    )

}

/// function display text
export default Home;
