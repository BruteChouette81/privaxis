import './css/product.css'

function Products() {
    return(
        window.localStorage.getItem("language") == "fr" ? <div className="Products">
            <h1>Produits</h1>
            <h3>Services fournis par les technologies CPL (<a href="/contact">contactez-nous</a> pour en savoir plus)</h3>
            <div class="container">
                <div class="row">
                    <div class="col">
                        <div class="product">
                        <img src="https://www.watchstation.com/on/demandware.static/-/Library-Sites-WatchStationSharedLibrary/default/dwd759a869/customer_care/payment/Mobile_Card_View@2x.png" alt="" id="product-img" />
                            <h5>Passerelle de paiement</h5>
                            <p>le logiciel CPL gère les transactions et permet des options de paiements très flexibles (Débit/Crédit, Paypal, crypto et plus sans frais supplémentaires). Le fournisseur de paiement CPL autorise également des frais aussi bas que <strong>0 %</strong> en utilisant notre portefeuille digital pour les marchand.</p>
                        </div>
                    </div>
                    <div class="col">
                        <div class="product">
                            <img src="https://tse2.mm.bing.net/th?id=OIP.uOLU9MMV-zjVqwfPF1dk0gHaE7&pid=Api&P=0&h=180" alt="" id="product-img" />
                            <h5>Hébergement de sites Web</h5>
                            <p>Notre hébergement de site Web décentralisé offre aux commerçants un hébergement gratuit de leur site Web.</p>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="product">
                        <img src="https://www.mobiletransaction.org/wp-content/uploads/2021/12/square-vs-shopify-australia.jpg" alt="" id="product-img" />
                            <h5>Adaptation de site Web</h5>
                            <p>Vous possédez déjà un site Shopify ou Square et vous ne souhaitez pas tout perdre lors du transfert vers notre système ? Le CPL vous protège ! Nous adapterons rapidement votre site Web au CPL sans perdre aucune des fonctionnalités de votre précédent service d'hébergement.  </p>
                        </div>
                    </div>
                
                    <div class="col">
                        <div class="product">
                        <img src="https://cdn.leverageedu.com/blog/wp-content/uploads/2020/09/04184424/How-to-Become-a-Software-Engineer-800x500.jpg" alt="" id="product-img" />
                            <h5>Création de site web</h5>
                            <p>Créer et héberger un site Web n’a jamais été aussi accessible et bon marché. Nous construirons un site internet suite à vos demandes et l’hébergerons. Nous veillerons à ce que toutes vos attentes soient satisfaites et l’ajustement ne se fera qu’en quelques clics. </p>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="product">
                        <img src="https://cdn2.iconfinder.com/data/icons/flat-style-svg-icons-part-1/512/user_login_man-1024.png" alt="" id="product-img" />
                            <h5>Protection des données clients</h5>
                            <p>Le CPL garantit le niveau de protection des données privées le plus sûr grâce à notre nouvelle approche. Avec le CPL, toutes les informations de votre client seront sécurisées et « inpiratables ».</p>
                        </div>
                    </div>
                    <div class="col">
                        <div class="product">
                        <img src="https://exertpro.com/wp-content/uploads/2021/06/Website-maintenance-scaled.jpg" alt="" id="product-img" />
                            <h5>Service de maintenance/mise à jour du site Web</h5>
                            <p>L’équipe du CPL gérera et maintiendra votre site Web. Des mises à niveau de votre site Web seront également disponibles à tout moment avec des frais supplémentaires.</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div> : <div className="Products">
            <h1>Products</h1>
            <h3>Services provided by CPL technologies (<a href="/contact">contact us</a> for more)</h3>
            <div class="container">
                <div class="row">
                    <div class="col">
                        <div class="product">
                        <img src="https://www.watchstation.com/on/demandware.static/-/Library-Sites-WatchStationSharedLibrary/default/dwd759a869/customer_care/payment/Mobile_Card_View@2x.png" alt="" id="product-img" />
                            <h5>Payment provider</h5>
                            <p>the CPL software manages transactions and allows very flexibles payments options (Debit/Credit, Paypal, crypto and more without additionnal fees). The CPL payment provider also allows fees as low as <strong>0%</strong> using our merchant wallet.</p>
                        </div>
                    </div>
                    <div class="col">
                        <div class="product">
                            <img src="https://tse2.mm.bing.net/th?id=OIP.uOLU9MMV-zjVqwfPF1dk0gHaE7&pid=Api&P=0&h=180" alt="" id="product-img" />
                            <h5>Website hosting</h5>
                            <p>Our decentralized website hosting is providing merchant with free hosting of their website.</p>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="product">
                        <img src="https://www.mobiletransaction.org/wp-content/uploads/2021/12/square-vs-shopify-australia.jpg" alt="" id="product-img" />
                            <h5>Website adaptation</h5>
                            <p>You already have a Shopify or Square website and dont want to lose it all when transfering to our system ? The CPL got you cover! We will quickly adapt your website to the CPL without losing any of the features from your previous hosting service.  </p>
                        </div>
                    </div>
                
                    <div class="col">
                        <div class="product">
                        <img src="https://cdn.leverageedu.com/blog/wp-content/uploads/2020/09/04184424/How-to-Become-a-Software-Engineer-800x500.jpg" alt="" id="product-img" />
                            <h5>Website creation</h5>
                            <p>Getting a website build and hosted has never been more accessible and cheap. We will build a website following your requests and host it. We will insure that all of your expectations are met and adjustation will only be at a few clicks away. </p>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="product">
                        <img src="https://cdn2.iconfinder.com/data/icons/flat-style-svg-icons-part-1/512/user_login_man-1024.png" alt="" id="product-img" />
                            <h5>Protection of customer data</h5>
                            <p>The CPL ensures the safest level of protection of private data using our new approach. With the CPL, all of your client's information will be secure and "unHackable".</p>
                        </div>
                    </div>
                    <div class="col">
                        <div class="product">
                        <img src="https://exertpro.com/wp-content/uploads/2021/06/Website-maintenance-scaled.jpg" alt="" id="product-img" />
                            <h5>Website maintenance/upgrade service</h5>
                            <p>The CPL team will manage and maintain your website. Upgrades to your website will also be available at all time with additional cost.</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Products;