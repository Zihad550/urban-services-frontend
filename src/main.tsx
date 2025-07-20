import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import "slick-carousel/slick/slick-theme.css"
import "slick-carousel/slick/slick.css"
import App from './App.tsx'
import './index.css'
import { store } from './redux/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </StrictMode>,
)
