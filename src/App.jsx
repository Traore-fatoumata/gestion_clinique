import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/Login"
import DashboardSecretaire from "./pages/auth/DashbordSecretaire"
import DashboardMedecinChef from "./pages/auth/DashboardMedecinChef"
import DashboardMedecin from "./pages/auth/DashboardMedecin"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/secretaire" element={<DashboardSecretaire />} />
        <Route path="/dashboard-medecin-chef" element={<DashboardMedecinChef />} />
        <Route path="/medecin" element={<DashboardMedecin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App