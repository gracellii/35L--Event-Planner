import { useEffect, useState } from 'react'
import { useNavigate, Routes, Route } from 'react-router-dom'
import SupplyList from './pages/SupplyList'
import './App.css'

// Home page
function Home() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error(error))
  }, [])

  return (
    <div className="page-container">
      <h1>Event Planner</h1>
      <p>{message}</p>
    </div>
  )
}

//main app
function App() {
  const navigate = useNavigate()

  return (
    <div>
      <nav className="navbar">
        <h2 className="brand">Event Planner</h2>

        <div className="nav-right">
          <button
            className="nav-button"
            onClick={() => navigate('/')}
          >
            Home
          </button>

          <button
            className="nav-button"
            onClick={() => navigate('/supplies')}
          >
            Supply List
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/supplies" element={<SupplyList />} />
      </Routes>
    </div>
  )
}

export default App 