import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import Game from './containers/Game'
import './styles/app.css'
import configureStore from './store/configureStore'

const store = configureStore();

render(
  <Provider store={store}>
      <Game />
  </Provider>,
  document.getElementById('root')
)
