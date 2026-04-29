import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useSharedData } from "../../hooks/useSharedData.jsx"
import { useNavigate } from "react-router-dom"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
const today = () => new Date().toISOString().slice(0, 10)
const getNowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
const fmt = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"
const getAge = d => d ? Math.floor((Date.now() - new Date(d)) / (365.25 * 86400000)) : "—"

// ══════════════════════════════════════════════════════
//  PARSEUR MINDRAY — import fichier USB
// ══════════════════════════════════════════════════════
// Correspondance paramètres Mindray (anglais) → noms français du système
const MINDRAY_MAP = {
  WBC:"GB",    "LYM#":"LYM", LYM:"LYM",
  "MON#":"MON",MON:"MON",
  "GRA#":"GRA",GRA:"GRA",
  "NEU#":"GRA",NEU:"GRA",
  RBC:"GR",    HGB:"HB",
  HCT:"HCT",
  MCV:"VGM",
  MCH:"TCMH",
  MCHC:"CCMH",
  PLT:"PLT",
  "RDW-CV":"RDW-CV",
  "RDW-SD":"RDW-SD",
  MPV:"MPV",   PDW:"PDW",
  PCT:"PCT",   "P-LCR":"P-LCR",
  "PLR":"PLR",
  "LYM%":"LYM%","MON%":"MON%","GRA%":"GRA%","NEU%":"NEU%",
}

function parseMindrayFile(text) {
  const resultats = {}
  const lines = text.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("*")) continue
    // format: "WBC   5.30   10^9/L   [4.0~10.0]"  ou  "WBC,5.30,10^9/L,4.0-10.0"
    const parts = trimmed.split(/[\s,\t]+/).filter(Boolean)
    if (parts.length < 2) continue
    const rawParam = parts[0].replace(/:$/, "")
    const value    = parts[1]
    const unite    = parts[2] || ""
    // valeur numérique ?
    if (isNaN(parseFloat(value))) continue
    const frParam = MINDRAY_MAP[rawParam.toUpperCase()] || MINDRAY_MAP[rawParam] || rawParam
    // extraire norme entre [] ou de la forme 4.0-10.0
    let norme = ""
    const bracketMatch = trimmed.match(/\[([^\]]+)\]/)
    if (bracketMatch) norme = bracketMatch[1].replace(/~/g, "-")
    resultats[frParam] = { valeur: value, unite: unite.replace("10^9/L","Giga/l").replace("10^12/L","Téra T/l"), norme }
  }
  return resultats
}

// ══════════════════════════════════════════════════════
//  DONNÉES
// ══════════════════════════════════════════════════════
const PATIENTS_DB = [
  { id: 1, pid: "ABC-A1B2C3", nom: "Bah Mariama",     dateNaissance: "1990-03-12", sexe: "F", telephone: "+224 622 11 22 33" },
  { id: 2, pid: "ABC-D4E5F6", nom: "Diallo Ibrahima", dateNaissance: "1972-07-04", sexe: "M", telephone: "+224 628 44 55 66" },
  { id: 3, pid: "ABC-G7H8I9", nom: "Sow Fatoumata",   dateNaissance: "1996-11-20", sexe: "F", telephone: "+224 621 77 88 99" },
  { id: 4, pid: "ABC-J1K2L3", nom: "Kouyaté Mamadou", dateNaissance: "1963-01-15", sexe: "M", telephone: "+224 624 33 44 55" },
  { id: 5, pid: "ABC-M4N5O6", nom: "Baldé Aissatou",  dateNaissance: "2018-06-08", sexe: "F", telephone: "+224 625 66 77 88" },
]

const TYPES_EXAMENS = [
  "Hématologie","Biochimie","Sérologie","Immunologie","Hormonologie",
  "Marqueurs Tumoraux","Bactériologie","Parasitologie","Autre"
]

const EXAMENS_PAR_TYPE = {
  "Hématologie":        ["NFS (Numération Formule Sanguine)","Hémoglobine + Goutte Épaisse","Groupage Sanguin + Rhésus","TP / TCA / Fibrinogène"],
  "Biochimie":          ["Biochimie Complète (Sang)","Bilan Hépatique (ASAT/ALAT)","Bilan Rénal (Créat/Urée)","Bilan Lipidique","Glycémie à jeun","HbA1c","Électrolytes (Na/K/Cl)"],
  "Sérologie":          ["Sérologie Complète (ASLO/CRP/Widal/BW)","Widal + GE","CRP + ASLO","RPR / TPHA (Syphilis)"],
  "Immunologie":        ["AgHBs + AgHBe + Anti-VHC (Hépatite)","Toxoplasmose IgM + IgG","Rubéole IgM + IgG","Toxoplasmose + Rubéole (TORCH)"],
  "Hormonologie":       ["Bilan Hormonal Complet (Sexuel)","Hormones Thyroïdiennes (TSH/T3/T4)","BHCG Quantitatif","Vitamine D / Parathormone / Ferritine"],
  "Marqueurs Tumoraux": ["CA-125 / CA-19.9 / ACE / CA-15-3","PSA Total (Prostate)","AFP (Alphafœtoprotéine)"],
  "Bactériologie":      ["ECBU (Urine) + ATG","Prélèvement Vaginal + ATG","Antibiogramme"],
  "Parasitologie":      ["Parasitologie des Selles","Goutte Épaisse + Frottis Sanguin"],
  "Autre":              ["Examen à définir"]
}

const PARAMS_PAR_EXAMEN = {
  "NFS (Numération Formule Sanguine)": [
    { nom:"GB",    unite:"Giga/l",    norme:"4-12"     },
    { nom:"LYM",   unite:"Giga/l",    norme:"0.8-4.5"  },
    { nom:"MON",   unite:"Giga/l",    norme:"0.1-1.5"  },
    { nom:"GRA",   unite:"Giga/l",    norme:"2-7"      },
    { nom:"GR",    unite:"Téra T/l",  norme:"3.5-6.0"  },
    { nom:"HB",    unite:"g/dl",      norme:"11.5-17.5"},
    { nom:"HCT",   unite:"%",         norme:"36-54"    },
    { nom:"VGM",   unite:"fl",        norme:"80-100"   },
    { nom:"TCMH",  unite:"Pg/l",      norme:"27-34"    },
    { nom:"CCMH",  unite:"g/dl",      norme:"32-36"    },
    { nom:"PLT",   unite:"Giga/l",    norme:"150-450"  },
  ],
  "Hémoglobine + Goutte Épaisse": [
    { nom:"Hémoglobine",    unite:"g/100ml", norme:"12-17"   },
    { nom:"Goutte Épaisse", unite:"",        norme:"Négatif" },
  ],
  "Biochimie Complète (Sang)": [
    { nom:"Créatinine",       unite:"µmol/l",  norme:"50-120"   },
    { nom:"Urée",             unite:"mmol/l",  norme:"2.5-7.5"  },
    { nom:"Calcium",          unite:"mmol/l",  norme:"2.2-2.9"  },
    { nom:"Magnésium",        unite:"mmol/l",  norme:"0.66-1.03"},
    { nom:"Glycémie",         unite:"mmol/l",  norme:"3.3-5.5"  },
    { nom:"Cholestérol total",unite:"mmol/l",  norme:"3.8-6.5"  },
    { nom:"Cholestérol HDL",  unite:"mmol/l",  norme:"1.06-6.52"},
    { nom:"LDL",              unite:"mmol/l",  norme:"3.4-4.1"  },
    { nom:"Triglycérides",    unite:"mmol/l",  norme:"0.4-1.6"  },
    { nom:"Acide Urique",     unite:"µmol/l",  norme:"150-420"  },
    { nom:"ASAT (SGOT)",      unite:"UI/l",    norme:"< 38"     },
    { nom:"ALAT (SGPT)",      unite:"UI/l",    norme:"≤ 40"     },
    { nom:"Potassium",        unite:"mmol/l",  norme:"3.5-5.5"  },
    { nom:"Sodium",           unite:"mmol/l",  norme:"135-145"  },
    { nom:"Chlore",           unite:"mmol/l",  norme:"98-107"   },
  ],
  "Bilan Hépatique (ASAT/ALAT)": [
    { nom:"ASAT (SGOT)", unite:"UI/l", norme:"< 38" },
    { nom:"ALAT (SGPT)", unite:"UI/l", norme:"≤ 40" },
    { nom:"Bilirubine T",unite:"µmol/l",norme:"< 17" },
    { nom:"GGT",         unite:"UI/l", norme:"< 50" },
  ],
  "Bilan Rénal (Créat/Urée)": [
    { nom:"Créatinine", unite:"µmol/l", norme:"50-120"  },
    { nom:"Urée",       unite:"mmol/l", norme:"2.5-7.5" },
    { nom:"Potassium",  unite:"mmol/l", norme:"3.5-5.5" },
    { nom:"Sodium",     unite:"mmol/l", norme:"135-145" },
  ],
  "Bilan Lipidique": [
    { nom:"Cholestérol total",unite:"mmol/l",  norme:"3.8-6.5"  },
    { nom:"Cholestérol HDL",  unite:"mmol/l",  norme:"1.06-6.52"},
    { nom:"LDL",              unite:"mmol/l",  norme:"3.4-4.1"  },
    { nom:"Triglycérides",    unite:"mmol/l",  norme:"0.4-1.6"  },
  ],
  "Glycémie à jeun":       [{ nom:"Glycémie",   unite:"mmol/l", norme:"3.3-5.5"  }],
  "HbA1c":                 [{ nom:"HbA1c",      unite:"%",      norme:"< 6.5"    }],
  "Électrolytes (Na/K/Cl)":[
    { nom:"Potassium", unite:"mmol/l", norme:"3.5-5.5" },
    { nom:"Sodium",    unite:"mmol/l", norme:"135-145" },
    { nom:"Chlore",    unite:"mmol/l", norme:"98-107"  },
  ],
  "Sérologie Complète (ASLO/CRP/Widal/BW)": [
    { nom:"Aslo (titre)",        unite:"",        norme:"≤ 200"   },
    { nom:"Facteur Rhumatoïde",  unite:"",        norme:"Négatif" },
    { nom:"CRP",                 unite:"",        norme:"≤ 6"     },
    { nom:"H-Pylori",            unite:"",        norme:"Négatif" },
    { nom:"Widal TO",            unite:"",        norme:"≤ 200"   },
    { nom:"Widal TH",            unite:"",        norme:"≤ 200"   },
    { nom:"BW RPR",              unite:"",        norme:"Négatif" },
    { nom:"BW TPHA",             unite:"",        norme:"Négatif" },
    { nom:"Hémoglobine",         unite:"g/100ml", norme:"12-17"   },
    { nom:"Goutte Épaisse",      unite:"",        norme:"Négatif" },
  ],
  "Widal + GE": [
    { nom:"Widal TO", unite:"", norme:"≤ 200" },
    { nom:"Widal TH", unite:"", norme:"≤ 200" },
    { nom:"Goutte Épaisse", unite:"", norme:"Négatif" },
  ],
  "CRP + ASLO": [
    { nom:"CRP",  unite:"", norme:"≤ 6" },
    { nom:"ASLO", unite:"", norme:"≤ 200" },
  ],
  "RPR / TPHA (Syphilis)": [
    { nom:"RPR",  unite:"", norme:"Négatif" },
    { nom:"TPHA", unite:"", norme:"Négatif" },
  ],
  "AgHBs + AgHBe + Anti-VHC (Hépatite)": [
    { nom:"AgHBs",             unite:"",     norme:"Négatif < 0.13" },
    { nom:"AgHBe",             unite:"UI/ml",norme:"Négatif < 0.10" },
    { nom:"Anticorps anti-VHC",unite:"",     norme:"Négatif < 1.00" },
  ],
  "Toxoplasmose IgM + IgG": [
    { nom:"Toxoplasmose IgM", unite:"UI/ml", norme:"Négatif < 0.55" },
    { nom:"Toxoplasmose IgG", unite:"UI/ml", norme:"Négatif < 4"    },
  ],
  "Rubéole IgM + IgG": [
    { nom:"Rubéole IgM", unite:"UI/ml", norme:"Négatif < 0.80" },
    { nom:"Rubéole IgG", unite:"UI/ml", norme:"Positif ≥ 15"   },
  ],
  "Toxoplasmose + Rubéole (TORCH)": [
    { nom:"Toxoplasmose IgM", unite:"UI/ml", norme:"Négatif < 0.55" },
    { nom:"Toxoplasmose IgG", unite:"UI/ml", norme:"Négatif < 4"    },
    { nom:"Rubéole IgM",      unite:"UI/ml", norme:"Négatif < 0.80" },
    { nom:"Rubéole IgG",      unite:"UI/ml", norme:"Positif ≥ 15"   },
  ],
  "Bilan Hormonal Complet (Sexuel)": [
    { nom:"Testostérone", unite:"ng/ml",  norme:"H:2.27-10.30 / F≥19-50:0.23-0.73" },
    { nom:"Prolactine",   unite:"ng/l",   norme:"H:2.10-17.7 / F:1.80-29.20"       },
    { nom:"FSH",          unite:"mUI/ml", norme:"H:2.1-18.6 / F Foll:4.5-80"       },
    { nom:"LH",           unite:"mUI/ml", norme:"1.1-7"                             },
    { nom:"Œstradiol",    unite:"Pg/ml",  norme:"H:<62 / F:<575"                    },
    { nom:"Progestérone", unite:"ng/ml",  norme:"H:0.25-0.56 / F:<20"              },
  ],
  "Hormones Thyroïdiennes (TSH/T3/T4)": [
    { nom:"TSH", unite:"µUI/ml", norme:"Euthyroïdie:0.25-5" },
    { nom:"T3",  unite:"nmol/l", norme:"Euthyroïdie:0.9-2.5"},
    { nom:"T4",  unite:"nmol/l", norme:"Euthyroïdie:60-120" },
  ],
  "BHCG Quantitatif": [
    { nom:"βHCG Quantitatif", unite:"mUI/L", norme:"< 5 (non enceinte)" },
  ],
  "Vitamine D / Parathormone / Ferritine": [
    { nom:"Vitamine D",   unite:"ng/ml", norme:"30-45"         },
    { nom:"Parathormone", unite:"pg/µl", norme:"15-65"         },
    { nom:"Ferritine",    unite:"ng/ml", norme:"H:18-270 / F:18-160" },
  ],
  "CA-125 / CA-19.9 / ACE / CA-15-3": [
    { nom:"CA-125",  unite:"U/ml",  norme:"< 30"   },
    { nom:"CA-19.9", unite:"U/ml",  norme:"< 37"   },
    { nom:"ACE",     unite:"ng/ml", norme:"< 4.10" },
    { nom:"CA-15-3", unite:"U/mL",  norme:"< 30"   },
  ],
  "PSA Total (Prostate)": [
    { nom:"T.PSA Total", unite:"ng/ml", norme:"<40ans:0.21-1.72" },
  ],
  "AFP (Alphafœtoprotéine)": [
    { nom:"AFP", unite:"UI/ml", norme:"0 à 2" },
  ],
  "ECBU (Urine) + ATG": [
    { nom:"Leucocytes",                   unite:"/champ", norme:"< 10"    },
    { nom:"Hématies",                     unite:"/champ", norme:"< 5"     },
    { nom:"Cellules épithéliales",        unite:"/champ", norme:"—"       },
    { nom:"Cristaux",                     unite:"/champ", norme:"—"       },
    { nom:"Levures",                      unite:"/champ", norme:"Absent"  },
    { nom:"Parasites",                    unite:"/champ", norme:"Absent"  },
    { nom:"Cellules Vaginales/Urétrales", unite:"/champ", norme:"—"       },
  ],
  "Prélèvement Vaginal + ATG": [
    { nom:"Leucocytes",          unite:"/champ", norme:"—"      },
    { nom:"Hématies",            unite:"/champ", norme:"—"      },
    { nom:"Cellules épithéliales",unite:"/champ",norme:"—"      },
    { nom:"Levures",             unite:"/champ", norme:"Absent" },
    { nom:"Autres éléments",     unite:"",       norme:"—"      },
    { nom:"Résultat Gram",       unite:"",       norme:"—"      },
  ],
  "Parasitologie des Selles": [
    { nom:"Aspect des selles",            unite:"",  norme:"—"       },
    { nom:"Couleur",                      unite:"",  norme:"—"       },
    { nom:"Recherche Œufs et Parasites",  unite:"",  norme:"Négatif" },
  ],
  "Goutte Épaisse + Frottis Sanguin": [
    { nom:"Goutte Épaisse",  unite:"",  norme:"Négatif" },
    { nom:"Frottis Sanguin", unite:"",  norme:"Négatif" },
  ],
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
  bg:"#f7f9f8",      white:"#ffffff",
  textPri:"#111827", textSec:"#374151", textMuted:"#6b7280",
  border:"#e2ebe4",
  green:"#16a34a",   greenSoft:"#dcfce7",  greenDark:"#15803d", greenLight:"#bbf7d0",
  blue:"#1d6fa4",    blueSoft:"#e8f4fb",   blueDark:"#155e8b",
  amber:"#b45309",   amberSoft:"#fef3c7",
  red:"#dc2626",     redSoft:"#fef2f2",
  slate:"#475569",   slateSoft:"#f1f5f9",
  purple:"#6d28d9",  purpleSoft:"#ede9fe",
  orange:"#c2410c",  orangeSoft:"#fff7ed",
  teal:"#0f766e",    tealSoft:"#f0fdfa",
}

// ══════════════════════════════════════════════════════
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
function Badge({ statut }) {
  const cfg = {
    en_attente:{ label:"En attente", color:C.slate, bg:C.slateSoft },
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
    { bg:"#e8f5ec", fg:"#2d7a3f" }, { bg:"#dcfce7", fg:"#16a34a" },
    { bg:"#d8eed8", fg:"#1a4a25" }, { bg:"#eeeeee", fg:"#444444" },
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
          <SectionCard label="Informations du patient" icon="user" color={C.blue}>
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
                    <p style={{ fontSize:13, fontWeight:700, color:form.urgent?C.red:C.textSec }}>Demande urgente</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>Priorité élevée</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard label="Examens à réaliser" icon="micro" color={C.purple}>
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
            <Btn onClick={() => { if (ok) { onCreate(form); onClose() } }} disabled={!ok} variant="success">Créer la demande</Btn>
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
  const [importMsg,           setImportMsg]           = useState("")

  const handleImportMindray = (nomExamen, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const parsed = parseMindrayFile(e.target.result)
      if (Object.keys(parsed).length === 0) {
        setImportMsg("Aucune valeur reconnue dans ce fichier. Vérifiez le format.")
        return
      }
      setResultats(prev => {
        const r = JSON.parse(JSON.stringify(prev))
        if (!r[nomExamen]) r[nomExamen] = { valeurs: {}, commentaire: "" }
        Object.entries(parsed).forEach(([param, data]) => {
          r[nomExamen].valeurs[param] = data
        })
        return r
      })
      setImportMsg(`[OK] ${Object.keys(parsed).length} paramètre(s) importé(s) depuis Mindray`)
      setTimeout(() => setImportMsg(""), 4000)
    }
    reader.readAsText(file)
  }

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
            <div style={{ width:44, height:44, borderRadius:12, background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.5 2 20 9l-5.5 7H7l-5.5-7L7 2z"/><path d="M7 2v20M14.5 2v20"/></svg></div>
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:C.blueDark }}>Saisie des résultats</p>
              <p style={{ fontSize:12, color:C.textPri }}>{demande.patient.nom} — {demande.patient.pid}</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:12, color:C.textPri, fontWeight:600 }}>{nbExamensRemplis}/{demande.examens.length} examen{demande.examens.length>1?"s":""} saisi{nbExamensRemplis>1?"s":""}</span>
            <CloseBtn onClose={onClose} />
          </div>
        </div>

        <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:3, background:C.green, width:(nbExamensRemplis/demande.examens.length*100)+"%", transition:"width .3s" }} />
          </div>

          {importMsg && (
            <div style={{ padding:"10px 16px", borderRadius:10, background: importMsg.startsWith("[OK]") ? C.greenSoft : C.redSoft, border:"1.5px solid "+(importMsg.startsWith("[OK]")?C.green:C.red)+"44", color:importMsg.startsWith("[OK]")?C.green:C.red, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
              {importMsg.startsWith("[OK]")
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
              {importMsg.replace("[OK] ", "")}
            </div>
          )}

          {demande.examens.map((ex) => {
            const saisi = resultats[ex.nom]
            return (
              <div key={ex.nom} style={{ borderRadius:14, border:"1.5px solid "+(saisi?C.green+"50":C.border), background:saisi?C.greenSoft+"40":C.slateSoft, overflow:"hidden" }}>
                <div style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:saisi?"1px solid "+C.green+"30":"none" }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{ex.nom}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{ex.type} · {ex.prix.toLocaleString("fr-FR")} GNF</p>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    {(ex.type==="Hématologie" || ex.nom.toLowerCase().includes("nfs") || ex.nom.toLowerCase().includes("hémato")) && (
                      <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, background:C.purpleSoft, border:"1.5px solid "+C.purple+"44", color:C.purple, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Importer Mindray
                        <input type="file" accept=".txt,.csv,.res,.dat" style={{ display:"none" }}
                          onChange={e => { initExamen(ex.nom); handleImportMindray(ex.nom, e.target.files[0]); e.target.value="" }} />
                      </label>
                    )}
                    {saisi
                      ? <span style={{ fontSize:11, fontWeight:700, color:C.green, background:C.greenSoft, padding:"4px 10px", borderRadius:8 }}>Saisi</span>
                      : <Btn onClick={() => initExamen(ex.nom)} small variant="primary">+ Saisir manuellement</Btn>
                    }
                  </div>
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
                            {anormal && <span></span>}{param}
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
            <Btn onClick={() => onSave(resultats, commentaireGlobal)} variant="primary" disabled={nbExamensRemplis===0}>Sauvegarder (brouillon)</Btn>
            <Btn onClick={() => onValider(resultats, commentaireGlobal)} variant="success" disabled={nbExamensRemplis===0}>Valider et signer</Btn>
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
    const dateEdit = new Date().toLocaleDateString("fr-FR")
    const numRef   = `LAB-${demande.id}`
    const nomParts = (demande.patient.nom || "").split(" ")
    const prenom   = nomParts[0] || ""
    const nom      = nomParts.slice(1).join(" ") || ""
    const age      = getAge(demande.patient.dateNaissance)
    const prescripteur = demande.medecinPrescripteur || ""
    const service      = demande.service || ""

    const css = `
      @page { size:A4; margin:10mm 12mm; }
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;}
      .page{page-break-after:always;min-height:257mm;display:flex;flex-direction:column;}
      .page:last-child{page-break-after:avoid;}
      .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:10px;}
      .hdr-left{font-size:10.5px;line-height:1.55;}
      .hdr-logo{font-size:13px;font-weight:bold;margin-bottom:2px;}
      .hdr-logo span{font-style:italic;color:#005a8e;}
      .hdr-right table{border-collapse:collapse;}
      .hdr-right td{border:1px solid #555;padding:3px 10px;font-size:10px;min-width:90px;}
      .hdr-right td:first-child{font-weight:bold;background:#f0f0f0;width:60px;}
      .section-title{text-align:center;margin:8px 0 10px;line-height:1.5;}
      .section-title .labo{font-size:13px;font-weight:bold;text-decoration:underline;}
      .section-title .type{font-size:12px;font-style:italic;}
      .pat-box{border:1px solid #555;padding:0;margin-bottom:12px;}
      .pat-row{display:flex;}
      .pat-cell{flex:1;padding:4px 8px;border-right:1px solid #ccc;font-size:10.5px;}
      .pat-cell:last-child{border-right:none;}
      .pat-cell b{display:inline-block;min-width:70px;}
      table.res{width:100%;border-collapse:collapse;margin-bottom:12px;}
      table.res th,table.res td{border:1px solid #555;padding:5px 7px;font-size:10.5px;vertical-align:middle;}
      table.res th{background:#e8e8e8;font-weight:bold;text-align:center;}
      .anormal{color:#cc0000;font-weight:bold;}
      .positif{color:#cc0000;}
      .negatif{color:#007700;}
      .footer-sig{margin-top:auto;padding-top:16px;text-align:right;font-size:11px;border-top:1px solid #bbb;}
      .interp{font-size:9.5px;margin-top:6px;border:1px solid #aaa;padding:6px 10px;background:#fafafa;}
      .interp-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;}
    `

    // ── helper: en-tête de chaque page ───────────────────
    const hdr = (typeAnalyse) => `
      <div class="hdr">
        <div class="hdr-left">
          <div class="hdr-logo"><strong>CABINET MEDICAL</strong> <span>Marouane</span></div>
          <div>Dr DOUMBOUYA Mamoudou</div>
          <div>Médecin Généraliste RG</div>
          <div>Tel : (+224)664-29-04-31 / 620-62-55-98</div>
          <div>E-mail : amoudymtha@gmail.com</div>
        </div>
        <div class="hdr-right">
          <table><tr><td>Date</td><td>${dateEdit}</td></tr>
          <tr><td>Reçu N°</td><td>${numRef}</td></tr>
          <tr><td>Montant</td><td></td></tr></table>
        </div>
      </div>
      <div class="section-title">
        <div class="labo">Laboratoire d'Analyse Bio Médicale</div>
        <div class="type">${typeAnalyse}</div>
      </div>
      <div class="pat-box">
        <div class="pat-row" style="border-bottom:1px solid #ccc;">
          <div class="pat-cell"><b>N° :</b> ${numRef}</div>
          <div class="pat-cell"><b>Effectué le :</b> ${fmt(demande.datePrelevement)||dateEdit}</div>
        </div>
        <div class="pat-row" style="border-bottom:1px solid #ccc;">
          <div class="pat-cell"><b>Nom :</b> ${nom}</div>
          <div class="pat-cell"><b>Édité le :</b> ${dateEdit}</div>
        </div>
        <div class="pat-row" style="border-bottom:1px solid #ccc;">
          <div class="pat-cell"><b>Prénom :</b> ${prenom}</div>
          <div class="pat-cell"><b>Prescripteur :</b> ${prescripteur}</div>
        </div>
        <div class="pat-row">
          <div class="pat-cell"><b>Age :</b> ${age} ans</div>
          <div class="pat-cell"><b>Service :</b> ${service}</div>
        </div>
      </div>`

    const footSig = () => `
      <div class="footer-sig">Le Biologiste Responsable du Laboratoire</div>`

    // ── templates par type ────────────────────────────────
    const tGeneric = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => {
        const an = estAnormal(d.valeur, d.norme)
        return `<tr>
          <td>${p}</td>
          <td class="${an?"anormal":""}" style="text-align:center;">${d.valeur||"—"}</td>
          <td style="text-align:center;">${d.unite||"—"}</td>
          <td>${d.norme||"—"}</td>
        </tr>`
      }).join("")
      return `<table class="res"><thead><tr>
        <th>Paramètre</th><th>Résultat</th><th>Unité</th><th>Valeur de Référence</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tHematologie = (valeurs) => {
      const refH = { GB:"4-12",LYM:"0.8-4.5",MON:"0.1-1.5",GRA:"2-7",GR:"3.5-6.0",HB:"13.0-17.5",HCT:"37-54",VGM:"80-100",TCMH:"27-34",CCMH:"32-36",PLT:"100-400" }
      const refF = { GB:"4-12",LYM:"0.8-4.5",MON:"0.1-1.5",GRA:"2-7",GR:"3.1-5.1",HB:"11.5-16.5",HCT:"36-46",VGM:"80-100",TCMH:"27-34",CCMH:"32-36",PLT:"150-450" }
      const refN = { GB:"4-12",LYM:"2-11.2",MON:"0.40-3.10",GRA:"1.00-8.50",GR:"3.9-6.1",HB:"13.5-20.5",HCT:"43-63.5",VGM:"96.5-120",TCMH:"31-37",CCMH:"30-36",PLT:"200-450" }
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td>${p}</td>
        <td style="text-align:center;font-weight:bold;">${d.valeur||""}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td style="text-align:center;">${refN[p]||d.norme||""}</td>
        <td style="text-align:center;">${refH[p]||""}</td>
        <td style="text-align:center;">${refF[p]||""}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultat Hématologie (Cyan Hématologie)</div>
      <table class="res"><thead><tr>
        <th>Paramètres</th><th>Résultats</th><th>Unités</th>
        <th colspan="3">Valeurs de référence</th>
      </tr><tr>
        <th></th><th></th><th></th>
        <th>Normales</th><th>Homme</th><th>Femme</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <p style="font-size:9px;margin-top:4px;font-style:italic;">NB : les résultats normaux de l'hémogramme peuvent varier en fonction de l'âge, du sexe et des conditions physiologiques.</p>`
    }

    const tSerologie = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => {
        return `<tr>
          <td>${p}</td>
          <td class="${d.valeur&&d.valeur.toLowerCase().includes("négatif")?"negatif":"positif"}" style="text-align:center;">${d.valeur||"—"}</td>
          <td style="text-align:center;">${d.titre||""}</td>
          <td>${d.norme||"—"}</td>
        </tr>`
      }).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">FICHE DES RESULTATS : SEROLOGIQUE</div>
      <table class="res"><thead><tr>
        <th>Analyse demandée</th><th>Résultat</th><th>Titre</th><th>Valeur Normale</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <div class="interp"><div style="font-weight:bold;margin-bottom:4px;text-decoration:underline;">INTERPRETATION DES RESULTATS</div>
      <div class="interp-grid">
        <div>RPR+ TPHA+ : <b>SYPHILIS</b></div><div>RPR− TPHA− : absence d'infection syphilis</div>
        <div>TO+ TH+ : <b>Typhoïde</b></div><div>TO− TH− : pas de typhoïde</div>
        <div>TO+ TH− : Début de typhoïde</div><div>TO− TH+ : Trace (T=200)</div>
      </div></div>`
    }

    const tImmunologieHep = (valeurs) => {
      let no = 1
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td style="text-align:center;">${no++}</td>
        <td>${p}<br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;" class="${d.valeur&&d.valeur.toLowerCase().includes("négatif")?"negatif":"positif"}">${d.valeur||"—"}${d.vt?` VT : ${d.vt}`:""}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td>${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats – Immunologie</div>
      <table class="res"><thead><tr>
        <th>N°</th><th>Recherche demandée</th><th>Résultats</th><th>Unité</th><th>Interprétation</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tHormonal = (valeurs) => {
      let no = 1
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td style="text-align:center;">${no++}</td>
        <td><b>${p}</b><br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;">${d.valeur||"—"}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td style="font-size:10px;">${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultat de l'analyse Hormonal</div>
      <table class="res"><thead><tr>
        <th>N°</th><th>Paramètre</th><th>Résultat</th><th>Unité</th><th>Valeurs Normales</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tThyroide = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td><b>${p}</b><br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;">${d.valeur||"—"}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td>${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats – Hormones Thyroïdiennes</div>
      <table class="res"><thead><tr>
        <th>Recherche demandée</th><th>Résultat</th><th>Unité</th><th>Interprétation (VN)</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tMarqueurs = (valeurs) => {
      let no = 1
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td style="text-align:center;">${no++}</td>
        <td><b>${p}</b><br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;">${d.valeur||"—"}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td>${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats des Marqueurs Tumoraux</div>
      <table class="res"><thead><tr>
        <th>N°</th><th>Recherche demandée</th><th>Résultats</th><th>Unités</th><th>Interprétation (VN)</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tBHCG = (valeurs) => {
      const val = Object.values(valeurs)[0]
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultat de l'analyse du BHCG Quantitatif</div>
      <table class="res" style="margin-bottom:10px;"><thead><tr>
        <th>Paramètre</th><th>Résultat</th><th>Unité</th>
      </tr></thead><tbody><tr>
        <td>βHCG – Chaîne bêta de l'hormone chorionique gonadotrope<br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;">${val?.valeur||"—"}</td>
        <td style="text-align:center;">${val?.unite||"mUI/L"}</td>
      </tr></tbody></table>
      <table class="res" style="font-size:10px;"><thead>
        <tr><th colspan="2">Interprétation (VN) – Taux de βHCG selon semaine de grossesse</th></tr>
        <tr><th>Jour / Semaine de grossesse</th><th>Taux de βHCG (mUI/L)</th></tr>
      </thead><tbody>
        <tr><td>Pas de grossesse</td><td>˂ 5</td></tr>
        <tr><td>7 jours</td><td>5 – 20</td></tr>
        <tr><td>2e Semaine</td><td>100 – 6 000</td></tr>
        <tr><td>3e Semaine</td><td>1 500 – 25 000</td></tr>
        <tr><td>4e Semaine</td><td>2 400 – 70 000</td></tr>
        <tr><td>5e Semaine</td><td>10 000 – 130 000</td></tr>
        <tr><td>6e Semaine</td><td>30 000 – 190 000</td></tr>
        <tr><td>2–3 mois</td><td>30 000 – 100 000</td></tr>
        <tr><td>7–9 mois</td><td>5 000 – 15 000</td></tr>
      </tbody></table>`
    }

    const tPSA = (valeurs) => {
      const val = Object.values(valeurs)[0]
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats – Cancérologie (Antigène Spécifique Prostatique)</div>
      <p style="margin-bottom:8px;">T.P.S.A Total : <b>${val?.valeur||"—"} ng/ml</b> &nbsp;&nbsp; (E.L.F.A – système Vidas : Biomerieux)</p>
      <table class="res" style="font-size:10px;"><thead>
        <tr><th colspan="2">Valeurs normales par tranche d'âge</th></tr>
        <tr><th>Tranche d'âge</th><th>VN (ng/ml)</th></tr>
      </thead><tbody>
        <tr><td>Moins de 40 ans</td><td>0.21 – 1.72</td></tr>
        <tr><td>40 – 49 ans</td><td>0.27 – 2.19</td></tr>
        <tr><td>50 – 59 ans</td><td>0.27 – 3.42</td></tr>
        <tr><td>60 – 69 ans</td><td>0.22 – 6.16</td></tr>
        <tr><td>Plus de 69 ans</td><td>0.91 – 6.77</td></tr>
      </tbody></table>
      <p style="font-size:9px;margin-top:6px;font-style:italic;">NB : Résultat à confronter toujours avec celui du toucher rectal et aux données cliniques du patient.</p>`
    }

    const tTORCH = (valeurs) => {
      let no = 1
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td style="text-align:center;">${no++}</td>
        <td>${p}<br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;" class="${d.valeur&&d.valeur.toLowerCase().includes("négatif")?"negatif":"positif"}">${d.valeur||"—"}</td>
        <td style="text-align:center;">${d.unite||"UI/ml"}</td>
        <td style="font-size:9.5px;">${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats – Immunologie (Toxoplasmose / Rubéole)</div>
      <table class="res"><thead><tr>
        <th>N°</th><th>Recherche demandée</th><th>Résultats</th><th>Unités</th><th>Interprétation</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <div class="interp"><div style="font-weight:bold;margin-bottom:3px;">Interprétation Toxoplasmose / Rubéole :</div>
        <div>IgG− IgM− : Pas d'infection ni immunité — Suivi sérologique mensuel</div>
        <div>IgG− IgM+ : Infection récente — contrôle après 15 jours</div>
        <div>IgG+ IgM− : Infection pré-conceptionnelle (immunité)</div>
        <div>IgG+ IgM+ : Probable évolution d'infection — confirmer par avidité IgG</div>
      </div>`
    }

    const tECBU = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td>${p}</td><td style="text-align:center;">${d.valeur||""}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Examen Cyto-Bactériologique des Urines (ECBU + ATG)</div>
      <table class="res" style="margin-bottom:10px;"><thead><tr>
        <th>Cytologie</th><th>Résultat</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <p style="font-size:10px;margin:8px 0 4px;font-weight:bold;">Coloration de Gram :</p>
      <div style="border:1px solid #aaa;padding:6px;font-size:10px;min-height:30px;"></div>`
    }

    const tParasitologie = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td>${p}</td><td style="text-align:center;">${d.valeur||""}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultat Parasitologique des Selles</div>
      <table class="res"><thead>
        <tr><th colspan="2">Examen Macroscopique</th></tr>
      </thead><tbody>${rows}</tbody></table>`
    }

    // ── choix du template par nom d'examen ───────────────
    const genSection = (nomExamen, data) => {
      const v = data.valeurs || {}
      const n = nomExamen.toLowerCase()
      if (n.includes("nfs") || (n.includes("hématologie") && !n.includes("hormones")))
        return [nomExamen, tHematologie(v)]
      if (n.includes("sérologie") || n.includes("aslo") || n.includes("widal") || n.includes("cpr") || n.includes("rpr") || n.includes("tpha"))
        return [nomExamen, tSerologie(v)]
      if (n.includes("aghbs") || n.includes("hépatite"))
        return [nomExamen, tImmunologieHep(v)]
      if (n.includes("torch") || n.includes("toxoplasmose") || n.includes("rubéole"))
        return [nomExamen, tTORCH(v)]
      if (n.includes("thyroïdien") || n.includes("tsh") || n.includes("t3") || n.includes("t4"))
        return [nomExamen, tThyroide(v)]
      if (n.includes("hormonal") || n.includes("testostérone") || n.includes("prolactine") || n.includes("fsh") || n.includes("œstradiol"))
        return [nomExamen, tHormonal(v)]
      if (n.includes("marqueurs") || n.includes("ca-125") || n.includes("ca-19") || n.includes("ace") || n.includes("ca-15"))
        return [nomExamen, tMarqueurs(v)]
      if (n.includes("psa") || n.includes("prostate"))
        return [nomExamen, tPSA(v)]
      if (n.includes("bhcg") || n.includes("βhcg"))
        return [nomExamen, tBHCG(v)]
      if (n.includes("ecbu") || n.includes("urine") || n.includes("vaginal"))
        return [nomExamen, tECBU(v)]
      if (n.includes("parasitologie") || n.includes("selles"))
        return [nomExamen, tParasitologie(v)]
      return [nomExamen, tGeneric(v, nomExamen)]
    }

    const pages = Object.entries(demande.resultats || {}).map(([nomExamen, data]) => {
      const [typeLabel, contenu] = genSection(nomExamen, data)
      return `<div class="page">${hdr(typeLabel)}${contenu}${footSig()}</div>`
    })

    if (pages.length === 0) {
      alert("Aucun résultat à imprimer.")
      return
    }

    const html = `<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8">
      <title>Résultats — ${demande.patient.nom}</title>
      <style>${css}</style>
    </head><body>${pages.join("")}</body></html>`

    const w = window.open("", "_blank")
    if (!w) { alert("Autoriser les pop-ups pour imprimer."); return }
    w.document.write(html); w.document.close()
    setTimeout(() => { w.print() }, 500)
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
            <Btn onClick={handlePrint} variant="success" small>Imprimer</Btn>
            <CloseBtn onClose={onClose} />
          </div>
        </div>
        <div style={{ padding:"28px 36px", background:"#fff" }}>
          <div style={{ textAlign:"center", borderBottom:"2px solid "+C.green, paddingBottom:16, marginBottom:22 }}>
            
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
                            {anormal
                              ? <span style={{ display:"inline-flex",alignItems:"center",gap:4,color:C.red,fontWeight:700 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                                  Anormal
                                </span>
                              : <span style={{ display:"inline-flex",alignItems:"center",gap:4,color:C.green }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  Normal
                                </span>}
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
                <div key={nom} style={{ marginBottom:8, padding:"10px 14px", background:C.slateSoft, borderRadius:8, fontSize:13 }}><strong>{nom} :</strong> {d.commentaire}</div>
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
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { patients: sharedPatients, resultatsLabo, addResultatLabo, updateResultatLabo } = useSharedData()

  const [sidebarOpen,         setSidebarOpen]         = useState(false)
  const [demandes,            setDemandes]            = useState(DEMANDES_INIT)
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

  const [onglet, setOnglet] = useState("toutes")

  const NAV_ICONS = {
    doc:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v8l-3.5 6A2 2 0 007.2 19h9.6a2 2 0 001.7-3L15 10V2"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="9.5" y1="7" x2="14.5" y2="7"/></svg>,
    wait:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14M5 21h14"/><path d="M7 3l5 9 5-9"/><path d="M7 21l5-9 5 9"/></svg>,
    micro: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 8h2M18 8h2"/><path d="M12 12v4M8 20h8"/><line x1="12" y1="16" x2="12" y2="20"/></svg>,
    check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>,
  }

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

  const NAV = [
    { id:"toutes",     label:"Toutes",     icon:"doc",   count:stats.total,      color:C.blue  },
    { id:"en_attente", label:"En attente", icon:"wait",  count:stats.en_attente, color:C.slate },
    { id:"en_cours",   label:"En cours",   icon:"micro", count:stats.en_cours,   color:C.blue  },
    { id:"termines",   label:"Terminés",   icon:"check", count:stats.termine,    color:C.green },
  ]

  const titres = {
    toutes:"Toutes les demandes", en_attente:"En attente de prélèvement",
    en_cours:"Analyses en cours", termines:"Résultats validés",
  }

  const handleCreerDemande = (form) => {
    const patient = sharedPatients.find(p=>p.id===parseInt(form.patientId))
    const nouvelle = {
      id:Date.now(), patientId:patient.id, patient,
      dateDemande:today(), heureDemande:getNowTime(),
      medecinPrescripteur:form.medecinPrescripteur, service:form.service,
      examens:form.examens.map(e=>({...e, prix:parseInt(e.prix)||0})),
      statut:"en_attente",
      datePrelevement:null, heurePrelevement:null,
      dateRendu:null, heureRendu:null,
      resultats:{}, valide:false, validePar:null, valideLe:null,
      urgent:form.urgent, commentaireGlobal:""
    }
    setDemandes(prev => [nouvelle, ...prev])
    addResultatLabo({ ...nouvelle, type:"demande_labo" })
  }
  const handleDemarrerPrelevement = (id) => {
    setDemandes(prev => prev.map(d => d.id===id?{...d, statut:"en_cours", datePrelevement:today(), heurePrelevement:getNowTime()}:d))
    const rl = resultatsLabo.find(r=>r.id===id)
    if (rl) updateResultatLabo(id, { statut:"en_cours", datePrelevement:today(), heurePrelevement:getNowTime() })
  }
  const handleSauvegarder = (id, resultats, commentaireGlobal) => {
    setDemandes(prev => prev.map(d => d.id===id?{...d, resultats, commentaireGlobal, statut:"en_cours"}:d))
    setShowSaisie(null)
  }
  const handleValider = (id, resultats, commentaireGlobal) => {
    const valideLe = today()+" "+getNowTime()
    const biologiste = user?.nom || "Biologiste"
    setDemandes(prev => prev.map(d => d.id===id?{...d, resultats, commentaireGlobal, statut:"termine", dateRendu:today(), heureRendu:getNowTime(), valide:true, validePar:biologiste, valideLe}:d))
    // Sauvegarder les résultats dans le contexte partagé pour que les médecins les voient
    const rl = resultatsLabo.find(r=>r.id===id)
    if (rl) updateResultatLabo(id, { resultats, commentaireGlobal, statut:"termine", dateRendu:today(), valide:true, validePar:biologiste, valideLe })
    setShowSaisie(null)
  }


  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI', system-ui, sans-serif", color:C.textPri }}>

      {/* MODALS */}
      {showNouvelleDemande && <ModalNouvelleDemande patients={sharedPatients} onClose={()=>setShowNouvelleDemande(false)} onCreate={handleCreerDemande}/>}
      {showSaisie && <ModalSaisieResultats demande={showSaisie} onClose={()=>setShowSaisie(null)} onSave={(r,c)=>handleSauvegarder(showSaisie.id,r,c)} onValider={(r,c)=>handleValider(showSaisie.id,r,c)}/>}
      {showFiche  && <ModalFicheLaboratoire demande={showFiche} onClose={()=>setShowFiche(null)}/>}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:265, background:C.white, boxShadow:"4px 0 24px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column", overflow:"auto" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44,height:44,borderRadius:10,background:"#fff",border:"1px solid "+C.border,padding:3,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:7,objectFit:"contain",display:"block" }}/>
              </div>
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
                  <span style={{ display:"flex", alignItems:"center" }}>{NAV_ICONS[n.icon]}</span>
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

        {/* Logo clinique */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:12, paddingRight:20, borderRight:"1px solid "+C.border, flexShrink:0 }}>
          <div style={{ width:38,height:38,borderRadius:9,background:"#fff",border:"1px solid "+C.border,padding:3,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <img src={logo} alt="" style={{ width:"100%",height:"100%",borderRadius:6,objectFit:"contain",display:"block" }}/>
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:800,color:C.textPri,lineHeight:1.2 }}>Clinique Marouane</p>
            <p style={{ fontSize:11,color:C.textMuted }}>Laboratoire</p>
          </div>
        </div>

        <div style={{ flex:1, marginLeft:16 }}>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>Laboratoire d'Analyses Médicales</p>
          <p style={{ fontSize:12, color:C.textMuted, textTransform:"capitalize" }}>{dateStr}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {stats.en_attente>0&&(
            <div style={{ display:"flex", alignItems:"center", gap:6, background:C.slateSoft, border:"1px solid "+C.slate+"40", borderRadius:10, padding:"6px 12px" }}>
            
              <span style={{ fontSize:12, fontWeight:700, color:C.slate }}>{stats.en_attente} en attente</span>
            </div>
          )}
          <div style={{ background:C.purpleSoft, border:"1px solid "+C.purple+"33", borderRadius:10, padding:"6px 14px", fontSize:14, fontWeight:700, color:C.purple, fontVariantNumeric:"tabular-nums" }}>
            {heure}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{user?.nom||"Laborantin"}</p>
              <p style={{ fontSize:11, color:C.textSec }}>{user?.titre||"Biologiste · Labo"}</p>
            </div>
            <Avatar name={user?.nom||"L"} size={36}/>
          </div>
          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width:36,height:36,borderRadius:8,border:"1px solid #fca5a5",background:"#fff5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main style={{ padding:"28px 28px", maxWidth:1400, margin:"0 auto" }}>
        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
          {[
            { label:"En attente",      val:stats.en_attente, color:C.slate,  bg:C.slateSoft,  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label:"En analyse",      val:stats.en_cours,   color:C.blue,   bg:C.blueSoft,   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2v8l-3.5 6A2 2 0 007.2 19h9.6a2 2 0 001.7-3L15 10V2"/><line x1="9" y1="2" x2="15" y2="2"/></svg> },
            { label:"Résultats prêts", val:stats.termine,    color:C.green,  bg:C.greenSoft,  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> },
            { label:"Total demandes",  val:stats.total,      color:C.purple, bg:C.purpleSoft, icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
          ].map(k=>(
            <div key={k.label} style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border, padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:22, fontWeight:900, color:k.color, lineHeight:1, marginBottom:4 }}>{k.val}</p>
                <p style={{ fontSize:11, color:C.textMuted }}>{k.label}</p>
              </div>
              <div style={{ width:38, height:38, borderRadius:10, background:k.bg, display:"flex", alignItems:"center", justifyContent:"center", color:k.color }}>{k.icon}</div>
            </div>
          ))}
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
                  <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:C.textMuted, letterSpacing:"0.07em", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demandesFiltrees.length===0?(
                <tr>
                  <td colSpan={7} style={{ padding:"60px 40px", textAlign:"center" }}>
                    
                    <p style={{ fontSize:15, fontWeight:600, color:C.textSec, marginBottom:4 }}>Aucune demande dans cette catégorie</p>
                    <p style={{ fontSize:13, color:C.textMuted }}>{recherche?`Aucun résultat pour "${recherche}"`:"Les demandes apparaîtront ici"}</p>
                  </td>
                </tr>
              ):demandesFiltrees.map((d,i,arr)=>(
                <tr key={d.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", background:d.urgent?"#fff8f8":"transparent", transition:"background .1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=d.urgent?C.redSoft:C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background=d.urgent?"#fff8f8":"transparent"}>
                  <td style={{ padding:"11px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={d.patient.nom} size={36}/>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{d.patient.nom}</p>
                          {d.urgent&&<span style={{ fontSize:10, fontWeight:800, color:C.red, background:C.redSoft, padding:"1px 6px", borderRadius:6 }}>URGENT</span>}
                        </div>
                        <p style={{ fontSize:11, color:C.textMuted }}>{d.patient.pid}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <p style={{ fontSize:14, fontWeight:800, color:C.purple, fontVariantNumeric:"tabular-nums" }}>{d.heureDemande}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{fmt(d.dateDemande)}</p>
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{d.medecinPrescripteur}</p>
                    <p style={{ fontSize:11, color:C.textMuted }}>{d.service||"—"}</p>
                  </td>
                  <td style={{ padding:"14px 14px", maxWidth:220 }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {d.examens.map((e,idx)=>(
                        <span key={idx} style={{ fontSize:11, fontWeight:600, background:C.blueSoft, color:C.textPri, padding:"3px 8px", borderRadius:6 }}>{e.nom}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:C.green }}>{d.examens.reduce((s,e)=>s+(e.prix||0),0).toLocaleString("fr-FR")} GNF</p>
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <Badge statut={d.statut}/>
                    {d.valide&&<p style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>Signé par {d.validePar}</p>}
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {d.statut==="en_attente"&&(
                        <>
                          <Btn onClick={()=>handleDemarrerPrelevement(d.id)} small variant="success">
                            <span style={{ display:"inline-flex",alignItems:"center",gap:5 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              Prélever
                            </span>
                          </Btn>
                          <Btn onClick={()=>setShowSaisie(d)} small variant="primary">Résultats</Btn>
                        </>
                      )}
                      {d.statut==="en_cours"&&(
                        <Btn onClick={()=>{ const updated=demandes.find(x=>x.id===d.id); setShowSaisie(updated) }} small variant="primary">Compléter</Btn>
                      )}
                      {d.statut==="termine"&&(
                        <Btn onClick={()=>setShowFiche(d)} small variant="secondary">Voir fiche</Btn>
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