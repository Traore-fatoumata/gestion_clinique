import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
const today   = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })
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

// Patients assignés à ce médecin (docteurId:2 = Dr. Camara)
const PATIENTS_INIT = [
  { id:1, pid:"CAB-A1B2C3", nom:"Bah Mariama",     dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", adresse:"Ratoma",  motif:"Consultation générale", statut:"en_attente", arrivee:"08:15", docteurId:2 },
  { id:2, pid:"CAB-D4E5F6", nom:"Diallo Ibrahima", dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", adresse:"Kaloum",  motif:"Suivi cardiologie",     statut:"en_attente", arrivee:"08:45", docteurId:2 },
  { id:3, pid:"CAB-G7H8I9", nom:"Sow Fatoumata",   dateNaissance:"1996-11-20", sexe:"F", telephone:"+224 621 77 88 99", adresse:"Dixinn",  motif:"Douleur thoracique",    statut:"en_salle",   arrivee:"09:00", docteurId:2 },
  { id:4, pid:"CAB-J1K2L3", nom:"Kouyaté Mamadou", dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", adresse:"Matam",   motif:"Palpitations",          statut:"en_attente", arrivee:"09:30", docteurId:3 },
  { id:5, pid:"CAB-M4N5O6", nom:"Baldé Aissatou",  dateNaissance:"2018-06-08", sexe:"F", telephone:"+224 625 66 77 88", adresse:"Matoto",  motif:"Fièvre persistante",    statut:"en_attente", arrivee:"10:00", docteurId:4 },
]

const CONSULTATIONS_INIT = [
  { id:1, patientId:1, date:"2026-03-15", motif:"Fièvre persistante",  service:"Cardiologie", docteurId:2, observations:"TA 13/8, pouls 90", symptomes:"Fièvre, fatigue", diagnostics:["Infection virale"], pathologies:["Anémie"], examens:["NFS"], traitements:["Paracétamol 500mg"], commentaires:"Repos 3 jours", signe:true,  signeLe:"15/03/2026 10:30" },
  { id:2, patientId:2, date:"2026-03-28", motif:"Suivi cardiologie",   service:"Cardiologie", docteurId:2, observations:"Tension stable 12/8", symptomes:"Palpitations", diagnostics:["HTA stable"],         pathologies:["HTA"],    examens:["ECG"], traitements:["Amlodipine 5mg"],  commentaires:"Contrôle dans 1 mois", signe:true,  signeLe:"28/03/2026 11:00" },
  { id:3, patientId:3, date:today(),      motif:"Douleur thoracique",  service:"Cardiologie", docteurId:2, observations:"",                   symptomes:"",              diagnostics:[],                      pathologies:[],         examens:[],      traitements:[],                  commentaires:"",                     signe:false, signeLe:null },
]

// Médecin connecté (simulé — viendra de AuthContext plus tard)
const MEDECIN_CONNECTE = { id:2, nom:"Dr. Camara", specialite:"Cardiologie" }

// ══════════════════════════════════════════════════════
//  COULEURS
// ══════════════════════════════════════════════════════
const C = {
  bg:"#f8f9fa", white:"#ffffff", textPri:"#0f172a", textSec:"#64748b", textMuted:"#94a3b8", border:"#e2e8f0",
  green:"#16a34a", greenSoft:"#dcfce7",
  blue:"#2563eb",  blueSoft:"#dbeafe",
  amber:"#d97706", amberSoft:"#fef3c7",
  red:"#dc2626",   redSoft:"#fee2e2",
  slate:"#475569", slateSoft:"#e2e8f0",
  purple:"#7c3aed",purpleSoft:"#ede9fe",
  orange:"#ea580c",orangeSoft:"#ffedd5",
}

// ══════════════════════════════════════════════════════
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
function Badge({ statut }) {
  const cfg = {
    en_attente: { label:"En attente",  color:C.amber, bg:C.amberSoft },
    en_salle:   { label:"En salle",    color:C.green, bg:C.greenSoft, pulse:true },
    termine:    { label:"Terminé",     color:C.slate, bg:C.slateSoft },
    signe:      { label:"✓ Signé",     color:C.green, bg:C.greenSoft },
    non_signe:  { label:"⚠ Non signé", color:C.red,   bg:C.redSoft   },
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
  const bgs = [C.blueSoft,C.greenSoft,C.purpleSoft,C.amberSoft,C.orangeSoft]
  const fgs = [C.blue,C.green,C.purple,C.amber,C.orange]
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
    primary:  { bg:C.blue,  hov:"#1d4ed8", color:"#fff", border:"none" },
    success:  { bg:C.green, hov:"#15803d", color:"#fff", border:"none" },
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

// ══════════════════════════════════════════════════════
//  MODAL — FICHE PATIENT
// ══════════════════════════════════════════════════════
function ModalFichePatient({ patient, consultations, onClose, onConsulter }) {
  if (!patient) return null
  const visites = consultations.filter(c=>c.patientId===patient.id).sort((a,b)=>b.date.localeCompare(a.date))
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:580, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar name={patient.nom} size={48} />
            <div>
              <p style={{ fontSize:18, fontWeight:800, color:C.textPri, marginBottom:3 }}>{patient.nom}</p>
              <p style={{ fontSize:13, color:C.textSec }}>{patient.pid} · {calcAge(patient.dateNaissance)} ans · {patient.sexe==="F"?"Féminin":"Masculin"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>

        {/* Infos */}
        <div style={{ padding:"20px 28px" }}>
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

          {/* Historique */}
          {visites.length > 0 && (
            <>
              <p style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Historique des consultations</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                {visites.map((v,i)=>(
                  <div key={v.id} style={{ background:C.bg, borderRadius:10, padding:"12px 16px", border:"1px solid "+C.border }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{fmt(v.date)} — {v.motif}</p>
                      <Badge statut={v.signe?"signe":"non_signe"} />
                    </div>
                    {v.diagnostics.length>0 && <p style={{ fontSize:12, color:C.textSec, marginBottom:2 }}>Diag : {v.diagnostics.join(", ")}</p>}
                    {v.traitements.length>0 && <p style={{ fontSize:12, color:C.textSec }}>Traitement : {v.traitements.join(", ")}</p>}
                  </div>
                ))}
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
  if (!patient) return null

  const [form, setForm] = useState({
    motif:        consultation?.motif        || patient.motif || "",
    symptomes:    consultation?.symptomes    || "",
    observations: consultation?.observations || "",
    diagnostics:  (consultation?.diagnostics||[]).join(", "),
    pathologies:  (consultation?.pathologies||[]).join(", "),
    examens:      (consultation?.examens||[]).join(", "),
    traitements:  (consultation?.traitements||[]).join(", "),
    commentaires: consultation?.commentaires || "",
  })
  const [suggestions, setSuggestions] = useState([])
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

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

  const ajouterTag = (champ, val) => {
    const curr = form[champ].split(",").map(x=>x.trim()).filter(Boolean)
    if (!curr.includes(val)) f(champ, [...curr, val].join(", "))
  }

  const parseList = str => str.split(",").map(x=>x.trim()).filter(Boolean)

  const valider = (signer) => {
    if (!form.observations.trim()) { alert("Les observations cliniques sont obligatoires."); return }
    if (signer && !form.diagnostics.trim()) { alert("Le diagnostic est obligatoire pour signer."); return }
    const data = {
      motif:        form.motif,
      symptomes:    form.symptomes,
      observations: form.observations,
      diagnostics:  parseList(form.diagnostics),
      pathologies:  parseList(form.pathologies),
      examens:      parseList(form.examens),
      traitements:  parseList(form.traitements),
      commentaires: form.commentaires,
    }
    if (signer) onSigner(data)
    else onSauvegarder(data)
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:680, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header bleu */}
        <div style={{ padding:"22px 28px 20px", borderBottom:"1px solid "+C.border, background:"linear-gradient(135deg,#1e40af,#2563eb)", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar name={patient.nom} size={46} bg="rgba(255,255,255,0.25)" />
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:3 }}>{patient.nom}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>{patient.pid} · {calcAge(patient.dateNaissance)} ans · {medecin.specialite}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:8, color:"#fff", cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>

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
                <p style={{ fontSize:12, fontWeight:700, color:C.blue, marginBottom:8 }}>💡 Suggestions de diagnostic basées sur les symptômes :</p>
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

          {/* Avertissement signature */}
          <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:12, color:C.red, fontWeight:600 }}>
              🔒 La signature est <strong>obligatoire et définitive</strong>. Une consultation non signée est une anomalie détectée dans le système d'audit.
            </p>
          </div>

          {/* Boutons */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={()=>valider(false)} variant="secondary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Sauvegarder
            </Btn>
            <Btn onClick={()=>valider(true)} variant="success">
              ✍️ Signer &amp; Valider
            </Btn>
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
  const medecin = MEDECIN_CONNECTE

  const [onglet, setOnglet]               = useState("accueil")
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [patients, setPatients]           = useState(PATIENTS_INIT)
  const [consultations, setConsultations] = useState(CONSULTATIONS_INIT)
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
  })

  const ouvrirConsultation = (patient) => {
    const existing = consultations.find(c=>c.patientId===patient.id&&c.date===today()&&c.docteurId===medecin.id)
    setMConsult({ patient, consultation:existing||null })
  }

  const handleSauvegarder = (data) => {
    const patientId = mConsult.patient.id
    const existing  = consultations.find(c=>c.patientId===patientId&&c.date===today()&&c.docteurId===medecin.id)
    if (existing) {
      setConsultations(prev=>prev.map(c=>c.id===existing.id?{...c,...data}:c))
    } else {
      setConsultations(prev=>[...prev,{ id:prev.length+1, patientId, date:today(), service:medecin.specialite, docteurId:medecin.id, signe:false, signeLe:null, ...data }])
    }
    setMConsult(null)
    alert("Consultation sauvegardée.")
  }

  const handleSigner = (data) => {
    const patientId = mConsult.patient.id
    const ts        = new Date().toLocaleString("fr-FR")
    const existing  = consultations.find(c=>c.patientId===patientId&&c.date===today()&&c.docteurId===medecin.id)
    if (existing) {
      setConsultations(prev=>prev.map(c=>c.id===existing.id?{...c,...data,signe:true,signeLe:ts}:c))
    } else {
      setConsultations(prev=>[...prev,{ id:prev.length+1, patientId, date:today(), service:medecin.specialite, docteurId:medecin.id, signe:true, signeLe:ts, ...data }])
    }
    setPatients(prev=>prev.map(p=>p.id===patientId?{...p,statut:"termine"}:p))
    setMConsult(null)
    alert("Consultation signée et validée.")
  }

  const NAV = [
    { id:"accueil",       label:"Accueil",         icon:"🏠", desc:"Vue d'ensemble",      badge:0          },
    { id:"patients",      label:"Mes patients",     icon:"👥", desc:"Liste du jour",       badge:enAttente  },
    { id:"consultations", label:"Mes consultations",icon:"📋", desc:"Historique & signature", badge:nonSignees },
  ]

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      {/* MODALS */}
      {mFiche && (
        <ModalFichePatient
          patient={mFiche}
          consultations={consultations}
          onClose={()=>setMFiche(null)}
          onConsulter={p=>{ ouvrirConsultation(p) }}
        />
      )}
      {mConsult && (
        <ModalConsultation
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
                  <p style={{ fontSize:11, color:C.blue, fontWeight:600, marginTop:1 }}>{medecin.specialite}</p>
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
              🔒 {nonSignees} à signer
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
                { val:mesPatients.length,                         label:"Patients assignés",     bg:C.blueSoft,  fg:C.blue,  icon:"👥" },
                { val:enAttente,                                  label:"En attente",             bg:C.amberSoft, fg:C.amber, icon:"⏳" },
                { val:mesConsultations.filter(c=>c.signe).length, label:"Consultations signées",  bg:C.greenSoft, fg:C.green, icon:"✅" },
              ].map(({val,label,bg,fg,icon})=>(
                <Card key={label} style={{ padding:"22px 20px" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:14 }}>{icon}</div>
                  <p style={{ fontSize:32, fontWeight:800, color:fg, letterSpacing:"-1px", lineHeight:1 }}>{val}</p>
                  <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>{label}</p>
                </Card>
              ))}
            </div>

            {/* Alerte consultations non signées */}
            {nonSignees>0 && (
              <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:14, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setOnglet("consultations")}>
                <span style={{ fontSize:22 }}>⚠️</span>
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
                        <p style={{ fontSize:11, color:C.textSec }}>{p.motif} · Arrivé à {p.arrivee}</p>
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
                  {["Patient","Motif","Arrivée","Statut","Actions"].map(h=>(
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patientsFiltres.length===0
                  ? <tr><td colSpan={5} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun patient trouvé</td></tr>
                  : patientsFiltres.sort((a,b)=>a.statut==="en_attente"?-1:1).map((p,i,arr)=>(
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
                      <td style={{ padding:"13px 16px", fontSize:13, color:C.textSec }}>{p.motif}</td>
                      <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:C.blue, fontVariantNumeric:"tabular-nums" }}>{p.arrivee}</td>
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
                  🔒 {nonSignees} consultation{nonSignees>1?"s":""} non signée{nonSignees>1?"s":""} — action requise
                </p>
                <p style={{ fontSize:13, color:"#991b1b" }}>Signez chaque consultation pour valider votre travail.</p>
              </div>
            )}
            <Card>
              <CardHeader title={"Mes consultations — "+mesConsultations.length+" au total"} />
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.slateSoft }}>
                    {["Patient","Date","Motif","Diagnostic","Traitement","Signature","Action"].map(h=>(
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mesConsultations.length===0
                    ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucune consultation enregistrée</td></tr>
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
                                  ✍️ Signer
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