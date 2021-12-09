import React, { createRef, useState } from "react"

import { FcApproval, FcBinoculars } from "react-icons/fc"

export const Components = () => {
  const [wow, setWow] = useState("Click me")
  const [selectedColor, setSelectedColor] = useState(null)

  const buttonType = "primary"

  const clickit = () => {
    alert("I'm clicked!")
  }

  const selectit = (e) => {
    setWow(e.target.value)
  }

  const colors =  ['#888', '#c99', '#0ff0ff' ]

  const newColor = e => setSelectedColor(e.target.value)

  const buttonOptions = ["Button to Be Clicked", "I Am Button"]

  const dialog = createRef()

  return <>
    <sl-button type={buttonType} onclick={clickit} onsl-focus={() => { console.info('focuuuus') }}>{wow}</sl-button>

    <br/><br/>

    <sl-select placeholder="Choose a new button label…" onsl-change={selectit}>
      {buttonOptions.map(item => <sl-menu-item key={item} value={item}>{item}</sl-menu-item>)}
    </sl-select>

    <br/>

    <h2 style={{color: selectedColor}}>Hello world! Look at all the colors…</h2>

    <sl-color-picker value="#000" inline swatches={colors} onsl-change={newColor}></sl-color-picker>

    <br/><br/><br/><br/>

    <sl-dialog ref={dialog}>
      <span slot="label"><FcApproval style={{verticalAlign: "text-top"}} /> Cool Dialog with React Icon!</span>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      <sl-button slot="footer" type="warning" outline pill onclick={() => { dialog.current.hide() }}>Close</sl-button>
    </sl-dialog>

    <sl-button style={{"--sl-spacing-small": "0.7rem"}} type="success" outline pill onclick={() => { dialog.current.show() }}>
      <span slot="prefix"><FcBinoculars style={{verticalAlign: "text-top"}} size="1.25rem" /></span>
      Open a Dialog
    </sl-button>
  </>
}
