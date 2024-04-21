import './css/community.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import atelierdesim from './css/Screenshot 2024-02-10 130938.png'

import cpl_logo from './logo/cpl_logo2.png'

function Community() {
    return(
        <div class="community">
            {window.localStorage.getItem("language") == "fr" ? <div><h1 id='title'>Nous contacter</h1>
            <h3 style={{"textAlign": "center"}}>Comment ça marche</h3>
            <h5 style={{"textAlign": "center"}}>Comme nous sommes encore un petit projet, nous devons rencontrer nos clients afin d'obtenir des retours et d'améliorer notre technologie. Mais bientôt, l’intégration de CPL ne se fera qu’en quelques clics et sera accessible à tous. </h5>
            <div class="explanation"><div class="row"><div class="step"><img src="https://www.phoenixgroup.org.uk/images/icons/icon-blue-contact.png" alt="" /><p>1 - vous nous contactez <br /> (418 906-6360 ou centralizedpaymentledger@gmail.com)</p></div> <img id="arrow" src="https://cdn0.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/arrow-right-circle-blue-1024.png" alt="" /><div class="step"><img src="https://cdn4.iconfinder.com/data/icons/office-workplace-1/50/7-1024.png" alt="" /><p>2 - nous nous rencontrons afin de comprendre vos besoins et de personnaliser votre expérience</p></div> <img id="arrow" src="https://cdn0.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/arrow-right-circle-blue-1024.png" alt="" /> <div class="step"><img src={cpl_logo} alt="" id='cpl_logo'/><p>3 - nous adaptons rapidement votre système au CPL ou nous en créons un nouveau(cette étape est entièrement réversible et n'entraîne aucune obligation)</p></div></div></div>
            <br />
            <br />
            <h5>Examples de projets:</h5>
            <div class="example"><img src={atelierdesim} alt="" id="atelierdesim" /><h4>Atelier de Simon</h4> <a href="https://atelierdesimon.net">atelierdesimon.net</a> <p>"Atelier de Simon" est une galerie d'art virtuelle qui utilise le CPL pour permettre non seulement des paiements rapides à moindre coût, mais également un hébergement gratuit et la meilleure protection des données privées.</p></div>
            
            </div> : <div><h1 id='title'>Contact us</h1>
            <h3 style={{"textAlign": "center"}}>How does it work</h3>
            <h5 style={{"textAlign": "center"}}>Since we are still a small project, we need to meet with our clients in order to get feedback and improve our technology. But soon, integration of CPL will only take a few clicks and will be available to everyone. </h5>
            <div class="explanation"><div class="row"><div class="step"><img src="https://www.phoenixgroup.org.uk/images/icons/icon-blue-contact.png" alt="" /><p>1 - you contact us <br /> (418 906-6360 or centralizedpaymentledger@gmail.com)</p></div> <img id="arrow" src="https://cdn0.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/arrow-right-circle-blue-1024.png" alt="" /><div class="step"><img src="https://cdn4.iconfinder.com/data/icons/office-workplace-1/50/7-1024.png" alt="" /><p>2 - we meet in order for us to understand your needs and personalize your experience</p></div> <img id="arrow" src="https://cdn0.iconfinder.com/data/icons/social-messaging-ui-color-shapes/128/arrow-right-circle-blue-1024.png" alt="" /> <div class="step"><img src={cpl_logo} alt="" id='cpl_logo'/><p>3 - we quickly adapt your system to the CPL or create a new one(this step is fully reversible and does not come with any obligations)</p></div></div></div>
            <br />
            <br />
            <h5>Examples of previous projects:</h5>
            <div class="example"><img src={atelierdesim} alt="" id="atelierdesim" /><h4>Atelier de Simon</h4> <a href="https://atelierdesimon.net">atelierdesimon.net</a> <p>"Atelier de Simon" is a virtual art gallery that uses the CPL to not only allow fast low-cost payments, but also free hosting and the best protection of private data.</p></div>
            </div>}
            
        </div>
    )
}


export default Community;