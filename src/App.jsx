import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/Login"
import DashboardSecretaire from "./pages/auth/DashbordSecretaire"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/secretaire" element={<DashboardSecretaire />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
