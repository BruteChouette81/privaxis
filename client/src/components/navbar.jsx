
import logo from './logo/cpl_logo.png' 
import menu from './css/menu.png'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import './css/navbar.css'

//https://drive.google.com/file/d/1J0zWu2maYsf6AoP6FMjcIqrLnhg52C-1/view?usp=drive_link

function NewNavBar() {
  const setFrench = () => {
    window.localStorage.setItem("language", "fr")
    window.location.reload()
  }
  const setEnglish = () => {
    window.localStorage.setItem("language", "en")
    window.location.reload()
  }
  /*
  <li class="nav-item">
            {window.localStorage.getItem("language") == "fr" ? <a class="nav-link" href="/Token">Nous contacter</a> : <a class="nav-link" href="/Token">Contact us</a>}
            
            </li> */
  return (
    <nav class="navbar navbar-expand-lg navbar-light" style={{"background-color": "white"}}>
      <div class="container-fluid">
        <a className="navbar-brand" href="/">
          <img src={logo} alt="" width="50" height="25" className="d-inline-block align-text-top" />
           - Technologies
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <img src={menu} alt="" width="30" height="24" />
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
            {window.localStorage.getItem("language") == "fr" ? <a class="nav-link active" aria-current="page" href="/">Accueil</a> : <a class="nav-link active" aria-current="page" href="/">Home</a>}
            </li>

            
            <li class="nav-item">
            {window.localStorage.getItem("language") == "fr" ? <a class="nav-link" href="/products"> Nos produits</a> : <a class="nav-link" href="/products">Our products</a>}

            </li>
            
            <li class="nav-item">
            {window.localStorage.getItem("language") == "fr" ? <a class="nav-link" href="/about"> À propos</a> : <a class="nav-link" href="/about">About</a>}

            </li>
          
            <li class="nav-item">
            {window.localStorage.getItem("language") == "fr" ? <a class="nav-link" href="/contact">Nous contacter</a> : <a class="nav-link" href="/contact">Contact us</a>}
            
            </li>

            <li class="nav-item">
            {window.localStorage.getItem("language") == "fr" ?  <div><button onClick={() => {window.location.replace("/websitebuilder")}} class="btn btn-outline-success me-2" style={{ float:"left", paddingLeft: 20 + "px", paddingRight: 20 + "px"}}>Construire son site gratuitement</button> </div>:  <div><button onClick={() => {window.location.replace("/websitebuilder")}} class="btn btn-outline-success me-2" style={{ float:"left", paddingLeft: 20 + "px", paddingRight: 20 + "px"}}>Free website builder</button></div>}
            </li>
            
          </ul>
          <ul class="navbar-nav ms-auto" style={{"paddingRight": 200 + "px"}}>
            <li class="nav-item">
            <div><button onClick={setFrench} class="btn btn-outline-dark me-2" style={{ float:"left", paddingLeft: 20 + "px", paddingRight: 20 + "px"}}>Français</button> <button onClick={setEnglish} class="btn btn-outline-dark me-2">English</button></div> 
              
            </li>
          </ul>
        </div>
      </div>
    </nav>
  ) //Q&A = /Blog

}
  

export default NewNavBar;
