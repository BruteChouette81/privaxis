import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Logo from "../images/logo.png";
import logo from "../../logo/logo.png";

const Footer = (props) => {
  return (
    <>
      <footer>
        <div className=" footer max-w-full mx-auto px-4 sm:px-6 bg-gray-100 border-t border-b py-30">
          <div className=" grid sm:grid-cols-9 gap-5 py-8 md:py-12 border-t border-gray-200 lg:ml-11">
            <div className="col-span-8 lg:col-span-4">
              {window.screen.width<600 ? <div width={window.screen.width}>
                <h3 className="">
                  {" "}
                  <img src={Logo} width="30%" />
                </h3>
                <div className="text-md font-medium text-gray-600">
                 <h5>about@cpltechnologies.com</h5>
                </div>
              </div> :<div className="box-border border-b-4 border-blue-900 p-8 bg-gray-200 text-gray-600 text-center rounded-lg xl:w-80 mx-auto">
                <h3 className="flex justify-center font-bold text-4xl mb-4">
                  {" "}
                  <img src={props.name =="CPL Technologies" ? Logo : logo} width="50%" />
                </h3>
                <div className="text-md font-medium text-gray-600">
                 <h5>about@cpltechnologies.com</h5>
                </div>
              </div>}
            </div>
            <div className="col-span-6 md:col-span-6 lg:col-span-1 ml-7 mx-auto">
              <h6 className="text-[#013289] text-xl font-bold mb-4"> {window.localStorage.getItem("language") == "en" ? "LINKS" : "LIENS"}</h6>
              <ul className="text-md">
              <li className="mb-2">
                <HashLink
                    to="/"
                    className="text-[#013289] hover:text-gray-900 hover:tracking-wider transition duration-250 ease-in-out"
                  >
                     {window.localStorage.getItem("language") == "en" ? "Home" : "Accueil"}
                  </HashLink>
                </li>
                <li className="mb-2">
                  <HashLink
                    to="/about"
                    className="text-[#013289] hover:text-gray-900 hover:tracking-wider transition duration-250 ease-in-out"
                  >
                     {window.localStorage.getItem("language") == "en" ? "About" : "À Propos"}
                  </HashLink>
                </li>
                
               
                <li className="mb-2">
                  <HashLink
                    to="/contact"
                    className="text-[#013289] hover:text-gray-900 hover:tracking-wider transition duration-250 ease-in-out"
                  >
                    {window.localStorage.getItem("language") == "en" ? "Contact Us" : "Nous Contacter"}
                  </HashLink>
                </li>
              </ul>
            </div>

            <div className="col-span-12 text-center mx-auto lg:col-span-3 font-bold uppercase text-blue-900">
             
            </div>
          </div>

          <div className="flex flex-wrap items-center md:justify-between justify-center mx-auto px-4">
            <div className="w-full md:w-4/12 px-4 mx-auto text-center py-2">
              <div className="text-sm text-gray-200 font-semibold py-1">
                Copyright &copy; {new Date().getFullYear()}
                {"  "}
                <HashLink to="/" className=" hover:text-gray-900">
                  {props.name}
                </HashLink>
                . All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
export default Footer;
