import React from "react";
import Clients from "./home_components/components/Clients";
import Cta from "./home_components/components/Cta";
import Hero from "./home_components/components/Hero";
import Services from "./home_components/components/Services";
import Canvas from "./home_components/components/Animations/Canvas";

const Home = (props) => {
  return (
    <>
     
      <Hero name={props.name} />
      <Canvas />
      <Services name={props.name}/>
      <Canvas />
      <Clients name={props.name}/>
      <Canvas />
      <Cta />
     
    </>
  );
};

export default Home;
