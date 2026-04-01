import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"

function genId(seed) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let result = "CAB-", n = seed * 48271 + 1000003
  for (let i = 0; i < 6; i++) { n = (n * 1664525 + 1013904223) & 0x7fffffff; result += chars[n % chars.length] }
  return result
}

const PATIENTS_INIT = [
  { id: 1, pid: genId(1), nom: "Bah Mariama",     age: 34, dateNaissance: "1990-03-12", adresse: "Ratoma, Conakry",    telephone: "+224 622 11 22 33", sexe: "F", motif: "Consultation générale", arrivee: "08:15", depart: null, statut: "en_attente",      docteur: "Non assigné", tuteur: "" },
  { id: 2, pid: genId(2), nom: "Diallo Ibrahima", age: 52, dateNaissance: "1972-07-04", adresse: "Kaloum, Conakry",    telephone: "+224 628 44 55 66", sexe: "M", motif: "Cardiologie",           arrivee: "08:45", depart: null, statut: "en_salle",   docteur: "Dr. Camara",    tuteur: "" },
  { id: 3, pid: genId(3), nom: "Sow Fatoumata",   age: 28, dateNaissance: "1996-11-20", adresse: "Dixinn, Conakry",    telephone: "+224 621 77 88 99", sexe: "F", motif: "Pédiatrie",             arrivee: "09:00", depart: null, statut: "en_attente", docteur: "Non assigné", tuteur: "" },
  { id: 4, pid: genId(4), nom: "Kouyaté Mamadou", age: 61, dateNaissance: "1963-01-15", adresse: "Matam, Conakry",     telephone: "+224 624 33 44 55", sexe: "M", motif: "Diabétologie",          arrivee: "09:30", depart: null, statut: "en_attente", docteur: "Non assigné", tuteur: "" },
  { id: 5, pid: genId(5), nom: "Baldé Aissatou",  age: 19, dateNaissance: "2005-06-08", adresse: "Matoto, Conakry",    telephone: "+224 625 66 77 88", sexe: "F", motif: "Dermatologie",          arrivee: "10:00", depart: null, statut: "en_attente", docteur: "Non assigné", tuteur: "" },
  { id: 6, pid: genId(6), nom: "Condé Ousmane",   age: 45, dateNaissance: "1979-09-30", adresse: "Lambanyi, Conakry",  telephone: "+224 627 99 00 11", sexe: "M", motif: "Ophtalmologie",         arrivee: "10:20", depart: "11:05", statut: "parti",      docteur: "Dr. Barry",     tuteur: "" },
]

const DOCTEURS = [
  { id: 1, nom: "Dr. Doumbouya", specialite: "Médecine générale", statut: "present",   arrive: "07:30", patients: 4 },
  { id: 2, nom: "Dr. Camara",    specialite: "Cardiologie",       statut: "present",   arrive: "08:00", patients: 3 },
  { id: 3, nom: "Dr. Barry",     specialite: "Diabétologie",      statut: "present",   arrive: "08:15", patients: 2 },
  { id: 4, nom: "Dr. Souaré",    specialite: "Pédiatrie",         statut: "absent",    arrive: null,    patients: 0 },
  { id: 5, nom: "Dr. Keïta",     specialite: "Dermatologie",      statut: "en_retard", arrive: null,    patients: 1 },
]

const RDV_JOUR = [
  { id: 1, heure: "08:00", patient: "Bah Mariama",     docteur: "Dr. Doumbouya", type: "Consultation", statut: "termine" },
  { id: 2, heure: "09:00", patient: "Diallo Ibrahima", docteur: "Dr. Camara",    type: "Suivi cardio", statut: "en_cours" },
  { id: 3, heure: "10:00", patient: "Sow Fatoumata",   docteur: "Dr. Doumbouya", type: "Pédiatrie",    statut: "en_attente" },
  { id: 4, heure: "10:30", patient: "Kouyaté Mamadou", docteur: "Dr. Barry",     type: "Glycémie",     statut: "en_attente" },
  { id: 5, heure: "11:00", patient: "Baldé Aissatou",  docteur: "Dr. Camara",    type: "Dermatologie", statut: "en_attente" },
  { id: 6, heure: "14:00", patient: "Traoré Sekou",    docteur: "Dr. Barry",     type: "Diabétologie", statut: "programme" },
]

// New constants for appointments, histories, and doctor presence
const RDV_INIT = RDV_JOUR.map(r => ({ ...r, patientId: PATIENTS_INIT.find(p => p.nom === r.patient)?.id || null }))
const HISTORIQUES_PATIENTS = [
  { id: 1, patientId: 1, date: "2026-03-30", motif: "Consultation générale", docteur: "Dr. Doumbouya", notes: "Première visite" },
  // Add more as needed
]
const HISTORIQUES_DOCTEURS = [
  { id: 1, docteurId: 1, date: "2026-03-31", arrivee: "07:30", depart: null, patientsVus: 4 },
  // Add more
]

const P = {
  bg: "#f2faf4", sidebar: "#ffffff", card: "#ffffff", cardHover: "#edf7ef",
  hero: "#2d6a3f", heroLight: "#3a8050",
  border: "rgba(61,122,74,0.12)", borderMd: "rgba(61,122,74,0.22)", borderHi: "rgba(61,122,74,0.38)",
  textPri: "#1a3a22", textSec: "#4a7a55", textMuted: "#8aaa90", textWhite: "#ffffff",
  green: "#2d7a3f", greenHov: "#236032", greenSoft: "#e6f4ea", greenGlow: "rgba(45,122,63,0.18)",
  sage: "#2d7a3f", sageBg: "rgba(45,122,63,0.10)",
  amber: "#b45309", amberBg: "rgba(180,83,9,0.09)",
  slate: "#1d6aa6", slateBg: "rgba(29,106,166,0.09)",
  rose: "#c0392b", roseBg: "rgba(192,57,43,0.09)",
  mist: "#6b7280", mistBg: "rgba(107,114,128,0.09)",
}

function Badge({ statut }) {
  const cfg = {
    present:    { label: "Présent",    color: P.sage,  bg: P.sageBg },
    en_salle:   { label: "En salle",   color: P.sage,  bg: P.sageBg,  pulse: true },
    en_cours:   { label: "En cours",   color: P.sage,  bg: P.sageBg,  pulse: true },
    en_attente: { label: "En attente", color: P.amber, bg: P.amberBg },
    en_retard:  { label: "En retard",  color: P.amber, bg: P.amberBg },
    programme:  { label: "Programmé",  color: P.slate, bg: P.slateBg },
    absent:     { label: "Absent",     color: P.rose,  bg: P.roseBg },
    parti:      { label: "Parti",      color: P.mist,  bg: P.mistBg },
    termine:    { label: "Terminé",    color: P.mist,  bg: P.mistBg },
  }
  const s = cfg[statut] || cfg.programme
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: s.bg, color: s.color, fontSize: "11px", fontWeight: 600, padding: "4px 11px", borderRadius: "20px", border: `1px solid ${s.color}20`, whiteSpace: "nowrap" }}>
      {s.pulse && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.color, display: "inline-block", animation: "blink 2s ease-in-out infinite" }} />}
      {s.label}
    </span>
  )
}

function Avatar({ name, size = 32, bg }) {
  const colors = ["#d4edda", "#cce5f0", "#fde8cc", "#f0d4f5", "#d4e6f0"]
  const textColors = ["#2d6a3f", "#1d6aa6", "#b45309", "#7b2d8b", "#1a4a6a"]
  const idx = (name?.charCodeAt(0) || 0) % colors.length
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg || colors[idx], border: `1px solid ${P.borderMd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: textColors[idx], flexShrink: 0 }}>
      {name?.charAt(0)?.toUpperCase()}
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: "18px", overflow: "hidden", boxShadow: "0 1px 8px rgba(45,122,63,0.06)", ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ title, action }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${P.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <p style={{ fontWeight: 700, fontSize: "14px", color: P.textPri }}>{title}</p>
      {action}
    </div>
  )
}

function Btn({ children, onClick, variant = "primary", small = false }) {
  const isPrimary = variant === "primary"
  return (
    <button onClick={onClick} style={{
      background: isPrimary ? P.green : "transparent",
      color: isPrimary ? "#fff" : P.textSec,
      border: isPrimary ? "none" : `1px solid ${P.border}`,
      borderRadius: "10px", padding: small ? "6px 14px" : "10px 20px",
      fontSize: small ? "12px" : "13px", fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", gap: "6px", fontFamily: "inherit",
      transition: "background 0.2s", boxShadow: isPrimary ? `0 2px 10px ${P.greenGlow}` : "none",
    }}
      onMouseEnter={e => e.currentTarget.style.background = isPrimary ? P.greenHov : P.cardHover}
      onMouseLeave={e => e.currentTarget.style.background = isPrimary ? P.green : "transparent"}
    >
      {children}
    </button>
  )
}

// ── Modal fiche patient ──
function ModalPatient({ patient, onClose, onNouvelleConsultation }) {
  if (!patient) return null
  // Check if returning patient
  const isReturning = HISTORIQUES_PATIENTS.filter(h => h.patientId === patient.id).length > 1
  const lastVisit = HISTORIQUES_PATIENTS.filter(h => h.patientId === patient.id).sort((a, b) => new Date(b.date) - new Date(a.date))[1]  // Second last for last visit

  const champs = [
    { label: "ID Clinique",      val: patient.pid },
    { label: "Nom complet",      val: patient.nom },
    { label: "Date de naissance",val: patient.dateNaissance },
    { label: "Âge",              val: `${patient.age} ans` },
    { label: "Sexe",             val: patient.sexe === "F" ? "Féminin" : "Masculin" },
    { label: "Téléphone",        val: patient.telephone },
    { label: "Adresse",          val: patient.adresse },
    { label: "Tuteur",           val: patient.tuteur || "—" },
    // Removed: motif, docteur, arrivee, depart, statut
  ]

  if (isReturning && lastVisit) {
    champs.push(
      { label: "Dernière visite", val: lastVisit.date },
      { label: "Motif dernière",  val: lastVisit.motif },
      { label: "Médecin dernière",val: lastVisit.docteur },
      { label: "Notes dernière",  val: lastVisit.notes }
    )
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {/* En-tête */}
        <div style={{ background: `linear-gradient(135deg, ${P.hero}, ${P.heroLight})`, padding: "24px 28px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Avatar name={patient.nom} size={56} bg="rgba(255,255,255,0.2)" />
          <div style={{ flex: 1 }}>
            <p style={{ color: "#fff", fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>{patient.nom}</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>{patient.pid} · Historique disponible</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", padding: "6px 10px", fontSize: "16px", marginLeft: "8px" }}>✕</button>
        </div>

        {/* Corps */}
        <div style={{ padding: "24px 28px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: P.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Informations du patient</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {champs.map(({ label, val }) => (
              <div key={label} style={{ background: P.bg, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${P.border}` }}>
                <p style={{ fontSize: "10px", color: P.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: P.textPri }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Action nouvelle consultation */}
          <div style={{ background: P.greenSoft, border: `1px solid ${P.borderMd}`, borderRadius: "12px", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: P.textPri, marginBottom: "2px" }}>Nouvelle consultation ?</p>
              <p style={{ fontSize: "12px", color: P.textMuted }}>Signalez au médecin chef pour assigner ce patient</p>
            </div>
            <Btn onClick={() => onNouvelleConsultation(patient)} small>
              Signaler au médecin chef
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardSecretaire() {
  const [onglet, setOnglet]         = useState("accueil")
  const [showForm, setShowForm]     = useState(false)
  const [recherche, setRecherche]   = useState("")
  const [patients, setPatients]     = useState(PATIENTS_INIT)
  const [patientVu, setPatientVu]   = useState(null)
  const [heure, setHeure]           = useState("")
  const [date, setDate]             = useState("")
  const [rdv]                     = useState(RDV_INIT)
  const [historiquesPatients, setHistoriquesPatients] = useState(HISTORIQUES_PATIENTS)
  const [historiquesDocteurs, setHistoriquesDocteurs] = useState(HISTORIQUES_DOCTEURS)
  const [docteursPresence, setDocteursPresence] = useState(DOCTEURS.map(d => ({ ...d, arrivee: d.arrive, depart: null })))
  const [rdvVu, setRdvVu]           = useState(null)
  const [sousOnglet, setSousOnglet] = useState("patients")  // For histories tab
  const [historyFilter, setHistoryFilter] = useState("jour")  // jour, semaine, mois, annee

  // ── Horloge temps réel ──
  useEffect(() => {
    function tick() {
      const now = new Date()
      setHeure(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setDate(now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  const FORM_INIT = { nom: "", prenom: "", dateNaissance: "", adresse: "", sexe: "F", telephone: "", motif: "", tuteur: "" }
  const [form, setForm] = useState(FORM_INIT)

  const now = new Date()
  const totalPatients = patients.length
  const enAttente     = patients.filter(p => p.statut === "en_attente").length
  const enSalle       = patients.filter(p => p.statut === "en_salle").length
  const docPresents   = DOCTEURS.filter(d => d.statut === "present").length

  // ── Recherche fonctionnelle sur tous les champs ──
  const patientsFiltres = patients.filter(p => {
    const q = recherche.toLowerCase().trim()
    if (!q) return true
    return (
      p.nom.toLowerCase().includes(q) ||
      p.motif.toLowerCase().includes(q) ||
      p.docteur.toLowerCase().includes(q) ||
      p.pid.toLowerCase().includes(q) ||
      (p.telephone || "").toLowerCase().includes(q) ||
      (p.adresse || "").toLowerCase().includes(q)
    )
  })

  // ── Tri : rendez-vous en haut (en_attente + en_salle), puis le reste ──
  const patientsAffiches = [...patientsFiltres].sort((a, b) => {
    const priorite = s => (s === "en_attente" || s === "en_salle" ? 0 : 1)
    return priorite(a.statut) - priorite(b.statut)
  })

  // New function to log doctor presence (to prevent cheating)
  const logPresence = (docteurId, action) => {
    const now = new Date()
    const log = { docteurId, action, timestamp: now.toISOString() }
    console.log("Presence Log:", log)  // In real app, send to backend
  }

  const updatePresence = (docteurId, action) => {
    setDocteursPresence(prev => prev.map(d => d.id === docteurId ? { ...d, [action]: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) } : d))
    logPresence(docteurId, action)
    setHistoriquesDocteurs(prev => [...prev, { id: prev.length + 1, docteurId, date: new Date().toISOString().split('T')[0], [action]: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), patientsVus: 0 }])
  }

  const handleAjouter = () => {
    if (!form.nom || !form.prenom) return
    const fullNom = `${form.nom} ${form.prenom}`
    const existingPatient = patients.find(p => p.nom === fullNom)
    if (existingPatient) {
      alert(`Patient ${fullNom} est de retour. Notifié au médecin chef.`)
      setHistoriquesPatients(prev => [...prev, { id: prev.length + 1, patientId: existingPatient.id, date: new Date().toISOString().split('T')[0], motif: form.motif, docteur: "Non assigné", notes: "Retour" }])
      setForm(FORM_INIT)
      setShowForm(false)
      return
    }
    let age = 0
    if (form.dateNaissance) {
      const diff = Date.now() - new Date(form.dateNaissance).getTime()
      age = Math.floor(diff / (365.25 * 24 * 3600 * 1000))
    }
    const nouveau = {
      id: patients.length + 1,
      pid: genId(Date.now() % 999999),
      nom: fullNom,
      age,
      dateNaissance: form.dateNaissance,
      adresse: form.adresse,
      telephone: form.telephone,
      sexe: form.sexe,
      motif: form.motif || "Consultation",
      arrivee: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      depart: null,
      statut: "en_attente",
      docteur: "Non assigné",
      tuteur: form.tuteur,
    }
    setPatients(prev => [nouveau, ...prev])
    setHistoriquesPatients(prev => [...prev, { id: prev.length + 1, patientId: nouveau.id, date: new Date().toISOString().split('T')[0], motif: nouveau.motif, docteur: nouveau.docteur, notes: "Nouvelle visite" }])
    setForm(FORM_INIT)
    setShowForm(false)
  }

  const handleNouvelleConsultation = (patient) => {
    alert(`✅ Le médecin chef a été notifié pour ${patient.nom}.\nUne nouvelle consultation sera ouverte sans nouvel enregistrement.`)
    setPatientVu(null)
  }

  const nav = [
    { id: "accueil",  label: "Accueil",     icon: IcoHome,  desc: "Vue d'ensemble" },
    { id: "patients", label: "Patients",    icon: IcoUsers, desc: "Liste du jour" },
    { id: "docteurs", label: "Médecins",    icon: IcoDoc,   desc: "Présences" },
    { id: "rdv",      label: "Rendez-vous", icon: IcoCal,   desc: "Planning" },
    { id: "historiques", label: "Historiques", icon: IcoHist, desc: "Archives" },
  ]

  const inputSt = {
    width: "100%", padding: "11px 14px", fontSize: "14px",
    border: `1.5px solid ${P.border}`, borderRadius: "10px",
    background: "#f8fdf9", color: P.textPri,
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s, box-shadow 0.2s",
  }
  const focusSt = e => { e.target.style.borderColor = P.borderHi; e.target.style.boxShadow = `0 0 0 3px ${P.greenGlow}` }
  const blurSt  = e => { e.target.style.borderColor = P.border;   e.target.style.boxShadow = "none" }

  return (
    <div style={{ minHeight: "100vh", background: P.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", color: P.textPri }}>

      {/* ═══ MODAL FICHE PATIENT ═══ */}
      <ModalPatient patient={patientVu} onClose={() => setPatientVu(null)} onNouvelleConsultation={handleNouvelleConsultation} />

      {/* ═══ MODAL RDV ═══ */}
      {rdvVu && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={e => { if (e.target === e.currentTarget) setRdvVu(null) }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ background: `linear-gradient(135deg, ${P.hero}, ${P.heroLight})`, padding: "24px 28px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>Rendez-vous</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>{rdvVu.patient} · {rdvVu.heure}</p>
              </div>
              <button onClick={() => setRdvVu(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", padding: "6px 10px", fontSize: "16px" }}>✕</button>
            </div>
            <div style={{ padding: "24px 28px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: P.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Détails du rendez-vous</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: P.bg, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${P.border}` }}>
                  <p style={{ fontSize: "10px", color: P.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Patient</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: P.textPri }}>{rdvVu.patient}</p>
                </div>
                <div style={{ background: P.bg, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${P.border}` }}>
                  <p style={{ fontSize: "10px", color: P.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Médecin</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: P.textPri }}>{rdvVu.docteur}</p>
                </div>
                <div style={{ background: P.bg, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${P.border}` }}>
                  <p style={{ fontSize: "10px", color: P.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Heure</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: P.textPri }}>{rdvVu.heure}</p>
                </div>
                <div style={{ background: P.bg, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${P.border}` }}>
                  <p style={{ fontSize: "10px", color: P.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Type</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: P.textPri }}>{rdvVu.type}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside style={{ width: "240px", background: P.sidebar, borderRight: `1px solid ${P.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", boxShadow: "2px 0 16px rgba(45,122,63,0.06)" }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${P.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={logo} alt="Logo" style={{ width: "50px", height: "50px", borderRadius: "5px", objectFit: "cover", flexShrink: 0, border: `1px solid ${P.borderMd}` }} />
            <div>
              <p style={{ color: P.textPri, fontSize: "15px", fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.2 }}>Clinique</p>
              <p style={{ color: P.green, fontSize: "15px", fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.2 }}>Marouane</p>
            </div>
          </div>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <p style={{ color: P.textMuted, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>Menu principal</p>
          {nav.map((item) => {
            const active = onglet === item.id
            return (
              <button key={item.id} onClick={() => setOnglet(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 12px", borderRadius: "12px", border: "none",
                background: active ? P.greenSoft : "transparent",
                color: active ? P.green : P.textSec,
                fontSize: "13px", fontWeight: active ? 700 : 500,
                cursor: "pointer", textAlign: "left", marginBottom: "3px",
                transition: "all 0.15s",
                boxShadow: active ? `inset 3px 0 0 ${P.green}` : "none",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = P.cardHover }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: active ? P.hero : "rgba(45,122,63,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <item.icon active={active} />
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: active ? 700 : 500, color: active ? P.green : P.textPri, lineHeight: 1.2 }}>{item.label}</p>
                  <p style={{ fontSize: "10px", color: P.textMuted, lineHeight: 1.2, marginTop: "1px" }}>{item.desc}</p>
                </div>
              </button>
            )
          })}
        </nav>

        <div style={{ padding: "16px 16px 20px", borderTop: `1px solid ${P.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: P.greenSoft, borderRadius: "12px", border: `1px solid ${P.borderMd}` }}>
            <Avatar name="S" size={36} bg={P.hero} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: P.textPri, fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}>Secrétaire</p>
              <p style={{ color: P.textMuted, fontSize: "11px", lineHeight: 1.2, marginTop: "1px" }}>Accueil · Clinique Marouane</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Header */}
        <header style={{ padding: "14px 28px", borderBottom: `1px solid ${P.border}`, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>

          {/* ── Barre de recherche ── */}
          <div style={{ position: "relative", width: "340px" }}>
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              placeholder="Nom, ID, médecin, motif, téléphone…"
              value={recherche}
              onChange={e => {
                setRecherche(e.target.value)
                if (e.target.value.trim()) setOnglet("patients")
              }}
              style={{ width: "100%", padding: "9px 36px 9px 38px", fontSize: "13px", border: `1.5px solid ${P.border}`, borderRadius: "10px", background: "#f8fdf9", color: P.textPri, outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = P.borderHi}
              onBlur={e => e.target.style.borderColor = P.border}
            />
            {/* Bouton effacer */}
            {recherche && (
              <button onClick={() => setRecherche("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: P.textMuted, fontSize: "16px", lineHeight: 1, padding: "2px" }}>✕</button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Horloge temps réel */}
            <div style={{ background: P.greenSoft, border: `1px solid ${P.borderMd}`, borderRadius: "10px", padding: "8px 16px", fontSize: "14px", fontWeight: 700, color: P.green, fontVariantNumeric: "tabular-nums", minWidth: "110px", textAlign: "center" }}>
              {heure}
            </div>
           
          </div>
        </header>

        <div style={{ padding: "24px 28px", flex: 1, overflow: "auto" }}>

          {/* Titre */}
          <div style={{ marginBottom: "22px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: P.textPri, letterSpacing: "-0.4px", marginBottom: "3px" }}>
              {onglet === "accueil"  && "Bonjour — Bienvenue sur votre espace"}
              {onglet === "patients" && (recherche ? `Résultats pour « ${recherche} »` : "Patients du jour")}
              {onglet === "docteurs" && "Médecins — Présences"}
              {onglet === "rdv"      && "Rendez-vous du jour"}
              {onglet === "historiques" && "Historiques"}
            </h1>
            <p style={{ color: P.textMuted, fontSize: "13px", textTransform: "capitalize" }}>{date}</p>
          </div>

          {/* ══ ACCUEIL ══ */}
          {onglet === "accueil" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "16px" }}>
                <div style={{ background: `linear-gradient(135deg, ${P.hero} 0%, ${P.heroLight} 100%)`, borderRadius: "18px", padding: "28px 28px 24px", position: "relative", overflow: "hidden", boxShadow: `0 8px 32px ${P.greenGlow}` }}>
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Patients aujourd'hui</p>
                  <p style={{ color: "#fff", fontSize: "52px", fontWeight: 800, lineHeight: 1, letterSpacing: "-2px" }}>{totalPatients}</p>
                </div>
                {[
                  { valeur: enAttente,   label: "En attente",       icon: "⏳", color: P.amber, bg: P.amberBg },
                  { valeur: enSalle,     label: "En consultation",  icon: "🏥", color: P.slate, bg: P.slateBg },
                  { valeur: docPresents, label: "Médecins présents", icon: "👨‍⚕️", color: P.green, bg: P.sageBg },
                ].map(({ valeur, label, icon, bg }) => (
                  <div key={label} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: "18px", padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 1px 8px rgba(45,122,63,0.05)" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "14px" }}>{icon}</div>
                    <div>
                      <p style={{ color: P.textPri, fontSize: "30px", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1 }}>{valeur}</p>
                      <p style={{ color: P.textMuted, fontSize: "12px", marginTop: "5px" }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                <Card>
                  <CardHeader title="Patients du jour" action={<button onClick={() => setOnglet("patients")} style={{ background: "none", border: "none", color: P.green, fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>Tout voir →</button>} />
                  {patients.slice(0, 5).map((p, i) => (
                    <div key={p.id} style={{ padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < 4 ? `1px solid ${P.border}` : "none", transition: "background 0.15s", cursor: "pointer" }}
                      onClick={() => setPatientVu(p)}
                      onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Avatar name={p.nom} size={36} />
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: P.textPri }}>{p.nom}</p>
                          <p style={{ fontSize: "11px", color: P.textMuted }}>{p.motif}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Badge statut={p.statut} />
                        <p style={{ fontSize: "11px", color: P.textMuted, marginTop: "3px" }}>{p.arrivee}</p>
                      </div>
                    </div>
                  ))}
                </Card>

                <Card>
                  <CardHeader title="Médecins présents" action={<button onClick={() => setOnglet("docteurs")} style={{ background: "none", border: "none", color: P.green, fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>Tout voir →</button>} />
                  {DOCTEURS.map((d, i) => (
                    <div key={d.id} style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < DOCTEURS.length - 1 ? `1px solid ${P.border}` : "none", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar name={d.nom.split(" ")[1]} size={34} />
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: P.textPri }}>{d.nom}</p>
                          <p style={{ fontSize: "11px", color: P.textMuted }}>{d.specialite}</p>
                        </div>
                      </div>
                      <Badge statut={d.statut} />
                    </div>
                  ))}
                </Card>
              </div>

              {/* RDV du jour — accueil */}
              <Card>
                <CardHeader title="Rendez-vous du jour" action={<button onClick={() => setOnglet("rdv")} style={{ background: "none", border: "none", color: P.green, fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>Tout voir →</button>} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)" }}>
                  {RDV_JOUR.map((r, i) => (
                    <div key={r.id} style={{ padding: "18px 14px", textAlign: "center", borderRight: i < 5 ? `1px solid ${P.border}` : "none", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <p style={{ fontSize: "18px", fontWeight: 800, color: P.green, marginBottom: "6px", fontVariantNumeric: "tabular-nums" }}>{r.heure}</p>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: P.textPri, marginBottom: "2px" }}>{r.patient.split(" ")[0]}</p>
                      <p style={{ fontSize: "11px", color: P.textMuted, marginBottom: "10px" }}>{r.type}</p>
                      <Badge statut={r.statut} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ PATIENTS ══ */}
          {onglet === "patients" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Formulaire enregistrement */}
              {showForm && (
                <Card style={{ border: `1.5px solid ${P.borderMd}` }}>
                  <div style={{ padding: "22px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <div>
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: P.textPri }}>Enregistrer un nouveau patient</h2>
                        <p style={{ color: P.textMuted, fontSize: "12px", marginTop: "2px" }}>Le médecin chef assignera le médecin après l'enregistrement</p>
                      </div>
                      <Btn onClick={() => setShowForm(false)} variant="secondary" small>✕ Fermer</Btn>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                      {[
                        { label: "Nom de famille",  key: "nom",    placeholder: "Ex : Diallo",    req: true },
                        { label: "Prénom",           key: "prenom", placeholder: "Ex : Aminata",   req: true },
                        { label: "Téléphone",        key: "telephone", placeholder: "+224 6XX XX XX XX" },
                        { label: "Adresse",          key: "adresse", placeholder: "Ex : Ratoma, Conakry", req: true },
                        { label: "Raison de la visite", key: "motif", placeholder: "Ex : Fièvre, douleurs…" },
                        { label: "Tuteur (si mineur)", key: "tuteur", placeholder: "Ex : Bah Mamadou" },
                      ].map(({ label, key, placeholder, req }) => (
                        <div key={key}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: P.textSec, marginBottom: "6px" }}>
                            {label} {req && <span style={{ color: "#c0392b" }}>*</span>}
                          </label>
                          <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                            style={inputSt} onFocus={focusSt} onBlur={blurSt} />
                        </div>
                      ))}

                      {/* Date de naissance */}
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: P.textSec, marginBottom: "6px" }}>
                          Date de naissance <span style={{ color: "#c0392b" }}>*</span>
                        </label>
                        <input type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })}
                          style={inputSt} onFocus={focusSt} onBlur={blurSt} />
                      </div>

                      {/* Sexe */}
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: P.textSec, marginBottom: "6px" }}>Sexe</label>
                        <select value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })} style={{ ...inputSt, cursor: "pointer" }} onFocus={focusSt} onBlur={blurSt}>
                          <option value="F">Féminin</option>
                          <option value="M">Masculin</option>
                        </select>
                      </div>
                    </div>

                    {/* Note médecin chef */}
                    <div style={{ marginTop: "16px", background: P.greenSoft, border: `1px solid ${P.borderMd}`, borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>ℹ️</span>
                      <p style={{ fontSize: "12px", color: P.textSec }}>
                        <strong>L'assignation au médecin est faite par le médecin chef</strong>, pas par la secrétaire. Le patient sera enregistré en statut "En attente".
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${P.border}` }}>
                      <Btn onClick={() => { setShowForm(false); setForm(FORM_INIT) }} variant="secondary">Annuler</Btn>
                      <Btn onClick={handleAjouter}>Enregistrer l'arrivée</Btn>
                    </div>
                  </div>
                </Card>
              )}

              {/* Tableau simplifié */}
              <Card>
                <CardHeader
                  title={`Liste du jour — ${now.toLocaleDateString("fr-FR")} (${patientsAffiches.length} patient${patientsAffiches.length > 1 ? "s" : ""})`}
                  action={!showForm && (
                    <Btn onClick={() => setShowForm(true)} small>
                      Nouveau patient
                    </Btn>
                  )}
                />
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fdf9", borderBottom: `1px solid ${P.border}` }}>
                      {["ID", "Patient", "Action"].map(h => (
                        <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: P.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patientsAffiches.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: P.textMuted, fontSize: "14px" }}>
                          Aucun patient trouvé pour « {recherche} »
                        </td>
                      </tr>
                    ) : patientsAffiches.map((p, i) => (
                      <tr key={p.id}
                        style={{ borderBottom: i < patientsAffiches.length - 1 ? `1px solid ${P.border}` : "none", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: P.green, background: P.greenSoft, padding: "3px 8px", borderRadius: "6px", border: `1px solid ${P.borderMd}` }}>{p.pid}</span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Avatar name={p.nom} size={32} />
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: P.textPri }}>{p.nom}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <button onClick={() => setPatientVu(p)} style={{
                            background: P.greenSoft, border: `1px solid ${P.borderMd}`, borderRadius: "8px",
                            color: P.green, fontSize: "12px", fontWeight: 600, cursor: "pointer",
                            padding: "6px 14px", fontFamily: "inherit", transition: "all 0.15s",
                            display: "flex", alignItems: "center", gap: "5px"
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = P.green; e.currentTarget.style.color = "#fff" }}
                            onMouseLeave={e => { e.currentTarget.style.background = P.greenSoft; e.currentTarget.style.color = P.green }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                            Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ══ DOCTEURS ══ */}
          {onglet === "docteurs" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" }}>
                {[
                  { label: "Présents",  val: DOCTEURS.filter(d => d.statut === "present").length,   color: P.sage,  bg: P.sageBg,  icon: "✅" },
                  { label: "Absents",   val: DOCTEURS.filter(d => d.statut === "absent").length,    color: P.rose,  bg: P.roseBg,  icon: "❌" },
                  { label: "En retard", val: DOCTEURS.filter(d => d.statut === "en_retard").length, color: P.amber, bg: P.amberBg, icon: "⏰" },
                ].map(({ label, val, color, bg, icon }) => (
                  <div key={label} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: "16px", padding: "20px 22px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{icon}</div>
                    <div>
                      <p style={{ fontSize: "26px", fontWeight: 800, color, letterSpacing: "-1px" }}>{val}</p>
                      <p style={{ fontSize: "12px", color: P.textMuted }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
                {docteursPresence.map(d => (
                  <Card key={d.id} style={{ border: `1.5px solid ${d.statut === "present" ? P.borderMd : P.border}` }}>
                    <div style={{ padding: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                        <Avatar name={d.nom.split(" ")[1]} size={48} />
                        <Badge statut={d.statut} />
                      </div>
                      <p style={{ fontSize: "15px", fontWeight: 800, color: P.textPri, marginBottom: "2px" }}>{d.nom}</p>
                      <p style={{ fontSize: "12px", color: P.textSec, marginBottom: "16px" }}>{d.specialite}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div style={{ background: P.bg, borderRadius: "10px", padding: "10px 12px", border: `1px solid ${P.border}` }}>
                          <p style={{ fontSize: "10px", color: P.textMuted, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Arrivée</p>
                          <p style={{ fontSize: "15px", fontWeight: 700, color: d.arrivee ? P.green : P.textMuted }}>{d.arrivee || "—"}</p>
                        </div>
                        <div style={{ background: P.bg, borderRadius: "10px", padding: "10px 12px", border: `1px solid ${P.border}` }}>
                          <p style={{ fontSize: "10px", color: P.textMuted, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Patients</p>
                          <p style={{ fontSize: "15px", fontWeight: 700, color: P.textPri }}>{d.patients}</p>
                        </div>
                      </div>
                      <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                        <Btn onClick={() => updatePresence(d.id, "arrivee")} small>Arrivée</Btn>
                        <Btn onClick={() => updatePresence(d.id, "depart")} small variant="secondary">Départ</Btn>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ══ RDV ══ */}
          {onglet === "rdv" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Appointment Creation Form */}
              <Card>
                <CardHeader title="Créer un rendez-vous" />
                <div style={{ padding: "20px" }}>
                  {/* Simplified form for creating RDV */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <select style={inputSt}>
                      <option>Choisir patient</option>
                      {patients.map(p => <option key={p.id}>{p.nom}</option>)}
                    </select>
                    <select style={inputSt}>
                      <option>Choisir médecin</option>
                      {DOCTEURS.map(d => <option key={d.id}>{d.nom}</option>)}
                    </select>
                    <input type="time" style={inputSt} />
                    <input placeholder="Type (e.g., Consultation)" style={inputSt} />
                    <input type="date" style={inputSt} />
                  </div>
                  <Btn onClick={() => alert("RDV créé (simulation)")} style={{ marginTop: "16px" }}>Créer</Btn>
                </div>
              </Card>
              <Card>
                <CardHeader title={`Rendez-vous — ${now.toLocaleDateString("fr-FR")}`} />
                {rdv.map((r, i) => (
                  <div key={r.id} style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: "20px", borderBottom: i < rdv.length - 1 ? `1px solid ${P.border}` : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "14px", background: P.greenSoft, border: `1px solid ${P.borderMd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <p style={{ fontSize: "15px", fontWeight: 800, color: P.green, fontVariantNumeric: "tabular-nums" }}>{r.heure}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "15px", fontWeight: 700, color: P.textPri, marginBottom: "3px" }}>{r.patient}</p>
                      <p style={{ fontSize: "12px", color: P.textMuted }}>{r.type} · {r.docteur}</p>
                    </div>
                    <Badge statut={r.statut} />
                    <Btn onClick={() => setRdvVu(r)} small>Voir</Btn>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ══ HISTORIQUES ══ */}
          {onglet === "historiques" && (
            <div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <Btn onClick={() => setSousOnglet("patients")}>Patients</Btn>
                <Btn onClick={() => setSousOnglet("docteurs")}>Médecins</Btn>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <select value={historyFilter} onChange={e => setHistoryFilter(e.target.value)} style={{ ...inputSt, width: "200px" }}>
                  <option value="jour">Par jour</option>
                  <option value="semaine">Par semaine</option>
                  <option value="mois">Par mois</option>
                  <option value="annee">Par année</option>
                </select>
              </div>
              {sousOnglet === "patients" && (
                <Card>
                  <CardHeader title="Historiques Patients" />
                  <div style={{ padding: "20px" }}>
                    {historiquesPatients
                      .filter(h => {
                        const today = new Date()
                        const visitDate = new Date(h.date)
                        if (historyFilter === "jour") return visitDate.toDateString() === today.toDateString()
                        if (historyFilter === "semaine") return visitDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                        if (historyFilter === "mois") return visitDate.getMonth() === today.getMonth() && visitDate.getFullYear() === today.getFullYear()
                        if (historyFilter === "annee") return visitDate.getFullYear() === today.getFullYear()
                        return true
                      })
                      .map(h => (
                        <div key={h.id} style={{ padding: "12px", borderBottom: `1px solid ${P.border}` }}>
                          <p>{h.date} - {PATIENTS_INIT.find(p => p.id === h.patientId)?.nom} ({PATIENTS_INIT.find(p => p.id === h.patientId)?.pid}) - {h.motif} - {h.docteur}</p>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
              {sousOnglet === "docteurs" && (
                <Card>
                  <CardHeader title="Historiques Médecins" />
                  <div style={{ padding: "20px" }}>
                    {historiquesDocteurs
                      .filter(h => {
                        const today = new Date()
                        const logDate = new Date(h.date)
                        if (historyFilter === "jour") return logDate.toDateString() === today.toDateString()
                        if (historyFilter === "semaine") return logDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                        if (historyFilter === "mois") return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear()
                        if (historyFilter === "annee") return logDate.getFullYear() === today.getFullYear()
                        return true
                      })
                      .map(h => (
                        <div key={h.id} style={{ padding: "12px", borderBottom: `1px solid ${P.border}` }}>
                          <p>{h.date} - {DOCTEURS.find(d => d.id === h.docteurId)?.nom} - Arrivée: {h.arrivee} - Départ: {h.depart || "—"}</p>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
        * { box-sizing:border-box; margin:0; padding:0; }
        select option { background:#fff; color:#1a3a22; }
        input::placeholder { color:#8aaa90; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(45,122,63,0.2); border-radius:3px; }
      `}</style>
    </div>
  )
}

function IcoHome({ active }) {
  const c = active ? "#fff" : "#4a7a55"
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
}
function IcoUsers({ active }) {
  const c = active ? "#fff" : "#4a7a55"
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function IcoDoc({ active }) {
  const c = active ? "#fff" : "#4a7a55"
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}
function IcoCal({ active }) {
  const c = active ? "#fff" : "#4a7a55"
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}
function IcoHist({ active }) {
  const c = active ? "#fff" : "#4a7a55"
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>
}