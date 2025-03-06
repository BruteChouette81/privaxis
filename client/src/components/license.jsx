import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js";
import { SAND_CLIENT_ID, CLIENT_ID } from '../apikeyStorer.js'
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import './css/product.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'

import { useEffect, useState } from "react";

import bronze from './css/images/bronze.png'
import silver from './css/images/silver.png'
import gold from './css/images/gold.png'

const planId1 = "P-4MG9748233399803AM6ETTXQ" //"P-02U60226SN022074CM56B6FY" 
const planId2 = "P-32727078E9467440BM56UNTA" 

function Products(props) {
  const [license, setLicense] = useState()
  const [licenseLevel, setLicenseLevel] = useState()
     useEffect(()=> {
            const canvas = document.getElementById("gradientCanvas");
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let gradientColors = [
          ["#ff9a9e", "#fad0c4"],
          ["#a18cd1", "#fbc2eb"],
          ["#ffecd2", "#fcb69f"],
          ["#a1c4fd", "#c2e9fb"],
        ];
    
        let currentGradientIndex = 0;
        let nextGradientIndex = 1;
        let gradientStep = 0.0;
        const stepSpeed = 0.002;
    
        function drawGradient() {
          const currentColors = gradientColors[currentGradientIndex];
          const nextColors = gradientColors[nextGradientIndex];
    
          const gradient = ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
          );
          gradient.addColorStop(
            0,
            lerpColor(currentColors[0], nextColors[0], gradientStep)
          );
          gradient.addColorStop(
            1,
            lerpColor(currentColors[1], nextColors[1], gradientStep)
          );
    
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
    
          gradientStep += stepSpeed;
    
          if (gradientStep >= 1) {
            gradientStep = 0;
            currentGradientIndex = nextGradientIndex;
            nextGradientIndex = (nextGradientIndex + 1) % gradientColors.length;
          }
    
          requestAnimationFrame(drawGradient);
        }
    
        function lerpColor(a, b, amount) {
          const ah = parseInt(a.replace("#", ""), 16);
          const bh = parseInt(b.replace("#", ""), 16);
          const ar = ah >> 16,
            ag = (ah >> 8) & 0xff,
            ab = ah & 0xff;
          const br = bh >> 16,
            bg = (bh >> 8) & 0xff,
            bb = bh & 0xff;
          const rr = ar + amount * (br - ar);
          const rg = ag + amount * (bg - ag);
          const rb = ab + amount * (bb - ab);
          return `rgb(${Math.round(rr)}, ${Math.round(rg)}, ${Math.round(rb)})`;
        }
    
        drawGradient();
        
        }
    )

    return(
        <div className="hero relative" id="hero">
        <canvas
          id="gradientCanvas"
          className="absolute mob-nav top-[-16px] left-0 w-full h-full -z-10"
        ></canvas>

        <div
          className="m-auto overflow-hidden mx-4 mt-8 lg:mt-4 p-2 md:p-12 h-5/6"
          data-aos="zoom-in"
        >
          <div
            id="hero"
            
            
          >
        {window.localStorage.getItem("language") == "fr" ? <div className="Products">
            <h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900 uppercase">Licence {props.name}</h1>
            <div className="text-xl font-semibold tracking-tight mb-5 text-gray-500 ">
            <h5>Une licence {props.name} vous donne accès à différentes fonctionnalités selon votre besoin. Choisissez celle qui convient à votre entreprise. Pour en savoir plus, consultez notre section <a href="/legal">légale</a> ou <a href="/contact">contactez-nous</a>.</h5>
            </div>
            
           
            <div class="container">
                <div class="row">
                    <div class="col">
                      {license && licenseLevel==1 ? <div className="product">
                        <h3>Subscription ID: {license}</h3>
                        <p>Your next step is to <a target="_blank" href="https://cpltechnologies.com/seller/0">download the app</a></p>
                      </div> : 
                        <div class="product">
                        <img src={bronze} alt="" id="product-img" />
                            <h5>Niveau 1</h5>
                            <p> Fait pour: <strong>petites et moyennes entreprises</strong> </p>
                            <p> <strong>15$ / mois</strong></p>
                            
                            <button className="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#features" aria-expanded="false" aria-controls="features">Afficher les fonctionnalités</button>
                            <br />
                            <br />
                            <div class="collapse" id="features" style={{visibility: "visible"}}>
                            <div className="card card-body" style={{color: "black"}}>
                            <p>Thème Shopify {props.name}</p>
<p>Paiement hébergé {props.name}</p>
<p>Confidentialité de toutes les informations de vos clients conformément à la loi au Canada</p>
<p>Application d'administration pour surveiller vos commandes</p>
<p>Tableau de bord d'administration simple</p>
                            </div>
                            </div>
                            <br />
                            <PayPalScriptProvider options={{clientId: props.sandbox ? SAND_CLIENT_ID : CLIENT_ID, vault: true, intent: "subscription", currency: "CAD" }}>
                               
                               <PayPalButtons fundingSource={FUNDING.PAYPAL}
                                   createSubscription={(data, actions) => {
                                       return actions.subscription.create({
                                           plan_id: planId1, // Use the PayPal Plan ID for your subscription
                                       });
                                       }}
                                       onApprove={async (data, actions) => {
                                           // This is triggered after the payment is successfully completed
                                           console.log("Subscription approved:", data);
                                           setLicense(data.subscriptionID)
                                           setLicenseLevel(1)
                                           alert("Thank you for subscribing!");
                                       }}
                                       onError={(err) => {
                                        console.error("PayPal Subscription Error:", err);
                                        alert("An error occurred during the payment process.");
                                      }}
                                      style={{
                                        layout: "vertical",
                                        color: "blue",
                                        shape: "pill",
                                        label: "subscribe",
                                      }}
                                       
                               />
                               
                           </PayPalScriptProvider>
                           
                        </div>}
                    </div>
                    <div class="col">
                    {license && licenseLevel==2 ? <div className="product">
                        <h3>Subscription ID: {license}</h3>
                        <p>Save this information to complete your <a target="_blank" href="https://cpltechnologies.com/seller/0">connection</a></p>
                      </div> :
                        <div class="product">
                            <img src={silver} alt="" id="product-img" />
                            <h5>Niveau 2</h5>
                            <p>  Fait pour: <strong>entreprises en croissance</strong> </p>
                            <p> <strong>100$ / mois</strong></p>
                            <button className="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#features" aria-expanded="false" aria-controls="features">Afficher les fonctionnalités</button>
                            <br />
                            <br />
                            <div class="collapse" id="features" style={{visibility: "visible"}}>
                            <div className="card card-body" style={{color: "black"}}>
                            <p>Application {props.name} Shopify Hydrogen</p>
<p>Paiement hébergé {props.name} personnalisé</p>
<p>Modification du paiement incluse pour répondre à vos besoins</p>
<p>Confidentialité de toutes les informations de vos clients conformément à la loi au Canada</p>
<p>Application d'administration pour surveiller vos commandes</p>
<p>Tableau de bord d'administration avancé</p>
<p>Accès aux données et analyses client dépersonnalisées</p>
                            </div>
                            </div>
                            <br />
                            
                            <PayPalScriptProvider options={{clientId: props.sandbox ? SAND_CLIENT_ID : CLIENT_ID, vault: true, intent: "subscription", currency: "CAD" }}>
                               
                               <PayPalButtons fundingSource={FUNDING.PAYPAL}
                                   createSubscription={(data, actions) => {
                                       return actions.subscription.create({
                                           plan_id: planId2, // Use the PayPal Plan ID for your subscription
                                       });
                                       }}
                                       onApprove={(data, actions) => {
                                           // This is triggered after the payment is successfully completed
                                           console.log("Subscription approved:", data);
                                           setLicense(data.subscriptionID)
                                           setLicenseLevel(2)
                                           alert("Thank you for subscribing!");
                                       }}
                                       onError={(err) => {
                                        console.error("PayPal Subscription Error:", err);
                                        alert("An error occurred during the payment process.");
                                      }}
                                      style={{
                                        layout: "vertical",
                                        color: "blue",
                                        shape: "pill",
                                        label: "subscribe",
                                      }}
                                       
                               />
                               
                           </PayPalScriptProvider>
                        </div>}
                    </div>
                    <div class="col">
                    {license && licenseLevel==3 ? "" :
                        <div class="product">
                            <img src={gold} alt="" id="product-img" />
                            <h5>Niveau 3</h5>
                            <p>  Fait pour: <strong>entreprises ou sociétés à forte croissance</strong></p>
                            <p> <strong>custom</strong></p>
                            <button className="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#features" aria-expanded="false" aria-controls="features">Afficher les fonctionnalités</button>
                            <br />
                            <br />
                            <div class="collapse" id="features" style={{visibility: "visible"}}>
                            <div className="card card-body" style={{color: "black"}}>
                            <p>Site Web personnalisé complet</p>
<p>Site Web hébergé gratuitement inclus</p>
<p>Tableau de bord complet pour tout ce dont votre site Web a besoin</p>
<p>Des mesures de confidentialité et de sécurité personnalisées sont développées avec vous pour vous</p>
<p>L'analyse la plus précise proposée pour faciliter la transition vers des données dépersonnalisées</p>
                            </div>
                            </div>
                            <br />
                            <Link
                                              to="/contact"
                                              className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 text-lg shadow-xl rounded-2xl "
                                            >
                                              Contact sales
                                              <svg
                                                className="w-4 h-4 ml-1"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                                  clipRule="evenodd"
                                                ></path>
                                              </svg>
                                            </Link>
                           
                        </div>}
                    </div>
                    
                </div>
                <br />
                    <br />
               
            </div>
        </div> : <div className="Products">
            <h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900 uppercase">{props.name} license</h1>
            <div className="text-xl font-semibold tracking-tight mb-5 text-gray-500 ">
            <h5>A {props.name} license gives you access to different features depending on your needs. Choose the one that suits your business. To learn more, visit our <a href="/legal">legal</a> section or <a href="/contact">contact us</a>.</h5>
            </div>
            
           
            <div class="container">
                <div class="row">
                    <div class="col">
                        <div class="product">
                        <img src={bronze} alt="" id="product-img" />
                            <h5>Niveau 1</h5>
                            <p> Made for: <strong>small to medium businesses</strong> </p>
                            <p> <strong>15$ / month</strong></p>
                            
                            <button className="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#features" aria-expanded="false" aria-controls="features">Show features</button>
                            <br />
                            <br />
                            <div class="collapse" id="features" style={{visibility: "visible"}}>
                            <div className="card card-body" style={{color: "black"}}>
                                <p>{props.name} Shopify Theme</p>
                                <p>{props.name} Hosted Checkout</p>
                                <p>Privacy of all of your customer's infromation according to law in Canada</p>
                                <p>Admin app to monitor your orders</p>
                                <p>Simple admin dashboard</p>
                            </div>
                            </div>
                            <br />
                            <PayPalScriptProvider options={{clientId: CLIENT_ID, vault: true, intent: "subscription", currency: "CAD" }}>
                               
                               <PayPalButtons fundingSource={FUNDING.PAYPAL}
                                   createSubscription={(data, actions) => {
                                       return actions.subscription.create({
                                           plan_id: planId1, // Use the PayPal Plan ID for your subscription
                                       });
                                       }}
                                       onApprove={(data, actions) => {
                                           // This is triggered after the payment is successfully completed
                                           console.log("Subscription approved:", data);
                                           alert("Thank you for subscribing!");
                                       }}
                                       onError={(err) => {
                                        console.error("PayPal Subscription Error:", err);
                                        alert("An error occurred during the payment process.");
                                      }}
                                      style={{
                                        layout: "vertical",
                                        color: "blue",
                                        shape: "pill",
                                        label: "subscribe",
                                      }}
                                       
                               />
                               
                           </PayPalScriptProvider>
                           
                        </div>
                    </div>
                    <div class="col">
                        <div class="product">
                            <img src={silver} alt="" id="product-img" />
                            <h5>Niveau 2</h5>
                            <p> Made for: <strong>growing businesses</strong> </p>
                            <p> <strong>100$ / month</strong></p>
                            <button className="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#features" aria-expanded="false" aria-controls="features">Show features</button>
                            <br />
                            <br />
                            <div class="collapse" id="features" style={{visibility: "visible"}}>
                            <div className="card card-body" style={{color: "black"}}>
                            <p>{props.name} Shopify Hydrogen app</p>
                                <p>Custom {props.name} Hosted Checkout</p>
                                <p>Included checkout modification to fit your needs</p>
                                <p>Privacy of all of your customer's infromation according to law in Canada</p>
                                <p>Admin app to monitor your orders</p>
                                <p>Advance admin dashboard</p>
                                <p>Access to depersonnalized customer data and analysis</p>
                            </div>
                            </div>
                            <br />
                            
                            <PayPalScriptProvider options={{clientId: CLIENT_ID, vault: true, intent: "subscription", currency: "CAD" }}>
                               
                               <PayPalButtons fundingSource={FUNDING.PAYPAL}
                                   createSubscription={(data, actions) => {
                                       return actions.subscription.create({
                                           plan_id: planId2, // Use the PayPal Plan ID for your subscription
                                       });
                                       }}
                                       onApprove={(data, actions) => {
                                           // This is triggered after the payment is successfully completed
                                           console.log("Subscription approved:", data);
                                           alert("Thank you for subscribing!");
                                       }}
                                       onError={(err) => {
                                        console.error("PayPal Subscription Error:", err);
                                        alert("An error occurred during the payment process.");
                                      }}
                                      style={{
                                        layout: "vertical",
                                        color: "blue",
                                        shape: "pill",
                                        label: "subscribe",
                                      }}
                                       
                               />
                               
                           </PayPalScriptProvider>
                        </div>
                    </div>
                    <div class="col">
                        <div class="product">
                            <img src={gold} alt="" id="product-img" />
                            <h5>Niveau 3</h5>
                            <p> Made for: <strong>enterprises or high-growth businesses</strong></p>
                            <p> <strong>custom</strong></p>
                            <button className="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#features" aria-expanded="false" aria-controls="features">Show features</button>
                            <br />
                            <br />
                            <div class="collapse" id="features" style={{visibility: "visible"}}>
                            <div className="card card-body" style={{color: "black"}}>
                            <p>Complete custom website</p>
                                <p>Included free hosted website </p>
                                <p>Complete dashboard for everything your webiste needs</p>
                                <p>Custom privacy and security meseare develop with you for you</p>
                                <p>Most precise analysis offered to make the transition to depersonnalized data seamless</p>
                              
                            </div>
                            </div>
                            <br />
                            <Link
                                              to="/contact"
                                              className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 text-lg shadow-xl rounded-2xl "
                                            >
                                              Contact sales
                                              <svg
                                                className="w-4 h-4 ml-1"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                                  clipRule="evenodd"
                                                ></path>
                                              </svg>
                                            </Link>
                           
                        </div>
                    </div>
                    
                </div>
                <br />
                    <br />
               
            </div>
        </div>}
        </div>
        </div>
        </div>
    )
}

export default Products;