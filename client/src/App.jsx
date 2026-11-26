import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute, { GuestOnlyRoute } from './components/ProtectedRoute'
import { BackIcon } from './components/Icons'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import EventPage from './pages/Event/EventPage'
import SupplyList from './pages/SupplyList/SupplyList'
import Itinerary from './pages/Itinerary/Itinerary'
import PlanningChecklist from './pages/PlanningChecklist/PlanningChecklist'
import Budget from './pages/Budget/Budget'

// Shows a feature page (supply list, itinerary, ...) inside an event, with a
// link back to the event.
// Note: these features' API routes still use TEST_EVENT_ID, so every event
// shows the same data until each route reads the event id from the URL.
function InEvent({ children }) {
  const { id } = useParams()
  return (
    <main className="container" style={{ paddingTop: 28 }}>
      <Link to={`/events/${id}`} className="back"><BackIcon /> Back to event</Link>
      {children}
    </main>
  )
}

//main app
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Story 1: only for logged-out visitors */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Everything else needs a logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events/:id" element={<EventPage />} />
          <Route path="/events/:id/supplies" element={<InEvent><SupplyList /></InEvent>} />
          <Route path="/events/:id/itinerary" element={<InEvent><Itinerary /></InEvent>} />
          <Route path="/events/:id/planning-checklist" element={<InEvent><PlanningChecklist /></InEvent>} />
          <Route path="/events/:id/budget" element={<InEvent><Budget /></InEvent>} />

          {/* earlier routes, kept until features use real event ids */}
          <Route path="/supplies" element={<main className="container"><SupplyList /></main>} />
          <Route path="/itinerary" element={<main className="container"><Itinerary /></main>} />
          <Route path="/planning-checklist" element={<main className="container"><PlanningChecklist /></main>} />
          <Route path="/budget" element={<main className="container"><Budget /></main>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
