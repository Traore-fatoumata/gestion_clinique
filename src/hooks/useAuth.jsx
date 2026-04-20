/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

// IDs médecins alignés avec INIT_MEDECINS dans DashboardMedecinChef
// Personnel non-médecin : IDs >= 100 pour éviter les conflits
export const UTILISATEURS = [
  // ── Personnel non-médecin ──────────────────────────────
  { id:101, email:"secretaire@clinique.com",   motDePasse:"1234", route:"/secretaire",             role:"secretaire",  nom:"Mariama Diallo",        titre:"Secrétaire Médicale",              specialite:""                               },
  { id:102, email:"labo@clinique.com",          motDePasse:"1234", route:"/laboratoire",            role:"laborantin",  nom:"Dr. Aboubacar Sylla",   titre:"Biologiste · Labo",                specialite:"Laboratoire"                    },
  { id:103, email:"infirmier@clinique.com",     motDePasse:"1234", route:"/soins-infirmiers",       role:"infirmier",   nom:"Mme. Fatoumata Diallo", titre:"Infirmière Principale",            specialite:"Soins Infirmiers"               },
  // ── Médecin Chef (id:1 = INIT_MEDECINS[0]) ────────────
  { id:1,   email:"chef@clinique.com",          motDePasse:"1234", route:"/dashboard-medecin-chef", role:"medecinChef", nom:"Dr. Amadou Doumbouya",  titre:"Médecin Chef",                     specialite:"Médecine générale"              },
  // ── Médecins (IDs = INIT_MEDECINS ids) ────────────────
  { id:2,   email:"medecin@clinique.com",       motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Camara",            titre:"Médecin — Cardiologie",            specialite:"Cardiologie"                    },
  { id:3,   email:"generaliste@clinique.com",   motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Barry",             titre:"Médecin — Diabétologie",           specialite:"Diabétologie / Endocrinologie"  },
  { id:4,   email:"pediatre@clinique.com",      motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Souaré",            titre:"Médecin — Pédiatrie",              specialite:"Pédiatrie"                      },
  { id:5,   email:"gynecologue@clinique.com",   motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Keïta",   titre:"Médecin — Gynécologie / Obstétrique", specialite:"Gynécologie"                    },
  { id:6,   email:"ophtalmologue@clinique.com", motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Bah",     titre:"Médecin — Ophtalmologie",             specialite:"Ophtalmologie"                  },
  { id:7,   email:"traumatologue@clinique.com", motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Diallo",  titre:"Médecin — Traumatologie",             specialite:"Traumatologie"                  },
  { id:8,   email:"neurologue@clinique.com",    motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Konaté",  titre:"Médecin — Neurologie",                specialite:"Neurologie"                     },
  { id:9,   email:"orl@clinique.com",           motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Traoré",  titre:"Médecin — ORL",                       specialite:"ORL"                            },
  { id:10,  email:"urologue@clinique.com",      motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Baldé",   titre:"Médecin — Urologie",                  specialite:"Urologie"                       },
  { id:11,  email:"chirurgien@clinique.com",    motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Condé",        titre:"Médecin — Chirurgie",                 specialite:"Chirurgie"                      },
  { id:14,  email:"dermatologue@clinique.com", motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Soumah",       titre:"Médecin — Dermatologie",              specialite:"Dermatologie"                   },
  { id:15,  email:"oncologue@clinique.com",    motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Cissé",        titre:"Médecin — Oncologie",                 specialite:"Oncologie"                      },
  { id:16,  email:"infectiologue@clinique.com",motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Bangoura",     titre:"Médecin — Maladies infectieuses",     specialite:"Maladies infectieuses"          },
  { id:17,  email:"stomatologue@clinique.com", motDePasse:"1234", route:"/medecin",                role:"medecin",     nom:"Dr. Fofana",       titre:"Médecin — Stomatologie",              specialite:"Stomatologie"                   },
  // ── Comptabilité ──────────────────────────────────────
  { id:200, email:"comptable@clinique.com",    motDePasse:"1234", route:"/comptabilite",           role:"comptable",   nom:"M. Diallo Oumar",  titre:"Comptable",                           specialite:"Comptabilité"                   },
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
