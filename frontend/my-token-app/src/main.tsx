import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { web3Modal } from './config/web3'

// 将Web3Modal实例暴露到全局，供Layout组件使用
if (typeof window !== 'undefined') {
  (window as any).web3Modal = web3Modal;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
