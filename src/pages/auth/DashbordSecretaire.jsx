import { useState } from "react"
import logo from "../../assets/images/logo.jpeg"

// ── Données fictives ──
function genId(seed) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let result = "CAB-", n = seed * 48271 + 1000003
  for (let i = 0; i < 6; i++) { n = (n * 1664525 + 1013904223) & 0x7fffffff; result += chars[n % chars.length] }
  return result
}

const PATIENTS_INIT = [
  { id: 1, pid: genId(1), nom: "Bah Mariama",     prenom: "", age: 34, motif: "Consultation générale", arrivee: "08:15", depart: "09:10", statut: "parti",      docteur: "Dr. Doumbouya" },
  { id: 2, pid: genId(2), nom: "Diallo Ibrahima", prenom: "", age: 52, motif: "Cardiologie",           arrivee: "08:45", depart: null,    statut: "en_salle",   docteur: "Dr. Camara" },
  { id: 3, pid: genId(3), nom: "Sow Fatoumata",   prenom: "", age: 28, motif: "Pédiatrie",             arrivee: "09:00", depart: null,    statut: "en_attente", docteur: "Dr. Doumbouya" },
  { id: 4, pid: genId(4), nom: "Kouyaté Mamadou", prenom: "", age: 61, motif: "Diabétologie",          arrivee: "09:30", depart: null,    statut: "en_attente", docteur: "Dr. Barry" },
  { id: 5, pid: genId(5), nom: "Baldé Aissatou",  prenom: "", age: 19, motif: "Dermatologie",          arrivee: "10:00", depart: null,    statut: "en_attente", docteur: "Dr. Camara" },
  { id: 6, pid: genId(6), nom: "Condé Ousmane",   prenom: "", age: 45, motif: "Ophtalmologie",         arrivee: "10:20", depart: "11:05", statut: "parti",      docteur: "Dr. Barry" },
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

// ── Palette vert doux ──
const P = {
  bg:        "#f2faf4",
  sidebar:   "#ffffff",
  card:      "#ffffff",
  cardHover: "#edf7ef",
  hero:      "#2d6a3f",   // vert foncé pour la grande carte
  heroLight: "#3a8050",

  border:    "rgba(61,122,74,0.12)",
  borderMd:  "rgba(61,122,74,0.22)",
  borderHi:  "rgba(61,122,74,0.38)",

  textPri:   "#1a3a22",
  textSec:   "#4a7a55",
  textMuted: "#8aaa90",
  textWhite: "#ffffff",

  green:     "#2d7a3f",
  greenHov:  "#236032",
  greenSoft: "#e6f4ea",
  greenGlow: "rgba(45,122,63,0.18)",

  // Sémantiques
  sage:      "#2d7a3f",  sageBg:   "rgba(45,122,63,0.10)",
  amber:     "#b45309",  amberBg:  "rgba(180,83,9,0.09)",
  slate:     "#1d6aa6",  slateBg:  "rgba(29,106,166,0.09)",
  rose:      "#c0392b",  roseBg:   "rgba(192,57,43,0.09)",
  mist:      "#6b7280",  mistBg:   "rgba(107,114,128,0.09)",
}

// ── Composants utilitaires ──
function Badge({ statut }) {
  const cfg = {
    present:    { label: "Présent",    color: P.sage,  bg: P.sageBg  },
    en_salle:   { label: "En salle",   color: P.sage,  bg: P.sageBg,  pulse: true },
    en_cours:   { label: "En cours",   color: P.sage,  bg: P.sageBg,  pulse: true },
    en_attente: { label: "En attente", color: P.amber, bg: P.amberBg },
    en_retard:  { label: "En retard",  color: P.amber, bg: P.amberBg },
    programme:  { label: "Programmé",  color: P.slate, bg: P.slateBg },
    absent:     { label: "Absent",     color: P.rose,  bg: P.roseBg  },
    parti:      { label: "Parti",      color: P.mist,  bg: P.mistBg  },
    termine:    { label: "Terminé",    color: P.mist,  bg: P.mistBg  },
  }
  const s = cfg[statut] || cfg.programme
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", background:s.bg, color:s.color, fontSize:"11px", fontWeight:600, padding:"4px 11px", borderRadius:"20px", border:`1px solid ${s.color}20`, whiteSpace:"nowrap" }}>
      {s.pulse && <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:s.color, display:"inline-block", animation:"blink 2s ease-in-out infinite" }} />}
      {s.label}
    </span>
  )
}

function Avatar({ name, size = 32, bg }) {
  const colors = ["#d4edda","#cce5f0","#fde8cc","#f0d4f5","#d4e6f0"]
  const textColors = ["#2d6a3f","#1d6aa6","#b45309","#7b2d8b","#1a4a6a"]
  const idx = (name?.charCodeAt(0) || 0) % colors.length
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background: bg || colors[idx], border:`1px solid ${P.borderMd}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.38, fontWeight:700, color:textColors[idx], flexShrink:0 }}>
      {name?.charAt(0)?.toUpperCase()}
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:P.card, border:`1px solid ${P.border}`, borderRadius:"18px", overflow:"hidden", boxShadow:"0 1px 8px rgba(45,122,63,0.06)", ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ title, action }) {
  return (
    <div style={{ padding:"16px 20px", borderBottom:`1px solid ${P.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <p style={{ fontWeight:700, fontSize:"14px", color:P.textPri }}>{title}</p>
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
      borderRadius: "10px",
      padding: small ? "6px 14px" : "10px 20px",
      fontSize: small ? "12px" : "13px",
      fontWeight: 600, cursor:"pointer",
      display:"flex", alignItems:"center", gap:"6px",
      fontFamily:"inherit",
      transition:"background 0.2s",
      boxShadow: isPrimary ? `0 2px 10px ${P.greenGlow}` : "none",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = isPrimary ? P.greenHov : P.cardHover }}
      onMouseLeave={e => { e.currentTarget.style.background = isPrimary ? P.green : "transparent" }}
    >
      {children}
    </button>
  )
}

export default function DashboardSecretaire() {
  const [onglet, setOnglet]     = useState("accueil")
  const [showForm, setShowForm] = useState(false)
  const [recherche, setRecherche] = useState("")
  const [patients, setPatients] = useState(PATIENTS_INIT)
  const [form, setForm]         = useState({ nom:"", prenom:"", age:"", sexe:"F", telephone:"", motif:"", docteur:"", tuteur:"" })

  const now   = new Date()
  const heure = now.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })
  const date  = now.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })

  const totalPatients = patients.length
  const enAttente     = patients.filter(p => p.statut === "en_attente").length
  const enSalle       = patients.filter(p => p.statut === "en_salle").length
  const docPresents   = DOCTEURS.filter(d => d.statut === "present").length

  const patientsFiltres = patients.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    p.motif.toLowerCase().includes(recherche.toLowerCase()) ||
    p.docteur.toLowerCase().includes(recherche.toLowerCase())
  )

  const handleAjouter = () => {
    if (!form.nom || !form.prenom) return
    const nouveau = {
      id: patients.length + 1,
      pid: genId(Date.now() % 999999),
      nom: `${form.nom} ${form.prenom}`,
      prenom: "",
      age: parseInt(form.age) || 0,
      motif: form.motif || "Consultation",
      arrivee: now.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }),
      depart: null,
      statut: "en_attente",
      docteur: form.docteur || "Non assigné",
    }
    setPatients(prev => [...prev, nouveau])
    setForm({ nom:"", prenom:"", age:"", sexe:"F", telephone:"", motif:"", docteur:"", tuteur:"" })
    setShowForm(false)
  }

  const nav = [
    { id:"accueil",  label:"Accueil",       icon:IcoHome,  desc:"Vue d'ensemble" },
    { id:"patients", label:"Patients",      icon:IcoUsers, desc:"Liste du jour" },
    { id:"docteurs", label:"Médecins",      icon:IcoDoc,   desc:"Présences" },
    { id:"rdv",      label:"Rendez-vous",   icon:IcoCal,   desc:"Planning" },
  ]

  const inputSt = {
    width:"100%", padding:"11px 14px", fontSize:"14px",
    border:`1.5px solid ${P.border}`, borderRadius:"10px",
    background:"#f8fdf9", color:P.textPri,
    outline:"none", fontFamily:"inherit",
    transition:"border-color 0.2s, box-shadow 0.2s",
  }

  return (
    <div style={{ minHeight:"100vh", background:P.bg, fontFamily:"'Segoe UI', system-ui, sans-serif", display:"flex", color:P.textPri }}>

      {/* ═══════ SIDEBAR ═══════ */}
      <aside style={{ width:"240px", background:P.sidebar, borderRight:`1px solid ${P.border}`, display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh", boxShadow:"2px 0 16px rgba(45,122,63,0.06)" }}>

        

        {/* Logo clinique */}
        <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid ${P.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <img src={logo} alt="Logo" style={{ width:"px", height:"50px", borderRadius:"5px", objectFit:"cover", flexShrink:0, border:`1px solid ${P.borderMd}` }} />
            <div>
              <p style={{ color:P.textPri, fontSize:"15px", fontWeight:800, letterSpacing:"-0.3px", lineHeight:1.2 }}>Clinique</p>
              <p style={{ color:P.green, fontSize:"15px", fontWeight:800, letterSpacing:"-0.3px", lineHeight:1.2 }}>Marouane</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding:"16px 12px", flex:1 }}>
          <p style={{ color:P.textMuted, fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", padding:"0 8px", marginBottom:"8px" }}>Menu principal</p>
          {nav.map(({ id, label, icon:NavIcon, desc }) => {
            const active = onglet === id
            return (
              <button key={id} onClick={() => setOnglet(id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:"12px",
                padding:"11px 12px", borderRadius:"12px", border:"none",
                background: active ? P.greenSoft : "transparent",
                color: active ? P.green : P.textSec,
                fontSize:"13px", fontWeight: active ? 700 : 500,
                cursor:"pointer", textAlign:"left", marginBottom:"3px",
                transition:"all 0.15s",
                boxShadow: active ? `inset 3px 0 0 ${P.green}` : "none",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = P.cardHover }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
              >
                <div style={{ width:"32px", height:"32px", borderRadius:"9px", background: active ? P.hero : "rgba(45,122,63,0.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <NavIcon active={active} />
                </div>
                <div style={{ textAlign:"left" }}>
                  <p style={{ fontSize:"13px", fontWeight: active ? 700 : 500, color: active ? P.green : P.textPri, lineHeight:1.2 }}>{label}</p>
                  <p style={{ fontSize:"10px", color:P.textMuted, lineHeight:1.2, marginTop:"1px" }}>{desc}</p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Profil */}
        <div style={{ padding:"16px 16px 20px", borderTop:`1px solid ${P.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:P.greenSoft, borderRadius:"12px", border:`1px solid ${P.borderMd}` }}>
            <Avatar name="S" size={36} bg={P.hero} />
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:P.textPri, fontSize:"13px", fontWeight:700, lineHeight:1.2 }}>Secrétaire</p>
              <p style={{ color:P.textMuted, fontSize:"11px", lineHeight:1.2, marginTop:"1px" }}>Accueil · Clinique Marouane</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════ CONTENU ═══════ */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

        {/* Header */}
        <header style={{ padding:"14px 28px", borderBottom:`1px solid ${P.border}`, background:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:20 }}>

          {/* Barre de recherche */}
          <div style={{ position:"relative", width:"320px" }}>
            <svg style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              placeholder="Rechercher un patient, un médecin…"
              value={recherche}
              onChange={e => { setRecherche(e.target.value); if (e.target.value) setOnglet("patients") }}
              style={{ width:"100%", padding:"9px 14px 9px 38px", fontSize:"13px", border:`1.5px solid ${P.border}`, borderRadius:"10px", background:"#f8fdf9", color:P.textPri, outline:"none", fontFamily:"inherit" }}
              onFocus={e => e.target.style.borderColor = P.borderHi}
              onBlur={e => e.target.style.borderColor = P.border}
            />
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            {/* Heure */}
            <div style={{ background:P.greenSoft, border:`1px solid ${P.borderMd}`, borderRadius:"10px", padding:"8px 16px", fontSize:"15px", fontWeight:700, color:P.green, fontVariantNumeric:"tabular-nums" }}>
              🕐 {heure}
            </div>
            {/* Bouton nouveau patient */}
            <Btn onClick={() => { setShowForm(true); setOnglet("patients") }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Nouveau patient
            </Btn>
          </div>
        </header>

        <div style={{ padding:"24px 28px", flex:1, overflow:"auto" }}>

          {/* Titre page */}
          <div style={{ marginBottom:"22px" }}>
            <h1 style={{ fontSize:"22px", fontWeight:800, color:P.textPri, letterSpacing:"-0.4px", marginBottom:"3px" }}>
              {onglet === "accueil"  && "Bonjour 👋 Bienvenue sur votre espace"}
              {onglet === "patients" && "Patients du jour"}
              {onglet === "docteurs" && "Médecins — Présences"}
              {onglet === "rdv"      && "Rendez-vous du jour"}
            </h1>
            <p style={{ color:P.textMuted, fontSize:"13px", textTransform:"capitalize" }}>{date}</p>
          </div>

          {/* ══════ ACCUEIL ══════ */}
          {onglet === "accueil" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

              {/* Stat cards — rangée */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"16px" }}>

                {/* Grande carte héro */}
                <div style={{ background:`linear-gradient(135deg, ${P.hero} 0%, ${P.heroLight} 100%)`, borderRadius:"18px", padding:"28px 28px 24px", position:"relative", overflow:"hidden", boxShadow:`0 8px 32px ${P.greenGlow}` }}>
                  <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
                  <div style={{ position:"absolute", bottom:"-30px", right:"30px", width:"80px", height:"80px", borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
                  <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"12px", fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>Patients aujourd'hui</p>
                  <p style={{ color:"#fff", fontSize:"52px", fontWeight:800, lineHeight:1, letterSpacing:"-2px", marginBottom:"10px" }}>{totalPatients}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <span style={{ background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:"11px", fontWeight:600, padding:"3px 10px", borderRadius:"20px" }}>
                      {enAttente} en attente
                    </span>
                    <span style={{ background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:"11px", fontWeight:600, padding:"3px 10px", borderRadius:"20px" }}>
                      {enSalle} en salle
                    </span>
                  </div>
                </div>

                {/* Petites cartes */}
                {[
                  { valeur: enAttente,   label:"En attente",      icon:"⏳", color:P.amber, bg:P.amberBg },
                  { valeur: enSalle,     label:"En consultation", icon:"🏥", color:P.slate, bg:P.slateBg },
                  { valeur: docPresents, label:"Médecins présents", icon:"👨‍⚕️", color:P.green, bg:P.sageBg },
                ].map(({ valeur, label, icon, color, bg }) => (
                  <div key={label} style={{ background:P.card, border:`1px solid ${P.border}`, borderRadius:"18px", padding:"22px 20px", display:"flex", flexDirection:"column", justifyContent:"space-between", boxShadow:"0 1px 8px rgba(45,122,63,0.05)" }}>
                    <div style={{ width:"40px", height:"40px", borderRadius:"11px", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", marginBottom:"14px" }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ color:P.textPri, fontSize:"30px", fontWeight:800, letterSpacing:"-1px", lineHeight:1 }}>{valeur}</p>
                      <p style={{ color:P.textMuted, fontSize:"12px", marginTop:"5px" }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grille 2 colonnes */}
              <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:"16px" }}>

                {/* Patients récents */}
                <Card>
                  <CardHeader
                    title="Patients du jour"
                    action={<button onClick={() => setOnglet("patients")} style={{ background:"none", border:"none", color:P.green, fontSize:"12px", cursor:"pointer", fontWeight:600 }}>Tout voir →</button>}
                  />
                  {patients.slice(0, 5).map((p, i) => (
                    <div key={p.id} style={{ padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom: i < 4 ? `1px solid ${P.border}` : "none", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                        <Avatar name={p.nom} size={36} />
                        <div>
                          <p style={{ fontSize:"13px", fontWeight:600, color:P.textPri }}>{p.nom}</p>
                          <p style={{ fontSize:"11px", color:P.textMuted }}>{p.motif}</p>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <Badge statut={p.statut} />
                        <p style={{ fontSize:"11px", color:P.textMuted, marginTop:"3px" }}>{p.arrivee}</p>
                      </div>
                    </div>
                  ))}
                </Card>

                {/* Médecins */}
                <Card>
                  <CardHeader
                    title="Médecins présents"
                    action={<button onClick={() => setOnglet("docteurs")} style={{ background:"none", border:"none", color:P.green, fontSize:"12px", cursor:"pointer", fontWeight:600 }}>Tout voir →</button>}
                  />
                  {DOCTEURS.map((d, i) => (
                    <div key={d.id} style={{ padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom: i < DOCTEURS.length-1 ? `1px solid ${P.border}` : "none", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                        <Avatar name={d.nom.split(" ")[1]} size={34} />
                        <div>
                          <p style={{ fontSize:"13px", fontWeight:600, color:P.textPri }}>{d.nom}</p>
                          <p style={{ fontSize:"11px", color:P.textMuted }}>{d.specialite}</p>
                        </div>
                      </div>
                      <Badge statut={d.statut} />
                    </div>
                  ))}
                </Card>
              </div>

              {/* RDV du jour */}
              <Card>
                <CardHeader
                  title="Rendez-vous du jour"
                  action={<button onClick={() => setOnglet("rdv")} style={{ background:"none", border:"none", color:P.green, fontSize:"12px", cursor:"pointer", fontWeight:600 }}>Tout voir →</button>}
                />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)" }}>
                  {RDV_JOUR.map((r, i) => (
                    <div key={r.id} style={{ padding:"18px 14px", textAlign:"center", borderRight: i < 5 ? `1px solid ${P.border}` : "none", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <p style={{ fontSize:"18px", fontWeight:800, color:P.green, marginBottom:"6px", fontVariantNumeric:"tabular-nums" }}>{r.heure}</p>
                      <p style={{ fontSize:"12px", fontWeight:600, color:P.textPri, marginBottom:"2px" }}>{r.patient.split(" ")[0]}</p>
                      <p style={{ fontSize:"11px", color:P.textMuted, marginBottom:"10px" }}>{r.type}</p>
                      <Badge statut={r.statut} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══════ PATIENTS ══════ */}
          {onglet === "patients" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"18px" }}>

              {/* Formulaire */}
              {showForm && (
                <Card style={{ border:`1.5px solid ${P.borderMd}` }}>
                  <div style={{ padding:"22px 24px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
                      <div>
                        <h2 style={{ fontSize:"16px", fontWeight:800, color:P.textPri }}>📋 Enregistrer un nouveau patient</h2>
                        <p style={{ color:P.textMuted, fontSize:"12px", marginTop:"2px" }}>Remplissez les informations ci-dessous</p>
                      </div>
                      <Btn onClick={() => setShowForm(false)} variant="secondary" small>✕ Fermer</Btn>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
                      {[
                        { label:"Nom de famille",        key:"nom",       placeholder:"Ex : Diallo",           req:true },
                        { label:"Prénom",                key:"prenom",    placeholder:"Ex : Aminata",           req:true },
                        { label:"Âge",                   key:"age",       placeholder:"Ex : 35" },
                        { label:"Numéro de téléphone",   key:"telephone", placeholder:"+224 6XX XX XX XX" },
                        { label:"Raison de la visite",   key:"motif",     placeholder:"Ex : Fièvre, douleurs…" },
                        { label:"Nom du tuteur (si enfant mineur)", key:"tuteur", placeholder:"Ex : Bah Mamadou" },
                      ].map(({ label, key, placeholder, req }) => (
                        <div key={key}>
                          <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:P.textSec, marginBottom:"6px" }}>
                            {label} {req && <span style={{ color:"#c0392b" }}>*</span>}
                          </label>
                          <input value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={placeholder}
                            style={inputSt}
                            onFocus={e => { e.target.style.borderColor=P.borderHi; e.target.style.boxShadow=`0 0 0 3px ${P.greenGlow}` }}
                            onBlur={e => { e.target.style.borderColor=P.border; e.target.style.boxShadow="none" }}
                          />
                        </div>
                      ))}

                      <div>
                        <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:P.textSec, marginBottom:"6px" }}>Sexe</label>
                        <select value={form.sexe} onChange={e => setForm({...form,sexe:e.target.value})} style={{ ...inputSt, cursor:"pointer" }}>
                          <option value="F">Féminin</option>
                          <option value="M">Masculin</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display:"block", fontSize:"12px", fontWeight:600, color:P.textSec, marginBottom:"6px" }}>Médecin assigné</label>
                        <select value={form.docteur} onChange={e => setForm({...form,docteur:e.target.value})} style={{ ...inputSt, cursor:"pointer" }}>
                          <option value="">— Choisir un médecin —</option>
                          {DOCTEURS.filter(d => d.statut==="present").map(d => (
                            <option key={d.id} value={d.nom}>{d.nom} · {d.specialite}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"20px", paddingTop:"20px", borderTop:`1px solid ${P.border}` }}>
                      <Btn onClick={() => setShowForm(false)} variant="secondary">Annuler</Btn>
                      <Btn onClick={handleAjouter}>✅ Enregistrer l'arrivée</Btn>
                    </div>
                  </div>
                </Card>
              )}

              {/* Tableau patients */}
              <Card>
                <CardHeader
                  title={`Liste du jour — ${now.toLocaleDateString("fr-FR")} (${patientsFiltres.length} patient${patientsFiltres.length>1?"s":""})`}
                  action={
                    !showForm && <Btn onClick={() => setShowForm(true)} small>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      Ajouter
                    </Btn>
                  }
                />
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"#f8fdf9", borderBottom:`1px solid ${P.border}` }}>
                      {["ID", "Patient", "Motif de visite", "Médecin", "Arrivée", "Départ", "Statut"].map(h => (
                        <th key={h} style={{ padding:"11px 18px", textAlign:"left", fontSize:"11px", fontWeight:700, color:P.textMuted, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patientsFiltres.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding:"40px", textAlign:"center", color:P.textMuted, fontSize:"14px" }}>
                        Aucun patient trouvé pour « {recherche} »
                      </td></tr>
                    ) : patientsFiltres.map((p, i) => (
                      <tr key={p.id}
                        style={{ borderBottom: i < patientsFiltres.length-1 ? `1px solid ${P.border}` : "none", transition:"background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding:"13px 18px" }}>
                          <span style={{ fontFamily:"monospace", fontSize:"11px", fontWeight:700, color:P.green, background:P.greenSoft, padding:"3px 8px", borderRadius:"6px", border:`1px solid ${P.borderMd}` }}>{p.pid}</span>
                        </td>
                        <td style={{ padding:"13px 18px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                            <Avatar name={p.nom} size={32} />
                            <div>
                              <p style={{ fontSize:"13px", fontWeight:600, color:P.textPri }}>{p.nom}</p>
                              <p style={{ fontSize:"11px", color:P.textMuted }}>{p.age} ans</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"13px 18px", fontSize:"13px", color:P.textSec }}>{p.motif}</td>
                        <td style={{ padding:"13px 18px", fontSize:"13px", color:P.textPri, fontWeight:500 }}>{p.docteur}</td>
                        <td style={{ padding:"13px 18px" }}>
                          <span style={{ fontSize:"13px", fontWeight:700, color:P.green, fontVariantNumeric:"tabular-nums" }}>{p.arrivee}</span>
                        </td>
                        <td style={{ padding:"13px 18px" }}>
                          {p.depart
                            ? <span style={{ fontSize:"13px", fontWeight:600, color:P.textSec, fontVariantNumeric:"tabular-nums" }}>{p.depart}</span>
                            : <span style={{ color:P.textMuted }}>—</span>
                          }
                        </td>
                        <td style={{ padding:"13px 18px" }}><Badge statut={p.statut} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ══════ DOCTEURS ══════ */}
          {onglet === "docteurs" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"20px" }}>
                {[
                  { label:"Présents",  val:DOCTEURS.filter(d=>d.statut==="present").length,   color:P.sage,  bg:P.sageBg,  icon:"✅" },
                  { label:"Absents",   val:DOCTEURS.filter(d=>d.statut==="absent").length,    color:P.rose,  bg:P.roseBg,  icon:"❌" },
                  { label:"En retard", val:DOCTEURS.filter(d=>d.statut==="en_retard").length, color:P.amber, bg:P.amberBg, icon:"⏰" },
                ].map(({ label, val, color, bg, icon }) => (
                  <div key={label} style={{ background:P.card, border:`1px solid ${P.border}`, borderRadius:"16px", padding:"20px 22px", display:"flex", alignItems:"center", gap:"16px" }}>
                    <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>{icon}</div>
                    <div>
                      <p style={{ fontSize:"26px", fontWeight:800, color, letterSpacing:"-1px" }}>{val}</p>
                      <p style={{ fontSize:"12px", color:P.textMuted }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
                {DOCTEURS.map(d => (
                  <Card key={d.id} style={{ border:`1.5px solid ${d.statut==="present" ? P.borderMd : P.border}` }}>
                    <div style={{ padding:"20px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px" }}>
                        <Avatar name={d.nom.split(" ")[1]} size={48} />
                        <Badge statut={d.statut} />
                      </div>
                      <p style={{ fontSize:"15px", fontWeight:800, color:P.textPri, marginBottom:"2px" }}>{d.nom}</p>
                      <p style={{ fontSize:"12px", color:P.textSec, marginBottom:"16px" }}>{d.specialite}</p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                        <div style={{ background:P.bg, borderRadius:"10px", padding:"10px 12px", border:`1px solid ${P.border}` }}>
                          <p style={{ fontSize:"10px", color:P.textMuted, marginBottom:"3px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Arrivée</p>
                          <p style={{ fontSize:"15px", fontWeight:700, color: d.arrive ? P.green : P.textMuted }}>{d.arrive || "—"}</p>
                        </div>
                        <div style={{ background:P.bg, borderRadius:"10px", padding:"10px 12px", border:`1px solid ${P.border}` }}>
                          <p style={{ fontSize:"10px", color:P.textMuted, marginBottom:"3px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Patients</p>
                          <p style={{ fontSize:"15px", fontWeight:700, color:P.textPri }}>{d.patients}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ══════ RDV ══════ */}
          {onglet === "rdv" && (
            <Card>
              <CardHeader title={`Rendez-vous — ${now.toLocaleDateString("fr-FR")}`} />
              {RDV_JOUR.map((r, i) => (
                <div key={r.id} style={{ padding:"16px 22px", display:"flex", alignItems:"center", gap:"20px", borderBottom: i < RDV_JOUR.length-1 ? `1px solid ${P.border}` : "none", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = P.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Heure */}
                  <div style={{ width:"64px", height:"64px", borderRadius:"14px", background:P.greenSoft, border:`1px solid ${P.borderMd}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <p style={{ fontSize:"15px", fontWeight:800, color:P.green, fontVariantNumeric:"tabular-nums", lineHeight:1 }}>{r.heure}</p>
                  </div>
                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:"15px", fontWeight:700, color:P.textPri, marginBottom:"3px" }}>{r.patient}</p>
                    <p style={{ fontSize:"12px", color:P.textMuted }}>{r.type} · {r.docteur}</p>
                  </div>
                  <Badge statut={r.statut} />
                </div>
              ))}
            </Card>
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
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function IcoUsers({ active }) {
  const c = active ? "#fff" : "#4a7a55"
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IcoDoc({ active }) {
  const c = active ? "#fff" : "#4a7a55"
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function IcoCal({ active }) {
  const c = active ? "#fff" : "#4a7a55"
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}