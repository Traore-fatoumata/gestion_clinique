/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'

const SharedDataContext = createContext()

// ── Helpers ──────────────────────────────────────────────
function genId(seed) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let result = "CAB-", n = seed * 48271 + 1000003
  for (let i = 0; i < 6; i++) { n = (n*1664525+1013904223)&0x7fffffff; result+=chars[n%chars.length] }
  return result
}
const today = () => new Date().toISOString().slice(0,10)

// ── Données initiales partagées ──────────────────────────
const INIT_PATIENTS = [
  { id:1, pid:genId(1), nom:"Bah Mariama",     dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", quartier:"Ratoma",  secteur:"Lansanayah", profession:"Commerçante",  responsable:"Mamadou Bah"   },
  { id:2, pid:genId(2), nom:"Diallo Ibrahima", dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", quartier:"Kaloum",  secteur:"Boulbinet",  profession:"Enseignant",   responsable:"Lui-même"      },
  { id:3, pid:genId(3), nom:"Sow Fatoumata",   dateNaissance:"1996-11-20", sexe:"F", telephone:"+224 621 77 88 99", quartier:"Dixinn",  secteur:"Yimbayah",   profession:"Étudiante",    responsable:"Mamadou Sow"   },
  { id:4, pid:genId(4), nom:"Kouyaté Mamadou", dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", quartier:"Matam",   secteur:"Tannerie",   profession:"Commerçant",   responsable:"Lui-même"      },
  { id:5, pid:genId(5), nom:"Baldé Aissatou",  dateNaissance:"2018-06-08", sexe:"F", telephone:"+224 625 66 77 88", quartier:"Matoto",  secteur:"Gbessia",    profession:"Élève",        responsable:"Mamadou Baldé" },
  { id:6, pid:genId(6), nom:"Touré Aminata",   dateNaissance:"1994-08-22", sexe:"F", telephone:"+224 620 12 34 56", quartier:"Coyah",   secteur:"Centre",     profession:"Enseignante",  responsable:"Ibrahima Touré"},
  { id:7, pid:genId(7), nom:"Camara Oumou",    dateNaissance:"1991-01-10", sexe:"F", telephone:"+224 623 98 76 54", quartier:"Matam",   secteur:"Tannerie",   profession:"Commerçante",  responsable:"Sékou Camara"  },
]

const INIT_FILE = [
  { id:1, patientId:1, pid:genId(1), nom:"Bah Mariama",     arrivee:"08:15", typeVisite:"consultation", statut:"en_attente", montantTotal:50000, paiement:null, service:"Médecine générale",             docteurId:1, motif:"Fièvre, céphalées"           },
  { id:2, patientId:2, pid:genId(2), nom:"Diallo Ibrahima", arrivee:"08:45", typeVisite:"rendez_vous",  statut:"en_attente", montantTotal:80000, paiement:null, service:"Cardiologie",                   docteurId:2, motif:"Suivi tension"               },
  { id:3, patientId:3, pid:genId(3), nom:"Sow Fatoumata",   arrivee:"09:00", typeVisite:"consultation", statut:"en_salle",   montantTotal:60000, paiement:null, service:"Gynécologie",                   docteurId:5, motif:"Douleur thoracique"          },
  { id:4, patientId:6, pid:genId(6), nom:"Touré Aminata",   arrivee:"10:30", typeVisite:"rendez_vous",  statut:"en_attente", montantTotal:60000, paiement:null, service:"Gynécologie",                   docteurId:5, motif:"CPN 3e trimestre"            },
  { id:5, patientId:7, pid:genId(7), nom:"Camara Oumou",    arrivee:"11:00", typeVisite:"consultation", statut:"en_salle",   montantTotal:60000, paiement:null, service:"Gynécologie",                   docteurId:5, motif:"Travail obstétrical"         },
]

const INIT_CONSULTATIONS = [
  { id:1, patientId:1, date:"2026-03-15", motif:"Fièvre persistante",  service:"Cardiologie",                   docteurId:2, observations:"TA 13/8", symptomes:"Fièvre, fatigue", diagnostics:["Infection virale"], pathologies:["Anémie"], examens:["NFS"], traitements:["Paracétamol 500mg"], commentaires:"Repos 3 jours", signe:true, signeLe:"15/03/2026 10:30", typeConsultation:"standard" },
  { id:2, patientId:2, date:"2026-03-28", motif:"Suivi cardiologie",   service:"Cardiologie",                   docteurId:2, observations:"Tension stable 12/8", symptomes:"Palpitations", diagnostics:["HTA stable"], pathologies:["HTA"], examens:["ECG"], traitements:["Amlodipine 5mg"], commentaires:"Contrôle dans 1 mois", signe:true, signeLe:"28/03/2026 11:00", typeConsultation:"standard" },
  { id:3, patientId:3, date:today(),      motif:"Douleur thoracique",  service:"Cardiologie",                   docteurId:2, observations:"", symptomes:"", diagnostics:[], pathologies:[], examens:[], traitements:[], commentaires:"", signe:false, signeLe:null, typeConsultation:"standard" },
  { id:4, patientId:6, date:"2026-02-01", motif:"CPN 2e trimestre",    service:"Gynécologie",                   docteurId:5, observations:"Échographie normale", symptomes:"—", diagnostics:["Grossesse évolutive"], pathologies:[], examens:["Échographie"], traitements:["Acide folique"], commentaires:"", signe:true, signeLe:"01/02/2026 14:00", typeConsultation:"prenatal" },
  { id:5, patientId:1, date:"2025-11-10", motif:"Migraine, fatigue",   service:"Médecine générale",             docteurId:1, observations:"Repos", symptomes:"Céphalée", diagnostics:["Migraine"], pathologies:[], examens:[], traitements:["Antalgique"], commentaires:"", signe:true, signeLe:"10/11/2025 09:00", typeConsultation:"standard" },
]

const INIT_RDV = [
  { id:1, patientId:3, patient:"Sow Fatoumata",   date:"2026-04-05", heure:"09:00", service:"Gynécologie",   docteur:"Dr. Keïta",  motif:"CPN - 7ème mois",       rappelEnvoye:false },
  { id:2, patientId:1, patient:"Bah Mariama",     date:"2026-04-05", heure:"10:00", service:"Cardiologie",   docteur:"Dr. Camara", motif:"Suivi tension",          rappelEnvoye:true  },
  { id:3, patientId:5, patient:"Baldé Aissatou",  date:"2026-04-07", heure:"08:30", service:"Ophtalmologie", docteur:"Dr. Bah",    motif:"Contrôle vue",           rappelEnvoye:false },
]

const INIT_RESULTATS_LABO = []
const INIT_SOINS = []

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* ignore */ }
}

export function useSharedData() {
  const ctx = useContext(SharedDataContext)
  if (!ctx) throw new Error('useSharedData must be used within SharedDataProvider')
  return ctx
}

export function SharedDataProvider({ children }) {
  const [patients,       setPatients]      = useState(() => load('sd_patients_v1',       INIT_PATIENTS))
  const [file,           setFile]          = useState(() => load('sd_file_v1',           INIT_FILE))
  const [consultations,  setConsultations] = useState(() => load('sd_consultations_v1',  INIT_CONSULTATIONS))
  const [rdv,            setRdv]           = useState(() => load('sd_rdv_v1',            INIT_RDV))
  const [resultatsLabo,  setResultatsLabo] = useState(() => load('sd_resultats_labo_v1', INIT_RESULTATS_LABO))
  const [soins,          setSoins]         = useState(() => load('sd_soins_v1',          INIT_SOINS))

  // ── Patients ──────────────────────────────────────────
  const addPatient = useCallback((p) => {
    setPatients(prev => {
      const next = [...prev, { ...p, id: Date.now(), pid: genId(Date.now()) }]
      save('sd_patients_v1', next); return next
    })
  }, [])
  const updatePatient = useCallback((id, data) => {
    setPatients(prev => { const next = prev.map(p => p.id===id ? {...p,...data} : p); save('sd_patients_v1', next); return next })
  }, [])

  // ── File d'attente ─────────────────────────────────────
  const addToFile = useCallback((entry) => {
    setFile(prev => {
      const next = [...prev, { ...entry, id: Date.now() }]
      save('sd_file_v1', next); return next
    })
  }, [])
  const updateFileEntry = useCallback((id, data) => {
    setFile(prev => { const next = prev.map(f => f.id===id ? {...f,...data} : f); save('sd_file_v1', next); return next })
  }, [])
  const removeFromFile = useCallback((id) => {
    setFile(prev => { const next = prev.filter(f => f.id!==id); save('sd_file_v1', next); return next })
  }, [])

  // ── Consultations ─────────────────────────────────────
  const addConsultation = useCallback((c) => {
    setConsultations(prev => {
      const next = [...prev, { ...c, id: Date.now() }]
      save('sd_consultations_v1', next); return next
    })
  }, [])
  const updateConsultation = useCallback((id, data) => {
    setConsultations(prev => { const next = prev.map(c => c.id===id ? {...c,...data} : c); save('sd_consultations_v1', next); return next })
  }, [])

  // ── RDV ───────────────────────────────────────────────
  const addRdv = useCallback((r) => {
    setRdv(prev => { const next = [...prev, { ...r, id: Date.now() }]; save('sd_rdv_v1', next); return next })
  }, [])
  const updateRdv = useCallback((id, data) => {
    setRdv(prev => { const next = prev.map(r => r.id===id ? {...r,...data} : r); save('sd_rdv_v1', next); return next })
  }, [])
  const removeRdv = useCallback((id) => {
    setRdv(prev => { const next = prev.filter(r => r.id!==id); save('sd_rdv_v1', next); return next })
  }, [])

  // ── Résultats labo ────────────────────────────────────
  const addResultatLabo = useCallback((r) => {
    setResultatsLabo(prev => { const next = [...prev, { ...r, id: Date.now() }]; save('sd_resultats_labo_v1', next); return next })
  }, [])
  const updateResultatLabo = useCallback((id, data) => {
    setResultatsLabo(prev => { const next = prev.map(r => r.id===id ? {...r,...data} : r); save('sd_resultats_labo_v1', next); return next })
  }, [])

  // ── Soins infirmiers ──────────────────────────────────
  const addSoin = useCallback((s) => {
    setSoins(prev => { const next = [...prev, { ...s, id: Date.now() }]; save('sd_soins_v1', next); return next })
  }, [])
  const updateSoin = useCallback((id, data) => {
    setSoins(prev => { const next = prev.map(s => s.id===id ? {...s,...data} : s); save('sd_soins_v1', next); return next })
  }, [])

  return (
    <SharedDataContext.Provider value={{
      patients, addPatient, updatePatient,
      file, addToFile, updateFileEntry, removeFromFile,
      consultations, addConsultation, updateConsultation,
      rdv, addRdv, updateRdv, removeRdv,
      resultatsLabo, addResultatLabo, updateResultatLabo,
      soins, addSoin, updateSoin,
    }}>
      {children}
    </SharedDataContext.Provider>
  )
}
