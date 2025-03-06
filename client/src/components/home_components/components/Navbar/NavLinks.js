import React from "react";
import { HashLink } from "react-router-hash-link";

const NavLinks = () => {
  const setLanguage = () => {
    if (window.localStorage.getItem("language") == "en") {
      window.localStorage.setItem("language", "fr")
      window.location.reload()
    } else {
      window.localStorage.setItem("language", "en")
      window.location.reload()
    }
    
  }
  return (
    <>
      <HashLink
        className="px-4 font-extrabold text-gray-500 hover:text-blue-900"
        to="/about"
      >
        {window.localStorage.getItem("language") == "en" ? "About & FAQ" : "À Propos & FAQ"}
      </HashLink>

      <HashLink
        className="px-4 font-extrabold text-gray-500 hover:text-blue-900"
        to="/license"
      >
        {window.localStorage.getItem("language") == "en" ? "Get a license" : "Obtenir une licence"}
      </HashLink>
     
    
      <HashLink
        className="px-4 font-extrabold text-gray-500 hover:text-blue-900"
        to="/contact"
      >
        {window.localStorage.getItem("language") == "en" ? "Contact Us" : "Nous Contacter"}
      </HashLink>
      <button style={{"textAlign": "start"}} className="px-4 font-extrabold text-gray-500 hover:text-blue-900" onClick={() => {setLanguage()}}>{window.localStorage.getItem("language") == "en" ? "Français" : "English"}</button>
      <HashLink
        className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl"
        to="/seller/0"
      >
        {window.localStorage.getItem("language") == "en" ?  "Partner Sign up" :"Connexion Partenaire"}
      </HashLink>
    </>
  );
};

export default NavLinks;
