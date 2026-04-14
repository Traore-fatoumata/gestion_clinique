import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
const today   = () => new Date().toISOString().slice(0, 10)
const fmt     = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"
const calcAge = d => { if (!d) return 0; return Math.floor((Date.now() - new Date(d)) / (365.25 * 864e5)) }

// ══════════════════════════════════════════════════════
//  DONNÉES
// ══════════════════════════════════════════════════════
const SYMPTOMES_DIAGNOSTICS = {
  "Douleur thoracique": ["Infarctus", "Angine de poitrine", "Péricardite", "Embolie pulmonaire"],
  "Palpitations":       ["Tachycardie", "Fibrillation auriculaire", "Anxiété", "Hyperthyroïdie"],
  "Essoufflement":      ["Insuffisance cardiaque", "Asthme", "Embolie pulmonaire", "Anémie"],
  "Fièvre":             ["Infection bactérienne", "Infection virale", "Paludisme", "COVID-19"],
  "Nausées":            ["Grossesse", "Gastro-entérite", "Migraine", "Insuffisance hépatique"],
  "Douleur abdominale": ["Appendicite", "Cholécystite", "Ulcère", "Colique néphrétique"],
  "Toux":               ["Bronchite", "Pneumonie", "Asthme", "COVID-19"],
  "Maux de tête":       ["Migraine", "Hypertension", "Méningite", "Glaucome"],
}

const PATHOLOGIES_COMMUNES = [
  "Hypertension", "Diabète", "Asthme", "Paludisme", "Infection urinaire",
  "Grippe", "Bronchite", "Gastro-entérite", "Migraine", "Anémie",
  "Dépression", "Anxiété", "Arthrose", "Allergie", "Dermatite",
]

const EXAMENS_RAPIDES = ["ECG", "NFS", "Glycémie", "Radiographie", "Échographie", "Bilan rénal", "Bilan hépatique"]

const TYPE_CONSULT_LABEL = {
  standard:     { label:"Consultation standard",        short:"Standard" },
  prenatal:     { label:"Consultation prénatale (CPN)", short:"CPN"      },
  accouchement: { label:"Registre d’accouchement",      short:"Accouch." },
}

const isGynecoObst = (sp) => /gynécologie|obstétrique/i.test(sp || "")

// Patients assignés par le médecin chef — file d’accueil (plaintes, RDV, type de consultation)
const PATIENTS_INIT = [
  { id:1, pid:"CAB-A1B2C3", nom:"Bah Mariama",     dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", adresse:"Ratoma",  motif:"Consultation générale", statut:"en_attente", arrivee:"08:15", docteurId:2, typeVisite:"spontane", motifRdv:"", plaintesChef:"Céphalées, courbatures", symptomesChef:"Fièvre à 38.2°C", antecedentsChef:"Néant", diagnosticPreliminaireChef:"Syndrome grippal ?", typeConsultation:"standard" },
  { id:2, pid:"CAB-D4E5F6", nom:"Diallo Ibrahima", dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", adresse:"Kaloum",  motif:"Suivi cardiologie",     statut:"en_attente", arrivee:"08:45", docteurId:2, typeVisite:"rendez_vous", motifRdv:"Contrôle tension et bilan post-hospitalisation (6 mois)", plaintesChef:"— (RDV programmé)", symptomesChef:"—", antecedentsChef:"HTA connue", diagnosticPreliminaireChef:"Suivi HTA / bilan", typeConsultation:"standard" },
  { id:3, pid:"CAB-G7H8I9", nom:"Sow Fatoumata",   dateNaissance:"1996-11-20", sexe:"F", telephone:"+224 621 77 88 99", adresse:"Dixinn",  motif:"Douleur thoracique",    statut:"en_salle",   arrivee:"09:00", docteurId:2, typeVisite:"spontane", motifRdv:"", plaintesChef:"Douleur rétrosternale depuis 6h", symptomesChef:"Palpitations, sueurs", antecedentsChef:"Tabagisme", diagnosticPreliminaireChef:"Douleur thoracique à explorer", typeConsultation:"standard" },
  { id:4, pid:"CAB-J1K2L3", nom:"Kouyaté Mamadou", dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", adresse:"Matam",   motif:"Palpitations",          statut:"en_attente", arrivee:"09:30", docteurId:3, typeVisite:"spontane", motifRdv:"", plaintesChef:"", symptomesChef:"", antecedentsChef:"", diagnosticPreliminaireChef:"", typeConsultation:"standard" },
  { id:5, pid:"CAB-M4N5O6", nom:"Baldé Aissatou",  dateNaissance:"2018-06-08", sexe:"F", telephone:"+224 625 66 77 88", adresse:"Matoto",  motif:"Fièvre persistante",    statut:"en_attente", arrivee:"10:00", docteurId:4, typeVisite:"spontane", motifRdv:"", plaintesChef:"", symptomesChef:"", antecedentsChef:"", diagnosticPreliminaireChef:"", typeConsultation:"standard" },
  { id:6, pid:"CAB-P9Q0R1", nom:"Touré Aminata",   dateNaissance:"1994-08-22", sexe:"F", telephone:"+224 620 12 34 56", adresse:"Coyah",   motif:"CPN — suivi grossesse", statut:"en_attente", arrivee:"10:30", docteurId:5, typeVisite:"rendez_vous", motifRdv:"CPN 3e trimestre + bilan prénatal", plaintesChef:"Fatigue, œdèmes légers", symptomesChef:"TA 12/8, HU 32 cm", antecedentsChef:"G2P1", diagnosticPreliminaireChef:"Grossesse à terme proche", typeConsultation:"prenatal" },
  { id:7, pid:"CAB-S2T3U4", nom:"Camara Oumou",     dateNaissance:"1991-01-10", sexe:"F", telephone:"+224 623 98 76 54", adresse:"Matam",   motif:"Travail obstétrical",   statut:"en_salle",   arrivee:"11:00", docteurId:5, typeVisite:"spontane", motifRdv:"", plaintesChef:"Contractions régulières", symptomesChef:"BPP 140, col 6 cm", antecedentsChef:"G3P2", diagnosticPreliminaireChef:"Travail évolutif", typeConsultation:"accouchement" },
]

const CONSULTATIONS_INIT = [
  { id:10, patientId:1, date:"2025-11-10", motif:"Migraine, fatigue", service:"Médecine générale", docteurId:1, observations:"Repos", symptomes:"Céphalée", diagnostics:["Migraine"], pathologies:[], examens:[], traitements:["Antalgique"], commentaires:"Autre service", signe:true, signeLe:"10/11/2025 09:00", typeConsultation:"standard" },
  { id:1, patientId:1, date:"2026-03-15", motif:"Fièvre persistante",  service:"Cardiologie", docteurId:2, observations:"TA 13/8, pouls 90", symptomes:"Fièvre, fatigue", diagnostics:["Infection virale"], pathologies:["Anémie"], examens:["NFS"], traitements:["Paracétamol 500mg"], commentaires:"Repos 3 jours", signe:true,  signeLe:"15/03/2026 10:30", typeConsultation:"standard" },
  { id:2, patientId:2, date:"2026-03-28", motif:"Suivi cardiologie",   service:"Cardiologie", docteurId:2, observations:"Tension stable 12/8", symptomes:"Palpitations", diagnostics:["HTA stable"],         pathologies:["HTA"],    examens:["ECG"], traitements:["Amlodipine 5mg"],  commentaires:"Contrôle dans 1 mois", signe:true,  signeLe:"28/03/2026 11:00", typeConsultation:"standard" },
  { id:3, patientId:3, date:today(),      motif:"Douleur thoracique",  service:"Cardiologie", docteurId:2, observations:"",                   symptomes:"",              diagnostics:[],                      pathologies:[],         examens:[],      traitements:[],                  commentaires:"",                     signe:false, signeLe:null, typeConsultation:"standard" },
  { id:4, patientId:6, date:"2026-02-01", motif:"CPN 2e trimestre",    service:"Gynécologie", docteurId:5, observations:"Échographie normale", symptomes:"—", diagnostics:["Grossesse évolutive"], pathologies:[], examens:["Échographie"], traitements:["Acide folique"], commentaires:"", signe:true, signeLe:"01/02/2026 14:00", typeConsultation:"prenatal", donneesPrenatal:{ ddr:"2025-07-10", termeSA:"32 sa", gestiteParite:"G2P1", ta:"12/8", hu:"24", bcf:"140", presentation:"Céphalique", visiteCpn:"2", albumine:"négatif", sucre:"négatif", vat:"VAT2" } },
]

// Médecin connecté (simulé). Pour CPN / accouchement : { id:5, nom:"Dr. Keïta", specialite:"Gynécologie" }
const MEDECIN_CONNECTE = { id:5, nom:"Dr. Keïta", specialite:"Gynécologie" }
// ══════════════════════════════════════════════════════
//  COULEURS
// ══════════════════════════════════════════════════════
const C = {
  bg:"#f7f9f8",      white:"#ffffff",
  textPri:"#111827", textSec:"#374151", textMuted:"#6b7280",
  border:"#e2ebe4",
  green:"#16a34a",   greenSoft:"#dcfce7",  greenDark:"#15803d", greenLight:"#bbf7d0",
  blue:"#1d6fa4",    blueSoft:"#e8f4fb",
  amber:"#b45309",   amberSoft:"#fef3c7",
  red:"#dc2626",     redSoft:"#fef2f2",
  slate:"#475569",   slateSoft:"#f1f5f9",
  purple:"#6d28d9",  purpleSoft:"#ede9fe",
  orange:"#c2410c",  orangeSoft:"#fff7ed",
  teal:"#0f766e",    tealSoft:"#f0fdfa",
}

function TypeConsultBadge({ type }) {
  const t = TYPE_CONSULT_LABEL[type] || TYPE_CONSULT_LABEL.standard
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:8, background:C.purpleSoft, color:C.purple, border:"1px solid "+C.purple+"33" }} title={t.label}>
      {t.short}
    </span>
  )
}

function RdvBadge({ patient }) {
  if (patient.typeVisite !== "rendez_vous") return null
  return (
    <span style={{ fontSize:11, fontWeight:700, background:C.blueSoft, color:C.textPri, padding:"2px 8px", borderRadius:8, border:"1px solid "+C.blue+"33" }} title={patient.motifRdv || "Rendez-vous"}>
      RDV
    </span>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
function Badge({ statut }) {
  const cfg = {
    en_attente: { label:"En attente",  color:C.slate, bg:C.slateSoft },
    en_salle:   { label:"En salle",    color:C.green, bg:C.greenSoft, pulse:true },
    termine:    { label:"Terminé",     color:C.slate, bg:C.slateSoft },
    signe:      { label:"Signé",     color:C.green, bg:C.greenSoft },
    non_signe:  { label:"Non signé", color:C.red,   bg:C.redSoft   },
  }
  const s = cfg[statut] || cfg.en_attente
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33", whiteSpace:"nowrap" }}>
      {s.pulse && <span style={{ width:5, height:5, borderRadius:"50%", background:s.color, animation:"blink 2s ease-in-out infinite" }} />}
      {s.label}
    </span>
  )
}

function Avatar({ name, size=36, bg }) {
  const bgs = [C.blueSoft,C.greenSoft,C.purpleSoft,C.slateSoft,C.orangeSoft]
  const fgs = [C.blue,C.green,C.purple,C.slate,C.orange]
  const i   = (name?.charCodeAt(0)||0) % bgs.length
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg||bgs[i], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={bg?"#fff":fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}

function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>{children}</div>
}

function CardHeader({ title, sub, action }) {
  return (
    <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <p style={{ fontWeight:700, fontSize:15, color:C.textPri, marginBottom:sub?2:0 }}>{title}</p>
        {sub && <p style={{ fontSize:12, color:C.textMuted }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function Btn({ children, onClick, variant="primary", small=false, disabled=false, full=false }) {
  const cfg = {
    primary:  { bg:C.blue,  hov:"#155e8b", color:"#fff", border:"none" },
    success:  { bg:C.green, hov:"#166534", color:"#fff", border:"none" },
    danger:   { bg:C.red,   hov:"#b91c1c", color:"#fff", border:"none" },
    secondary:{ bg:"transparent", hov:C.slateSoft, color:C.textSec, border:"1px solid "+C.border },
  }
  const s = cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:s.bg, color:s.color, border:s.border||"none", borderRadius:10, padding:small?"7px 16px":"10px 20px", fontSize:small?12:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", transition:"all .2s", opacity:disabled?.55:1, width:full?"100%":"auto", justifyContent:full?"center":"flex-start" }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=s.hov }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.background=s.bg }}
    >{children}</button>
  )
}

const inputSt = { width:"100%", padding:"10px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", resize:"vertical" }
const labelSt = { display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }

/** Aligné sur le registre papier « Registre de consultation prénatale » */
const PRENATAL_DEFAULT = {
  ddr: "", termeSA: "", gestiteParite: "", dateRdv: "",
  visiteCpn: "", risque: "", tailleCm: "",
  poids: "", ta: "", hu: "",
  bcf: "", maf: "",
  presentation: "",
  albumine: "", sucre: "",
  vat: "", fer: "", acideFolique: "", tpi: "", miiMild: "",
  ptmeConseil: "", ptmeTest: "", ptmeResultat: "", ptmeArv: "", ptmePartenaire: "",
  constatsProblemes: "", notesCpn: "",
}

/** Aligné sur le registre « Registre de l’accouchement dans les CS » */
const ACCOUCH_DEFAULT = {
  dateAcc: "", heureAcc: "",
  dateSortie: "", joursHospitalisation: "", sangPerduMl: "",
  dernierNeVivant: "", avantDernierNeVivant: "", vatMere: "",
  voie: "", sexeNN: "", poidsNN: "", tailleNN: "", pc: "",
  apgar1: "", apgar5: "", apgar10: "",
  modeSortie: "", soinCordon: "", miseAuSein1h: "", soinYeux: "", vitamineK1: "",
  vpo0: "", bcg: "",
  etatSortieMere: "", etatSortieEnfant: "",
  partogramme: "", personnelQualifie: "",
  complicationsMere: "", notes: "",
}

function mergePrenatalInit(dp) {
  return {
    ...PRENATAL_DEFAULT,
    ...dp,
    termeSA: dp.terme || dp.termeSA || PRENATAL_DEFAULT.termeSA,
    gestiteParite: dp.gestiteParite || dp.parite || PRENATAL_DEFAULT.gestiteParite,
  }
}

function mergeAccouchInit(da) {
  const parts = da.apgar ? String(da.apgar).split(/[/\s]+/).filter(Boolean) : []
  return {
    ...ACCOUCH_DEFAULT,
    ...da,
    apgar1: da.apgar1 || parts[0] || "",
    apgar5: da.apgar5 || parts[1] || "",
    apgar10: da.apgar10 || parts[2] || "",
  }
}

function RegSection({ title, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10, borderBottom:"1px solid "+C.border, paddingBottom:6 }}>{title}</p>
      {children}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — FICHE PATIENT
// ══════════════════════════════════════════════════════
function ModalFichePatient({ patient, consultations, medecin, onClose, onConsulter }) {
  if (!patient) return null
  const visites = consultations.filter(c=>c.patientId===patient.id).sort((a,b)=>b.date.localeCompare(a.date))
  const tc = patient.typeConsultation || "standard"
  const hasChef = patient.plaintesChef || patient.symptomesChef || patient.diagnosticPreliminaireChef
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:600, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar name={patient.nom} size={48} />
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <p style={{ fontSize:18, fontWeight:800, color:C.textPri, marginBottom:3 }}>{patient.nom}</p>
                <RdvBadge patient={patient} />
                {tc !== "standard" && <TypeConsultBadge type={tc} />}
              </div>
              <p style={{ fontSize:13, color:C.textSec }}>{patient.pid} · {calcAge(patient.dateNaissance)} ans · {patient.sexe==="F"?"Féminin":"Masculin"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>

        {/* Infos */}
        <div style={{ padding:"20px 28px" }}>
          {patient.typeVisite === "rendez_vous" && patient.motifRdv && (
            <div style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Objet du rendez-vous</p>
              <p style={{ fontSize:14, color:C.textPri, lineHeight:1.45 }}>{patient.motifRdv}</p>
            </div>
          )}

          {hasChef && (
            <div style={{ background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.green, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>File d’accueil — médecin chef</p>
              {patient.plaintesChef && <p style={{ fontSize:13, color:C.textPri, marginBottom:4 }}><strong>Plaintes :</strong> {patient.plaintesChef}</p>}
              {patient.symptomesChef && <p style={{ fontSize:13, color:C.textPri, marginBottom:4 }}><strong>Signes / symptômes :</strong> {patient.symptomesChef}</p>}
              {patient.antecedentsChef && <p style={{ fontSize:13, color:C.textPri, marginBottom:4 }}><strong>Antécédents :</strong> {patient.antecedentsChef}</p>}
              {patient.diagnosticPreliminaireChef && <p style={{ fontSize:13, color:C.textPri }}><strong>Hypothèse préliminaire :</strong> {patient.diagnosticPreliminaireChef}</p>}
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              { l:"Téléphone",    v:patient.telephone },
              { l:"Adresse",      v:patient.adresse },
              { l:"Naissance",    v:fmt(patient.dateNaissance) },
              { l:"Motif actuel", v:patient.motif },
            ].map(({l,v})=>(
              <div key={l} style={{ background:C.bg, borderRadius:10, padding:"12px 14px", border:"1px solid "+C.border }}>
                <p style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{l}</p>
                <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{v||"—"}</p>
              </div>
            ))}
          </div>

          {/* Historique — toute la clinique */}
          {visites.length > 0 && (
            <>
              <p style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Historique dans la clinique (tous services)</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                {visites.map((v)=>{
                  const autreService = v.service && v.service !== medecin.specialite
                  return (
                    <div key={v.id} style={{ background:C.bg, borderRadius:10, padding:"12px 16px", border:"1px solid "+C.border, borderLeft:"4px solid "+(autreService?C.slate:C.blue) }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{fmt(v.date)} — {v.motif}</p>
                          <p style={{ fontSize:11, color:C.textMuted }}>{v.service || "—"}{autreService && <span style={{ color:C.slate, fontWeight:700 }}> · autre service</span>}</p>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          {v.typeConsultation && v.typeConsultation !== "standard" && <TypeConsultBadge type={v.typeConsultation} />}
                          <Badge statut={v.signe?"signe":"non_signe"} />
                        </div>
                      </div>
                      {(v.diagnostics||[]).length>0 && <p style={{ fontSize:12, color:C.textSec, marginBottom:2 }}>Diag : {(v.diagnostics||[]).join(", ")}</p>}
                      {(v.traitements||[]).length>0 && <p style={{ fontSize:12, color:C.textSec }}>Traitement : {(v.traitements||[]).join(", ")}</p>}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <Btn onClick={()=>{ onConsulter(patient); onClose() }} variant="success" full>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Démarrer la consultation
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — FORMULAIRE CONSULTATION
// ══════════════════════════════════════════════════════
function ModalConsultation({ patient, medecin, consultation, onClose, onSauvegarder, onSigner }) {
  const mode = patient?.typeConsultation || consultation?.typeConsultation || "standard"
  const specGyn = isGynecoObst(medecin?.specialite)
  const showPrenatal = specGyn && mode === "prenatal"
  const showAcc = specGyn && mode === "accouchement"
  const warnWrongService = !specGyn && mode !== "standard"

  const dp = consultation?.donneesPrenatal || {}
  const da = consultation?.donneesAccouchement || {}

  const [form, setForm] = useState({
    motif:        consultation?.motif        || patient?.motif || "",
    symptomes:    consultation?.symptomes    || "",
    observations: consultation?.observations || "",
    diagnostics:  (consultation?.diagnostics||[]).join(", "),
    pathologies:  (consultation?.pathologies||[]).join(", "),
    examens:      (consultation?.examens||[]).join(", "),
    traitements:  (consultation?.traitements||[]).join(", "),
    commentaires: consultation?.commentaires || "",
  })
  const [prenatal, setPrenatal] = useState(() => mergePrenatalInit(dp))
  const [accouch, setAccouch] = useState(() => mergeAccouchInit(da))
  const STAGIAIRE_VIDE = { nom:"", service:"", participation:0, connaissances:0, comportement:0, commentaire:"" }
  const [stagiaires, setStagiaires] = useState(consultation?.stagiaires || [])
  const addStagiaire = () => setStagiaires(p=>[...p, { ...STAGIAIRE_VIDE, id: Date.now() }])
  const removeStagiaire = id => setStagiaires(p=>p.filter(s=>s.id!==id))
  const updateStagiaire = (id, k, v) => setStagiaires(p=>p.map(s=>s.id===id?{...s,[k]:v}:s))
  const [suggestions, setSuggestions] = useState([])
  const f = (k,v) => setForm(p=>({...p,[k]:v}))
  const fp = (k,v) => setPrenatal(p=>({...p,[k]:v}))
  const fa = (k,v) => setAccouch(p=>({...p,[k]:v}))

  const genSuggestions = (txt) => {
    const mots = txt.toLowerCase().split(/[,\s]+/).filter(Boolean)
    const res = new Set()
    mots.forEach(mot=>{
      Object.entries(SYMPTOMES_DIAGNOSTICS).forEach(([key,diags])=>{
        if (key.toLowerCase().includes(mot)||mot.length>3&&key.toLowerCase().split(" ").some(w=>w.startsWith(mot)))
          diags.forEach(d=>res.add(d))
      })
    })
    setSuggestions(Array.from(res))
  }

  if (!patient) return null

  const ajouterTag = (champ, val) => {
    const curr = form[champ].split(",").map(x=>x.trim()).filter(Boolean)
    if (!curr.includes(val)) f(champ, [...curr, val].join(", "))
  }

  const parseList = str => str.split(",").map(x=>x.trim()).filter(Boolean)

  const valider = (signer) => {
    if (!form.observations.trim()) { alert("Les observations cliniques sont obligatoires."); return }
    if (signer && !form.diagnostics.trim()) { alert("Le diagnostic est obligatoire pour signer."); return }
    if (showPrenatal && !prenatal.ddr.trim() && !prenatal.termeSA.trim()) {
      alert("Pour une CPN, indiquez au minimum la DDR ou le terme (semaines d’aménorrhée)."); return
    }
    if (showAcc && !accouch.dateAcc.trim()) {
      alert("Pour le registre d’accouchement, la date de l’accouchement est obligatoire."); return
    }
    const data = {
      motif:        form.motif,
      symptomes:    form.symptomes,
      observations: form.observations,
      diagnostics:  parseList(form.diagnostics),
      pathologies:  parseList(form.pathologies),
      examens:      parseList(form.examens),
      traitements:  parseList(form.traitements),
      commentaires: form.commentaires,
      typeConsultation: mode,
      stagiaires:   stagiaires.filter(s=>s.nom.trim()),
      ...(showPrenatal && { donneesPrenatal: { ...prenatal, parite: prenatal.gestiteParite, terme: prenatal.termeSA } }),
      ...(showAcc && { donneesAccouchement: { ...accouch } }),
    }
    if (signer) onSigner(data)
    else onSauvegarder(data)
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth: showPrenatal || showAcc ? 960 : 680, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header bleu */}
        <div style={{ padding:"22px 28px 20px", borderBottom:"1px solid "+C.border, background:"linear-gradient(135deg,#1e40af,#2563eb)", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar name={patient.nom} size={46} bg="rgba(255,255,255,0.25)" />
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:3 }}>{patient.nom}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                {patient.pid} · {calcAge(patient.dateNaissance)} ans · {medecin.specialite}
                <TypeConsultBadge type={mode} />
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:8, color:"#fff", cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>

          {warnWrongService && (
            <div style={{ background:C.slateSoft, border:"1px solid "+C.slate+"44", borderRadius:12, padding:"12px 14px" }}>
              <p style={{ fontSize:13, color:"#92400e", fontWeight:600 }}>Ce dossier est typé « {TYPE_CONSULT_LABEL[mode]?.label || mode} ». Vous n’êtes pas en gynécologie — le formulaire spécialisé est masqué ; utilisez la consultation standard.</p>
            </div>
          )}

          {patient.typeVisite === "rendez_vous" && patient.motifRdv && (
            <div style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:12, padding:"12px 14px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.textPri, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Pourquoi ce rendez-vous</p>
              <p style={{ fontSize:14, color:C.textPri, lineHeight:1.45 }}>{patient.motifRdv}</p>
            </div>
          )}

          {(patient.plaintesChef || patient.symptomesChef || patient.diagnosticPreliminaireChef) && (
            <div style={{ background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:12, padding:"12px 14px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.green, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Transmis par le médecin chef (accueil)</p>
              {patient.plaintesChef && <p style={{ fontSize:13, marginBottom:4 }}><strong>Plaintes :</strong> {patient.plaintesChef}</p>}
              {patient.symptomesChef && <p style={{ fontSize:13, marginBottom:4 }}><strong>Symptômes :</strong> {patient.symptomesChef}</p>}
              {patient.antecedentsChef && <p style={{ fontSize:13, marginBottom:4 }}><strong>Antécédents :</strong> {patient.antecedentsChef}</p>}
              {patient.diagnosticPreliminaireChef && <p style={{ fontSize:13 }}><strong>Hypothèse :</strong> {patient.diagnosticPreliminaireChef}</p>}
            </div>
          )}

          {showPrenatal && (
            <div style={{ background:C.bg, border:"1px solid "+C.border, borderRadius:14, padding:"16px 18px" }}>
              <p style={{ fontSize:13, fontWeight:800, color:C.textPri, marginBottom:4 }}>Registre de consultation prénatale (CPN)</p>
              <p style={{ fontSize:11, color:C.textMuted, marginBottom:16 }}>Champs calqués sur le registre papier — saisie par sections.</p>

              <div style={{ background:C.white, border:"1px dashed "+C.border, borderRadius:10, padding:"10px 12px", marginBottom:16, fontSize:12, color:C.textSec }}>
                <strong style={{ color:C.textPri }}>Patient :</strong> {patient.nom} · {patient.pid} · {calcAge(patient.dateNaissance)} ans · {patient.adresse || "—"}
              </div>

              <RegSection title="Suivi de grossesse & rendez-vous">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                  <div><label style={labelSt}>DDR</label><input value={prenatal.ddr} onChange={e=>fp("ddr",e.target.value)} type="date" style={inputSt} /></div>
                  <div><label style={labelSt}>Âge de la grossesse (terme)</label><input value={prenatal.termeSA} onChange={e=>fp("termeSA",e.target.value)} placeholder="ex. 36 sa" style={inputSt} /></div>
                  <div><label style={labelSt}>Gestité / parité (G / P)</label><input value={prenatal.gestiteParite} onChange={e=>fp("gestiteParite",e.target.value)} placeholder="G2P1" style={inputSt} /></div>
                  <div><label style={labelSt}>Date du RDV</label><input value={prenatal.dateRdv} onChange={e=>fp("dateRdv",e.target.value)} type="date" style={inputSt} /></div>
                  <div><label style={labelSt}>Visite CPN (n°)</label>
                    <select value={prenatal.visiteCpn} onChange={e=>fp("visiteCpn",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="1">1re visite</option>
                      <option value="2">2e visite</option>
                      <option value="3">3e visite</option>
                      <option value="4+">4e et +</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Risque</label>
                    <select value={prenatal.risque} onChange={e=>fp("risque",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="non">Non signalé</option>
                      <option value="oui">Grossesse à risque</option>
                    </select>
                  </div>
                </div>
              </RegSection>

              <RegSection title="Taille & signes vitaux (P, TA, HU)">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
                  <div><label style={labelSt}>Taille (cm)</label><input value={prenatal.tailleCm} onChange={e=>fp("tailleCm",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>P — Poids (kg)</label><input value={prenatal.poids} onChange={e=>fp("poids",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>TA</label><input value={prenatal.ta} onChange={e=>fp("ta",e.target.value)} placeholder="12/8" style={inputSt} /></div>
                  <div><label style={labelSt}>HU (cm)</label><input value={prenatal.hu} onChange={e=>fp("hu",e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Foetus — BCF, MAF, présentation">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                  <div><label style={labelSt}>BDCF / BCF (bpm)</label><input value={prenatal.bcf} onChange={e=>fp("bcf",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>MAF (mouvements actifs fœtaux)</label><input value={prenatal.maf} onChange={e=>fp("maf",e.target.value)} placeholder="Normaux / diminués…" style={inputSt} /></div>
                  <div><label style={labelSt}>Présentation</label><input value={prenatal.presentation} onChange={e=>fp("presentation",e.target.value)} placeholder="Céphalique…" style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Bandelette — albumine / sucre">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={labelSt}>Albumine</label><input value={prenatal.albumine} onChange={e=>fp("albumine",e.target.value)} placeholder="Négatif / +…" style={inputSt} /></div>
                  <div><label style={labelSt}>Sucre</label><input value={prenatal.sucre} onChange={e=>fp("sucre",e.target.value)} placeholder="Négatif / +…" style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Vaccination (VAT) & suppléments — Fer / acide folique — TPI — MII / MILD">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                  <div><label style={labelSt}>VAT (doses / statut)</label><input value={prenatal.vat} onChange={e=>fp("vat",e.target.value)} placeholder="ex. VAT3" style={inputSt} /></div>
                  <div><label style={labelSt}>Fer</label><input value={prenatal.fer} onChange={e=>fp("fer",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Acide folique</label><input value={prenatal.acideFolique} onChange={e=>fp("acideFolique",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>TPI (paludisme)</label><input value={prenatal.tpi} onChange={e=>fp("tpi",e.target.value)} placeholder="C1, C2, C3…" style={inputSt} /></div>
                  <div><label style={labelSt}>MII / MILD (moustiquaire)</label>
                    <select value={prenatal.miiMild} onChange={e=>fp("miiMild",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                </div>
              </RegSection>

              <RegSection title="PTME (prévention transmission mère-enfant)">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                  <div><label style={labelSt}>Conseil</label><input value={prenatal.ptmeConseil} onChange={e=>fp("ptmeConseil",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Test</label><input value={prenatal.ptmeTest} onChange={e=>fp("ptmeTest",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Résultat</label><input value={prenatal.ptmeResultat} onChange={e=>fp("ptmeResultat",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>ARV</label><input value={prenatal.ptmeArv} onChange={e=>fp("ptmeArv",e.target.value)} style={inputSt} /></div>
                  <div style={{ gridColumn:"1 / -1" }}><label style={labelSt}>Partenaire</label><input value={prenatal.ptmePartenaire} onChange={e=>fp("ptmePartenaire",e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Constats / problèmes & notes CPN">
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div><label style={labelSt}>Constats / problèmes</label><textarea value={prenatal.constatsProblemes} onChange={e=>fp("constatsProblemes",e.target.value)} rows={2} style={inputSt} /></div>
                  <div><label style={labelSt}>Observations & notes (suivi prochain RDV, écho…)</label><textarea value={prenatal.notesCpn} onChange={e=>fp("notesCpn",e.target.value)} rows={2} style={inputSt} /></div>
                </div>
              </RegSection>
            </div>
          )}

          {showAcc && (
            <div style={{ background:C.bg, border:"1px solid "+C.border, borderRadius:14, padding:"16px 18px" }}>
              <p style={{ fontSize:13, fontWeight:800, color:C.textPri, marginBottom:4 }}>Registre de l’accouchement (CS)</p>
              <p style={{ fontSize:11, color:C.textMuted, marginBottom:16 }}>Aligné sur le registre papier — sections détaillées.</p>

              <RegSection title="Accouchement & séjour">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                  <div><label style={labelSt}>Date d’accouchement <span style={{ color:C.red }}>*</span></label><input value={accouch.dateAcc} onChange={e=>fa("dateAcc",e.target.value)} type="date" style={inputSt} /></div>
                  <div><label style={labelSt}>Heure</label><input value={accouch.heureAcc} onChange={e=>fa("heureAcc",e.target.value)} type="time" style={inputSt} /></div>
                  <div><label style={labelSt}>Date de sortie</label><input value={accouch.dateSortie} onChange={e=>fa("dateSortie",e.target.value)} type="date" style={inputSt} /></div>
                  <div><label style={labelSt}>Journées d’hospitalisation</label><input value={accouch.joursHospitalisation} onChange={e=>fa("joursHospitalisation",e.target.value)} placeholder="ex. 2" style={inputSt} /></div>
                  <div style={{ gridColumn:"1 / -1" }}><label style={labelSt}>Quantité de sang perdu (ml)</label><input value={accouch.sangPerduMl} onChange={e=>fa("sangPerduMl",e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Antécédents — derniers nés & VAT mère">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={labelSt}>Dernier né vivant</label><input value={accouch.dernierNeVivant} onChange={e=>fa("dernierNeVivant",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Avant-dernier né vivant</label><input value={accouch.avantDernierNeVivant} onChange={e=>fa("avantDernierNeVivant",e.target.value)} style={inputSt} /></div>
                  <div style={{ gridColumn:"1 / -1" }}><label style={labelSt}>Vaccination mère (VAT)</label><input value={accouch.vatMere} onChange={e=>fa("vatMere",e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Voie d’accouchement & nouveau-né">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                  <div style={{ gridColumn:"1 / -1" }}><label style={labelSt}>Voie</label>
                    <select value={accouch.voie} onChange={e=>fa("voie",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="basse">Voie basse</option>
                      <option value="cesarienne">Césarienne</option>
                      <option value="instrumentale">Instrumentale</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Sexe</label>
                    <select value={accouch.sexeNN} onChange={e=>fa("sexeNN",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="F">F</option>
                      <option value="M">M</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Poids (g)</label><input value={accouch.poidsNN} onChange={e=>fa("poidsNN",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Taille (cm)</label><input value={accouch.tailleNN} onChange={e=>fa("tailleNN",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>PC (cm)</label><input value={accouch.pc} onChange={e=>fa("pc",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>APGAR 1 min</label><input value={accouch.apgar1} onChange={e=>fa("apgar1",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>APGAR 5 min</label><input value={accouch.apgar5} onChange={e=>fa("apgar5",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>APGAR 10 min</label><input value={accouch.apgar10} onChange={e=>fa("apgar10",e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Soins immédiats — cordon, sein, yeux, Vit K1, vaccins">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                  <div><label style={labelSt}>Mode de sortie NN</label>
                    <select value={accouch.modeSortie} onChange={e=>fa("modeSortie",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="vivant">Vivant</option>
                      <option value="decede">Décédé</option>
                      <option value="transfere">Transféré</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Soin du cordon</label><input value={accouch.soinCordon} onChange={e=>fa("soinCordon",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Mise au sein dans l’heure</label>
                    <select value={accouch.miseAuSein1h} onChange={e=>fa("miseAuSein1h",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Soin des yeux (ex. tétracycline)</label><input value={accouch.soinYeux} onChange={e=>fa("soinYeux",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Vitamine K1</label>
                    <select value={accouch.vitamineK1} onChange={e=>fa("vitamineK1",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>VPO 0</label>
                    <select value={accouch.vpo0} onChange={e=>fa("vpo0",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>BCG</label>
                    <select value={accouch.bcg} onChange={e=>fa("bcg",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                </div>
              </RegSection>

              <RegSection title="État à la sortie — partogramme — personnel">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={labelSt}>État à la sortie (mère)</label><input value={accouch.etatSortieMere} onChange={e=>fa("etatSortieMere",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>État à la sortie (enfant)</label><input value={accouch.etatSortieEnfant} onChange={e=>fa("etatSortieEnfant",e.target.value)} style={inputSt} /></div>
                  <div><label style={labelSt}>Partogramme</label>
                    <select value={accouch.partogramme} onChange={e=>fa("partogramme",e.target.value)} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">—</option>
                      <option value="oui">Rempli</option>
                      <option value="non">Non</option>
                    </select>
                  </div>
                  <div><label style={labelSt}>Personnel qualifié (nom / signature)</label><input value={accouch.personnelQualifie} onChange={e=>fa("personnelQualifie",e.target.value)} style={inputSt} /></div>
                </div>
              </RegSection>

              <RegSection title="Complications & observations">
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div><label style={labelSt}>Complications (mère / enfant)</label><textarea value={accouch.complicationsMere} onChange={e=>fa("complicationsMere",e.target.value)} rows={2} style={inputSt} /></div>
                  <div><label style={labelSt}>Observations</label><textarea value={accouch.notes} onChange={e=>fa("notes",e.target.value)} rows={2} style={inputSt} /></div>
                </div>
              </RegSection>
            </div>
          )}

          {/* Motif */}
          <div>
            <label style={labelSt}>Motif de consultation</label>
            <input value={form.motif} onChange={e=>f("motif",e.target.value)} placeholder="Ex : Douleur thoracique, suivi…"
              style={{ ...inputSt, resize:"none" }}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
          </div>

          {/* Observations */}
          <div>
            <label style={labelSt}>Observations cliniques <span style={{ color:C.red }}>*</span></label>
            <textarea value={form.observations} onChange={e=>f("observations",e.target.value)}
              placeholder="TA, pouls, température, auscultation, examen physique…" rows={3} style={inputSt}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
          </div>

          {/* Symptômes + suggestions auto */}
          <div>
            <label style={labelSt}>Symptômes du patient</label>
            <textarea value={form.symptomes} onChange={e=>{ f("symptomes",e.target.value); genSuggestions(e.target.value) }}
              placeholder="Ex : fièvre, toux, douleur thoracique… (les suggestions apparaissent automatiquement)" rows={2} style={inputSt}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
            {suggestions.length > 0 && (
              <div style={{ marginTop:8, padding:"10px 14px", background:C.blueSoft, borderRadius:10, border:"1px solid "+C.blue+"33" }}>
                <p style={{ fontSize:12, fontWeight:700, color:C.textPri, marginBottom:8 }}>Suggestions de diagnostic basées sur les symptômes :</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {suggestions.map(s=>(
                    <button key={s} type="button" onClick={()=>ajouterTag("diagnostics",s)}
                      style={{ padding:"3px 10px", background:C.white, color:C.blue, border:"1px solid "+C.blue+"44", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic & Pathologies */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={labelSt}>Diagnostic(s) <span style={{ color:C.red }}>*</span></label>
              <input value={form.diagnostics} onChange={e=>f("diagnostics",e.target.value)} placeholder="Séparer par des virgules"
                style={{ ...inputSt, resize:"none" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
            <div>
              <label style={labelSt}>Pathologies associées</label>
              <input value={form.pathologies} onChange={e=>f("pathologies",e.target.value)} placeholder="Séparer par des virgules"
                style={{ ...inputSt, resize:"none" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
              <div style={{ marginTop:6, display:"flex", flexWrap:"wrap", gap:4 }}>
                {PATHOLOGIES_COMMUNES.slice(0,7).map(p=>(
                  <button key={p} type="button" onClick={()=>ajouterTag("pathologies",p)}
                    style={{ padding:"2px 8px", background:C.slateSoft, color:C.textSec, border:"1px solid "+C.border, borderRadius:12, fontSize:11, cursor:"pointer", fontWeight:500 }}>
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Examens & Traitements */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={labelSt}>Examens demandés</label>
              <input value={form.examens} onChange={e=>f("examens",e.target.value)} placeholder="Ex : ECG, NFS, Radiographie…"
                style={{ ...inputSt, resize:"none" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
              <div style={{ marginTop:6, display:"flex", flexWrap:"wrap", gap:4 }}>
                {EXAMENS_RAPIDES.map(ex=>(
                  <button key={ex} type="button" onClick={()=>ajouterTag("examens",ex)}
                    style={{ padding:"2px 8px", background:C.slateSoft, color:C.textSec, border:"1px solid "+C.border, borderRadius:12, fontSize:11, cursor:"pointer", fontWeight:500 }}>
                    + {ex}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelSt}>Traitements prescrits</label>
              <input value={form.traitements} onChange={e=>f("traitements",e.target.value)} placeholder="Ex : Paracétamol 500mg 3x/j…"
                style={{ ...inputSt, resize:"none" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <label style={labelSt}>Commentaires / Suivi</label>
            <textarea value={form.commentaires} onChange={e=>f("commentaires",e.target.value)}
              placeholder="Notes supplémentaires, date du prochain suivi…" rows={2} style={inputSt}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
          </div>

          {/* ── Évaluation des Stagiaires ── */}
          <div style={{ border:"1px solid "+C.border, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", background:C.greenSoft, borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>Stagiaires présents</p>
                  <p style={{ fontSize:11, color:C.textSec }}>{stagiaires.length === 0 ? "Aucun stagiaire · cliquez pour en ajouter" : `${stagiaires.length} stagiaire${stagiaires.length>1?"s":""} enregistré${stagiaires.length>1?"s":""}`}</p>
                </div>
              </div>
              <button onClick={addStagiaire}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:C.green, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Ajouter
              </button>
            </div>

            {stagiaires.length > 0 && (
              <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:14 }}>
                {stagiaires.map((st, idx) => (
                  <div key={st.id} style={{ border:"1px solid "+C.border, borderRadius:10, overflow:"hidden" }}>
                    {/* En-tête du stagiaire */}
                    <div style={{ padding:"10px 14px", background:"#f9fafb", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:C.green+"22", display:"flex", alignItems:"center", justifyContent:"center", color:C.green, fontSize:12, fontWeight:800, flexShrink:0 }}>{idx+1}</div>
                      <input value={st.nom} onChange={e=>updateStagiaire(st.id,"nom",e.target.value)}
                        placeholder="Nom du stagiaire"
                        style={{ ...inputSt, flex:1, marginBottom:0, padding:"6px 10px" }}
                        onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                      <input value={st.service} onChange={e=>updateStagiaire(st.id,"service",e.target.value)}
                        placeholder="Service / Spécialité"
                        style={{ ...inputSt, flex:1, marginBottom:0, padding:"6px 10px" }}
                        onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                      <button onClick={()=>removeStagiaire(st.id)}
                        style={{ width:28, height:28, borderRadius:6, border:"1px solid "+C.red+"44", background:C.redSoft, color:C.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    {/* Critères d'évaluation */}
                    <div style={{ padding:"12px 14px" }}>
                      {[
                        { key:"participation",  label:"Participation active",       desc:"S'implique, pose des questions, propose des hypothèses" },
                        { key:"connaissances",  label:"Connaissances cliniques",    desc:"Maîtrise les bases théoriques liées au cas traité" },
                        { key:"comportement",   label:"Comportement professionnel", desc:"Tenue, respect du patient, attitude en salle" },
                      ].map(({ key, label, desc }) => (
                        <div key={key} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:12, fontWeight:600, color:C.textPri, marginBottom:1 }}>{label}</p>
                            <p style={{ fontSize:11, color:C.textMuted }}>{desc}</p>
                          </div>
                          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                            {[1,2,3,4,5].map(n=>(
                              <button key={n} type="button" onClick={()=>updateStagiaire(st.id, key, n)}
                                style={{ width:28, height:28, borderRadius:6, border:"none", cursor:"pointer", fontSize:16, lineHeight:1,
                                  background: n<=st[key] ? C.green : "#e5e7eb",
                                  color: n<=st[key] ? "#fff" : "#9ca3af",
                                  fontWeight:700, transition:"all .15s" }}>
                                ★
                              </button>
                            ))}
                            <span style={{ fontSize:11, color:C.textMuted, width:30, textAlign:"center", lineHeight:"28px", flexShrink:0 }}>{st[key]>0?st[key]+"/5":"—"}</span>
                          </div>
                        </div>
                      ))}

                      {/* Commentaire */}
                      <div style={{ marginTop:8 }}>
                        <label style={{ ...labelSt, marginBottom:4 }}>Commentaire libre <span style={{ fontWeight:400, color:C.textMuted }}>(facultatif)</span></label>
                        <textarea value={st.commentaire} onChange={e=>updateStagiaire(st.id,"commentaire",e.target.value)}
                          placeholder="Observations particulières sur ce stagiaire…" rows={2}
                          style={{ ...inputSt, resize:"vertical" }}
                          onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                      </div>

                      {/* Score moyen */}
                      {(st.participation+st.connaissances+st.comportement)>0 && (
                        <div style={{ marginTop:10, padding:"8px 12px", background:C.greenSoft, borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          <p style={{ fontSize:12, color:C.green, fontWeight:600 }}>
                            Score moyen : {((st.participation+st.connaissances+st.comportement)/[st.participation,st.connaissances,st.comportement].filter(n=>n>0).length).toFixed(1)} / 5
                            {" · "}
                            {(st.participation+st.connaissances+st.comportement)/[st.participation,st.connaissances,st.comportement].filter(n=>n>0).length >= 4 ? "Excellent" :
                             (st.participation+st.connaissances+st.comportement)/[st.participation,st.connaissances,st.comportement].filter(n=>n>0).length >= 3 ? "Satisfaisant" :
                             (st.participation+st.connaissances+st.comportement)/[st.participation,st.connaissances,st.comportement].filter(n=>n>0).length >= 2 ? "À améliorer" : "Insuffisant"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avertissement signature */}
          <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:12, color:C.red, fontWeight:600 }}>
              La signature est <strong>obligatoire et définitive</strong>. Une consultation non signée est une anomalie détectée dans le système d'audit.
            </p>
          </div>

          {/* Boutons */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <Btn onClick={()=>{
              const date = new Date().toLocaleDateString("fr-FR")
              const traitement = form.traitements||"—"
              const diagnostic = form.diagnostics||"—"
              const w = window.open("","_blank","width=700,height=900")
              w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ordonnance</title><style>
                body{font-family:'Segoe UI',sans-serif;margin:0;padding:32px;color:#000}
                .header{text-align:center;border-bottom:2px solid #2d7a3f;padding-bottom:16px;margin-bottom:24px}
                .title{font-size:22px;font-weight:800;color:#2d7a3f;margin:0}
                .sub{font-size:13px;color:#444;margin:4px 0}
                .section{margin-bottom:18px}
                .label{font-size:11px;font-weight:700;text-transform:uppercase;color:#666;letter-spacing:.05em;margin-bottom:4px}
                .value{font-size:14px;padding:8px 12px;background:#f5faf5;border-radius:6px;border:1px solid #dde8dd}
                .footer{margin-top:40px;display:flex;justify-content:space-between;font-size:12px;color:#666}
                .sign-box{text-align:center;border-top:1px solid #000;padding-top:8px;width:200px;font-size:12px}
                @media print{body{padding:20px}}
              </style></head><body>
              <div class="header">
                <div class="title">Clinique Médicale ABC Marouane</div>
                <div class="sub">Conakry, République de Guinée · +224 624 00 00 00</div>
                <div class="sub" style="font-size:16px;font-weight:700;margin-top:8px">ORDONNANCE MÉDICALE</div>
              </div>
              <div class="section"><div class="label">Date</div><div class="value">${date}</div></div>
              <div class="section"><div class="label">Patient</div><div class="value">${patient?.nom||"—"} · ${patient?.sexe==="F"?"Mme":"M."}</div></div>
              <div class="section"><div class="label">Médecin prescripteur</div><div class="value">${medecin?.nom||"—"} — ${medecin?.specialite||"—"}</div></div>
              <div class="section"><div class="label">Diagnostic</div><div class="value">${diagnostic}</div></div>
              <div class="section"><div class="label">Prescriptions</div><div class="value" style="white-space:pre-wrap">${traitement.split(",").map((t,i)=>`${i+1}. ${t.trim()}`).join("\n")}</div></div>
              ${form.commentaires?`<div class="section"><div class="label">Commentaires</div><div class="value">${form.commentaires}</div></div>`:""}
              <div class="footer">
                <div>Valable 3 mois à compter du ${date}</div>
                <div class="sign-box">Signature &amp; Cachet du médecin</div>
              </div></body></html>`)
              w.document.close(); setTimeout(()=>w.print(),400)
            }} variant="secondary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Imprimer ordonnance
            </Btn>
            <div style={{ display:"flex", gap:10 }}>
              <Btn onClick={onClose} variant="secondary">Annuler</Btn>
              <Btn onClick={()=>valider(false)} variant="secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Sauvegarder
              </Btn>
              <Btn onClick={()=>valider(true)} variant="success">
                Signer &amp; Valider
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL — DASHBOARD MÉDECIN
// ══════════════════════════════════════════════════════
export default function DashboardMedecin() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { patients: sharedPatients, consultations: sharedConsultations, updateConsultation, addConsultation, file, updateFileEntry } = useSharedData()

  const medecin = { id: user?.id || 2, nom: user?.nom || "Dr. Keïta", specialite: user?.specialite || "Médecine générale" }

  const [onglet, setOnglet]               = useState("accueil")
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const patients      = sharedPatients.length > 0 ? sharedPatients : PATIENTS_INIT
  const consultations = sharedConsultations
  const [heure, setHeure]                 = useState("")
  const [dateStr, setDateStr]             = useState("")
  const [recherche, setRecherche]         = useState("")
  const [mFiche,   setMFiche]             = useState(null)
  const [mConsult, setMConsult]           = useState(null)

  useEffect(()=>{
    const tick=()=>{
      const n=new Date()
      setHeure(n.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
      setDateStr(n.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))
    }
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  // Filtrer par médecin connecté
  const mesPatients     = patients.filter(p=>p.docteurId===medecin.id)
  const mesConsultations= consultations.filter(c=>c.docteurId===medecin.id)
  const enAttente       = mesPatients.filter(p=>p.statut==="en_attente").length
  const nonSignees      = mesConsultations.filter(c=>!c.signe).length

  const patientsFiltres = mesPatients.filter(p=>{
    const q=recherche.toLowerCase()
    return !q||p.nom.toLowerCase().includes(q)||p.pid.toLowerCase().includes(q)||p.motif.toLowerCase().includes(q)
      ||(p.motifRdv||"").toLowerCase().includes(q)||(TYPE_CONSULT_LABEL[p.typeConsultation]?.label||"").toLowerCase().includes(q)
  })

  const ouvrirConsultation = (patient) => {
    const existing = consultations.find(c=>c.patientId===patient.id&&c.date===today()&&c.docteurId===medecin.id)
    setMConsult({ patient, consultation:existing||null })
  }

  const handleSauvegarder = (data) => {
    const patientId = mConsult.patient.id
    const existing  = consultations.find(c=>c.patientId===patientId&&c.date===today()&&c.docteurId===medecin.id)
    if (existing) {
      updateConsultation(existing.id, data)
    } else {
      addConsultation({ patientId, date:today(), service:medecin.specialite, docteurId:medecin.id, signe:false, signeLe:null, ...data })
    }
    setMConsult(null)
    alert("Consultation sauvegardée.")
  }

  const handleSigner = (data) => {
    const patientId = mConsult.patient.id
    const ts        = new Date().toLocaleString("fr-FR")
    const existing  = consultations.find(c=>c.patientId===patientId&&c.date===today()&&c.docteurId===medecin.id)
    if (existing) {
      updateConsultation(existing.id, { ...data, signe:true, signeLe:ts })
    } else {
      addConsultation({ patientId, date:today(), service:medecin.specialite, docteurId:medecin.id, signe:true, signeLe:ts, ...data })
    }
    const fileEntry = file.find(f=>f.patientId===patientId)
    if (fileEntry) updateFileEntry(fileEntry.id, { statut:"termine" })
    setMConsult(null)
    alert("Consultation signée et validée.")
  }

  const NAV = [
    { id:"accueil",       label:"Accueil",         icon:"home", desc:"Vue d'ensemble",      badge:0          },
    { id:"patients",      label:"Mes patients",     icon:"users", desc:"Liste du jour",       badge:enAttente  },
    { id:"consultations", label:"Mes consultations",icon:"doc", desc:"Historique & signature", badge:nonSignees },
  ]

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      {/* MODALS */}
      {mFiche && (
        <ModalFichePatient
          patient={mFiche}
          consultations={consultations}
          medecin={medecin}
          onClose={()=>setMFiche(null)}
          onConsulter={p=>{ ouvrirConsultation(p) }}
        />
      )}
      {mConsult && (
        <ModalConsultation
          key={mConsult.patient.id + "-" + (mConsult.consultation?.id || "nouveau")}
          patient={mConsult.patient}
          medecin={medecin}
          consultation={mConsult.consultation}
          onClose={()=>setMConsult(null)}
          onSauvegarder={handleSauvegarder}
          onSigner={handleSigner}
        />
      )}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:270, background:C.white, boxShadow:"4px 0 24px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

            {/* Logo */}
            <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12 }}>
              <img src={logo} alt="" style={{height:44, borderRadius:8, objectFit:"cover", border:"1px solid "+C.border }} />
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.textPri, lineHeight:1.2 }}>Clinique Marouane</p>
                <p style={{ fontSize:12, color:C.textSec }}>Espace médecin</p>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ padding:"14px 12px", flex:1 }}>
              <p style={{ fontSize:10, color:C.textMuted, letterSpacing:"0.12em", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>Menu principal</p>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setOnglet(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:12, border:"none", background:onglet===n.id?C.blueSoft:"transparent", color:onglet===n.id?C.blue:C.textSec, fontSize:14, fontWeight:onglet===n.id?700:500, cursor:"pointer", textAlign:"left", marginBottom:3, transition:"all .15s", boxShadow:onglet===n.id?"inset 3px 0 0 "+C.blue:"none", position:"relative" }}
                  onMouseEnter={e=>{ if(onglet!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(onglet!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ fontSize:18 }}>{n.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, lineHeight:1.2 }}>{n.label}</p>
                    <p style={{ fontSize:10, color:C.textMuted, lineHeight:1.2, marginTop:1 }}>{n.desc}</p>
                  </div>
                  {n.badge>0 && <span style={{ background:C.red, color:"#fff", fontSize:11, fontWeight:700, borderRadius:10, padding:"2px 7px" }}>{n.badge}</span>}
                </button>
              ))}
            </nav>

            {/* Profil */}
            <div style={{ padding:"14px 16px 20px", borderTop:"1px solid "+C.border }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.blueSoft, borderRadius:12, border:"1px solid "+C.blue+"33" }}>
                <Avatar name={medecin.nom} size={36} bg={C.blue} />
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>{medecin.nom}</p>
                  <p style={{ fontSize:11, color:C.textPri, fontWeight:600, marginTop:1 }}>{medecin.specialite}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* Hamburger */}
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40, height:40, borderRadius:8, border:"1px solid "+C.border, background:C.white, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
        </button>

        {/* Titre */}
        <div style={{ flex:1, marginLeft:20 }}>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>
            {onglet==="accueil"       && "Accueil"}
            {onglet==="patients"      && "Mes patients du jour"}
            {onglet==="consultations" && "Mes consultations"}
          </p>
          <p style={{ fontSize:12, color:C.textMuted, textTransform:"capitalize" }}>{dateStr}</p>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {/* Alerte non signées */}
          {nonSignees>0 && (
            <button onClick={()=>setOnglet("consultations")} style={{ background:C.redSoft, border:"1px solid "+C.red+"44", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:700, color:C.red, cursor:"pointer", fontFamily:"inherit" }}>
              {nonSignees} à signer
            </button>
          )}
          {/* Horloge */}
          <div style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:10, padding:"8px 16px", fontSize:14, fontWeight:700, color:C.blue, fontVariantNumeric:"tabular-nums", minWidth:112, textAlign:"center" }}>{heure}</div>
          {/* Profil */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>{medecin.nom}</p>
              <p style={{ fontSize:11, color:C.textSec }}>{medecin.specialite}</p>
            </div>
            <Avatar name={medecin.nom} size={36} bg={C.blue} />
          </div>
          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width:36,height:36,borderRadius:8,border:"1px solid #fca5a5",background:"#fff5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {/* CONTENU */}
      <main style={{ padding:"28px 28px" }}>

        {/* ══ ACCUEIL ══ */}
        {onglet==="accueil" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                { val:mesPatients.length,                         label:"Patients assignés",    bg:C.blueSoft,  fg:C.blue,  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                { val:enAttente,                                  label:"En attente",           bg:C.slateSoft, fg:C.slate, icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                { val:mesConsultations.filter(c=>c.signe).length, label:"Consultations signées", bg:C.greenSoft, fg:C.green, icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg> },
              ].map(({val,label,bg,fg,icon})=>(
                <Card key={label} style={{ padding:"22px 20px" }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, color:fg }}>{icon}</div>
                  <p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-1px", lineHeight:1 }}>{val}</p>
                  <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>{label}</p>
                </Card>
              ))}
            </div>

            {/* Alerte consultations non signées */}
            {nonSignees>0 && (
              <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:14, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setOnglet("consultations")}>
                <div style={{ width:40,height:40,borderRadius:10,background:C.red+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.red }}>
                    {nonSignees} consultation{nonSignees>1?"s":""} non signée{nonSignees>1?"s":""} — signature requise
                  </p>
                  <p style={{ fontSize:12, color:"#991b1b" }}>Cliquez pour accéder et signer</p>
                </div>
                <span style={{ color:C.red, fontSize:20, fontWeight:700 }}>→</span>
              </div>
            )}

            {/* Liste patients du jour */}
            <Card>
              <CardHeader
                title="Mes patients du jour"
                sub={medecin.specialite+" · "+mesPatients.length+" patient"+(mesPatients.length>1?"s":"")}
                action={<button onClick={()=>setOnglet("patients")} style={{ background:"none", border:"none", color:C.blue, fontSize:13, cursor:"pointer", fontWeight:600 }}>Tout voir →</button>}
              />
              {mesPatients.length===0
                ? <p style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun patient assigné aujourd'hui</p>
                : mesPatients.slice(0,5).map((p,i)=>(
                  <div key={p.id} style={{ padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:i<Math.min(mesPatients.length,5)-1?"1px solid "+C.border:"none", cursor:"pointer", transition:"background .15s" }}
                    onClick={()=>setMFiche(p)}
                    onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Avatar name={p.nom} size={36} />
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                        <p style={{ fontSize:11, color:C.textSec, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          <RdvBadge patient={p} />
                          {(p.typeConsultation && p.typeConsultation !== "standard") && <TypeConsultBadge type={p.typeConsultation} />}
                          <span>{p.motif} · Arrivé à {p.arrivee}</span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Badge statut={p.statut} />
                      <Btn onClick={e=>{ e.stopPropagation(); ouvrirConsultation(p) }} small variant="success">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        Consulter
                      </Btn>
                    </div>
                  </div>
                ))
              }
            </Card>
          </div>
        )}

        {/* ══ MES PATIENTS ══ */}
        {onglet==="patients" && (
          <Card>
            <CardHeader
              title={"Mes patients — "+mesPatients.length+" assigné"+(mesPatients.length>1?"s":"")}
              sub={medecin.specialite}
              action={
                <div style={{ position:"relative" }}>
                  <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input placeholder="Nom, ID, motif…" value={recherche} onChange={e=>setRecherche(e.target.value)}
                    style={{ padding:"8px 12px 8px 32px", fontSize:13, border:"1.5px solid "+C.border, borderRadius:10, background:C.bg, color:C.textPri, outline:"none", fontFamily:"inherit", width:200 }}
                    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                </div>
              }
            />
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:C.slateSoft }}>
                  {["Patient","Motif / file","Arrivée","Statut","Actions"].map(h=>(
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patientsFiltres.length===0
                  ? <tr><td colSpan={5} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun patient trouvé</td></tr>
                  : patientsFiltres.sort((a)=>a.statut==="en_attente"?-1:1).map((p,i,arr)=>(
                    <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Avatar name={p.nom} size={32} />
                          <div>
                            <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                            <p style={{ fontSize:11, color:C.textMuted }}>{p.pid} · {calcAge(p.dateNaissance)} ans</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:C.textSec }}>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          <span>{p.motif}</span>
                          <span style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                            <RdvBadge patient={p} />
                            {(p.typeConsultation && p.typeConsultation !== "standard") && <TypeConsultBadge type={p.typeConsultation} />}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:C.textPri, fontVariantNumeric:"tabular-nums" }}>{p.arrivee}</td>
                      <td style={{ padding:"13px 16px" }}><Badge statut={p.statut} /></td>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>setMFiche(p)} style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:8, color:C.blue, fontSize:12, fontWeight:600, cursor:"pointer", padding:"6px 12px", fontFamily:"inherit" }}
                            onMouseEnter={e=>{ e.currentTarget.style.background=C.blue; e.currentTarget.style.color="#fff" }}
                            onMouseLeave={e=>{ e.currentTarget.style.background=C.blueSoft; e.currentTarget.style.color=C.blue }}>
                            Voir fiche
                          </button>
                          {p.statut!=="termine" && (
                            <Btn onClick={()=>ouvrirConsultation(p)} small variant="success">Consulter</Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </Card>
        )}

        {/* ══ MES CONSULTATIONS ══ */}
        {onglet==="consultations" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {nonSignees>0 && (
              <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:12, padding:"14px 20px" }}>
                <p style={{ fontSize:14, fontWeight:700, color:C.red, marginBottom:2 }}>
                  {nonSignees} consultation{nonSignees>1?"s":""} non signée{nonSignees>1?"s":""} — action requise
                </p>
                <p style={{ fontSize:13, color:"#991b1b" }}>Signez chaque consultation pour valider votre travail.</p>
              </div>
            )}
            <Card>
              <CardHeader title={"Mes consultations — "+mesConsultations.length+" au total"} />
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.slateSoft }}>
                    {["Patient","Date","Type","Motif","Diagnostic","Traitement","Signature","Action"].map(h=>(
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mesConsultations.length===0
                    ? <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucune consultation enregistrée</td></tr>
                    : [...mesConsultations].sort((a,b)=>b.date.localeCompare(a.date)).map((c,i,arr)=>{
                        const p = patients.find(pt=>pt.id===c.patientId)
                        if (!p) return null
                        return (
                          <tr key={c.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", background:!c.signe?"#fff8f8":"transparent", transition:"background .15s" }}
                            onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                            onMouseLeave={e=>e.currentTarget.style.background=!c.signe?"#fff8f8":"transparent"}>
                            <td style={{ padding:"13px 16px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <Avatar name={p.nom} size={28} />
                                <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                              </div>
                            </td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{fmt(c.date)}</td>
                            <td style={{ padding:"13px 16px" }}>{c.typeConsultation && c.typeConsultation !== "standard"
                              ? <TypeConsultBadge type={c.typeConsultation} />
                              : <span style={{ fontSize:12, color:C.textMuted }}>Standard</span>}
                            </td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{c.motif||"—"}</td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textPri }}>{c.diagnostics?.join(", ")||"—"}</td>
                            <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{c.traitements?.join(", ")||"—"}</td>
                            <td style={{ padding:"13px 16px" }}>
                              {c.signe
                                ? <div>
                                    <Badge statut="signe" />
                                    <p style={{ fontSize:10, color:C.textMuted, marginTop:3 }}>{c.signeLe}</p>
                                  </div>
                                : <Badge statut="non_signe" />
                              }
                            </td>
                            <td style={{ padding:"13px 16px" }}>
                              {!c.signe && (
                                <Btn onClick={()=>setMConsult({patient:p,consultation:c})} small variant="success">
                                  Signer
                                </Btn>
                              )}
                            </td>
                          </tr>
                        )
                      })
                  }
                </tbody>
              </table>
            </Card>
          </div>
        )}

      </main>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder,textarea::placeholder{color:#94a3b8}
        select option{background:#fff;color:#0f172a}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        button:focus{outline:none}
      `}</style>
    </div>
  )
}