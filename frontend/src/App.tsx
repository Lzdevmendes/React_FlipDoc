import React from "react"
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <BrowserRouter>
    <nav style={{ padding: 12}}>
      <Link to="/"></Link> | <Link to="/history">History</Link>
    </nav>
    <Route>
      <Route path="/" element={<UploadPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Route>
    </BrowserRouter>
  )
}
