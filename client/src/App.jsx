
import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error(error))
  }, [])

  return (
    <div>
      <h1>Event Planner</h1>
      <p>{message}</p>
    </div>
  )
}

export default App
