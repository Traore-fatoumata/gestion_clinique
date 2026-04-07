import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/Login"
import DashboardSecretaire from "./pages/auth/DashbordSecretaire"
import DashboardMedecinChef from "./pages/auth/DashboardMedecinChef"
import DashboardMedecin from "./pages/auth/DashboardMedecin"
import DashboardLaboratoire from "./pages/auth/DashboardLaboratoire"
import DashboardSoinsInfirmiers from "./pages/auth/DashboardSoinsInfirmiers"
import { ClinicSettingsProvider } from "./hooks/useClinicSettings.jsx"

function App() {
  return (
    <ClinicSettingsProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/secretaire" element={<DashboardSecretaire />} />
        <Route path="/dashboard-medecin-chef" element={<DashboardMedecinChef />} />
        <Route path="/medecin" element={<DashboardMedecin />} />
        <Route path="/laboratoire" element={<DashboardLaboratoire />} />
        <Route path="/soins-infirmiers" element={<DashboardSoinsInfirmiers />} />
      </Routes>
      </BrowserRouter>
    </ClinicSettingsProvider>
  )
}

export default App
