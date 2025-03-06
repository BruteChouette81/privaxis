import './css/community.css'
import { useEffect } from "react";
//import { Link } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css'

//import atelierdesim from './css/Screenshot 2024-02-10 130938.png'

//import cpl_logo from './logo/cpl_logo2.png'

function Community() {
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
           
              {window.screen.width <700 ? window.localStorage.getItem("language") !== "en" ? <div>
            
            <div  style={{"marginTop": "20%", "textAlign": "start", "paddingLeft": "0%", "paddingRight": "0%"}}>
              <div class="why-site">
                <h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900">Contactez-nous</h1>
                <h3>Entrez en contact avec notre équipe pour en savoir plus ou obtenir une démo. </h3>
               <h4> <a href="mailto:about@cpltechnologies.com?subject=Question sur les Technologies CPL">about@cpltechnologies.com</a></h4>
               <p>Téléphone: <a href="tel:+1418-906-6360">418 906-6360</a></p>
               </div>
            </div>
            <br />
            <br />
           
            </div> : <div style={{"marginTop": "20%", "textAlign": "start", "paddingLeft": "0%", "paddingRight": "0%"}}> <div class="why-site"><h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900">Contact us</h1>
            <h3>Get in touch with our team to learn more or get a demo.</h3>
            <h4> <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">about@cpltechnologies.com</a></h4>
            <p>Phone: <a href="tel:+1418-906-6360">418 906-6360</a></p></div>
            </div> : window.localStorage.getItem("language") == "fr" ? <div>
            
            <div  style={{"marginTop": "11%", "textAlign": "start", "paddingLeft": "25%", "paddingRight": "25%"}}>
              <div class="why-site">
                <h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900">Contactez-nous</h1>
                <h3>Entrez en contact avec notre équipe pour en savoir plus ou obtenir une démo. </h3>
               <h3> <a href="mailto:about@cpltechnologies.com?subject=Question sur les Technologies CPL">about@cpltechnologies.com</a></h3>
               <p>Téléphone: <a href="tel:+1418-906-6360">418 906-6360</a></p>
               </div>
            </div>
            <br />
            <br />
           
            </div> : <div style={{"marginTop": "11%", "textAlign": "start", "paddingLeft": "25%", "paddingRight": "25%"}}> <div class="why-site"><h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900">Contact us</h1>
            <h3>Get in touch with our team to learn more or get a demo.</h3>
            <h3> <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">about@cpltechnologies.com</a></h3>
            <p>Phone: <a href="tel:+1418-906-6360">418 906-6360</a></p></div>
            </div>}
              
            </div>
           
            </div></div>
           
            
      
    )
}
/**   <div class="community">
        
            <canvas
          id="gradientCanvas"
          className="absolute mob-nav top-[-16px] left-0 w-full h-full -z-10"
        ></canvas>{window.localStorage.getItem("language") == "fr" ? <div>
            
            <div  style={{"marginTop": "11%", "textAlign": "start", "paddingLeft": "20%", "paddingRight": "20%"}}>
              <div class="why-site">
                <h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900">Contactez-nous</h1>
                <h3>Entrez en contact avec notre équipe pour en savoir plus ou obtenir une démo. </h3>
               <h3> <a href="mailto:about@cpltechnologies.com?subject=Question sur les Technologies CPL">about@cpltechnologies.com</a></h3>
               <p>Téléphone: <a href="tel:+1418-906-6360">418 906-6360</a></p>
               </div>
            </div>
            <br />
            <br />
           
            </div> : <div style={{"marginTop": "11%", "textAlign": "start", "paddingLeft": "20%", "paddingRight": "20%"}}> <div class="why-site"><h1 className="mb-5 md:text-4xl text-3xl font-bold text-blue-900">Contact us</h1>
            <h3>Get in touch with our team to learn more or get a demo.</h3>
            <h3> <a href="mailto:about@cpltechnologies.com?subject=CPL Technology demo request">about@cpltechnologies.com</a></h3>
            <p>Phone: <a href="tel:+1418-906-6360">418 906-6360</a></p></div>
            </div>}   </div>*/

export default Community;