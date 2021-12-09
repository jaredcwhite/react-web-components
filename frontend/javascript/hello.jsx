import React from "react"
import * as ReactDOM from "react-dom"
import { Components } from "./components"


const rootEl = document.getElementById('root')

if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<Components>Wow!</Components>)
}
