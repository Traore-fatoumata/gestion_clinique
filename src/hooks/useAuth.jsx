/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const UTILISATEURS = [
  { id:1, email:"secretaire@clinique.com",  motDePasse:"1234", route:"/secretaire",             role:"secretaire",  nom:"Mariama Diallo",        titre:"Secrétaire Médicale",    specialite:""                          },
  { id:2, email:"medecin@clinique.com",      motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Sekou Keïta",        titre:"Médecin — Cardiologie",  specialite:"Cardiologie"               },
  { id:3, email:"chef@clinique.com",         motDePasse:"1234", route:"/dashboard-medecin-chef", role:"medecinChef", nom:"Dr. Amadou Doumbouya",   titre:"Médecin Chef",           specialite:"Médecine générale"         },
  { id:4, email:"labo@clinique.com",         motDePasse:"1234", route:"/laboratoire",            role:"laborantin",  nom:"Dr. Aboubacar Sylla",    titre:"Biologiste · Labo",      specialite:"Laboratoire"               },
  { id:5, email:"infirmier@clinique.com",    motDePasse:"1234", route:"/soins-infirmiers",       role:"infirmier",   nom:"Mme. Fatoumata Diallo",  titre:"Infirmière Principale",  specialite:"Soins Infirmiers"          },
]

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clinique_user_v1')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const login = (email, motDePasse) => {
    const found = UTILISATEURS.find(u => u.email === email && u.motDePasse === motDePasse)
    if (!found) return { success: false, error: "Email ou mot de passe incorrect." }
    const userData = { id: found.id, email: found.email, role: found.role, nom: found.nom, titre: found.titre, specialite: found.specialite, route: found.route }
    setUser(userData)
    localStorage.setItem('clinique_user_v1', JSON.stringify(userData))
    return { success: true, route: found.route }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('clinique_user_v1')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
