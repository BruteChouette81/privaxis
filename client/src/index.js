import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import './index.css'
import App from './App'
//<MoralisProvider serverUrl="https://a7p1zeaqvdrv.usemoralis.com:2053/server" appId="N4rINlnVecuzRFow0ONUpOWeSXDQwuErGQYikyte">
ReactDOM.render(
  <React.StrictMode>
     <Router>
      <App />
     </Router>
     
  </React.StrictMode>,
  document.getElementById('root')
)