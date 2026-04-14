import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/Login"
import DashboardSecretaire from "./pages/auth/DashbordSecretaire"
import DashboardMedecinChef from "./pages/auth/DashboardMedecinChef"
import DashboardMedecin from "./pages/auth/DashboardMedecin"
import DashboardLaboratoire from "./pages/auth/DashboardLaboratoire"
import DashboardSoinsInfirmiers from "./pages/auth/DashboardSoinsInfirmiers"
import { ClinicSettingsProvider } from "./hooks/useClinicSettings.jsx"
import { AuthProvider } from "./hooks/useAuth.jsx"
import { SharedDataProvider } from "./hooks/useSharedData.jsx"
import PrivateRoute from "./components/PrivateRoute.jsx"

function App() {
  return (
    <AuthProvider>
      <ClinicSettingsProvider>
        <SharedDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/secretaire" element={
                <PrivateRoute role="secretaire"><DashboardSecretaire /></PrivateRoute>
              }/>
              <Route path="/dashboard-medecin-chef" element={
                <PrivateRoute role="medecinChef"><DashboardMedecinChef /></PrivateRoute>
              }/>
              <Route path="/medecin" element={
                <PrivateRoute role="medecin"><DashboardMedecin /></PrivateRoute>
              }/>
              <Route path="/laboratoire" element={
                <PrivateRoute role="laborantin"><DashboardLaboratoire /></PrivateRoute>
              }/>
              <Route path="/soins-infirmiers" element={
                <PrivateRoute role="infirmier"><DashboardSoinsInfirmiers /></PrivateRoute>
              }/>
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </BrowserRouter>
        </SharedDataProvider>
      </ClinicSettingsProvider>
    </AuthProvider>
  )
}

export default App
