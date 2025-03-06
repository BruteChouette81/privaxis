import { useEffect } from "react";
import "./css/token.css"

function About(props) {
    const holders = 5; 
    const etherscan = () => {
        window.location.replace("https://etherscan.io/token/0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565")
    }
    const upcoming = () => {
        alert("Upcoming feature! We are working on it")
    }
    const liquidity = () => {
        window.location.replace("/liquidity")
    }
    const whitepaper = () => {
        window.location.replace("/whitepaper") // change to idea page
    }
    //find a chart site
    //white paper link https://drive.google.com/file/d/1J0zWu2maYsf6AoP6FMjcIqrLnhg52C-1/view?usp=drive_link
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
   
    return (
        window.localStorage.getItem("language") !== "en" ? 
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
                
                <div style={{"marginTop": "11%", "fontSize": "16pt"}}>
                <h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900 uppercase">À propos</h1>
                 {/*<h3>Chez {props.name} Technologies, nous comprenons que la protection des données client n’est pas seulement une question de conformité : il s’agit également de confiance, de réputation et de réussite de votre entreprise.</h3> */}
                    <div class='why-site'>
                        <h3>La confidentialité comme valeur centrale</h3>
                        <p>
                        Dans un monde où la protection des données est cruciale, {props.name} se distingue en plaçant la <strong>confidentialité des informations clients</strong> au cœur de ses solutions. Avec {props.name}, vos clients peuvent avoir l’assurance que leurs données personnelles restent privées et protégées contre tout usage non autorisé.
                       </p>
                    </div>
                    <div className="why-account">
                        <h3>Protection renforcée et conformité légale</h3>
                       <p> {props.name} agit comme un rempart contre les menaces. Notre application assure :</p>
                       <li>
                        
                        Une <strong>sécurité avancée</strong> pour prévenir les vols de données et les violations de système.
                       
                       </li>
                       <li>
                        
                        Une <strong>conformité totale aux lois et règlements</strong> sur la protection des données au Québec, vous épargnant des amendes ou des poursuites coûteuses.
                       
                       </li>
                    </div>
                    <div className="why-account">
                        <h3>Rentabilité et innovation à votre portée</h3>
                        <p>
                        {props.name} a été conçu pour être à la fois performant et économique. Nous comprenons les contraintes budgétaires des marchands et avons développé une licence qui :
                        </p>
                        <li>
                        Coûte <strong>moins cher que les alternatives</strong> disponibles sur le marché.
                        </li>
                        <li>
                        Vous aide à <strong>optimiser vos ressources</strong> tout en maintenant un haut niveau de sécurité.
                        </li>
                    </div>
                    <div className="why-account">
                        <h3>Une promesse de confiance</h3>
                        <p>
                        Avec  {props.name}, vous bénéficiez d’un partenaire fiable, dévoué à protéger votre entreprise et à renforcer la confiance de vos clients. En mettant la confidentialité des données clients au premier plan, nous nous engageons à vous offrir une solution qui inspire confiance et fidélité.
<br />
Choisissez  {props.name}. Parce que la sécurité et la confidentialité ne sont pas des options, mais des engagements.
                        </p>
                    </div>
                    <h1>FAQ</h1>
                    <div className="why-account">
                    <p>
<a data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
<img src="https://www.clipartbest.com/cliparts/7Ta/6eR/7Ta6eRqLc.png" alt="" style={{"height":"50px", "float": "left"}}/>Plans d'abonnement
</a>

</p>
<div class="collapse" id="collapseExample">
<div class="card card-body">
<p>
1. Quelles sont les différences entre les trois niveaux d'abonnement ?
<br />
<li>
<strong>Niveau Bronze</strong> : un thème Shopify Liquid prêt à l'emploi avec des améliorations de confidentialité intégrées.
</li>
<li>
<strong>Niveau Argent</strong> : intégration avec des vitrines personnalisées, offrant une protection renforcée des données.
</li>
<li>
<strong>Niveau Or</strong> : un site Web entièrement personnalisé adapté à vos besoins, exploitant la technologie Privaxis.
</li>
</p>
<p>
2. Puis-je changer de niveau d'abonnement ultérieurement ?
<br />
Oui ! Vous pouvez mettre à niveau votre abonnement à tout moment à mesure que votre entreprise se développe et que vos besoins évoluent.
</p>
<p>
3. Que se passe-t-il si j'annule mon abonnement ?
<br />
Si vous annulez, votre boutique reviendra à la sécurité des données standard fournie par votre plateforme de commerce électronique. Toutes les fonctionnalités améliorées par {props.name} seront supprimées.
</p>
</div>
                  </div>
                  </div>
                  <div className="why-account">
                  <p>
                    
<a data-bs-toggle="collapse" href="#collapseExample1" role="button" aria-expanded="false" aria-controls="collapseExample1">
<img src="https://www.clipartbest.com/cliparts/7Ta/6eR/7Ta6eRqLc.png" alt="" style={{"height":"50px", "float": "left"}}/> Sécurité et confidentialité
</a>

</p>
<div class="collapse" id="collapseExample1">
<div class="card card-body">
<p>1. Comment {props.name} garantit-il la sécurité des données de mes clients ?
<br />
{props.name} a créé une nouvelle façon de gérer les données en utilisant une technologie décentralisée et un cryptage de pointe pour permettre aux informations personnelles de vos clients de rester privées.
</p>
<p>
2.  {props.name} est-il conforme aux réglementations en matière de protection des données ?
<br />
Oui,  {props.name} est conçue pour vous aider à respecter les normes mondiales de confidentialité, y compris la loi québécoise sur la protection des informations des clients.
</p>
<p>3.  {props.name} stocke-t-elle les données de mes clients ?
<br />
Non, nous ne stockons aucune donnée client.  {props.name} agit comme une couche protectrice sur votre infrastructure de données existante.
</p>
</div>
</div>
                  </div>
                  <div className="why-account">
                    <p>
                    <a data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample2">
                    <img src="https://www.clipartbest.com/cliparts/7Ta/6eR/7Ta6eRqLc.png" alt="" style={{"height":"50px", "float": "left"}}/>Tarification et facturation
</a>

</p>
<div class="collapse" id="collapseExample2">
<div class="card card-body">
<p>
1. Combien coûte  {props.name} ?
<br />
La tarification dépend de votre niveau d'abonnement :
<li>
<strong>Niveau Bronze</strong> : 15 $/mois
</li>
<li>
<strong>Niveau Argent</strong> : 100 $/mois
</li>
<li>
<strong>Niveau Or</strong> : tarification personnalisée en fonction de votre projet.
</li>
</p>
<p>
2. Existe-t-il un essai gratuit ?
<br />
Oui, nous proposons un essai gratuit de 30 jours pour tous les niveaux afin de vous permettre de découvrir Privaxis sans risque.
</p>
<p>
3. Y a-t-il des frais supplémentaires ?
<br />
Pas de frais cachés ! Vous ne payez que le coût de votre abonnement !
</p>
                    </div>
                  </div>
                  </div>
                  </div>
            </div></div></div> :  <div className="hero relative" id="hero">
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
             
                   <div style={{"marginTop": "11%", "fontSize": "16pt"}}>
                   <h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900 uppercase">About</h1>

                   <div class='why-site'>
                   <h3>Privacy as a Core Value</h3>
                    <p>
                    In a world where data protection is crucial, {props.name} stands out by placing <strong>customer privacy</strong> at the heart of its solutions. With {props.name}, your customers can be assured that their personal data remains private and protected from unauthorized use.
                    </p>
                    </div>
                    <div className="why-account">
                    <h3>Enhanced Protection and Legal Compliance</h3>
                    <p>{props.name} acts as a bulwark against threats. Our application ensures:</p>
                    <li>

                    <strong>Advanced security</strong> to prevent data theft and system breaches.

                    </li>
                    <li>

                    <strong>Full compliance with data protection laws and regulations</strong> in Quebec, saving you from costly fines or prosecutions.

                    </li>
                    </div>
                    <div className="why-account">
                    <h3>Profitability and innovation at your fingertips</h3>
<p>
{props.name} has been designed to be both efficient and cost-effective. We understand the budgetary constraints of merchants and have developed a license that:
</p>
<li>
Costs <strong>less than the alternatives</strong> available on the market.
</li>
<li>
Helps you <strong>optimize your resources</strong> while maintaining a high level of security.
</li>
                    </div>
                    <div className="why-account">
                    <h3>A Promise of Trust</h3>
<p>
With {props.name}, you benefit from a reliable partner, dedicated to protecting your business and strengthening your customers’ trust. By putting customer data confidentiality at the forefront, we are committed to offering you a solution that inspires trust and loyalty.
<br />
Choose {props.name}. Because security and confidentiality are not options, but commitments.
</p>
                    </div>
                    <h1>FAQ</h1>
                    <div className="why-account">
                    <p>
                    <a  data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                    <img src="https://www.clipartbest.com/cliparts/7Ta/6eR/7Ta6eRqLc.png" alt="" style={{"height":"50px", "float": "left"}}/>Subscription Plans
                    </a>
                   
                  </p>
                  <div class="collapse" id="collapseExample">
                    <div class="card card-body">
                     <p>
                      1. What are the differences between the three subscription tiers?
                      <br />
                      <li>
                      <strong>Bronze Tier</strong>: A ready-to-use Shopify Liquid theme with built-in privacy enhancements.
                      </li>
                      <li>
                      <strong>Silver Tier</strong>: Integration with custom storefronts, providing enhanced data protection.
                      </li>
                      <li>
                      <strong>Gold Tier</strong>: A fully custom-built website tailored to your needs, leveraging Privaxis technology.
                      </li>
                     </p>
                     <p>
                      2. Can I switch between subscription tiers later?
                      <br />
                      Yes! You can upgrade your subscription at any time as your business grows and your needs evolve.
                      </p>
                     <p>
                      3. What happens if I cancel my subscription?
                      <br />
                      If you cancel, your store will revert to the standard data security provided by your e-commerce platform. All {props.name}-enhanced features will be removed.
                      </p>
                    </div>
                  </div>
                  </div>
                  <div className="why-account">
                    <p>
                    <a  data-bs-toggle="collapse" href="#collapseExample1" role="button" aria-expanded="false" aria-controls="collapseExample1">
                    <img src="https://www.clipartbest.com/cliparts/7Ta/6eR/7Ta6eRqLc.png" alt="" style={{"height":"50px", "float": "left"}}/>Security and Privacy
                    </a>
                   
                  </p>
                  <div class="collapse" id="collapseExample1">
                    <div class="card card-body">
                     <p>1. How does {props.name} ensure my customers’ data is secure?
                      <br />
                      {props.name} created a new way of dealing with data using decentralized technology and state-of-the-art encryption to allow your customers’ personal information to remain private.
                     </p>
                     <p>
                      2. Is {props.name} compliant with data protection regulations?
                      <br />
                      Yes, {props.name} is designed to help you meet global privacy standards, including Quebec's law for protection of customer information.
                     </p>
                     <p>3. Does {props.name} store my customers’ data?
                      <br />
                      No, we do not store any customer data. {props.name} acts as a protective layer over your existing data infrastructure.
                     </p>
                    </div>
                  </div>
                  </div>
                  <div className="why-account">
                    <p>
                    <a  data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample2">
                    <img src="https://www.clipartbest.com/cliparts/7Ta/6eR/7Ta6eRqLc.png" alt="" style={{"height":"50px", "float": "left"}}/>Pricing and Billing
                    </a>
                   
                  </p>
                  <div class="collapse" id="collapseExample2">
                    <div class="card card-body">
                      <p>
                      1. How much does {props.name} cost?
                      <br />
                      Pricing depends on your subscription tier:
                      <li>
                      <strong>Bronze Tier</strong>: 15$/month
                      </li>
                      <li>
                      <strong>Silver Tier</strong>: 100$/month
                      </li>
                      <li>
                      <strong>Gold Tier</strong>: Custom pricing based on your project.
                      </li>
                      </p>
                      <p>
                      2. Is there a free trial available?
                      <br />
                      Yes, we offer a 30-day free trial for the any Tier to let you experience Privaxis risk-free.
                      </p>
                      <p>
                      3. Are there additional fees?
                      <br />
                      No hidden fees! You only pay your subscription cost!
                      </p>
                    </div>
                  </div>
                  </div>
                  </div>
              
            </div> </div></div>
        
            
                    
                    
        )
    
}
export default About;