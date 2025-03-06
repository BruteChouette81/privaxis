import React from "react";
//import kws from "../images/pci.png";

const clientImage = {
  height: "15rem",
  width: "auto",
  mixBlendMode: "colorBurn",
};

const Clients = () => {
  return (
    <div className=" bg-gray-100">
      <section data-aos="fade-up">
        <div className=" py-6">
          <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold">
           {window.localStorage.getItem("language")== "en" ?  "Partners" : "Partnenaires" }
          </h2>
          <div className="flex justify-center">
            <div className="w-24 border-b-4 border-blue-900"></div>
          </div>
        </div>

        <div className="p-16" data-aos="fade-in" data-aos-delay="600">
          <div className="grid sm:grid-cols-3 lg:grid-cols-1">
            <div className="row justify-center">
            <div
              style={clientImage}
              className="overflow-hidden flex justify-center transition-all ease-in-out opacity-100 hover:opacity-100 w-1/6"
            >
              <img src={"https://onlinestorehelp.com/wp-content/uploads/2018/10/shopify-partner.png"} alt="client" />
            </div>
            <div
              style={clientImage}
              className="overflow-hidden flex justify-center transition-all ease-in-out opacity-100 hover:opacity-100 w-1/6"
            >
              <img src={"https://static.vecteezy.com/system/resources/previews/022/100/824/original/paypal-logo-transparent-free-png.png"} alt="client" />
            </div>
            <div
              style={clientImage}
              className="overflow-hidden flex justify-center transition-all ease-in-out opacity-100 hover:opacity-100 w-1/6"
            >
              <img src={"https://logos-world.net/wp-content/uploads/2020/10/Square-Logo.png"} alt="client" />
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Clients;
