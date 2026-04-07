import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
const today = () => new Date().toISOString().slice(0, 10)
const getNowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
const fmt = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"
const getAge = d => d ? Math.floor((Date.now() - new Date(d)) / (365.25 * 86400000)) : "—"

// ══════════════════════════════════════════════════════
//  DONNÉES
// ══════════════════════════════════════════════════════
const PATIENTS_DB = [
  { id: 1, pid: "CAB-A1B2C3", nom: "Bah Mariama",     dateNaissance: "1990-03-12", sexe: "F", telephone: "+224 622 11 22 33" },
  { id: 2, pid: "CAB-D4E5F6", nom: "Diallo Ibrahima", dateNaissance: "1972-07-04", sexe: "M", telephone: "+224 628 44 55 66" },
  { id: 3, pid: "CAB-G7H8I9", nom: "Sow Fatoumata",   dateNaissance: "1996-11-20", sexe: "F", telephone: "+224 621 77 88 99" },
  { id: 4, pid: "CAB-J1K2L3", nom: "Kouyaté Mamadou", dateNaissance: "1963-01-15", sexe: "M", telephone: "+224 624 33 44 55" },
  { id: 5, pid: "CAB-M4N5O6", nom: "Baldé Aissatou",  dateNaissance: "2018-06-08", sexe: "F", telephone: "+224 625 66 77 88" },
]

const TYPES_EXAMENS = [
  "Hématologie","Biochimie","Bactériologie","Parasitologie",
  "Immunologie","Hormonologie","Sérologie","Urines","LCR","Autre"
]

const EXAMENS_PAR_TYPE = {
  "Hématologie":   ["NFS (Numération Formule Sanguine)","Groupage sanguin","Rhésus","TP","TCA","Fibrinogène"],
  "Biochimie":     ["Glycémie","Urée","Créatinine","Cholestérol total","HDL Cholestérol","LDL Cholestérol","Triglycérides","ALAT/ASAT","Bilirubine","Protéines totales","HbA1c"],
  "Bactériologie": ["ECBU","Hémoculture","Coproculture","Prélèvement vaginal","Prélèvement urétral","Antibiogramme"],
  "Parasitologie": ["Goutte épaisse","Frottis sanguin","Examen parasitologique des selles","Recherche de microfilaire"],
  "Immunologie":   ["Test de grossesse (β-HCG)","Test rapide VIH","Test rapide Hépatite B","Test rapide Hépatite C","WDAL/TPHA"],
  "Hormonologie":  ["TSH","T3/T4","Progestérone","Œstradiol","Prolactine"],
  "Sérologie":     ["Sérologie VIH","Sérologie Hépatite B","Sérologie Hépatite C","Sérologie Syphilis","Sérologie Toxoplasmose","Sérologie Rubéole"],
  "Urines":        ["Bandelette urinaire","Examen cytobactériologique","Protéinurie","Glycosurie"],
  "LCR":           ["Examen cytologique","Biochimie LCR","Recherche de germes"],
  "Autre":         ["Examen à définir"]
}

const PARAMS_PAR_EXAMEN = {
  "NFS (Numération Formule Sanguine)": [
    { nom: "Hémoglobine",    unite: "g/dL",   norme: "12-16"        },
    { nom: "Globules rouges",unite: "M/mm³",  norme: "4-5.5"        },
    { nom: "Globules blancs",unite: "/mm³",   norme: "4000-10000"   },
    { nom: "Plaquettes",     unite: "/mm³",   norme: "150000-400000"},
    { nom: "Hématocrite",    unite: "%",      norme: "36-46"        },
  ],
  "Glycémie":          [{ nom: "Glycémie à jeun",   unite: "g/L",   norme: "0.7-1.1" }],
  "Urée":              [{ nom: "Urée",               unite: "g/L",   norme: "0.15-0.45" }],
  "Créatinine":        [{ nom: "Créatinine",          unite: "mg/L",  norme: "7-12" }],
  "Cholestérol total": [{ nom: "Cholestérol total",   unite: "g/L",   norme: "< 2" }],
  "Triglycérides":     [{ nom: "Triglycérides",       unite: "g/L",   norme: "< 1.5" }],
  "HbA1c":             [{ nom: "HbA1c",               unite: "%",     norme: "< 6.5" }],
  "TSH":               [{ nom: "TSH",                 unite: "mUI/L", norme: "0.4-4.0" }],
}

const buildParamsVides = (nomExamen) => {
  const modeles = PARAMS_PAR_EXAMEN[nomExamen] || [{ nom: "Résultat", unite: "", norme: "" }]
  return Object.fromEntries(modeles.map(p => [p.nom, { valeur: "", unite: p.unite, norme: p.norme }]))
}

const DEMANDES_INIT = [
  {
    id: 1, patientId: 1, patient: PATIENTS_DB[0],
    dateDemande: today(), heureDemande: "08:30",
    medecinPrescripteur: "Dr. Doumbouya", service: "Médecine générale",
    examens: [{ type: "Hématologie", nom: "NFS (Numération Formule Sanguine)", prix: 25000 }],
    statut: "termine",
    datePrelevement: today(), heurePrelevement: "08:45",
    dateRendu: today(), heureRendu: "11:00",
    resultats: {
      "NFS (Numération Formule Sanguine)": {
        valeurs: {
          "Hémoglobine":    { valeur: "12.5",   unite: "g/dL",   norme: "12-16"         },
          "Globules rouges":{ valeur: "4.5",    unite: "M/mm³",  norme: "4-5.5"         },
          "Globules blancs":{ valeur: "7500",   unite: "/mm³",   norme: "4000-10000"    },
          "Plaquettes":     { valeur: "250000", unite: "/mm³",   norme: "150000-400000" },
          "Hématocrite":    { valeur: "38",     unite: "%",      norme: "36-46"         },
        },
        commentaire: "Résultats dans les normes"
      }
    },
    valide: true, validePar: "Dr. Kamara", valideLe: today() + " 11:30", urgent: false
  },
  {
    id: 2, patientId: 2, patient: PATIENTS_DB[1],
    dateDemande: today(), heureDemande: "09:15",
    medecinPrescripteur: "Dr. Camara", service: "Cardiologie",
    examens: [
      { type: "Biochimie", nom: "Glycémie",         prix: 10000 },
      { type: "Biochimie", nom: "Cholestérol total", prix: 15000 },
      { type: "Biochimie", nom: "Triglycérides",     prix: 15000 },
    ],
    statut: "en_cours",
    datePrelevement: today(), heurePrelevement: "09:30",
    dateRendu: null, heureRendu: null,
    resultats: {}, valide: false, validePar: null, valideLe: null, urgent: false
  },
  {
    id: 3, patientId: 3, patient: PATIENTS_DB[2],
    dateDemande: today(), heureDemande: "10:00",
    medecinPrescripteur: "Dr. Keïta", service: "Gynécologie",
    examens: [
      { type: "Immunologie", nom: "Test de grossesse (β-HCG)",             prix: 20000 },
      { type: "Hématologie", nom: "NFS (Numération Formule Sanguine)", prix: 25000 },
    ],
    statut: "en_attente",
    datePrelevement: null, heurePrelevement: null,
    dateRendu: null, heureRendu: null,
    resultats: {}, valide: false, validePar: null, valideLe: null, urgent: false
  },
  {
    id: 4, patientId: 4, patient: PATIENTS_DB[3],
    dateDemande: today(), heureDemande: "10:30",
    medecinPrescripteur: "Dr. Barry", service: "Diabétologie",
    examens: [
      { type: "Biochimie", nom: "Glycémie", prix: 10000 },
      { type: "Biochimie", nom: "HbA1c",   prix: 30000 },
    ],
    statut: "en_attente",
    datePrelevement: null, heurePrelevement: null,
    dateRendu: null, heureRendu: null,
    resultats: {}, valide: false, validePar: null, valideLe: null, urgent: true
  },
]

// ══════════════════════════════════════════════════════
//  COULEURS (unifié avec les autres dashboards)
// ══════════════════════════════════════════════════════
const C = {
  bg: "#f8f9fa", white: "#ffffff",
  textPri: "#0f172a", textSec: "#64748b", textMuted: "#94a3b8", border: "#e2e8f0",
  green: "#16a34a", greenSoft: "#dcfce7", greenDark: "#15803d",
  blue: "#2563eb",  blueSoft: "#dbeafe",  blueDark: "#1d4ed8",
  amber: "#d97706", amberSoft: "#fef3c7",
  red: "#dc2626",   redSoft: "#fee2e2",
  slate: "#475569", slateSoft: "#e2e8f0",
  purple: "#7c3aed",purpleSoft: "#ede9fe",
  orange: "#ea580c",orangeSoft: "#ffedd5",
}

// ══════════════════════════════════════════════════════
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
function Badge({ statut }) {
  const cfg = {
    en_attente:{ label:"En attente", color:C.amber, bg:C.amberSoft },
    en_cours:  { label:"En cours",   color:C.blue,  bg:C.blueSoft  },
    termine:   { label:"Terminé",    color:C.green, bg:C.greenSoft },
    annule:    { label:"Annulé",     color:C.slate, bg:C.slateSoft },
  }
  const s = cfg[statut] || { label: statut, color: C.slate, bg: C.slateSoft }
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:s.bg, color:s.color, fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20, border:"1px solid "+s.color+"33" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.color }} />
      {s.label}
    </span>
  )
}

function Avatar({ name, size = 36 }) {
  const palettes = [
    { bg:"#dbeafe", fg:"#2563eb" }, { bg:"#dcfce7", fg:"#16a34a" },
    { bg:"#ede9fe", fg:"#7c3aed" }, { bg:"#fef3c7", fg:"#d97706" },
    { bg:"#ccfbf1", fg:"#0d9488" },
  ]
  const p = palettes[(name?.charCodeAt(0) || 0) % palettes.length]
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:p.bg, color:p.fg, border:"2px solid "+p.fg+"30", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:800, flexShrink:0 }}>
      {initials}
    </div>
  )
}

function Btn({ children, onClick, variant = "primary", small = false, disabled = false }) {
  const [hov, setHov] = useState(false)
  const cfg = {
    primary:   { bg:C.blue,  hov:C.blueDark,  color:"#fff" },
    success:   { bg:C.green, hov:C.greenDark, color:"#fff" },
    secondary: { bg:C.white, hov:C.slateSoft, color:C.textSec, border:"1.5px solid "+C.border },
    danger:    { bg:C.red,   hov:"#b91c1c",   color:"#fff" },
  }
  const s = cfg[variant] || cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:hov&&!disabled?s.hov:s.bg, color:s.color, border:s.border||"none", borderRadius:10, padding:small?"6px 14px":"9px 18px", fontSize:small?12:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", transition:"background .15s", opacity:disabled?0.5:1, whiteSpace:"nowrap" }}>
      {children}
    </button>
  )
}

function Overlay({ children, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose])
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </div>
  )
}

function CloseBtn({ onClose }) {
  return (
    <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>×</button>
  )
}

function iSt(extra = {}) {
  return { width:"100%", padding:"10px 13px", fontSize:13, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", ...extra }
}

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
        {label} {required && <span style={{ color:C.red }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionCard({ label, icon, color, children }) {
  return (
    <div style={{ background:C.slateSoft, borderRadius:14, overflow:"hidden", border:"1px solid "+C.border }}>
      <div style={{ padding:"10px 16px", borderBottom:"1px solid "+C.border, background:color+"18", display:"flex", alignItems:"center", gap:8 }}>
        <span>{icon}</span>
        <p style={{ fontSize:12, fontWeight:700, color:color, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</p>
      </div>
      <div style={{ padding:"16px" }}>{children}</div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — NOUVELLE DEMANDE
// ══════════════════════════════════════════════════════
function ModalNouvelleDemande({ patients, onClose, onCreate }) {
  const [form, setForm] = useState({ patientId:"", medecinPrescripteur:"", service:"", urgent:false, examens:[{ type:"Hématologie", nom:"", prix:"" }] })
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const updateExamen = (index, field, value) => {
    setForm(p => {
      const examens = p.examens.map((e, i) => {
        if (i !== index) return e
        const updated = { ...e, [field]: value }
        if (field === "type") updated.nom = ""
        return updated
      })
      return { ...p, examens }
    })
  }
  const ajouterExamen  = () => setForm(p => ({ ...p, examens: [...p.examens, { type:"Hématologie", nom:"", prix:"" }] }))
  const supprimerExamen = idx => setForm(p => ({ ...p, examens: p.examens.filter((_, i) => i !== idx) }))

  const total = form.examens.reduce((s, e) => s + (parseInt(e.prix) || 0), 0)
  const ok = form.patientId && form.medecinPrescripteur && form.examens.length > 0 && form.examens.every(e => e.nom && e.prix)

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:700, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:17, fontWeight:800, color:C.textPri }}>Nouvelle demande d'examen</p>
            <p style={{ fontSize:13, color:C.textSec, marginTop:2 }}>Créer une demande d'analyse de laboratoire</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:18 }}>
          <SectionCard label="Informations du patient" icon="👤" color={C.blue}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="Patient" required>
                <select value={form.patientId} onChange={e => setF("patientId", e.target.value)} style={iSt()}>
                  <option value="">— Choisir un patient —</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.nom} — {p.pid}</option>)}
                </select>
              </Field>
              <Field label="Médecin prescripteur" required>
                <input value={form.medecinPrescripteur} onChange={e => setF("medecinPrescripteur", e.target.value)} placeholder="Ex : Dr. Doumbouya" style={iSt()} />
              </Field>
              <Field label="Service">
                <input value={form.service} onChange={e => setF("service", e.target.value)} placeholder="Ex : Médecine générale" style={iSt()} />
              </Field>
              <div style={{ display:"flex", alignItems:"center", paddingTop:26 }}>
                <div onClick={() => setF("urgent", !form.urgent)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, cursor:"pointer", background:form.urgent?C.redSoft:C.slateSoft, border:"1.5px solid "+(form.urgent?C.red+"50":C.border), transition:"all .15s", width:"100%" }}>
                  <input type="checkbox" checked={form.urgent} onChange={() => {}} style={{ width:17, height:17, accentColor:C.red, cursor:"pointer" }} />
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:form.urgent?C.red:C.textSec }}>⚡ Demande urgente</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>Priorité élevée</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard label="Examens à réaliser" icon="🔬" color={C.purple}>
            {form.examens.map((examen, idx) => (
              <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr 110px 36px", gap:10, alignItems:"flex-end", paddingBottom:idx<form.examens.length-1?12:0, marginBottom:idx<form.examens.length-1?12:0, borderBottom:idx<form.examens.length-1?"1px dashed "+C.border:"none" }}>
                <Field label="Type">
                  <select value={examen.type} onChange={e => updateExamen(idx,"type",e.target.value)} style={iSt({ padding:"9px 12px" })}>
                    {TYPES_EXAMENS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Examen" required>
                  <select value={examen.nom} onChange={e => updateExamen(idx,"nom",e.target.value)} style={iSt({ padding:"9px 12px" })}>
                    <option value="">— Choisir —</option>
                    {(EXAMENS_PAR_TYPE[examen.type]||[]).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label="Prix (GNF)" required>
                  <input type="number" value={examen.prix} onChange={e => updateExamen(idx,"prix",e.target.value)} placeholder="0" style={iSt({ padding:"9px 12px" })} />
                </Field>
                {form.examens.length > 1 && (
                  <button onClick={() => supprimerExamen(idx)} style={{ width:36, height:36, borderRadius:8, background:C.redSoft, border:"1px solid "+C.red+"30", color:C.red, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                )}
              </div>
            ))}
            <button onClick={ajouterExamen} style={{ marginTop:12, padding:"8px 16px", border:"2px dashed "+C.border, borderRadius:10, background:"transparent", color:C.blue, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
              + Ajouter un examen
            </button>
          </SectionCard>

          <div style={{ background:C.greenSoft, borderRadius:12, padding:"14px 18px", border:"1px solid "+C.green+"40", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:C.textSec }}>Montant total à payer</p>
              <p style={{ fontSize:11, color:C.textMuted }}>{form.examens.length} examen{form.examens.length>1?"s":""}</p>
            </div>
            <p style={{ fontSize:24, fontWeight:900, color:C.green }}>{total.toLocaleString("fr-FR")} GNF</p>
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => { if (ok) { onCreate(form); onClose() } }} disabled={!ok} variant="success">✓ Créer la demande</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — SAISIE DES RÉSULTATS
// ══════════════════════════════════════════════════════
function ModalSaisieResultats({ demande, onClose, onSave, onValider }) {
  const initResultats = () => {
    const r = {}
    demande.examens.forEach(ex => {
      if (demande.resultats?.[ex.nom]) r[ex.nom] = JSON.parse(JSON.stringify(demande.resultats[ex.nom]))
    })
    return r
  }
  const [resultats,           setResultats]           = useState(initResultats)
  const [commentaireGlobal,   setCommentaireGlobal]   = useState(demande.commentaireGlobal || "")
  const [newParamNoms,        setNewParamNoms]         = useState({})

  const initExamen = (nomExamen) => {
    setResultats(prev => {
      if (prev[nomExamen]) return prev
      return { ...prev, [nomExamen]: { valeurs: buildParamsVides(nomExamen), commentaire: "" } }
    })
  }
  const setValeur = (nomExamen, param, sousChamp, valeur) => {
    setResultats(prev => {
      const r = JSON.parse(JSON.stringify(prev))
      r[nomExamen].valeurs[param][sousChamp] = valeur
      return r
    })
  }
  const setCommentaireExamen = (nomExamen, val) => {
    setResultats(prev => {
      const r = JSON.parse(JSON.stringify(prev))
      r[nomExamen].commentaire = val
      return r
    })
  }
  const ajouterParam = (nomExamen) => {
    const nom = (newParamNoms[nomExamen] || "").trim()
    if (!nom) return
    setResultats(prev => {
      const r = JSON.parse(JSON.stringify(prev))
      r[nomExamen].valeurs[nom] = { valeur:"", unite:"", norme:"" }
      return r
    })
    setNewParamNoms(prev => ({ ...prev, [nomExamen]: "" }))
  }
  const supprimerParam = (nomExamen, param) => {
    setResultats(prev => {
      const r = JSON.parse(JSON.stringify(prev))
      delete r[nomExamen].valeurs[param]
      return r
    })
  }
  const nbExamensRemplis = demande.examens.filter(ex => resultats[ex.nom]).length
  const estAnormal = (valeur, norme) => {
    if (!valeur || !norme || !norme.includes("-")) return false
    const [min, max] = norme.split("-").map(Number)
    const v = parseFloat(valeur)
    return !isNaN(v) && !isNaN(min) && !isNaN(max) && (v < min || v > max)
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:760, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.blueSoft, borderRadius:"20px 20px 0 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🔬</div>
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:C.blueDark }}>Saisie des résultats</p>
              <p style={{ fontSize:12, color:C.blue }}>{demande.patient.nom} — {demande.patient.pid}</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:12, color:C.blue, fontWeight:600 }}>{nbExamensRemplis}/{demande.examens.length} examen{demande.examens.length>1?"s":""} saisi{nbExamensRemplis>1?"s":""}</span>
            <CloseBtn onClose={onClose} />
          </div>
        </div>

        <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:3, background:C.green, width:(nbExamensRemplis/demande.examens.length*100)+"%", transition:"width .3s" }} />
          </div>

          {demande.examens.map((ex) => {
            const saisi = resultats[ex.nom]
            return (
              <div key={ex.nom} style={{ borderRadius:14, border:"1.5px solid "+(saisi?C.green+"50":C.border), background:saisi?C.greenSoft+"40":C.slateSoft, overflow:"hidden" }}>
                <div style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:saisi?"1px solid "+C.green+"30":"none" }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{ex.nom}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{ex.type} · {ex.prix.toLocaleString("fr-FR")} GNF</p>
                  </div>
                  {saisi
                    ? <span style={{ fontSize:11, fontWeight:700, color:C.green, background:C.greenSoft, padding:"4px 10px", borderRadius:8 }}>✓ Saisi</span>
                    : <Btn onClick={() => initExamen(ex.nom)} small variant="primary">+ Saisir les résultats</Btn>
                  }
                </div>

                {saisi && (
                  <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 1fr 32px", gap:8 }}>
                      {["Paramètre","Valeur","Unité","Norme de référence",""].map(h => (
                        <p key={h} style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</p>
                      ))}
                    </div>
                    {Object.entries(saisi.valeurs).map(([param, data]) => {
                      const anormal = estAnormal(data.valeur, data.norme)
                      return (
                        <div key={param} style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 1fr 32px", gap:8, alignItems:"center" }}>
                          <p style={{ fontSize:13, fontWeight:600, color:anormal?C.red:C.textPri, display:"flex", alignItems:"center", gap:4 }}>
                            {anormal && <span>⚠️</span>}{param}
                          </p>
                          <input value={data.valeur} onChange={e => setValeur(ex.nom,param,"valeur",e.target.value)} placeholder="—" style={iSt({ padding:"7px 10px", fontSize:13, borderColor:anormal?C.red:C.border })} />
                          <input value={data.unite} onChange={e => setValeur(ex.nom,param,"unite",e.target.value)} placeholder="g/dL…" style={iSt({ padding:"7px 10px", fontSize:13 })} />
                          <input value={data.norme} onChange={e => setValeur(ex.nom,param,"norme",e.target.value)} placeholder="Ex: 12-16" style={iSt({ padding:"7px 10px", fontSize:13 })} />
                          <button onClick={() => supprimerParam(ex.nom, param)} style={{ width:28, height:28, borderRadius:6, border:"none", background:C.redSoft, color:C.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>×</button>
                        </div>
                      )
                    })}
                    <div style={{ display:"flex", gap:8, marginTop:4 }}>
                      <input value={newParamNoms[ex.nom]||""} onChange={e => setNewParamNoms(prev=>({...prev,[ex.nom]:e.target.value}))} onKeyDown={e=>{ if(e.key==="Enter") ajouterParam(ex.nom) }} placeholder="Nouveau paramètre…" style={iSt({ flex:1, padding:"7px 12px", fontSize:12 })} />
                      <button onClick={() => ajouterParam(ex.nom)} style={{ padding:"7px 14px", borderRadius:10, background:C.blueSoft, color:C.blue, border:"1px solid "+C.blue+"30", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Ajouter</button>
                    </div>
                    <div style={{ marginTop:4 }}>
                      <label style={{ fontSize:12, fontWeight:600, color:C.textMuted, display:"block", marginBottom:4 }}>Commentaire pour cet examen</label>
                      <textarea value={saisi.commentaire||""} onChange={e => setCommentaireExamen(ex.nom,e.target.value)} rows={2} placeholder="Interprétation, observations…" style={iSt({ resize:"none", fontSize:12 })} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div>
            <label style={{ fontSize:13, fontWeight:600, color:C.textPri, display:"block", marginBottom:6 }}>Conclusion / Commentaire global</label>
            <textarea value={commentaireGlobal} onChange={e => setCommentaireGlobal(e.target.value)} rows={3} placeholder="Conclusion générale des analyses…" style={iSt({ resize:"vertical" })} />
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:10, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => onSave(resultats, commentaireGlobal)} variant="primary" disabled={nbExamensRemplis===0}>💾 Sauvegarder (brouillon)</Btn>
            <Btn onClick={() => onValider(resultats, commentaireGlobal)} variant="success" disabled={nbExamensRemplis===0}>✓ Valider et signer</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — FICHE RÉSULTATS (impression)
// ══════════════════════════════════════════════════════
function ModalFicheLaboratoire({ demande, onClose }) {
  const estAnormal = (valeur, norme) => {
    if (!valeur || !norme || !norme.includes("-")) return false
    const [min, max] = norme.split("-").map(Number)
    const v = parseFloat(valeur)
    return !isNaN(v) && !isNaN(min) && !isNaN(max) && (v < min || v > max)
  }

  const handlePrint = () => {
    const rows = []
    Object.entries(demande.resultats || {}).forEach(([nomExamen, data]) => {
      Object.entries(data.valeurs || {}).forEach(([param, d]) => {
        const anormal = estAnormal(d.valeur, d.norme)
        rows.push(`<tr>
          <td style="font-weight:600">${nomExamen}</td>
          <td>${param}</td>
          <td style="color:${anormal?"#dc2626":"#16a34a"};font-weight:${anormal?700:400}">${d.valeur||"—"}</td>
          <td>${d.unite||"—"}</td>
          <td>${d.norme||"—"}</td>
          <td style="color:${anormal?"#dc2626":"#16a34a"}">${anormal?"↑↓ Anormal":"✓ Normal"}</td>
        </tr>`)
      })
    })
    const html = `<!DOCTYPE html><html><head>
      <title>Résultats — ${demande.patient.nom}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px 40px;max-width:210mm;margin:0 auto}h1{color:#16a34a;margin:4px 0;font-size:20px}h2{font-size:14px;color:#555;font-weight:normal;margin:4px 0}.info{background:#f8f9fa;padding:14px;border-radius:6px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;margin:18px 0}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #e2e8f0;padding:8px 12px;font-size:13px;text-align:left}th{background:#f1f5f9;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em}.footer{margin-top:40px;border-top:1px solid #ccc;padding-top:14px;font-size:11px;color:#999;text-align:center}</style>
    </head><body>
      <div style="text-align:center;border-bottom:2px solid #16a34a;padding-bottom:14px;margin-bottom:20px">
        <h1>CLINIQUE ABC MAROUANE</h1><h2>Service de Laboratoire d'Analyses Médicales</h2>
        <p style="font-size:12px;color:#999">Conakry, Guinée · cabinet.marouane@clinique.gn</p>
      </div>
      <div class="info">
        <p><strong>Nom :</strong> ${demande.patient.nom}</p>
        <p><strong>N° Dossier :</strong> ${demande.patient.pid}</p>
        <p><strong>Âge / Sexe :</strong> ${getAge(demande.patient.dateNaissance)} ans / ${demande.patient.sexe==="F"?"Féminin":"Masculin"}</p>
        <p><strong>Médecin :</strong> ${demande.medecinPrescripteur}</p>
        <p><strong>Prélèvement :</strong> ${fmt(demande.datePrelevement)} à ${demande.heurePrelevement||"—"}</p>
        <p><strong>Rendu le :</strong> ${fmt(demande.dateRendu)} à ${demande.heureRendu||"—"}</p>
      </div>
      <table><thead><tr><th>Examen</th><th>Paramètre</th><th>Résultat</th><th>Unité</th><th>Référence</th><th>Statut</th></tr></thead>
      <tbody>${rows.join("")}</tbody></table>
      ${demande.commentaireGlobal?`<div style="margin-top:18px;padding:14px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;font-size:13px"><strong>Conclusion :</strong> ${demande.commentaireGlobal}</div>`:""}
      <div style="margin-top:40px;display:flex;justify-content:flex-end">
        <div style="text-align:center">
          <p style="font-size:12px;color:#666;margin-bottom:50px">${demande.validePar?"Validé par "+demande.validePar+" le "+demande.valideLe:"En attente de validation"}</p>
          <div style="width:160px;height:70px;border:1px dashed #ccc;border-radius:8px;display:inline-block"></div>
          <p style="font-size:11px;color:#999;margin-top:4px">Signature et cachet</p>
        </div>
      </div>
      <div class="footer"><p>Document à conserver — Résultats valables à la date du prélèvement</p><p>Clinique ABC Marouane · Conakry, Guinée</p></div>
    </body></html>`
    const w = window.open("","_blank")
    w.document.write(html); w.document.close()
    setTimeout(() => { w.print() }, 400)
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:860, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:17, fontWeight:800, color:C.textPri }}>Fiche de résultats — Laboratoire</p>
            <p style={{ fontSize:13, color:C.textSec, marginTop:2 }}>{demande.patient.nom} · {demande.patient.pid}</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={handlePrint} variant="success" small>🖨️ Imprimer</Btn>
            <CloseBtn onClose={onClose} />
          </div>
        </div>
        <div style={{ padding:"28px 36px", background:"#fff" }}>
          <div style={{ textAlign:"center", borderBottom:"2px solid "+C.green, paddingBottom:16, marginBottom:22 }}>
            <div style={{ fontSize:28, marginBottom:6 }}>🏥</div>
            <p style={{ fontSize:20, fontWeight:900, color:C.green }}>CLINIQUE ABC MAROUANE</p>
            <p style={{ fontSize:13, color:C.textSec }}>Service de Laboratoire d'Analyses Médicales</p>
            <p style={{ fontSize:12, color:C.textMuted }}>Conakry, Guinée · cabinet.marouane@clinique.gn</p>
          </div>
          <div style={{ background:C.slateSoft, padding:16, borderRadius:10, marginBottom:22, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, fontSize:13 }}>
            {[
              ["Nom", demande.patient.nom],
              ["N° Dossier", demande.patient.pid],
              ["Âge / Sexe", getAge(demande.patient.dateNaissance)+" ans / "+(demande.patient.sexe==="F"?"Féminin":"Masculin")],
              ["Médecin prescripteur", demande.medecinPrescripteur],
              ["Date prélèvement", fmt(demande.datePrelevement)+" à "+(demande.heurePrelevement||"—")],
              ["Date rendu", fmt(demande.dateRendu)+" à "+(demande.heureRendu||"—")],
            ].map(([label, val]) => <p key={label}><strong>{label} :</strong> {val}</p>)}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:C.slateSoft }}>
                {["Examen","Paramètre","Résultat","Unité","Référence","Statut"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", border:"1px solid "+C.border }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(demande.resultats||{}).length===0
                ? <tr><td colSpan={6} style={{ padding:24, textAlign:"center", color:C.textMuted, border:"1px solid "+C.border }}>Aucun résultat saisi</td></tr>
                : Object.entries(demande.resultats||{}).map(([nomExamen, data]) =>
                    Object.entries(data.valeurs||{}).map(([param, d], i, arr) => {
                      const anormal = (() => {
                        if (!d.valeur||!d.norme||!d.norme.includes("-")) return false
                        const [mn,mx]=d.norme.split("-").map(Number); const v=parseFloat(d.valeur)
                        return !isNaN(v)&&!isNaN(mn)&&!isNaN(mx)&&(v<mn||v>mx)
                      })()
                      return (
                        <tr key={param} style={{ background:anormal?"#fff5f5":"white" }}>
                          {i===0&&<td rowSpan={arr.length} style={{ padding:"10px 12px", fontWeight:700, color:C.blue, verticalAlign:"top", border:"1px solid "+C.border }}>{nomExamen}</td>}
                          <td style={{ padding:"10px 12px", border:"1px solid "+C.border }}>{param}</td>
                          <td style={{ padding:"10px 12px", fontWeight:700, color:anormal?C.red:C.green, border:"1px solid "+C.border }}>{d.valeur||"—"}</td>
                          <td style={{ padding:"10px 12px", color:C.textSec, border:"1px solid "+C.border }}>{d.unite||"—"}</td>
                          <td style={{ padding:"10px 12px", color:C.textSec, border:"1px solid "+C.border }}>{d.norme||"—"}</td>
                          <td style={{ padding:"10px 12px", border:"1px solid "+C.border }}>
                            {anormal?<span style={{ color:C.red, fontWeight:700 }}>↑↓ Anormal</span>:<span style={{ color:C.green }}>✓ Normal</span>}
                          </td>
                        </tr>
                      )
                    })
                  )
              }
            </tbody>
          </table>
          {Object.entries(demande.resultats||{}).some(([,d])=>d.commentaire)&&(
            <div style={{ marginTop:18 }}>
              {Object.entries(demande.resultats||{}).map(([nom,d])=>d.commentaire?(
                <div key={nom} style={{ marginBottom:8, padding:"10px 14px", background:C.amberSoft, borderRadius:8, fontSize:13 }}><strong>{nom} :</strong> {d.commentaire}</div>
              ):null)}
            </div>
          )}
          {demande.commentaireGlobal&&(
            <div style={{ marginTop:16, padding:"12px 16px", background:C.blueSoft, borderRadius:8, fontSize:13 }}><strong>Conclusion :</strong> {demande.commentaireGlobal}</div>
          )}
          <div style={{ marginTop:40, display:"flex", justifyContent:"flex-end" }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:40 }}>{demande.validePar?`Validé par ${demande.validePar} le ${demande.valideLe}`:"En attente de validation"}</p>
              <div style={{ width:160, height:70, border:"1px dashed "+C.border, borderRadius:8 }}/>
              <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>Signature et cachet</p>
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardLaboratoire() {
  const [onglet,              setOnglet]              = useState("toutes")
  const [sidebarOpen,         setSidebarOpen]         = useState(false)
  const [demandes,            setDemandes]            = useState(DEMANDES_INIT)
  const [patients]                                     = useState(PATIENTS_DB)
  const [showNouvelleDemande, setShowNouvelleDemande] = useState(false)
  const [showSaisie,          setShowSaisie]          = useState(null)
  const [showFiche,           setShowFiche]           = useState(null)
  const [recherche,           setRecherche]           = useState("")
  const [heure,               setHeure]               = useState(getNowTime())
  const [dateStr,             setDateStr]             = useState("")

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setHeure(n.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit", second:"2-digit" }))
      setDateStr(n.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" }))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const getDemandesFiltrees = () => {
    let liste = demandes
    if (onglet==="en_attente") liste = demandes.filter(d=>d.statut==="en_attente")
    else if (onglet==="en_cours") liste = demandes.filter(d=>d.statut==="en_cours")
    else if (onglet==="termines") liste = demandes.filter(d=>d.statut==="termine")
    if (recherche.trim()) {
      const q = recherche.toLowerCase()
      liste = liste.filter(d =>
        d.patient.nom.toLowerCase().includes(q) ||
        d.patient.pid.toLowerCase().includes(q) ||
        d.medecinPrescripteur.toLowerCase().includes(q) ||
        d.examens.some(e=>e.nom.toLowerCase().includes(q))
      )
    }
    return [...liste].sort((a,b) => {
      if (a.urgent&&!b.urgent) return -1
      if (!a.urgent&&b.urgent) return 1
      return b.id - a.id
    })
  }

  const demandesFiltrees = getDemandesFiltrees()

  const stats = {
    en_attente: demandes.filter(d=>d.statut==="en_attente").length,
    en_cours:   demandes.filter(d=>d.statut==="en_cours").length,
    termine:    demandes.filter(d=>d.statut==="termine").length,
    total:      demandes.length,
  }

  const handleCreerDemande = (form) => {
    const patient = patients.find(p=>p.id===parseInt(form.patientId))
    setDemandes(prev => [{
      id:Date.now(), patientId:patient.id, patient,
      dateDemande:today(), heureDemande:getNowTime(),
      medecinPrescripteur:form.medecinPrescripteur, service:form.service,
      examens:form.examens.map(e=>({...e, prix:parseInt(e.prix)||0})),
      statut:"en_attente",
      datePrelevement:null, heurePrelevement:null,
      dateRendu:null, heureRendu:null,
      resultats:{}, valide:false, validePar:null, valideLe:null,
      urgent:form.urgent, commentaireGlobal:""
    }, ...prev])
  }
  const handleDemarrerPrelevement = (id) => {
    setDemandes(prev => prev.map(d => d.id===id?{...d, statut:"en_cours", datePrelevement:today(), heurePrelevement:getNowTime()}:d))
  }
  const handleSauvegarder = (id, resultats, commentaireGlobal) => {
    setDemandes(prev => prev.map(d => d.id===id?{...d, resultats, commentaireGlobal, statut:"en_cours"}:d))
    setShowSaisie(null)
  }
  const handleValider = (id, resultats, commentaireGlobal) => {
    setDemandes(prev => prev.map(d => d.id===id?{...d, resultats, commentaireGlobal, statut:"termine", dateRendu:today(), heureRendu:getNowTime(), valide:true, validePar:"Dr. Kamara", valideLe:today()+" "+getNowTime()}:d))
    setShowSaisie(null)
  }

  const NAV = [
    { id:"toutes",     label:"Toutes",     icon:"📋", count:stats.total,      color:C.blue   },
    { id:"en_attente", label:"En attente", icon:"⏳", count:stats.en_attente, color:C.amber  },
    { id:"en_cours",   label:"En cours",   icon:"🔬", count:stats.en_cours,   color:C.blue   },
    { id:"termines",   label:"Terminés",   icon:"✅", count:stats.termine,    color:C.green  },
    { id:"historique", label:"Historique", icon:"📊", count:stats.total,      color:C.purple },
  ]

  const titres = {
    toutes:"Toutes les demandes", en_attente:"En attente de prélèvement",
    en_cours:"Analyses en cours", termines:"Résultats validés", historique:"Historique complet"
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI', system-ui, sans-serif", color:C.textPri }}>

      {/* MODALS */}
      {showNouvelleDemande && <ModalNouvelleDemande patients={patients} onClose={()=>setShowNouvelleDemande(false)} onCreate={handleCreerDemande}/>}
      {showSaisie && <ModalSaisieResultats demande={showSaisie} onClose={()=>setShowSaisie(null)} onSave={(r,c)=>handleSauvegarder(showSaisie.id,r,c)} onValider={(r,c)=>handleValider(showSaisie.id,r,c)}/>}
      {showFiche  && <ModalFicheLaboratoire demande={showFiche} onClose={()=>setShowFiche(null)}/>}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:265, background:C.white, boxShadow:"4px 0 24px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column", overflow:"auto" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12 }}>
              <img src={logo} alt="" style={{ height:42, borderRadius:8, objectFit:"cover", border:"1px solid "+C.border }}/>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize:12, color:C.textSec }}>Laboratoire d'Analyses</p>
              </div>
            </div>
            <nav style={{ padding:"14px 12px", flex:1 }}>
              <p style={{ fontSize:10, color:C.textMuted, letterSpacing:"0.12em", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>Menu</p>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setOnglet(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:12, border:"none", background:onglet===n.id?C.blueSoft:"transparent", color:onglet===n.id?C.blue:C.textSec, fontSize:14, fontWeight:onglet===n.id?700:500, cursor:"pointer", textAlign:"left", marginBottom:2, fontFamily:"inherit" }}
                  onMouseEnter={e=>{ if(onglet!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(onglet!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ fontSize:18 }}>{n.icon}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  <span style={{ background:onglet===n.id?C.blue:C.slateSoft, color:onglet===n.id?"#fff":C.textMuted, fontSize:11, fontWeight:700, borderRadius:10, padding:"2px 7px" }}>{n.count}</span>
                </button>
              ))}
            </nav>
            <div style={{ padding:"14px 16px 20px", borderTop:"1px solid "+C.border }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.purpleSoft, borderRadius:12, border:"1px solid "+C.purple+"33" }}>
                <Avatar name="M. Baldé" size={36}/>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>M. Baldé</p>
                  <p style={{ fontSize:11, color:C.purple, fontWeight:600 }}>Technicien labo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40, height:40, borderRadius:8, border:"1px solid "+C.border, background:C.white, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }}/>
        </button>
        <div style={{ flex:1, marginLeft:20 }}>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>🔬 Laboratoire d'Analyses Médicales</p>
          <p style={{ fontSize:12, color:C.textMuted, textTransform:"capitalize" }}>{dateStr}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {stats.en_attente>0&&(
            <div style={{ display:"flex", alignItems:"center", gap:6, background:C.amberSoft, border:"1px solid "+C.amber+"40", borderRadius:10, padding:"6px 12px" }}>
              <span>⏳</span>
              <span style={{ fontSize:12, fontWeight:700, color:C.amber }}>{stats.en_attente} en attente</span>
            </div>
          )}
          <div style={{ background:C.purpleSoft, border:"1px solid "+C.purple+"33", borderRadius:10, padding:"6px 14px", fontSize:14, fontWeight:700, color:C.purple, fontVariantNumeric:"tabular-nums" }}>
            {heure}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>M. Baldé</p>
              <p style={{ fontSize:11, color:C.textSec }}>Technicien labo</p>
            </div>
            <Avatar name="M. Baldé" size={36}/>
          </div>
        </div>
      </header>

      <main style={{ padding:"28px 28px", maxWidth:1400, margin:"0 auto" }}>
        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"En attente",      val:stats.en_attente, icon:"⏳", color:C.amber,  bg:C.amberSoft  },
            { label:"En analyse",      val:stats.en_cours,   icon:"🔬", color:C.blue,   bg:C.blueSoft   },
            { label:"Résultats prêts", val:stats.termine,    icon:"✅", color:C.green,  bg:C.greenSoft  },
            { label:"Total",           val:stats.total,      icon:"📊", color:C.purple, bg:C.purpleSoft },
          ].map(k=>(
            <div key={k.label} style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:28, fontWeight:900, color:k.color, lineHeight:1, marginBottom:6 }}>{k.val}</p>
                <p style={{ fontSize:12, color:C.textMuted }}>{k.label}</p>
              </div>
              <div style={{ width:48, height:48, borderRadius:14, background:k.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{k.icon}</div>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display:"flex", gap:4, marginBottom:20, background:C.white, padding:5, borderRadius:14, border:"1px solid "+C.border, width:"fit-content", flexWrap:"wrap" }}>
          {NAV.map(n=>{
            const active = onglet===n.id
            return (
              <button key={n.id} onClick={()=>setOnglet(n.id)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:active?(n.color||C.blue):"transparent", color:active?"#fff":C.textSec, fontSize:13, fontWeight:active?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit", transition:"all .15s", whiteSpace:"nowrap" }}>
                {n.icon} {n.label}
                <span style={{ background:active?"rgba(255,255,255,0.25)":C.slateSoft, color:active?"#fff":C.textMuted, fontSize:11, fontWeight:700, padding:"1px 7px", borderRadius:20 }}>{n.count}</span>
              </button>
            )
          })}
        </div>

        {/* Barre actions */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div>
            <p style={{ fontSize:20, fontWeight:800, color:C.textPri, letterSpacing:"-0.02em" }}>{titres[onglet]}</p>
            <p style={{ fontSize:13, color:C.textMuted, marginTop:2 }}>
              {demandesFiltrees.length} résultat{demandesFiltrees.length>1?"s":""}{recherche&&` pour "${recherche}"`}
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Patient, médecin, examen…" value={recherche} onChange={e=>setRecherche(e.target.value)}
                style={{ padding:"9px 12px 9px 34px", fontSize:13, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", width:260 }}/>
            </div>
            <Btn onClick={()=>setShowNouvelleDemande(true)} variant="success">+ Nouvelle demande</Btn>
          </div>
        </div>

        {/* TABLEAU */}
        <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.slateSoft }}>
                {["Patient","Demande","Médecin / Service","Examens","Montant","Statut","Actions"].map(h=>(
                  <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.07em", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demandesFiltrees.length===0?(
                <tr>
                  <td colSpan={7} style={{ padding:"60px 40px", textAlign:"center" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>🔬</div>
                    <p style={{ fontSize:15, fontWeight:600, color:C.textSec, marginBottom:4 }}>Aucune demande dans cette catégorie</p>
                    <p style={{ fontSize:13, color:C.textMuted }}>{recherche?`Aucun résultat pour "${recherche}"`:"Les demandes apparaîtront ici"}</p>
                  </td>
                </tr>
              ):demandesFiltrees.map((d,i,arr)=>(
                <tr key={d.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", background:d.urgent?"#fff8f8":"transparent", transition:"background .1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=d.urgent?C.redSoft:C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background=d.urgent?"#fff8f8":"transparent"}>
                  <td style={{ padding:"14px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={d.patient.nom} size={36}/>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{d.patient.nom}</p>
                          {d.urgent&&<span style={{ fontSize:10, fontWeight:800, color:C.red, background:C.redSoft, padding:"1px 6px", borderRadius:6 }}>⚡ URGENT</span>}
                        </div>
                        <p style={{ fontSize:11, color:C.textMuted }}>{d.patient.pid}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"14px 14px" }}>
                    <p style={{ fontSize:14, fontWeight:800, color:C.purple, fontVariantNumeric:"tabular-nums" }}>{d.heureDemande}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{fmt(d.dateDemande)}</p>
                  </td>
                  <td style={{ padding:"14px 14px" }}>
                    <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{d.medecinPrescripteur}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{d.service||"—"}</p>
                  </td>
                  <td style={{ padding:"14px 14px", maxWidth:220 }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {d.examens.map((e,idx)=>(
                        <span key={idx} style={{ fontSize:11, fontWeight:600, background:C.blueSoft, color:C.blue, padding:"3px 8px", borderRadius:6 }}>{e.nom}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding:"14px 14px" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:C.green }}>{d.examens.reduce((s,e)=>s+(e.prix||0),0).toLocaleString("fr-FR")} GNF</p>
                  </td>
                  <td style={{ padding:"14px 14px" }}>
                    <Badge statut={d.statut}/>
                    {d.valide&&<p style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>✓ Signé par {d.validePar}</p>}
                  </td>
                  <td style={{ padding:"14px 14px" }}>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {d.statut==="en_attente"&&(
                        <>
                          <Btn onClick={()=>handleDemarrerPrelevement(d.id)} small variant="success">▶ Prélever</Btn>
                          <Btn onClick={()=>setShowSaisie(d)} small variant="primary">✏️ Résultats</Btn>
                        </>
                      )}
                      {d.statut==="en_cours"&&(
                        <Btn onClick={()=>{ const updated=demandes.find(x=>x.id===d.id); setShowSaisie(updated) }} small variant="primary">✏️ Compléter</Btn>
                      )}
                      {d.statut==="termine"&&(
                        <Btn onClick={()=>setShowFiche(d)} small variant="secondary">📄 Voir fiche</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign:"center", fontSize:12, color:C.textMuted, padding:"14px 0", borderTop:"1px solid "+C.border }}>
            © 2026 Clinique ABC Marouane. Tous droits réservés.
          </p>
        </div>
      </main>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder,textarea::placeholder{color:#94a3b8}
        input:focus,select:focus,textarea:focus{border-color:#7c3aed!important;box-shadow:0 0 0 3px rgba(124,58,237,0.1)!important}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        button:focus{outline:none}
        @media print{.no-print{display:none!important}body{background:white}}
      `}</style>
    </div>
  )
}