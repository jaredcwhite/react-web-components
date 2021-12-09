---
# Feel free to add content and custom Front Matter to this file.

layout: home
---

Welcome to [Bridgetown](https://edge.bridgetownrb.com)! (and [React 18 experimental custom element support](https://github.com/facebook/react/commit/24dd07bd269590ee5024b7f0f1906887d256ea86)! 😃 and [Shoelace](https://shoelace.style)!! 🤩)

<div
  id="root"
  style="
    background: white;
    margin: 3rem auto;
    padding: 15px;
    border-radius: 6px;
    box-shadow: var(--sl-shadow-x-large)
  "
></div>


So…this is kind of magical. Shoelace web components without _any_ special-case React bindings or integration _whatsoever_ (this isn't using Shoelace's recent React integration) are now working perfectly fine within a React render tree, including mixing 'n' matching of Shoelace and React components, event handling, JSON objects as props, etc. Holy guacamole.
