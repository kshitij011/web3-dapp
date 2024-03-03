import {  Welcome, Footer, Transactions, Services, Loader } from './components'
import { Navbar } from './components/Navbar.jsx'

function App() {
  return (
    <div className='min-h-screen'>
      <div className='gradient-bg-welcome'>
        <Navbar />
        <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
    </div>
  )
}

export default App
