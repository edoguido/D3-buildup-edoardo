import React from 'react'
import ReactDOM from 'react-dom'
import 'modern-normalize'
import '@accurat/tachyons-lite'
import 'tachyons-extra'
import './reset.css'
import './style.css'
import { App } from './components/App'

function renderApp() {
  ReactDOM.render(<App />, document.getElementById('root'))
}

// First render
renderApp()

// // Hot module reloading
// if (module.hot) {
//   module.hot.accept('components/App', () => {
//     console.clear()
//     renderApp()
//   })
// }
