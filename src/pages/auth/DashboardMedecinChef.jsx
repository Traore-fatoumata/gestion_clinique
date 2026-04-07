import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import SettingsModal from "../../components/SettingsModal"
import { useClinicSettings } from "../../hooks/useClinicSettings.jsx"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
const today   = () => new Date().toISOString().slice(0, 10)
//const nowTime = () => new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })
const fmt     = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

const SERVICES = [
  "Accueil","Ophtalmologie","ORL","Laboratoire","Pharmacie","Pédiatrie",
  "Médecine générale","Traumatologie","Gynécologie","Cardiologie",
  "Neurologie","Urologie","Chirurgie","Diabétologie / Endocrinologie",
]

// ══════════════════════════════════════════════════════
//  DONNÉES
// ══════════════════════════════════════════════════════
const INIT_MEDECINS = [
  { id:1,  nom:"Dr. Doumbouya", prenom:"Amadou",   specialite:"Médecine générale",             email:"doumbouya@cab.gn", telephone:"+224 622 00 01 01", estChef:true,  statut:"actif", creeLe:"2024-01-05" },
  { id:2,  nom:"Dr. Camara",    prenom:"Ibrahima",  specialite:"Cardiologie",                   email:"camara@cab.gn",    telephone:"+224 622 00 02 02", estChef:false, statut:"actif", creeLe:"2024-01-05" },
  { id:3,  nom:"Dr. Barry",     prenom:"Mamadou",   specialite:"Diabétologie / Endocrinologie", email:"barry@cab.gn",     telephone:"+224 622 00 03 03", estChef:false, statut:"actif", creeLe:"2024-02-10" },
  { id:4,  nom:"Dr. Souaré",    prenom:"Fatoumata", specialite:"Pédiatrie",                     email:"souare@cab.gn",    telephone:"+224 622 00 04 04", estChef:false, statut:"actif", creeLe:"2024-03-01" },
  { id:5,  nom:"Dr. Keïta",     prenom:"Sekou",     specialite:"Gynécologie",                   email:"keita@cab.gn",     telephone:"+224 622 00 05 05", estChef:false, statut:"actif", creeLe:"2024-03-15" },
  { id:6,  nom:"Dr. Bah",       prenom:"Fatoumata", specialite:"Ophtalmologie",                 email:"bah@cab.gn",       telephone:"+224 622 00 06 06", estChef:false, statut:"actif", creeLe:"2024-04-01" },
  { id:7,  nom:"Dr. Diallo",    prenom:"Ousmane",   specialite:"Traumatologie",                 email:"diallo@cab.gn",    telephone:"+224 622 00 07 07", estChef:false, statut:"actif", creeLe:"2024-04-15" },
  { id:8,  nom:"Dr. Konaté",    prenom:"Ibrahima",  specialite:"Neurologie",                    email:"konate@cab.gn",    telephone:"+224 622 00 08 08", estChef:false, statut:"actif", creeLe:"2024-05-01" },
  { id:9,  nom:"Dr. Traoré",    prenom:"Aminata",   specialite:"ORL",                           email:"traore@cab.gn",    telephone:"+224 622 00 09 09", estChef:false, statut:"actif", creeLe:"2024-05-15" },
  { id:10, nom:"Dr. Baldé",     prenom:"Mamadou",   specialite:"Urologie",                      email:"balde@cab.gn",     telephone:"+224 622 00 10 10", estChef:false, statut:"actif", creeLe:"2024-06-01" },
  { id:11, nom:"Dr. Condé",     prenom:"Mariama",   specialite:"Chirurgie",                     email:"conde@cab.gn",     telephone:"+224 622 00 11 11", estChef:false, statut:"actif", creeLe:"2024-06-15" },
  { id:12, nom:"Dr. Sylla",     prenom:"Aboubacar", specialite:"Laboratoire",                   email:"sylla@cab.gn",     telephone:"+224 622 00 12 12", estChef:false, statut:"actif", creeLe:"2024-07-01" },
  { id:13, nom:"Dr. Kourouma",  prenom:"Fanta",     specialite:"Pharmacie",                     email:"kourouma@cab.gn",  telephone:"+224 622 00 13 13", estChef:false, statut:"actif", creeLe:"2024-07-15" },
]

const INIT_COMPTES = [
  { id:1, nom:"Mariama Diallo",   role:"secretaire", email:"sec1@cab.gn",   statut:"actif", creeLe:"2025-01-10", dernConn:"2026-03-31 08:00" },
  { id:2, nom:"Fatoumata Bah",    role:"secretaire", email:"sec2@cab.gn",   statut:"actif", creeLe:"2025-02-15", dernConn:"2026-03-30 17:30" },
  { id:3, nom:"Ibrahima Sow",     role:"infirmier",  email:"infirm@cab.gn", statut:"actif", creeLe:"2025-03-01", dernConn:"2026-03-31 07:45" },
  { id:4, nom:"Aissatou Kouyaté", role:"caissier",   email:"caisse@cab.gn", statut:"actif", creeLe:"2025-03-10", dernConn:"2026-03-31 08:30" },
]

const INIT_PATIENTS = [
  { id:1, pid:"CAB-A1B2C3", nom:"Bah Mariama",     age:"34 ans",    dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", quartier:"Ratoma",   secteur:"Lansanayah" },
  { id:2, pid:"CAB-D4E5F6", nom:"Diallo Ibrahima", age:"52 ans",    dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", quartier:"Kaloum",   secteur:"Boulbinet"  },
  { id:3, pid:"CAB-G7H8I9", nom:"Sow Fatoumata",   age:"1an 3mois", dateNaissance:"2022-11-20", sexe:"F", telephone:"+224 621 77 88 99", quartier:"Dixinn",   secteur:"Yimbayah"   },
  { id:4, pid:"CAB-J1K2L3", nom:"Kouyaté Mamadou", age:"61 ans",    dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", quartier:"Matam",    secteur:"Tannerie"   },
  { id:5, pid:"CAB-M4N5O6", nom:"Baldé Aissatou",  age:"19 ans",    dateNaissance:"2005-06-08", sexe:"F", telephone:"+224 625 66 77 88", quartier:"Matoto",   secteur:"Gbessia"    },
]

const INIT_CONSULTATIONS = [
  { id:1,  patientId:1, date:"2025-01-15", motif:"Fièvre, Toux, Rhume",              service:"Médecine générale",             docteurId:1,   statut:"paye",       paiement:"cash",  montant:50000, signePar:"Dr. Doumbouya", typeVisite:"consultation" },
  { id:2,  patientId:2, date:"2025-03-02", motif:"Douleur thoracique, Palpitations", service:"Cardiologie",                   docteurId:2,   statut:"paye",       paiement:"carte", montant:80000, signePar:"Dr. Camara",    typeVisite:"consultation" },
  { id:3,  patientId:3, date:"2025-06-15", motif:"CPN Suivi, Leucorrhée",             service:"Gynécologie",                   docteurId:5,   statut:"paye",       paiement:"cash",  montant:60000, signePar:"Dr. Keïta",     typeVisite:"rendez_vous"  },
  { id:4,  patientId:4, date:"2025-09-20", motif:"Glycémie élevée, Fatigue",          service:"Diabétologie / Endocrinologie", docteurId:3,   statut:"paye",       paiement:"cash",  montant:45000, signePar:"Dr. Barry",     typeVisite:"consultation" },
  { id:5,  patientId:5, date:"2026-01-20", motif:"Fièvre, Eruption cutanée",          service:"Pédiatrie",                     docteurId:4,   statut:"paye",       paiement:"carte", montant:55000, signePar:"Dr. Souaré",    typeVisite:"consultation" },
  { id:6,  patientId:1, date:"2026-02-14", motif:"Douleur abdominale, Constipation",  service:"Médecine générale",             docteurId:1,   statut:"paye",       paiement:"cash",  montant:40000, signePar:"Dr. Doumbouya", typeVisite:"consultation" },
  { id:7,  patientId:2, date:"2026-03-01", motif:"Suivi cardio, Essoufflement",       service:"Cardiologie",                   docteurId:2,   statut:"en_attente", paiement:null,    montant:80000, signePar:null,            typeVisite:"rendez_vous"  },
  { id:8,  patientId:3, date:"2026-03-10", motif:"Douleur oculaire, Vision floue",    service:"Ophtalmologie",                 docteurId:6,   statut:"en_attente", paiement:null,    montant:35000, signePar:null,            typeVisite:"consultation" },
  { id:9,  patientId:1, date:today(),      motif:"Fièvre, Céphalée, Courbature",      service:"Médecine générale",             docteurId:null, statut:"en_attente", paiement:null,   montant:null,  signePar:null, arrivee:"08:15", typeVisite:"consultation" },
  { id:10, patientId:4, date:today(),      motif:"Glycémie, Soif excessive",          service:"Diabétologie / Endocrinologie", docteurId:null, statut:"en_attente", paiement:null,   montant:null,  signePar:null, arrivee:"09:30", typeVisite:"rendez_vous"  },
]

const ROLES_LABEL = { secretaire:"Secrétaire", medecin:"Médecin", infirmier:"Infirmier", caissier:"Caissier", pharmacien:"Pharmacien", laborantin:"Laborantin" }

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
  greenDark:"#0f4c2a",
}
const COULEURS = [C.blue,C.green,C.purple,C.orange,C.amber,C.red,"#0891b2","#7c3aed","#15803d","#dc2626","#ea580c","#64748b","#16a34a"]

// ══════════════════════════════════════════════════════
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
function StatutBadge({ statut }) {
  const cfg = {
    en_attente:{ label:"En attente", color:C.amber, bg:C.amberSoft },
    paye:      { label:"Payé",       color:C.green, bg:C.greenSoft },
    actif:     { label:"Actif",      color:C.green, bg:C.greenSoft },
    bloque:    { label:"Bloqué",     color:C.red,   bg:C.redSoft   },
  }
  const s = cfg[statut]||{ label:statut, color:C.slate, bg:C.slateSoft }
  return <span style={{ display:"inline-block", background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33" }}>{s.label}</span>
}
function RoleBadge({ role }) {
  const cfg = { secretaire:{color:C.blue,bg:C.blueSoft}, medecin:{color:C.green,bg:C.greenSoft}, infirmier:{color:C.purple,bg:C.purpleSoft}, caissier:{color:C.orange,bg:C.orangeSoft} }
  const c = cfg[role]||{color:C.slate,bg:C.slateSoft}
  return <span style={{ display:"inline-block", background:c.bg, color:c.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>{ROLES_LABEL[role]||role}</span>
}
function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>{children}</div>
}
function CardHeader({ title, sub, action }) {
  return (
    <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <p style={{ fontWeight:700, fontSize:15, color:C.textPri, marginBottom:sub?2:0 }}>{title}</p>
        {sub&&<p style={{ fontSize:13, color:C.textMuted }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}
function Btn({ children, onClick, variant="primary", small=false, disabled=false }) {
  const cfg={primary:{bg:C.blue,hov:"#1d4ed8",color:"#fff"},success:{bg:C.green,hov:"#15803d",color:"#fff"},outline:{bg:"transparent",hov:C.slateSoft,color:C.textSec,border:"1px solid "+C.border}}
  const s=cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:s.bg, color:s.color, border:s.border||"none", borderRadius:10, padding:small?"7px 14px":"10px 20px", fontSize:small?12:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", opacity:disabled?.55:1 }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=s.hov }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.background=s.bg }}
    >{children}</button>
  )
}
function Avatar({ name, size=40 }) {
  const bgs=[C.blueSoft,C.greenSoft,C.purpleSoft,C.amberSoft,C.orangeSoft]
  const fgs=[C.blue,C.green,C.purple,C.amber,C.orange]
  const i=(name?.charCodeAt(0)||0)%bgs.length
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bgs[i], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}
function Overlay({ children, onClose }) {
  return <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>{children}</div>
}
function FInput({ label, req, children }) {
  return <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>{label}{req&&<span style={{ color:C.red }}> *</span>}</label>{children}</div>
}
function Inp({ value, onChange, placeholder, type="text" }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }}
    onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }}
    onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }}/>
}
function Sel({ value, onChange, children }) {
  return <select value={value} onChange={onChange} style={{ width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", cursor:"pointer" }}>{children}</select>
}

// ══════════════════════════════════════════════════════
//  MODAL — CRÉER MÉDECIN
// ══════════════════════════════════════════════════════
function ModalCreerMedecin({ onClose, onCreer }) {
  const [form,setForm]=useState({ nom:"",prenom:"",specialite:SERVICES[6],email:"",telephone:"",motDePasse:"" })
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const ok=form.nom&&form.prenom&&form.email&&form.motDePasse&&form.telephone
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:560, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between" }}>
          <div><p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>Créer un compte médecin</p><p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>Le médecin recevra ses identifiants par email</p></div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <FInput label="Nom" req><Inp value={form.nom} onChange={e=>f("nom",e.target.value)} placeholder="Ex : Camara"/></FInput>
            <FInput label="Prénom" req><Inp value={form.prenom} onChange={e=>f("prenom",e.target.value)} placeholder="Ex : Ibrahima"/></FInput>
          </div>
          <FInput label="Spécialité" req><Sel value={form.specialite} onChange={e=>f("specialite",e.target.value)}>{SERVICES.map(s=><option key={s}>{s}</option>)}</Sel></FInput>
          <FInput label="Email" req><Inp type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="prenom.nom@cab.gn"/></FInput>
          <FInput label="Téléphone" req><Inp value={form.telephone} onChange={e=>f("telephone",e.target.value)} placeholder="+224 6XX XX XX XX"/></FInput>
          <FInput label="Mot de passe provisoire" req><Inp type="password" value={form.motDePasse} onChange={e=>f("motDePasse",e.target.value)} placeholder="Min. 8 caractères"/></FInput>
          <div style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:13, color:C.blue }}>ℹ️ Le médecin devra changer son mot de passe dès la première connexion.</p>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="outline">Annuler</Btn>
            <Btn onClick={()=>{ if(ok){ onCreer(form); onClose() } }} disabled={!ok}>Créer le compte</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — CRÉER AUTRE COMPTE
// ══════════════════════════════════════════════════════
function ModalCreerCompte({ onClose, onCreer }) {
  const [form,setForm]=useState({ nom:"",email:"",role:"secretaire",motDePasse:"" })
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const roles=["secretaire","infirmier","caissier","pharmacien","laborantin"]
  const ok=form.nom&&form.email&&form.motDePasse
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:480, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between" }}>
          <div><p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>Créer un compte utilisateur</p><p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>Seul le médecin chef peut créer des comptes</p></div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
          <FInput label="Nom complet" req><Inp value={form.nom} onChange={e=>f("nom",e.target.value)} placeholder="Ex : Mariama Diallo"/></FInput>
          <FInput label="Email" req><Inp type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="utilisateur@cab.gn"/></FInput>
          <FInput label="Rôle" req><Sel value={form.role} onChange={e=>f("role",e.target.value)}>{roles.map(r=><option key={r} value={r}>{ROLES_LABEL[r]}</option>)}</Sel></FInput>
          <FInput label="Mot de passe provisoire" req><Inp type="password" value={form.motDePasse} onChange={e=>f("motDePasse",e.target.value)} placeholder="Min. 8 caractères"/></FInput>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="outline">Annuler</Btn>
            <Btn onClick={()=>{ if(ok){ onCreer(form); onClose() } }} disabled={!ok}>Créer</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — CONSULTATION D'ACCUEIL (vrai flux médecin chef)
//  Étape 1 : Plaintes & Symptômes
//  Étape 2 : Diagnostic préliminaire
//  Étape 3 : Assigner au médecin de service
//  Étape 4 : Fixer le prix (payé à la secrétaire)
// ══════════════════════════════════════════════════════
function ModalConsultationChef({ patient, consultation, medecins, onClose, onValider }) {
  const [plaintes,     setPlaintes]     = useState(consultation?.plaintes||"")
  const [symptomes,    setSymptomes]    = useState(consultation?.symptomes||"")
  const [observations, setObservations] = useState(consultation?.observations||"")
  const [diagnostic,   setDiagnostic]   = useState(consultation?.diagnostic||"")
  const [prix,         setPrix]         = useState(consultation?.montant||"")
  const [docteurId,    setDocteurId]    = useState(consultation?.docteurId||"")

  if (!patient) return null
  const medecinChoisi = medecins.find(d=>d.id===parseInt(docteurId))
  const ok = plaintes && prix

  const iSt = { width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }
  const foc  = e => { e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }
  const blr  = e => { e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:680, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding:"20px 28px 18px", background:"linear-gradient(135deg,#14532d,#16a34a)", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:17, fontWeight:800, color:"#fff", marginBottom:3 }}>{patient.nom}</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>
              {patient.pid} · {patient.age||"—"}
              {consultation?.typeVisite==="rendez_vous" ? " · 📅 Rendez-vous" : " · 🏥 Consultation"}
              {consultation?.arrivee ? " · Arrivée "+consultation.arrivee : ""}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8, color:"#fff", cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 }}>

          {/* ── ÉTAPE 1 : Plaintes & Symptômes ── */}
          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.blue, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Étape 1 — Plaintes &amp; Symptômes
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
                  Plaintes du patient <span style={{ color:C.red }}>*</span>
                </label>
                <textarea value={plaintes} onChange={e=>setPlaintes(e.target.value)} rows={2}
                  placeholder="Ex : Douleur à la poitrine depuis 2 jours, toux sèche, maux de tête..."
                  style={{ ...iSt, resize:"none" }} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
                  Symptômes observés
                </label>
                <textarea value={symptomes} onChange={e=>setSymptomes(e.target.value)} rows={2}
                  placeholder="Ex : TA 14/9, Température 38.5°C, fréquence cardiaque élevée..."
                  style={{ ...iSt, resize:"none" }} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>
                  Observations / Antécédents
                </label>
                <input value={observations} onChange={e=>setObservations(e.target.value)}
                  placeholder="Ex : Patient hypertendu connu, diabétique, allergie au pénicilline..."
                  style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          </div>

          {/* ── ÉTAPE 2 : Diagnostic préliminaire ── */}
          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.blue, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Étape 2 — Diagnostic préliminaire
            </p>
            <input value={diagnostic} onChange={e=>setDiagnostic(e.target.value)}
              placeholder="Ex : Suspicion HTA, Paludisme, Infection respiratoire aiguë..."
              style={iSt} onFocus={foc} onBlur={blr}/>
            <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>
              Le diagnostic final sera posé par le médecin de service lors de la consultation approfondie.
            </p>
          </div>

          {/* ── ÉTAPE 3 : Assignation ── */}
          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.blue, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Étape 3 — Assigner au médecin de service
            </p>
            <select value={docteurId} onChange={e=>setDocteurId(e.target.value)}
              style={{ ...iSt, cursor:"pointer" }}>
              <option value="">— Dr. Doumbouya garde le patient (Médecine générale) —</option>
              {medecins.filter(d=>!d.estChef&&d.statut==="actif").map(d=>(
                <option key={d.id} value={d.id}>{d.nom} — {d.specialite}</option>
              ))}
            </select>
            {medecinChoisi
              ? <div style={{ marginTop:10, padding:"10px 14px", background:C.greenSoft, borderRadius:10, border:"1px solid "+C.green+"33", display:"flex", alignItems:"center", gap:8 }}>
                  <span>✅</span>
                  <p style={{ fontSize:13, color:C.green, fontWeight:600 }}>Patient orienté vers {medecinChoisi.nom} — {medecinChoisi.specialite}</p>
                </div>
              : <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>Laisser vide si Dr. Doumbouya assure lui-même la consultation.</p>
            }
          </div>

          {/* ── ÉTAPE 4 : Prix ── */}
          <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", border:"1px solid "+C.border }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.blue, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>
              Étape 4 — Prix de la consultation (GNF) <span style={{ color:C.red }}>*</span>
            </p>
            <input type="number" value={prix} onChange={e=>setPrix(e.target.value)}
              placeholder="Ex : 50000"
              style={{ ...iSt, fontSize:18, fontWeight:700, color:C.green, marginBottom:10 }} onFocus={foc} onBlur={blr}/>
            {/* Boutons prix rapides */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[25000,50000,75000,100000,150000,200000].map(p=>(
                <button key={p} type="button" onClick={()=>setPrix(p)}
                  style={{ padding:"7px 14px", background:prix==p?C.green:C.white, color:prix==p?"#fff":C.textSec, border:"1.5px solid "+(prix==p?C.green:C.border), borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  {(p/1000).toFixed(0)}K
                </button>
              ))}
            </div>
            <p style={{ fontSize:11, color:C.textMuted, marginTop:8 }}>
              💡 Fixé uniquement par le médecin chef. Le paiement se fait à la secrétaire avant la consultation.
            </p>
          </div>

          {/* Info orientation */}
          <div style={{ background:C.amberSoft, border:"1px solid "+C.amber+"33", borderRadius:10, padding:"12px 16px", display:"flex", gap:8 }}>
            <span style={{ fontSize:16, flexShrink:0 }}>ℹ️</span>
            <p style={{ fontSize:13, color:C.amber, lineHeight:1.5 }}>
              Après validation, le patient sera dirigé vers <strong>{medecinChoisi?medecinChoisi.nom+" ("+medecinChoisi.specialite+")":"Dr. Doumbouya (Médecine générale)"}</strong>. Le prix sera communiqué à la secrétaire pour encaissement.
            </p>
          </div>

          {/* Boutons */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <button onClick={onClose}
              style={{ padding:"10px 20px", border:"1px solid "+C.border, borderRadius:10, background:"transparent", color:C.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Annuler
            </button>
            <button onClick={()=>{
                if(!ok){ alert("Les plaintes et le prix sont obligatoires."); return }
                onValider({ plaintes, symptomes, observations, diagnostic, montant:parseInt(prix)||0, docteurId:docteurId?parseInt(docteurId):null })
              }}
              disabled={!ok}
              style={{ padding:"10px 24px", border:"none", borderRadius:10, background:ok?C.green:"#94a3b8", color:"#fff", fontSize:13, fontWeight:700, cursor:ok?"pointer":"not-allowed", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Valider &amp; Assigner
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — MODIFIER UNE CONSULTATION
// ══════════════════════════════════════════════════════
function ModalModifier({ consultation, patient, onClose, onModifier }) {
  const [motif,  setMotif]  = useState(consultation?.motif||consultation?.plaintes||"")
  const [diag,   setDiag]   = useState("")
  const [trait,  setTrait]  = useState("")
  const [raison, setRaison] = useState("")
  if (!consultation||!patient) return null
  const iSt = { width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:520, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>Modifier la consultation</p>
            <p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>{patient.nom} · {fmt(consultation.date)} · {consultation.service}</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:C.amberSoft, border:"1px solid "+C.amber+"33", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontSize:13, color:C.amber, fontWeight:600 }}>⚠️ Modification autorisée uniquement par le médecin chef. Action enregistrée dans l'audit.</p>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Motif / Plaintes</label>
            <input value={motif} onChange={e=>setMotif(e.target.value)} style={iSt} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Diagnostic corrigé</label>
            <input value={diag} onChange={e=>setDiag(e.target.value)} placeholder="Nouveau diagnostic si erreur" style={iSt} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Traitement corrigé</label>
            <input value={trait} onChange={e=>setTrait(e.target.value)} placeholder="Nouveau traitement si erreur" style={iSt} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>Raison de la modification <span style={{ color:C.red }}>*</span></label>
            <textarea value={raison} onChange={e=>setRaison(e.target.value)} rows={3}
              placeholder="Expliquez pourquoi cette consultation est modifiée…"
              style={{ ...iSt, resize:"vertical" }} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
            <button onClick={onClose} style={{ padding:"9px 20px", border:"1px solid "+C.border, borderRadius:10, background:"transparent", color:C.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Annuler</button>
            <button onClick={()=>{ if(!raison){ alert("La raison est obligatoire."); return }; onModifier(consultation.id, { motif, ...(diag&&{diagnostic:diag}), ...(trait&&{traitement:trait}), modifiePar:"Dr. Doumbouya — "+raison }); onClose() }}
              style={{ padding:"9px 20px", border:"none", borderRadius:10, background:C.amber, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              ✏️ Confirmer
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  PAGE ACCUEIL
// ══════════════════════════════════════════════════════
function PageAccueil({ consultations, patients, setPage }) {
  const consultAuj   = consultations.filter(c=>c.date===today())
  const enAttente    = consultAuj.filter(c=>!c.signePar)
  const recettesAuj  = consultAuj.filter(c=>c.statut==="paye").reduce((s,c)=>s+c.montant,0)
  const recettesTot  = consultations.filter(c=>c.statut==="paye").reduce((s,c)=>s+c.montant,0)
  const recettesMois = consultations.filter(c=>{ const d=new Date(c.date),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()&&c.statut==="paye" }).reduce((s,c)=>s+c.montant,0)
  const recentes     = [...consultations].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:28, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Tableau de Bord</p>
        <p style={{ fontSize:14, color:C.textSec }}>Bienvenue Dr. Doumbouya · Médecin chef · Médecine générale</p>
      </div>

      {/* Alerte patients en attente */}
      {enAttente.length>0&&(
        <div style={{ background:C.amberSoft, border:"1.5px solid "+C.amber+"55", borderRadius:14, padding:"16px 20px", marginBottom:24, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
          onClick={()=>setPage("consultations")}>
          <div style={{ width:44,height:44,borderRadius:12,background:C.amber,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:15, fontWeight:700, color:C.amber, marginBottom:2 }}>
              {enAttente.length} patient{enAttente.length>1?"s":""} en attente — consultation d'accueil requise
            </p>
            <p style={{ fontSize:13, color:"#92400e" }}>Cliquez pour recueillir les plaintes, assigner un médecin et fixer le prix de consultation</p>
          </div>
          <span style={{ color:C.amber, fontSize:22, fontWeight:700 }}>→</span>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Patients total",       val:patients.length,        fg:C.blue,   bg:C.blueSoft,   icon:"👥" },
          { label:"Consultations du jour", val:consultAuj.length,     fg:C.green,  bg:C.greenSoft,  icon:"📋" },
          { label:"En attente",           val:enAttente.length,       fg:C.amber,  bg:C.amberSoft,  icon:"⏳" },
          { label:"Recettes du mois (GNF)",val:(recettesMois/1000).toFixed(0)+"K", fg:C.purple, bg:C.purpleSoft, icon:"💰" },
        ].map(({label,val,fg,bg,icon})=>(
          <Card key={label} style={{ padding:"20px" }}>
            <div style={{ width:42,height:42,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:12 }}>{icon}</div>
            <p style={{ fontSize:28,fontWeight:800,color:fg,lineHeight:1,marginBottom:4 }}>{val}</p>
            <p style={{ fontSize:12,color:C.textMuted }}>{label}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:20, marginBottom:20 }}>
        {/* Consultations récentes */}
        <Card>
          <CardHeader title="Consultations récentes" action={<button onClick={()=>setPage("consultations")} style={{ background:"none",border:"none",color:C.blue,fontSize:13,cursor:"pointer",fontWeight:600 }}>Tout voir →</button>}/>
          <div style={{ padding:"0 20px" }}>
            {recentes.map((c,i)=>{
              const p=patients.find(pt=>pt.id===c.patientId)
              if(!p) return null
              return (
                <div key={c.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:i<recentes.length-1?"1px solid "+C.border:"none" }}>
                  <Avatar name={p.nom} size={36}/>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13,fontWeight:600,color:C.textPri,marginBottom:2 }}>{p.nom}</p>
                    <p style={{ fontSize:11,color:C.textSec }}>{c.plaintes||c.motif||"—"}</p>
                    <p style={{ fontSize:11,color:C.textMuted }}>{c.date} · <span style={{ color:C.blue,fontWeight:600 }}>{c.service}</span></p>
                  </div>
                  <StatutBadge statut={c.statut}/>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Statistiques financières */}
        <Card>
          <CardHeader title="Statistiques financières"/>
          <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:C.greenSoft,borderRadius:12,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontSize:12,color:C.textSec,marginBottom:4 }}>Recettes aujourd'hui</p>
                <p style={{ fontSize:20,fontWeight:800,color:C.green }}>{recettesAuj.toLocaleString("fr-FR")} GNF</p>
              </div>
              <span style={{ fontSize:24 }}>📈</span>
            </div>
            <div style={{ background:C.blueSoft,borderRadius:12,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontSize:12,color:C.textSec,marginBottom:4 }}>Recettes totales</p>
                <p style={{ fontSize:20,fontWeight:800,color:C.blue }}>{recettesTot.toLocaleString("fr-FR")} GNF</p>
              </div>
              <span style={{ fontSize:24 }}>💰</span>
            </div>
            <div style={{ background:C.purpleSoft,borderRadius:12,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontSize:12,color:C.textSec,marginBottom:4 }}>Ce mois</p>
                <p style={{ fontSize:20,fontWeight:800,color:C.purple }}>{recettesMois.toLocaleString("fr-FR")} GNF</p>
              </div>
              <span style={{ fontSize:24 }}>📊</span>
            </div>
          </div>
        </Card>
      </div>

      <p style={{ textAlign:"center", fontSize:12, color:C.textMuted }}>© 2026 Clinique ABC Marouane. Tous droits réservés.</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  PAGE CONSULTATIONS
// ══════════════════════════════════════════════════════
function PageConsultations({ consultations, patients, medecins, onValider, onModifier }) {
  const [mConsult, setMConsult] = useState(null)
  const [mModif,   setMModif]   = useState(null)
  const [filtreService, setFiltreService] = useState("tous")
  const [recherche,     setRecherche]     = useState("")

  const fileAccueil   = consultations.filter(c=>c.date===today()&&!c.signePar)
  const servicesDispo = [...new Set(consultations.map(c=>c.service))].filter(Boolean)

  const toutesFiltrees = [...consultations]
    .sort((a,b)=>b.date.localeCompare(a.date))
    .filter(c=>{
      const p=patients.find(pt=>pt.id===c.patientId)
      const q=recherche.toLowerCase()
      const okR=!q||(p&&p.nom.toLowerCase().includes(q))||c.service.toLowerCase().includes(q)||(c.plaintes||c.motif||"").toLowerCase().includes(q)
      const okS=filtreService==="tous"||c.service===filtreService
      return okR&&okS
    })

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:28, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Consultations</p>
      <p style={{ fontSize:14, color:C.textSec, marginBottom:24 }}>
        Vue complète de toutes les consultations · Modification possible en cas d'erreur médicale
      </p>

      {mConsult&&<ModalConsultationChef
        patient={patients.find(p=>p.id===mConsult.patientId)}
        consultation={mConsult}
        medecins={medecins}
        onClose={()=>setMConsult(null)}
        onValider={data=>{ onValider(mConsult.id,data); setMConsult(null) }}
      />}
      {mModif&&<ModalModifier
        consultation={mModif}
        patient={patients.find(p=>p.id===mModif.patientId)}
        onClose={()=>setMModif(null)}
        onModifier={onModifier}
      />}

      {/* ── File d'accueil ── */}
      {fileAccueil.length>0&&(
        <Card style={{ marginBottom:20, border:"1.5px solid "+C.green+"55" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, background:C.greenSoft, borderRadius:"16px 16px 0 0", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:C.green,animation:"blink 2s ease-in-out infinite" }}/>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Patients en attente — Consultation d'accueil</p>
              <p style={{ fontSize:13, color:C.textSec }}>
                {fileAccueil.length} patient{fileAccueil.length>1?"s":""} · Recueillez les plaintes, assignez un médecin et fixez le prix
              </p>
            </div>
          </div>
          {fileAccueil.map((c,i)=>{
            const p=patients.find(pt=>pt.id===c.patientId)
            if(!p) return null
            return (
              <div key={c.id} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, borderBottom:i<fileAccueil.length-1?"1px solid "+C.border:"none" }}>
                <Avatar name={p.nom} size={44}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{p.nom}</p>
                    {c.typeVisite==="rendez_vous"
                      ? <span style={{ fontSize:11,fontWeight:700,background:C.purpleSoft,color:C.purple,padding:"2px 9px",borderRadius:10 }}>📅 RDV</span>
                      : <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"2px 9px",borderRadius:10 }}>🏥 Consultation</span>
                    }
                  </div>
                  <p style={{ fontSize:13, color:C.textSec }}>
                    {c.plaintes||c.motif||"Pas encore de plaintes enregistrées"} · <span style={{ color:C.blue, fontWeight:600 }}>{c.service}</span>
                  </p>
                </div>
                {c.arrivee&&(
                  <div style={{ textAlign:"center", padding:"8px 16px", background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:10 }}>
                    <p style={{ fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2 }}>Arrivée</p>
                    <p style={{ fontSize:16,fontWeight:800,color:C.green,fontVariantNumeric:"tabular-nums" }}>{c.arrivee}</p>
                  </div>
                )}
                <StatutBadge statut="en_attente"/>
                <button onClick={()=>setMConsult(c)}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 20px",background:C.green,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}
                  onMouseEnter={e=>e.currentTarget.style.background="#15803d"}
                  onMouseLeave={e=>e.currentTarget.style.background=C.green}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.84 2 2 0 0 1 3.59 2.66h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.43 17"/></svg>
                  Consulter
                </button>
              </div>
            )
          })}
        </Card>
      )}

      {/* ── Toutes les consultations ── */}
      <Card>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Toutes les consultations — tous services</p>
              <p style={{ fontSize:13, color:C.textMuted }}>{toutesFiltrees.length} résultat{toutesFiltrees.length>1?"s":""}</p>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <select value={filtreService} onChange={e=>setFiltreService(e.target.value)}
                style={{ padding:"8px 14px",fontSize:13,border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit",cursor:"pointer" }}>
                <option value="tous">Tous les services</option>
                {servicesDispo.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ position:"relative" }}>
                <svg style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input placeholder="Patient, plaintes, service…" value={recherche} onChange={e=>setRecherche(e.target.value)}
                  style={{ padding:"8px 12px 8px 30px",fontSize:13,border:"1.5px solid "+C.border,borderRadius:10,background:C.bg,color:C.textPri,outline:"none",fontFamily:"inherit",width:210 }}
                  onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.background=C.white }}
                  onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.background=C.bg }}/>
              </div>
            </div>
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.slateSoft }}>
              {["Date","Patient","Service","Type","Plaintes / Motif","Médecin","Prix (GNF)","Statut","Action"].map(h=>(
                <th key={h} style={{ padding:"11px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {toutesFiltrees.length===0
              ? <tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucune consultation trouvée</td></tr>
              : toutesFiltrees.map((c,i,arr)=>{
                  const p  = patients.find(pt=>pt.id===c.patientId)
                  const dr = INIT_MEDECINS.find(d=>d.id===c.docteurId)
                  if(!p) return null
                  return (
                    <tr key={c.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"12px 12px", fontSize:12, color:C.textMuted, whiteSpace:"nowrap" }}>{c.date}</td>
                      <td style={{ padding:"12px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <Avatar name={p.nom} size={28}/>
                          <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                        </div>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        <span style={{ fontSize:11, fontWeight:600, background:C.blueSoft, color:C.blue, padding:"3px 9px", borderRadius:10, whiteSpace:"nowrap" }}>{c.service}</span>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        {c.typeVisite==="rendez_vous"
                          ? <span style={{ fontSize:11, fontWeight:700, background:C.purpleSoft, color:C.purple, padding:"2px 8px", borderRadius:10 }}>📅 RDV</span>
                          : <span style={{ fontSize:11, fontWeight:700, background:C.greenSoft,  color:C.green,  padding:"2px 8px", borderRadius:10 }}>🏥 Consult.</span>
                        }
                      </td>
                      <td style={{ padding:"12px 12px", fontSize:12, color:C.textSec, maxWidth:160 }}>
                        {(c.plaintes||c.motif||"—").split(",").slice(0,2).join(",")}
                      </td>
                      <td style={{ padding:"12px 12px", fontSize:12, color:dr?C.textPri:C.textMuted }}>
                        {dr?dr.nom:(c.signePar||"—")}
                      </td>
                      <td style={{ padding:"12px 12px", fontSize:13, fontWeight:700, color:c.montant?C.green:C.textMuted }}>
                        {c.montant?c.montant.toLocaleString("fr-FR"):"—"}
                      </td>
                      <td style={{ padding:"12px 12px" }}><StatutBadge statut={c.statut}/></td>
                      <td style={{ padding:"12px 12px" }}>
                        <button onClick={()=>setMModif(c)}
                          style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:C.amberSoft,border:"1px solid "+C.amber+"44",borderRadius:8,color:C.amber,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}
                          onMouseEnter={e=>{ e.currentTarget.style.background=C.amber; e.currentTarget.style.color="#fff" }}
                          onMouseLeave={e=>{ e.currentTarget.style.background=C.amberSoft; e.currentTarget.style.color=C.amber }}>
                          ✏️ Modifier
                        </button>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
        <p style={{ textAlign:"center", fontSize:12, color:C.textMuted, padding:"14px 0", borderTop:"1px solid "+C.border }}>© 2026 Clinique ABC Marouane. Tous droits réservés.</p>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  PAGE STATISTIQUES — filtres jour/semaine/mois/année
// ══════════════════════════════════════════════════════
function PageStats({ consultations, patients }) {
  const [periode, setPeriode] = useState("mois")
  const now = new Date()

  const filtreDate = d => {
    const dp=new Date(d)
    if(periode==="jour")    return d===today()
    if(periode==="semaine") { const s=new Date(now); s.setDate(s.getDate()-7); return dp>=s }
    if(periode==="mois")    { const s=new Date(now); s.setMonth(s.getMonth()-1); return dp>=s }
    if(periode==="annee")   { const s=new Date(now); s.setFullYear(s.getFullYear()-1); return dp>=s }
    return true
  }
  const cF          = consultations.filter(c=>filtreDate(c.date))
  const payees      = cF.filter(c=>c.statut==="paye")
  const totalRecettes = payees.reduce((s,c)=>s+c.montant,0)
  const prixMoyen     = payees.length>0?Math.round(totalRecettes/payees.length):0

  const JOURS=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
  const activiteHebo=JOURS.map((_,i)=>{ const d=new Date(now); d.setDate(d.getDate()-((d.getDay()||7)-1)+i); return consultations.filter(c=>c.date===d.toISOString().slice(0,10)).length })
  const maxHebo=Math.max(...activiteHebo,1)

  const servicesStats=SERVICES.map(s=>({ service:s, nb:cF.filter(c=>c.service===s).length, recettes:payees.filter(c=>c.service===s).reduce((sum,c)=>sum+c.montant,0) })).filter(s=>s.nb>0).sort((a,b)=>b.nb-a.nb)

  const PieChart=()=>{
    if(servicesStats.length===0) return <p style={{ color:C.textMuted,textAlign:"center",padding:30 }}>Aucune donnée</p>
    const total=servicesStats.reduce((s,x)=>s+x.nb,0)||1
    const cx=130,cy=130,r=100; let cumul=0
    const slices=servicesStats.slice(0,6).map((s,i)=>{ const pct=s.nb/total,start=cumul; cumul+=pct; return {...s,pct,start,end:cumul,color:COULEURS[i%COULEURS.length]} })
    return (
      <svg width="260" height="260" viewBox="0 0 260 260">
        {slices.map((s,i)=>{
          const a1=(s.start*2*Math.PI)-Math.PI/2,a2=(s.end*2*Math.PI)-Math.PI/2
          const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2)
          const d=`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${s.pct>0.5?1:0} 1 ${x2},${y2} Z`
          const ma=((s.start+s.end)/2*2*Math.PI)-Math.PI/2
          return <g key={i}><path d={d} fill={s.color} stroke="#fff" strokeWidth="2"/><text x={cx+(r+30)*Math.cos(ma)} y={cy+(r+30)*Math.sin(ma)} textAnchor="middle" fontSize="11" fontWeight="700" fill={s.color}>{Math.round(s.pct*100)}%</text></g>
        })}
      </svg>
    )
  }

  const LineChart=()=>{
    const pts=(periode==="semaine"||periode==="jour")
      ? JOURS.map((_,i)=>{ const d=new Date(now); d.setDate(d.getDate()-((d.getDay()||7)-1)+i); return { label:JOURS[i], val:payees.filter(c=>c.date===d.toISOString().slice(0,10)).reduce((s,c)=>s+c.montant,0) } })
      : [0,1,2,3,4,5].map(m=>{ const d=new Date(now); d.setMonth(d.getMonth()-5+m); const mo=d.getMonth(),yr=d.getFullYear(); return { label:d.toLocaleDateString("fr-FR",{month:"short"}), val:payees.filter(c=>{ const dp=new Date(c.date); return dp.getMonth()===mo&&dp.getFullYear()===yr }).reduce((s,c)=>s+c.montant,0) } })
    const maxV=Math.max(...pts.map(p=>p.val),1)
    const W=480,H=170,PL=50,PR=15,PT=15,PB=35,iW=W-PL-PR,iH=H-PT-PB
    const pp=pts.map((p,i)=>({ x:PL+(i/(pts.length-1||1))*iW, y:PT+iH-(p.val/maxV)*iH, ...p }))
    return (
      <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{ overflow:"visible" }}>
        {[0,Math.round(maxV/2),maxV].map(v=>{ const y=PT+iH-(v/maxV)*iH; return <g key={v}><line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#e2e8f0" strokeDasharray="4,4"/><text x={PL-8} y={y+4} textAnchor="end" fontSize="10" fill="#94a3b8">{(v/1000).toFixed(0)}K</text></g> })}
        {pp.map((p,i)=><text key={i} x={p.x} y={H-PB+18} textAnchor="middle" fontSize="10" fill="#94a3b8">{p.label}</text>)}
        <path d={pp.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ")} fill="none" stroke={C.green} strokeWidth="2.5" strokeLinejoin="round"/>
        {pp.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="5" fill={C.white} stroke={C.green} strokeWidth="2.5"/>)}
      </svg>
    )
  }

  const FILTRES=[{id:"jour",l:"Aujourd'hui"},{id:"semaine",l:"Semaine"},{id:"mois",l:"Mois"},{id:"annee",l:"Année"}]

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <p style={{ fontSize:28, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Statistiques &amp; Rapports</p>
          <p style={{ fontSize:14, color:C.textSec }}>Vue globale · {cF.length} consultation{cF.length>1?"s":""} sur la période</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", background:C.slateSoft, borderRadius:12, padding:4, gap:2 }}>
            {FILTRES.map(f=>(
              <button key={f.id} onClick={()=>setPeriode(f.id)}
                style={{ padding:"8px 16px", borderRadius:9, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", background:periode===f.id?"#fff":"transparent", color:periode===f.id?C.blue:C.textSec, boxShadow:periode===f.id?"0 1px 4px rgba(0,0,0,0.1)":"none" }}>
                {f.l}
              </button>
            ))}
          </div>
          <button onClick={()=>alert("Export en cours…")}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:C.white,color:C.textPri,border:"1px solid "+C.border,borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
            onMouseLeave={e=>e.currentTarget.style.background=C.white}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Patients", val:patients.length, sub:"Enregistrés", bg:C.blueSoft, fg:C.blue },
          { label:"Consultations",  val:cF.length,       sub:"Sur la période", bg:C.greenSoft, fg:C.green },
          { label:"Recettes (GNF)", val:totalRecettes.toLocaleString("fr-FR"), sub:"Paiements encaissés", bg:C.purpleSoft, fg:C.purple },
          { label:"Prix Moyen",     val:prixMoyen.toLocaleString("fr-FR")+" GNF", sub:"Par consultation", bg:C.orangeSoft, fg:C.orange },
        ].map(({label,val,sub,bg,fg})=>(
          <Card key={label} style={{ padding:"24px 28px" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:14,color:C.textSec,marginBottom:10 }}>{label}</p>
                <p style={{ fontSize:32,fontWeight:800,color:C.textPri,lineHeight:1,marginBottom:6 }}>{val}</p>
                <p style={{ fontSize:12,color:C.textMuted }}>{sub}</p>
              </div>
              <div style={{ width:52,height:52,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22 }}>
                {fg===C.blue?"👥":fg===C.green?"📋":fg===C.purple?"💰":"📊"}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Graphique barres hebdo */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:"20px 24px" }}>
          <p style={{ fontSize:15,fontWeight:700,color:C.textPri,marginBottom:4 }}>Activité Hebdomadaire</p>
          <p style={{ fontSize:13,color:C.textMuted,marginBottom:20 }}>Consultations par jour (semaine en cours)</p>
          <div style={{ position:"relative", height:200 }}>
            <div style={{ position:"absolute",left:40,right:10,bottom:28,top:0,display:"flex",alignItems:"flex-end",justifyContent:"space-around",gap:8 }}>
              {JOURS.map((j,i)=>{
                const val=activiteHebo[i]
                const h=val>0?Math.max((val/maxHebo)*165,8):0
                return (
                  <div key={j} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6,flex:1 }}>
                    {val>0&&<span style={{ fontSize:11,fontWeight:700,color:C.blue }}>{val}</span>}
                    <div style={{ width:"100%",maxWidth:52,height:h,background:val>0?C.blue:C.slateSoft,borderRadius:"4px 4px 0 0",transition:"height .4s" }}/>
                    <span style={{ fontSize:11,color:"#94a3b8" }}>{j}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ position:"absolute",left:40,right:10,bottom:26,height:1,background:C.border }}/>
          </div>
        </div>
      </Card>

      {/* Camembert + Ligne */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:20, marginBottom:20 }}>
        <Card>
          <div style={{ padding:"20px 24px" }}>
            <p style={{ fontSize:15,fontWeight:700,color:C.textPri,marginBottom:4 }}>Consultations par Service</p>
            <p style={{ fontSize:13,color:C.textMuted,marginBottom:16 }}>Distribution sur la période</p>
            <div style={{ display:"flex",justifyContent:"center" }}></div>
            <div style={{ display:"flex",flexDirection:"column",gap:6,marginTop:12 }}>
              {servicesStats.slice(0,6).map((s,i)=>(
                <div key={s.service} style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:COULEURS[i%COULEURS.length],flexShrink:0 }}/>
                  <span style={{ fontSize:12,color:C.textSec,flex:1 }}>{s.service}</span>
                  <span style={{ fontSize:12,fontWeight:700,color:C.textPri }}>{s.nb}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ padding:"20px 24px" }}>
            <p style={{ fontSize:15,fontWeight:700,color:C.textPri,marginBottom:4 }}>Évolution des Recettes</p>
            <p style={{ fontSize:13,color:C.textMuted,marginBottom:16 }}>En GNF · {periode==="jour"||periode==="semaine"?"par jour":"par mois"}</p>
            <div style={{ overflowX:"auto" }}></div>
          </div>
        </Card>
      </div>

      {/* Tableau récapitulatif */}
      <Card>
        <div style={{ padding:"18px 20px",borderBottom:"1px solid "+C.border }}>
          <p style={{ fontSize:15,fontWeight:700,color:C.textPri }}>Récapitulatif par Service</p>
          <p style={{ fontSize:13,color:C.textMuted }}>Performance sur la période sélectionnée</p>
        </div>
        {servicesStats.length===0
          ? <p style={{ padding:40,textAlign:"center",color:C.textMuted }}>Aucune consultation sur cette période</p>
          : <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead><tr>{["Service","Consultations","Recettes (GNF)"].map(h=>(<th key={h} style={{ padding:"12px 20px",textAlign:"left",fontSize:12,fontWeight:700,color:C.textPri,borderBottom:"1px solid "+C.border }}>{h}</th>))}</tr></thead>
              <tbody>
                {servicesStats.map((s,i,arr)=>(
                  <tr key={s.service} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"14px 20px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:COULEURS[servicesStats.indexOf(s)%COULEURS.length],flexShrink:0 }}/>
                        <span style={{ fontSize:14,fontWeight:600,color:C.textPri }}>{s.service}</span>
                      </div>
                    </td>
                    <td style={{ padding:"14px 20px",fontSize:14,color:C.textSec }}>{s.nb}</td>
                    <td style={{ padding:"14px 20px",fontSize:14,fontWeight:600,color:C.textPri }}>{s.recettes.toLocaleString("fr-FR")}</td>
                  </tr>
                ))}
                <tr style={{ background:"#f8f9fa" }}>
                  <td style={{ padding:"14px 20px" }}><span style={{ fontSize:14,fontWeight:800,color:C.textPri }}>TOTAL</span></td>
                  <td style={{ padding:"14px 20px",fontSize:14,fontWeight:800,color:C.textPri }}>{servicesStats.reduce((s,r)=>s+r.nb,0)}</td>
                  <td style={{ padding:"14px 20px",fontSize:14,fontWeight:800,color:C.textPri }}>{servicesStats.reduce((s,r)=>s+r.recettes,0).toLocaleString("fr-FR")}</td>
                </tr>
              </tbody>
            </table>
        }
        <p style={{ textAlign:"center",fontSize:12,color:C.textMuted,padding:"14px 0",borderTop:"1px solid "+C.border }}>© 2026 Clinique ABC Marouane. Tous droits réservés.</p>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  PAGE GESTION PERSONNEL
// ══════════════════════════════════════════════════════
function PageComptes({ comptes, setComptes, medecins, setMedecins }) {
  const [tab,         setTab]         = useState("medecins")
  const [showMedecin, setShowMedecin] = useState(false)
  const [showCompte,  setShowCompte]  = useState(false)
  const toggleM = id => setMedecins(prev=>prev.map(d=>d.id===id?{...d,statut:d.statut==="actif"?"bloque":"actif"}:d))
  const toggleC = id => setComptes(prev=>prev.map(c=>c.id===id?{...c,statut:c.statut==="actif"?"bloque":"actif"}:c))
  const creerMedecin = form => setMedecins(prev=>[...prev,{ id:prev.length+1, nom:"Dr. "+form.nom, prenom:form.prenom, specialite:form.specialite, email:form.email, telephone:form.telephone, estChef:false, statut:"actif", creeLe:today() }])
  const creerCompte  = form => setComptes(prev=>[...prev,{ id:prev.length+1, nom:form.nom, role:form.role, email:form.email, statut:"actif", creeLe:today(), dernConn:"Jamais" }])
  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      {showMedecin&&<ModalCreerMedecin onClose={()=>setShowMedecin(false)} onCreer={creerMedecin}/>}
      {showCompte &&<ModalCreerCompte  onClose={()=>setShowCompte(false)}  onCreer={creerCompte} />}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
        <div><p style={{ fontSize:22,fontWeight:800,color:C.textPri }}>Gestion Personnel</p><p style={{ fontSize:14,color:C.textSec }}>Gérer les comptes du personnel médical</p></div>
        <div style={{ display:"flex",gap:10 }}>
          <Btn onClick={()=>setShowMedecin(true)} variant="success" small>+ Nouveau médecin</Btn>
          <Btn onClick={()=>setShowCompte(true)} small>+ Autre compte</Btn>
        </div>
      </div>
      <div style={{ display:"flex",borderBottom:"1px solid "+C.border,marginBottom:20 }}>
        {[{id:"medecins",l:"Médecins ("+medecins.length+")"},{id:"autres",l:"Autres utilisateurs ("+comptes.length+")"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:"12px 24px",border:"none",background:"none",cursor:"pointer",fontSize:14,fontWeight:tab===t.id?700:500,color:tab===t.id?C.blue:C.textSec,borderBottom:tab===t.id?"2px solid "+C.blue:"2px solid transparent",fontFamily:"inherit" }}>{t.l}</button>
        ))}
      </div>
      {tab==="medecins"&&(
        <Card>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.slateSoft }}>{["Médecin","Spécialité","Email","Téléphone","Depuis","Statut","Action"].map(h=>(<th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.05em",textTransform:"uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>
              {medecins.map((d,i)=>(
                <tr key={d.id} style={{ borderBottom:i<medecins.length-1?"1px solid "+C.border:"none",opacity:d.statut==="bloque"?.6:1 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 14px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <Avatar name={d.nom} size={34}/>
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          <p style={{ fontSize:13,fontWeight:700,color:C.textPri }}>{d.nom}</p>
                          {d.estChef&&<span style={{ fontSize:10,background:C.amberSoft,color:C.amber,padding:"2px 7px",borderRadius:10,fontWeight:700 }}>CHEF</span>}
                        </div>
                        <p style={{ fontSize:11,color:C.textMuted }}>{d.prenom}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"13px 14px",fontSize:13,color:C.blue,fontWeight:500 }}>{d.specialite}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textSec }}>{d.email}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textSec }}>{d.telephone}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textMuted }}>{fmt(d.creeLe)}</td>
                  <td style={{ padding:"13px 14px" }}><StatutBadge statut={d.statut}/></td>
                  <td style={{ padding:"13px 14px" }}>
                    {!d.estChef&&<button onClick={()=>toggleM(d.id)}
                      style={{ padding:"6px 14px",borderRadius:8,border:"1px solid "+(d.statut==="actif"?C.red:C.green),background:"transparent",color:d.statut==="actif"?C.red:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                      {d.statut==="actif"?"Bloquer":"Débloquer"}
                    </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {tab==="autres"&&(
        <Card>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.slateSoft }}>{["Utilisateur","Rôle","Email","Créé le","Dernière connexion","Statut","Action"].map(h=>(<th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.05em",textTransform:"uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>
              {comptes.map((c,i)=>(
                <tr key={c.id} style={{ borderBottom:i<comptes.length-1?"1px solid "+C.border:"none",opacity:c.statut==="bloque"?.6:1 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 14px" }}><div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar name={c.nom} size={32}/><p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{c.nom}</p></div></td>
                  <td style={{ padding:"13px 14px" }}><RoleBadge role={c.role}/></td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textSec }}>{c.email}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textMuted }}>{fmt(c.creeLe)}</td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.textMuted }}>{c.dernConn}</td>
                  <td style={{ padding:"13px 14px" }}><StatutBadge statut={c.statut}/></td>
                  <td style={{ padding:"13px 14px" }}>
                    <button onClick={()=>toggleC(c.id)}
                      style={{ padding:"6px 14px",borderRadius:8,border:"1px solid "+(c.statut==="actif"?C.red:C.green),background:"transparent",color:c.statut==="actif"?C.red:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                      {c.statut==="actif"?"Bloquer":"Débloquer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  PAGE SUIVI PRÉSENCE
// ══════════════════════════════════════════════════════
function PagePresence({ medecins }) {
  const [presences] = useState([
    { id:1,  docteurId:1,  arrivee:"07:30", depart:null,    statut:"present",   patientsVus:4 },
    { id:2,  docteurId:2,  arrivee:"08:00", depart:null,    statut:"present",   patientsVus:3 },
    { id:3,  docteurId:3,  arrivee:"08:15", depart:null,    statut:"present",   patientsVus:2 },
    { id:4,  docteurId:4,  arrivee:null,    depart:null,    statut:"absent",    patientsVus:0 },
    { id:5,  docteurId:5,  arrivee:null,    depart:null,    statut:"en_retard", patientsVus:0 },
    { id:6,  docteurId:6,  arrivee:"07:55", depart:null,    statut:"present",   patientsVus:5 },
    { id:7,  docteurId:7,  arrivee:"08:30", depart:null,    statut:"present",   patientsVus:1 },
    { id:8,  docteurId:8,  arrivee:null,    depart:null,    statut:"absent",    patientsVus:0 },
    { id:9,  docteurId:9,  arrivee:"08:05", depart:null,    statut:"present",   patientsVus:2 },
    { id:10, docteurId:10, arrivee:"08:45", depart:null,    statut:"present",   patientsVus:1 },
    { id:11, docteurId:11, arrivee:null,    depart:null,    statut:"en_retard", patientsVus:0 },
    { id:12, docteurId:12, arrivee:"07:45", depart:null,    statut:"present",   patientsVus:0 },
    { id:13, docteurId:13, arrivee:"08:10", depart:null,    statut:"present",   patientsVus:0 },
  ])
  const cfgS = { present:{label:"Présent",color:C.green,bg:C.greenSoft}, absent:{label:"Absent",color:C.red,bg:C.redSoft}, en_retard:{label:"En retard",color:C.amber,bg:C.amberSoft}, parti:{label:"Parti",color:C.slate,bg:C.slateSoft} }
  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:6 }}>Suivi Présence</p>
      <p style={{ fontSize:14,color:C.textSec,marginBottom:24 }}>Personnel médical — {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</p>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
        {[
          {label:"Présents",   val:presences.filter(p=>p.statut==="present").length,   bg:C.greenSoft, fg:C.green, icon:"✅"},
          {label:"Absents",    val:presences.filter(p=>p.statut==="absent").length,    bg:C.redSoft,   fg:C.red,   icon:"❌"},
          {label:"En retard",  val:presences.filter(p=>p.statut==="en_retard").length, bg:C.amberSoft, fg:C.amber, icon:"⏰"},
          {label:"Partis",     val:presences.filter(p=>p.statut==="parti").length,     bg:C.slateSoft, fg:C.slate, icon:"🚪"},
        ].map(({label,val,bg,fg,icon})=>(
          <Card key={label} style={{ padding:"18px 20px",display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:40,height:40,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{icon}</div>
            <div><p style={{ fontSize:24,fontWeight:800,color:fg,letterSpacing:"-1px" }}>{val}</p><p style={{ fontSize:12,color:C.textMuted }}>{label}</p></div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title={"Présences du jour — "+new Date().toLocaleDateString("fr-FR")}/>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.slateSoft }}>{["Médecin","Spécialité","Arrivée","Départ","Patients vus","Statut"].map(h=>(<th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.05em",textTransform:"uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>
            {presences.map((p,i,arr)=>{
              const d=medecins.find(m=>m.id===p.docteurId); if(!d) return null
              const s=cfgS[p.statut]||cfgS.absent
              return (
                <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 14px" }}><div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar name={d.nom} size={32}/><div><p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{d.nom}</p>{d.estChef&&<span style={{ fontSize:10,color:C.amber,fontWeight:700 }}>★ Chef</span>}</div></div></td>
                  <td style={{ padding:"13px 14px",fontSize:12,color:C.blue,fontWeight:500 }}>{d.specialite}</td>
                  <td style={{ padding:"13px 14px",fontSize:13,fontWeight:700,color:p.arrivee?C.green:C.textMuted,fontVariantNumeric:"tabular-nums" }}>{p.arrivee||"—"}</td>
                  <td style={{ padding:"13px 14px",fontSize:13,fontWeight:700,color:p.depart?C.red:C.textMuted,fontVariantNumeric:"tabular-nums" }}>{p.depart||"En service"}</td>
                  <td style={{ padding:"13px 14px",textAlign:"center" }}><span style={{ background:C.blueSoft,color:C.blue,fontWeight:700,fontSize:13,borderRadius:20,padding:"4px 12px" }}>{p.patientsVus}</span></td>
                  <td style={{ padding:"13px 14px" }}><span style={{ display:"inline-flex",alignItems:"center",gap:5,background:s.bg,color:s.color,fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:20,border:"1px solid "+s.color+"33" }}>{s.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardMedecinChef() {
  const [page,         setPage]         = useState("accueil")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [consultations,setConsultations]= useState(INIT_CONSULTATIONS)
  const [comptes,      setComptes]      = useState(INIT_COMPTES)
  const [medecins,     setMedecins]     = useState(INIT_MEDECINS)
  const [heure,        setHeure]        = useState("")
  const [showPointer,  setShowPointer]  = useState(false)
  const [pointerHeure, setPointerHeure] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const { settings } = useClinicSettings()

  useEffect(()=>{
    const tick=()=>setHeure(new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  const handleValider = (consultId, data) => {
    const ts=new Date().toLocaleString("fr-FR")
    setConsultations(prev=>prev.map(c=>c.id===consultId
      ? { ...c, ...data, statut:data.docteurId?"en_attente":"paye", signePar:"Dr. Doumbouya", signeLe:ts }
      : c
    ))
  }

  const handleModifier = (consultId, data) => {
    setConsultations(prev=>prev.map(c=>c.id===consultId?{...c,...data}:c))
  }

  const enAttente = consultations.filter(c=>c.date===today()&&!c.signePar).length

  const NAV = [
    { id:"accueil",       label:"Tableau de bord",  icon:"🏠" },
    { id:"consultations", label:"Consultations",     icon:"📋", badge:enAttente },
    { id:"comptes",       label:"Gestion Personnel", icon:"👤" },
    { id:"presence",      label:"Suivi Présence",    icon:"🕐" },
    { id:"stats",         label:"Statistiques",      icon:"📊" },
  ]

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      {/* SIDEBAR */}
      {sidebarOpen&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute",left:0,top:0,bottom:0,width:260,background:C.white,boxShadow:"4px 0 20px rgba(0,0,0,0.1)",display:"flex",flexDirection:"column",overflow:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
              <img src={logo} alt="" style={{ width:40,height:40,borderRadius:8,objectFit:"cover" }}/>
              <div>
                <p style={{ fontSize:14,fontWeight:800,color:C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize:12,color:C.textSec }}>Espace médecin chef</p>
              </div>
            </div>
            <nav style={{ padding:"14px 12px",flex:1 }}>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setPage(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:12,border:"none",background:page===n.id?C.blueSoft:"transparent",color:page===n.id?C.blue:C.textSec,fontSize:14,fontWeight:page===n.id?700:500,cursor:"pointer",marginBottom:2,fontFamily:"inherit",textAlign:"left" }}
                  onMouseEnter={e=>{ if(page!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(page!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ fontSize:18 }}>{n.icon}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  {n.badge>0&&<span style={{ background:C.red,color:"#fff",fontSize:11,fontWeight:700,borderRadius:10,padding:"2px 7px" }}>{n.badge}</span>}
                </button>
              ))}
            </nav>
            <div style={{ padding:"12px 16px 18px",borderTop:"1px solid "+C.border,flexShrink:0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.amberSoft,borderRadius:12,border:"1px solid "+C.amber+"33" }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:C.amber,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:C.textPri }}>Dr. Doumbouya</p>
                  <p style={{ fontSize:11,color:C.amber,fontWeight:600 }}>★ Médecin chef · Médecine générale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white,borderBottom:"1px solid "+C.border,padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40,height:40,borderRadius:8,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5 }}>
          <div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/>
          <div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/>
          <div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/>
        </button>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          {enAttente>0&&(
            <button onClick={()=>setPage("consultations")}
              style={{ background:C.amberSoft,border:"1px solid "+C.amber+"44",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:700,color:C.amber,cursor:"pointer",fontFamily:"inherit" }}>
              ⏳ {enAttente} patient{enAttente>1?"s":""} en attente
            </button>
          )}
          <span style={{ fontSize:13,color:C.textSec,fontVariantNumeric:"tabular-nums" }}>{heure}</span>
          <button onClick={()=>{ setPointerHeure(new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})); setShowPointer(true) }}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,border:"1.5px solid "+C.green,background:C.white,color:C.green,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Pointer Arrivée
          </button>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>Dr. Doumbouya</p>
              <p style={{ fontSize:12,color:C.textSec }}>Médecin chef</p>
            </div>
            <div style={{ width:38,height:38,borderRadius:"50%",background:C.amberSoft,border:"2px solid "+C.amber+"33",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation pointer */}
      {showPointer&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ background:C.white,borderRadius:16,padding:32,maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width:60,height:60,borderRadius:"50%",background:C.greenSoft,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri,marginBottom:8 }}>Arrivée enregistrée</p>
            <p style={{ fontSize:14,color:C.textSec,marginBottom:8 }}>Dr. Doumbouya · Médecin chef</p>
            <p style={{ fontSize:28,fontWeight:800,color:C.green,marginBottom:20 }}>{pointerHeure}</p>
            <p style={{ fontSize:13,color:C.textMuted,marginBottom:24 }}>Votre heure d'arrivée est enregistrée et ne peut pas être modifiée.</p>
            <button onClick={()=>setShowPointer(false)} style={{ width:"100%",padding:"12px",background:C.blue,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Fermer</button>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <main style={{ padding:"32px 24px" }}>
        {page==="accueil"       && <PageAccueil       consultations={consultations} patients={INIT_PATIENTS} setPage={setPage} />}
        {page==="consultations" && <PageConsultations consultations={consultations} patients={INIT_PATIENTS} medecins={medecins} onValider={handleValider} onModifier={handleModifier} />}
        {page==="comptes"       && <PageComptes       comptes={comptes} setComptes={setComptes} medecins={medecins} setMedecins={setMedecins} />}
        {page==="presence"      && <PagePresence      medecins={medecins} />}
        {page==="stats"         && <PageStats         consultations={consultations} patients={INIT_PATIENTS} />}
      </main>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder,textarea::placeholder{color:#94a3b8}
        select option{background:#fff;color:#0f172a}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        button:focus{outline:none}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
      `}</style>
    </div>
  )
}