import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/Navbar/NavBar";
import heroImg from "../images/web-dev.svg";

const Hero = (props) => {
  useEffect(() => {
    const canvas = document.getElementById("gradientCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //make a list of blue gradient colors
    let gradientColors = [
      ["#62cff4", "#2c67f2"],
      ["#3cc5d7", "#47d794"],
      
      ["#00d2ff", "#3a7bd5"],
      
      
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
  }, []);

  return (
    window.localStorage.getItem("language") == "en" ? <>
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
            
            className="flex flex-col lg:flex-row py-8 justify-between text-center lg:text-left"
          >
            <div
              className="lg:w-1/2 flex flex-col justify-center"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <h1 style={{"marginTop": "10%"}} className="mb-5 md:text-4xl text-3xl font-bold text-blue-900 uppercase">
              {props.name}: Protect Your Customers, Inspire Trust
              </h1>
              <div className="text-xl font-semibold tracking-tight mb-5 text-gray-500 ">
              In the digital age, data breaches can cost merchants thousands of dollars in lost revenue and reputation. At {props.name}, our mission is clear: to transform the way merchants protect and manage their customers’ data, making data privacy our top priority and key differentiator. We offer an innovative technology solution that ensures your customers have complete privacy of shared data, while allowing you, as a merchant, to operate in a secure, compliant and cost-effective environment.
              </div>
              <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
                <Link
                  to="/about"
                  className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0"
                >
                  Learn more
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
            <div
              className="flex lg:justify-end w-full lg:w-1/2"
              data-aos="fade-up"
              data-aos-delay="700"
            >
              <img
                alt="card img"
                className="rounded-t float-right duration-1000 w-full"
                src={heroImg}
              />
            </div>
          </div>
        </div>
      </div>
    </> : <>
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
            className="flex flex-col lg:flex-row py-8 justify-between text-center lg:text-left"
          >
            <div
              className="lg:w-1/2 flex flex-col justify-center"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <h1 style={{"marginTop": " 10%"}} className="mb-5 md:text-4xl text-3xl font-bold text-blue-900 uppercase">
              
              {props.name}: Protégez vos clients, Inspirez la confiance
              </h1>
              <div className="text-xl font-semibold tracking-tight mb-5 text-gray-500 ">
              À l'ère du numérique, les vols de données peuvent coûter des milliers de dollars aux commerçants en termes de perte de revenus et de réputation. Chez {props.name}, notre mission est claire : transformer la manière dont les marchands protègent et gèrent les données de leurs clients, en faisant de la confidentialité des données notre priorité absolue et notre principal différentiateur. Nous offrons une solution technologique innovante qui garantit à vos clients une confidentialité totale des données partagées, tout en vous permettant, en tant que marchand, d’opérer dans un environnement sécuritaire, conforme et économiquement avantageux.
              </div>
              <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
                <Link
                  to="/about"
                  className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-full px-6 py-3 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0"
                >
                  En savoir plus
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
            <div
              className="flex lg:justify-end w-full lg:w-1/2"
              data-aos="fade-up"
              data-aos-delay="700"
            >
              <img
                alt="card img"
                className="rounded-t float-right duration-1000 w-full"
                src={heroImg}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
