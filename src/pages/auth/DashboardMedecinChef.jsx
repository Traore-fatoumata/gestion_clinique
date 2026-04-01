import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
const today   = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
const fmt     = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"
const genId = seed => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let r = "CAB-", n = seed * 48271 + 1000003
  for (let i = 0; i < 6; i++) { n = (n * 1664525 + 1013904223) & 0x7fffffff; r += chars[n % chars.length] }
  return r
}

// ══════════════════════════════════════════════════════
//  DONNÉES
// ══════════════════════════════════════════════════════
const SERVICES = ["Médecine générale","Cardiologie","Diabétologie","Pédiatrie","Dermatologie","Gynécologie","Ophtalmologie","Neurologie","Orthopédie","Urgences"]

const INIT_MEDECINS = [
  { id:1, nom:"Dr. Doumbouya", prenom:"Amadou", specialite:"Médecine générale", email:"doumbouya@cab.gn", telephone:"+224 622 00 01 01", estChef:true,  statut:"actif",  creeLe:"2024-01-05" },
  { id:2, nom:"Dr. Camara",    prenom:"Ibrahima",specialite:"Cardiologie",       email:"camara@cab.gn",    telephone:"+224 622 00 02 02", estChef:false, statut:"actif",  creeLe:"2024-01-05" },
  { id:3, nom:"Dr. Barry",     prenom:"Mamadou", specialite:"Diabétologie",      email:"barry@cab.gn",     telephone:"+224 622 00 03 03", estChef:false, statut:"actif",  creeLe:"2024-02-10" },
  { id:4, nom:"Dr. Souaré",    prenom:"Fatoumata",specialite:"Pédiatrie",        email:"souare@cab.gn",    telephone:"+224 622 00 04 04", estChef:false, statut:"actif",  creeLe:"2024-03-01" },
  { id:5, nom:"Dr. Keïta",     prenom:"Sekou",   specialite:"Dermatologie",      email:"keita@cab.gn",     telephone:"+224 622 00 05 05", estChef:false, statut:"bloque", creeLe:"2024-03-15" },
]

const INIT_COMPTES = [
  { id:1, nom:"Mariama Diallo",   role:"secretaire", email:"sec1@cab.gn",    statut:"actif",  creeLe:"2025-01-10", dernConn:"2026-03-31 08:00" },
  { id:2, nom:"Fatoumata Bah",    role:"secretaire", email:"sec2@cab.gn",    statut:"actif",  creeLe:"2025-02-15", dernConn:"2026-03-30 17:30" },
  { id:3, nom:"Dr. Camara",       role:"medecin",    email:"camara@cab.gn",  statut:"actif",  creeLe:"2025-01-05", dernConn:"2026-03-31 07:55" },
  { id:4, nom:"Dr. Barry",        role:"medecin",    email:"barry@cab.gn",   statut:"actif",  creeLe:"2025-01-05", dernConn:"2026-03-31 08:10" },
  { id:5, nom:"Dr. Souaré",       role:"medecin",    email:"souare@cab.gn",  statut:"actif",  creeLe:"2025-01-05", dernConn:"2026-03-28 16:00" },
  { id:6, nom:"Dr. Keïta",        role:"medecin",    email:"keita@cab.gn",   statut:"bloque", creeLe:"2025-01-05", dernConn:"2026-03-20 12:00" },
  { id:7, nom:"Ibrahima Sow",     role:"infirmier",  email:"infirm@cab.gn",  statut:"actif",  creeLe:"2025-03-01", dernConn:"2026-03-31 07:45" },
  { id:8, nom:"Aissatou Kouyaté", role:"caissier",   email:"caisse@cab.gn",  statut:"actif",  creeLe:"2025-03-10", dernConn:"2026-03-31 08:30" },
]

const INIT_PATIENTS = [
  { id:1, pid:genId(1), nom:"Bah Mariama",     dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", adresse:"Ratoma" },
  { id:2, pid:genId(2), nom:"Diallo Ibrahima", dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", adresse:"Kaloum" },
  { id:3, pid:genId(3), nom:"Sow Fatoumata",   dateNaissance:"1996-11-20", sexe:"F", telephone:"+224 621 77 88 99", adresse:"Dixinn" },
  { id:4, pid:genId(4), nom:"Kouyaté Mamadou", dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", adresse:"Matam"  },
  { id:5, pid:genId(5), nom:"Baldé Aissatou",  dateNaissance:"2018-06-08", sexe:"F", telephone:"+224 625 66 77 88", adresse:"Matoto" },
]

const INIT_CONSULTATIONS = [
  { id:1,  patientId:1, date:"2025-01-15", motif:"Fièvre",          service:"Médecine générale", docteurId:1, statut:"paye",      paiement:"cash",  montant:50000,  signePar:"Dr. Doumbouya" },
  { id:2,  patientId:2, date:"2025-03-02", motif:"Suivi cardio",    service:"Cardiologie",        docteurId:2, statut:"paye",      paiement:"carte", montant:80000,  signePar:"Dr. Camara" },
  { id:3,  patientId:3, date:"2025-06-15", motif:"Gynécologie",     service:"Gynécologie",        docteurId:4, statut:"paye",      paiement:"cash",  montant:60000,  signePar:"Dr. Souaré" },
  { id:4,  patientId:4, date:"2025-09-20", motif:"Glycémie",        service:"Diabétologie",       docteurId:3, statut:"paye",      paiement:"cash",  montant:45000,  signePar:"Dr. Barry" },
  { id:5,  patientId:5, date:"2026-01-20", motif:"Pédiatrie",       service:"Pédiatrie",          docteurId:4, statut:"paye",      paiement:"carte", montant:55000,  signePar:"Dr. Souaré" },
  { id:6,  patientId:1, date:"2026-02-14", motif:"Grippe",          service:"Médecine générale", docteurId:1, statut:"paye",      paiement:"cash",  montant:40000,  signePar:"Dr. Doumbouya" },
  { id:7,  patientId:2, date:"2026-03-01", motif:"Suivi cardio",    service:"Cardiologie",        docteurId:2, statut:"en_attente",paiement:null,    montant:80000,  signePar:null },
  { id:8,  patientId:3, date:"2026-03-10", motif:"Contrôle",        service:"Gynécologie",        docteurId:4, statut:"en_attente",paiement:null,    montant:60000,  signePar:null },
  { id:9,  patientId:1, date:today(),      motif:"Consultation",    service:"Médecine générale", docteurId:null, statut:"en_attente",paiement:null,  montant:50000,  signePar:null },
  { id:10, patientId:4, date:today(),      motif:"Diabétologie",    service:"Diabétologie",       docteurId:null, statut:"en_attente",paiement:null,  montant:45000,  signePar:null },
]

const ROLES_LABEL = {
  secretaire:"Secrétaire", medecin:"Médecin", medecin_chef:"Médecin chef",
  infirmier:"Infirmier", caissier:"Caissier", pharmacien:"Pharmacien", laborantin:"Laborantin"
}

// ══════════════════════════════════════════════════════
//  COULEURS (fidèle à la maquette)
// ══════════════════════════════════════════════════════
const C = {
  bg:        "#f8f9fa",
  white:     "#ffffff",
  textPri:   "#0f172a",
  textSec:   "#64748b",
  textMuted: "#94a3b8",
  border:    "#e2e8f0",
  borderHov: "#cbd5e1",

  blue:      "#2563eb",  blueBg:    "#eff6ff",  blueSoft: "#dbeafe",
  green:     "#16a34a",  greenBg:   "#f0fdf4",  greenSoft:"#dcfce7",
  amber:     "#d97706",  amberBg:   "#fffbeb",  amberSoft:"#fef3c7",
  purple:    "#7c3aed",  purpleBg:  "#f5f3ff",  purpleSoft:"#ede9fe",
  orange:    "#ea580c",  orangeBg:  "#fff7ed",  orangeSoft:"#ffedd5",
  red:       "#dc2626",  redBg:     "#fef2f2",  redSoft:  "#fee2e2",
  slate:     "#475569",  slateBg:   "#f1f5f9",  slateSoft:"#e2e8f0",

  greenDark: "#0f4c2a",
}

// ══════════════════════════════════════════════════════
//  COMPOSANTS UI
// ══════════════════════════════════════════════════════
function StatutBadge({ statut }) {
  const cfg = {
    en_attente: { label:"En attente", color:C.amber,  bg:C.amberSoft },
    paye:       { label:"Payé",       color:C.green,  bg:C.greenSoft },
    non_signe:  { label:"Non signé",  color:C.red,    bg:C.redSoft   },
    actif:      { label:"Actif",      color:C.green,  bg:C.greenSoft },
    bloque:     { label:"Bloqué",     color:C.red,    bg:C.redSoft   },
    present:    { label:"Présent",    color:C.green,  bg:C.greenSoft },
    absent:     { label:"Absent",     color:C.red,    bg:C.redSoft   },
  }
  const s = cfg[statut] || { label:statut, color:C.slate, bg:C.slateSoft }
  return <span style={{ display:"inline-block", background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:`1px solid ${s.color}33` }}>{s.label}</span>
}

function RoleBadge({ role }) {
  const cfg = {
    secretaire:{ color:C.blue,   bg:C.blueSoft   },
    medecin:   { color:C.green,  bg:C.greenSoft  },
    infirmier: { color:C.purple, bg:C.purpleSoft },
    caissier:  { color:C.orange, bg:C.orangeSoft },
    pharmacien:{ color:C.amber,  bg:C.amberSoft  },
    laborantin:{ color:C.slate,  bg:C.slateSoft  },
  }
  const c = cfg[role] || { color:C.slate, bg:C.slateSoft }
  return <span style={{ display:"inline-block", background:c.bg, color:c.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>{ROLES_LABEL[role]||role}</span>
}

function IconCircle({ bg, children, size=52 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{children}</div>
}

function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>{children}</div>
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:15, fontWeight:700, color:C.textPri, marginBottom:3 }}>{title}</p>
      {sub && <p style={{ fontSize:13, color:C.textSec }}>{sub}</p>}
    </div>
  )
}

function Btn({ children, onClick, variant="primary", small=false, disabled=false, full=false }) {
  const cfg = {
    primary: { bg:C.blue,  hov:"#1d4ed8", color:"#fff", border:"none" },
    success: { bg:C.green, hov:"#15803d", color:"#fff", border:"none" },
    danger:  { bg:C.red,   hov:"#b91c1c", color:"#fff", border:"none" },
    outline: { bg:"transparent", hov:C.slateSoft, color:C.textSec, border:`1px solid ${C.border}` },
    ghost:   { bg:"transparent", hov:C.blueSoft,  color:C.blue,    border:"none" },
  }
  const s = cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled} style={{ background:s.bg, color:s.color, border:s.border, borderRadius:10, padding:small?"7px 16px":"11px 22px", fontSize:small?12:14, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:7, fontFamily:"inherit", transition:"all .2s", opacity:disabled?.55:1, width:full?"100%":"auto", justifyContent:full?"center":"flex-start" }}
      onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.background=s.hov; e.currentTarget.style.transform="translateY(-1px)" } }}
      onMouseLeave={e=>{ if(!disabled){ e.currentTarget.style.background=s.bg;  e.currentTarget.style.transform="none" } }}
    >{children}</button>
  )
}

function FInput({ label, req, children }) {
  return <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>{label}{req&&<span style={{ color:C.red }}> *</span>}</label>{children}</div>
}
function Inp({ value, onChange, placeholder, type="text" }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%", padding:"11px 14px", fontSize:14, border:`1.5px solid ${C.border}`, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }}
    onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.boxShadow=`0 0 0 3px ${C.blueSoft}` }}
    onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }} />
}
function Sel({ value, onChange, children }) {
  return <select value={value} onChange={onChange} style={{ width:"100%", padding:"11px 14px", fontSize:14, border:`1.5px solid ${C.border}`, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", cursor:"pointer" }}>{children}</select>
}
function Overlay({ children, onClose }) {
  return <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>{children}</div>
}
function Modal({ children, w=560, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:w, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        {children}
      </div>
    </Overlay>
  )
}
function ModalHead({ title, sub, onClose }) {
  return (
    <div style={{ padding:"22px 28px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>{title}</p>
        {sub && <p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>{sub}</p>}
      </div>
      <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:300 }}>×</button>
    </div>
  )
}

function Avatar({ name, size=40 }) {
  const bgs = [C.blueSoft, C.greenSoft, C.purpleSoft, C.amberSoft, C.orangeSoft]
  const fgs = [C.blue, C.green, C.purple, C.amber, C.orange]
  const i   = (name?.charCodeAt(0)||0) % bgs.length
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bgs[i], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M22 12c-4.418 0-8 1.79-8 4v4H2v-4c0-2.21 3.582-4 8-4s8 1.79 8 4"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL CRÉER MÉDECIN
// ══════════════════════════════════════════════════════
function ModalCreerMedecin({ onClose, onCreer }) {
  const [form, setForm] = useState({ nom:"", prenom:"", specialite:SERVICES[0], email:"", telephone:"", motDePasse:"" })
  const f = (k,v) => setForm(p=>({...p,[k]:v}))
  const ok = form.nom && form.prenom && form.email && form.motDePasse && form.telephone
  return (
    <Modal onClose={onClose} w={560}>
      <ModalHead title="Créer un compte médecin" sub="Le médecin recevra ses identifiants par email" onClose={onClose} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <FInput label="Nom" req><Inp value={form.nom} onChange={e=>f("nom",e.target.value)} placeholder="Ex : Camara" /></FInput>
          <FInput label="Prénom" req><Inp value={form.prenom} onChange={e=>f("prenom",e.target.value)} placeholder="Ex : Ibrahima" /></FInput>
        </div>
        <FInput label="Spécialité / Service" req>
          <Sel value={form.specialite} onChange={e=>f("specialite",e.target.value)}>
            {SERVICES.map(s=><option key={s}>{s}</option>)}
          </Sel>
        </FInput>
        <FInput label="Email professionnel" req><Inp type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="prenom.nom@cab.gn" /></FInput>
        <FInput label="Téléphone" req><Inp value={form.telephone} onChange={e=>f("telephone",e.target.value)} placeholder="+224 6XX XX XX XX" /></FInput>
        <FInput label="Mot de passe provisoire" req><Inp type="password" value={form.motDePasse} onChange={e=>f("motDePasse",e.target.value)} placeholder="Min. 8 caractères" /></FInput>
        <div style={{ background:C.blueSoft, border:`1px solid ${C.blue}33`, borderRadius:10, padding:"12px 16px" }}>
          <p style={{ fontSize:13, color:C.blue }}>ℹ️ Le médecin devra changer son mot de passe dès la première connexion.</p>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
          <Btn onClick={onClose} variant="outline">Annuler</Btn>
          <Btn onClick={()=>{ if(ok){ onCreer(form); onClose() } }} disabled={!ok} variant="primary">Créer le compte</Btn>
        </div>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL CRÉER AUTRE COMPTE
// ══════════════════════════════════════════════════════
function ModalCreerCompte({ onClose, onCreer }) {
  const [form, setForm] = useState({ nom:"", email:"", role:"secretaire", motDePasse:"" })
  const f = (k,v) => setForm(p=>({...p,[k]:v}))
  const roles = ["secretaire","infirmier","caissier","pharmacien","laborantin"]
  const ok = form.nom && form.email && form.motDePasse
  return (
    <Modal onClose={onClose} w={480}>
      <ModalHead title="Créer un compte utilisateur" sub="Seul le médecin chef peut créer des comptes" onClose={onClose} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>
        <FInput label="Nom complet" req><Inp value={form.nom} onChange={e=>f("nom",e.target.value)} placeholder="Ex : Mariama Diallo" /></FInput>
        <FInput label="Email" req><Inp type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="utilisateur@cab.gn" /></FInput>
        <FInput label="Rôle" req>
          <Sel value={form.role} onChange={e=>f("role",e.target.value)}>
            {roles.map(r=><option key={r} value={r}>{ROLES_LABEL[r]}</option>)}
          </Sel>
        </FInput>
        <FInput label="Mot de passe provisoire" req><Inp type="password" value={form.motDePasse} onChange={e=>f("motDePasse",e.target.value)} placeholder="Min. 8 caractères" /></FInput>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
          <Btn onClick={onClose} variant="outline">Annuler</Btn>
          <Btn onClick={()=>{ if(ok){ onCreer(form); onClose() } }} disabled={!ok} variant="primary">Créer</Btn>
        </div>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL ASSIGNER MÉDECIN
// ══════════════════════════════════════════════════════
function ModalAssigner({ consultation, patient, medecins, onClose, onAssigner }) {
  const [docteurId, setDocteurId] = useState("")
  if (!consultation||!patient) return null
  return (
    <Modal onClose={onClose} w={460}>
      <ModalHead title="Assigner un médecin" sub={`${patient.nom} · ${consultation.motif}`} onClose={onClose} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ background:C.slateSoft, borderRadius:12, padding:"14px 16px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[{l:"Patient",v:patient.nom},{l:"Motif",v:consultation.motif},{l:"Service",v:consultation.service},{l:"Arrivée",v:consultation.date===today()?"Aujourd'hui":fmt(consultation.date)}].map(({l,v})=>(
              <div key={l}><p style={{ fontSize:11, color:C.textMuted, marginBottom:2 }}>{l}</p><p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{v}</p></div>
            ))}
          </div>
        </div>
        <FInput label="Choisir le médecin" req>
          <Sel value={docteurId} onChange={e=>setDocteurId(e.target.value)}>
            <option value="">— Sélectionner un médecin —</option>
            {medecins.filter(d=>d.statut==="actif"&&!d.estChef).map(d=>(
              <option key={d.id} value={d.id}>{d.nom} · {d.specialite}</option>
            ))}
          </Sel>
        </FInput>
        <div style={{ background:C.amberSoft, border:`1px solid ${C.amber}33`, borderRadius:10, padding:"12px 16px" }}>
          <p style={{ fontSize:13, color:C.amber }}>⚠️ Seul le médecin chef peut assigner un patient. Cette action est enregistrée dans l&apos;audit.</p>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
          <Btn onClick={onClose} variant="outline">Annuler</Btn>
          <Btn onClick={()=>{ if(docteurId){ onAssigner(consultation.id,parseInt(docteurId)); onClose() } }} disabled={!docteurId} variant="success">Confirmer l&apos;assignation</Btn>
        </div>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL SIGNER CONSULTATION
// ══════════════════════════════════════════════════════
function ModalSigner({ consultation, patient, onClose, onSigner }) {
  const [notes, setNotes]         = useState(consultation?.notes||"")
  const [diagnostic, setDiag]     = useState("")
  const [traitement, setTrait]    = useState("")
  if (!consultation||!patient) return null
  const ok = diagnostic && traitement
  return (
    <Modal onClose={onClose} w={560}>
      <ModalHead title="Signer la consultation" sub={`${patient.nom} · ${fmt(consultation.date)}`} onClose={onClose} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ background:C.slateSoft, borderRadius:12, padding:"14px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[{l:"Patient",v:patient.nom},{l:"Service",v:consultation.service},{l:"Date",v:fmt(consultation.date)},{l:"Motif",v:consultation.motif}].map(({l,v})=>(
            <div key={l}><p style={{ fontSize:11, color:C.textMuted, marginBottom:2 }}>{l}</p><p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{v}</p></div>
          ))}
        </div>
        <FInput label="Observations / Notes">
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observations cliniques, examens réalisés…"
            style={{ width:"100%", padding:"11px 14px", fontSize:14, border:`1.5px solid ${C.border}`, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", resize:"vertical", minHeight:80 }} />
        </FInput>
        <FInput label="Diagnostic" req><Inp value={diagnostic} onChange={e=>setDiag(e.target.value)} placeholder="Ex : Hypertension artérielle" /></FInput>
        <FInput label="Traitement prescrit" req><Inp value={traitement} onChange={e=>setTrait(e.target.value)} placeholder="Ex : Paracétamol 500mg 3x/jour" /></FInput>
        <div style={{ background:C.redSoft, border:`1px solid ${C.red}33`, borderRadius:10, padding:"12px 16px" }}>
          <p style={{ fontSize:13, color:C.red }}>🔒 Signature obligatoire. Une consultation non signée est une anomalie détectée dans l&apos;audit.</p>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
          <Btn onClick={onClose} variant="outline">Annuler</Btn>
          <Btn onClick={()=>{ if(ok){ onSigner(consultation.id,notes,diagnostic,traitement); onClose() } }} disabled={!ok} variant="success">✍️ Signer</Btn>
        </div>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════
//  PAGE ACCUEIL (fidèle à la maquette)
// ══════════════════════════════════════════════════════
function PageAccueil({ consultations, patients, medecins, setPage }) {
  const consultAuj    = consultations.filter(c=>c.date===today())
  const totalPatients = patients.length
  const totalConsult  = consultations.length
  const consultAujNb  = consultAuj.length
  const totalMedecins = medecins.length
  const medecinsActifs = medecins.filter(m=>m.statut==="actif").length
  const recettesMois  = consultations.filter(c=>{ const d=new Date(c.date); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()&&c.statut==="paye" }).reduce((s,c)=>s+c.montant,0)
  const recettesAuj   = consultAuj.filter(c=>c.statut==="paye").reduce((s,c)=>s+c.montant,0)
  const recettesTot   = consultations.filter(c=>c.statut==="paye").reduce((s,c)=>s+c.montant,0)
  const cashNb        = consultations.filter(c=>c.paiement==="cash").length
  const carteNb       = consultations.filter(c=>c.paiement==="carte").length
  const recentes      = [...consultations].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)
  const nonAssignes   = consultations.filter(c=>c.date===today()&&!c.docteurId).length

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>

      {/* Alerte si patients non assignés */}
      {nonAssignes > 0 && (
        <div style={{ background:C.amberSoft, border:`1px solid ${C.amber}44`, borderRadius:12, padding:"14px 20px", marginBottom:24, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setPage("assignation")}>
          <span style={{ fontSize:20 }}>⏳</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.amber }}>{nonAssignes} patient{nonAssignes>1?"s":""} en attente d&apos;assignation</p>
            <p style={{ fontSize:13, color:"#92400e" }}>Cliquez pour assigner un médecin</p>
          </div>
          <span style={{ color:C.amber, fontSize:20, fontWeight:700 }}>→</span>
        </div>
      )}

      {/* KPI cards — exactement comme la maquette */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16, marginBottom:24 }}>
        {/* Patients Total */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Patients Total</p>
              <p style={{ fontSize:40, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:8 }}>{totalPatients}</p>
              <p style={{ fontSize:13, color:C.textMuted }}>Patients enregistrés</p>
            </div>
            <IconCircle bg={C.blueSoft} size={56}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </IconCircle>
          </div>
        </Card>

        {/* Consultations Aujourd'hui */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Consultations Aujourd&apos;hui</p>
              <p style={{ fontSize:40, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:8 }}>{consultAujNb}</p>
              <p style={{ fontSize:13, color:C.textMuted }}>Rendez-vous du jour</p>
            </div>
            <IconCircle bg={C.greenSoft} size={56}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </IconCircle>
          </div>
        </Card>

        {/* Consultations Total */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Consultations Total</p>
              <p style={{ fontSize:40, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:8 }}>{totalConsult}</p>
              <p style={{ fontSize:13, color:C.textMuted }}>Toutes les consultations</p>
            </div>
            <IconCircle bg={C.purpleSoft} size={56}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </IconCircle>
          </div>
        </Card>

        {/* Recettes du Mois */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Recettes du Mois</p>
              <p style={{ fontSize:40, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:8 }}>{(recettesMois/1000).toFixed(0)}K</p>
              <p style={{ fontSize:13, color:C.textMuted }}>FG</p>
            </div>
            <IconCircle bg={C.orangeSoft} size={56}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </IconCircle>
          </div>
        </Card>

        {/* Médecins Actifs */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Médecins Actifs</p>
              <p style={{ fontSize:40, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:8 }}>{medecinsActifs}</p>
              <p style={{ fontSize:13, color:C.textMuted }}>Sur {totalMedecins} total</p>
            </div>
            <IconCircle bg={C.greenSoft} size={56}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </IconCircle>
          </div>
        </Card>
      </div>

      {/* Consultations Récentes */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:"22px 24px 14px" }}>
          <SectionTitle title="Consultations Récentes" sub="Dernières consultations enregistrées" />
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {recentes.map((c,i)=>{
              const p = patients.find(pt=>pt.id===c.patientId)
              if (!p) return null
              return (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:i<recentes.length-1?`1px solid ${C.border}`:"none" }}>
                  <Avatar name={p.nom} size={42} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:C.textPri, marginBottom:2 }}>{p.nom}</p>
                    {c.motif && c.motif!==c.service && <p style={{ fontSize:13, color:C.textSec, marginBottom:2 }}>{c.motif}</p>}
                    <p style={{ fontSize:12, color:C.textMuted }}>
                      {c.date} &nbsp;
                      <span style={{ color:C.blue, fontWeight:600 }}>{c.service}</span>
                    </p>
                  </div>
                  <StatutBadge statut={c.statut} />
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Statistiques Financières */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:"22px 24px" }}>
          <SectionTitle title="Statistiques Financières" sub="Aperçu des recettes" />
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {/* Recettes aujourd'hui */}
            <div style={{ background:C.greenSoft, borderRadius:12, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:13, color:C.textSec, marginBottom:4 }}>Recettes Aujourd&apos;hui</p>
                <p style={{ fontSize:22, fontWeight:800, color:C.textPri }}>{recettesAuj.toLocaleString("fr-FR")} FG</p>
              </div>
              <IconCircle bg={C.green} size={46}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </IconCircle>
            </div>
            {/* Recettes totales */}
            <div style={{ background:C.blueSoft, borderRadius:12, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:13, color:C.textSec, marginBottom:4 }}>Recettes Totales</p>
                <p style={{ fontSize:22, fontWeight:800, color:C.textPri }}>{recettesTot.toLocaleString("fr-FR")} FG</p>
              </div>
              <IconCircle bg={C.blueSoft} size={46}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </IconCircle>
            </div>
            {/* Cash / Carte */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", textAlign:"center" }}>
                <p style={{ fontSize:12, color:C.textMuted, marginBottom:6 }}>Paiements Cash</p>
                <p style={{ fontSize:24, fontWeight:800, color:C.textPri }}>{cashNb}</p>
              </div>
              <div style={{ border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", textAlign:"center" }}>
                <p style={{ fontSize:12, color:C.textMuted, marginBottom:6 }}>Paiements Carte</p>
                <p style={{ fontSize:24, fontWeight:800, color:C.textPri }}>{carteNb}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bandeau bienvenue — fidèle maquette */}
      <div style={{ background:C.greenDark, borderRadius:16, padding:"22px 24px", display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
        <IconCircle bg={C.blue} size={50}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </IconCircle>
        <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:4 }}>Bienvenue, Dr. Doumbouya</p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>En tant qu&apos;administrateur, vous avez accès à toutes les fonctionnalités du système. Utilisez le menu latéral pour naviguer entre les différents services.</p>
        </div>
      </div>

      <p style={{ textAlign:"center", fontSize:12, color:C.textMuted, marginTop:20 }}>© 2026 Clinique Marouwana. Tous droits réservés.</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  PAGE STATISTIQUES
// ══════════════════════════════════════════════════════
function PageStats({ consultations, patients }) {
  const [periode, setPeriode] = useState("mois")
  const maintenant = new Date()

  const filtreDate = d => {
    const dp = new Date(d)
    if (periode==="jour")    return d===today()
    if (periode==="semaine") { const s=new Date(maintenant); s.setDate(s.getDate()-7);    return dp>=s }
    if (periode==="mois")    { const s=new Date(maintenant); s.setMonth(s.getMonth()-1);  return dp>=s }
    const s = new Date(maintenant); s.setFullYear(s.getFullYear()-1); return dp>=s
  }

  const cF = consultations.filter(c=>filtreDate(c.date))
  const payees    = cF.filter(c=>c.statut==="paye")
  const enAttente = cF.filter(c=>c.statut==="en_attente")
  const recettes  = payees.reduce((s,c)=>s+c.montant,0)
  const cashNb    = payees.filter(c=>c.paiement==="cash").length
  const carteNb   = payees.filter(c=>c.paiement==="carte").length

  const parService = SERVICES.map(s=>({ service:s, nb:cF.filter(c=>c.service===s).length })).filter(x=>x.nb>0).sort((a,b)=>b.nb-a.nb)
  const total = cF.length||1

  const femmes = cF.filter(c=>{ const p=patients.find(pt=>pt.id===c.patientId); return p?.sexe==="F" }).length
  const hommes = cF.length - femmes

  const FILTRES = [{id:"jour",l:"Aujourd'hui"},{id:"semaine",l:"Semaine"},{id:"mois",l:"Mois"},{id:"annee",l:"Année"}]

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <p style={{ fontSize:22, fontWeight:800, color:C.textPri }}>Statistiques</p>
          <p style={{ fontSize:14, color:C.textSec }}>Analyse de l&apos;activité de la clinique</p>
        </div>
        <div style={{ display:"flex", gap:4, background:C.slateSoft, borderRadius:12, padding:4 }}>
          {FILTRES.map(f=>(
            <button key={f.id} onClick={()=>setPeriode(f.id)} style={{ padding:"8px 16px", borderRadius:9, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", background:periode===f.id?"#fff":    "transparent", color:periode===f.id?C.blue:C.textSec, boxShadow:periode===f.id?"0 1px 4px rgba(0,0,0,0.1)":"none", transition:"all .2s" }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total consultations", val:cF.length,      color:C.blue,   bg:C.blueSoft   },
          { label:"Consultations payées",val:payees.length,  color:C.green,  bg:C.greenSoft  },
          { label:"En attente",          val:enAttente.length,color:C.amber, bg:C.amberSoft  },
          { label:"Recettes (FG)",       val:`${(recettes/1000).toFixed(0)}K`,color:C.orange,bg:C.orangeSoft },
        ].map(({ label, val, color, bg })=>(
          <Card key={label} style={{ padding:"20px" }}>
            <div style={{ width:36, height:36, borderRadius:9, background:bg, marginBottom:12 }} />
            <p style={{ fontSize:26, fontWeight:800, color, letterSpacing:"-0.5px" }}>{val}</p>
            <p style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>{label}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16, marginBottom:16 }}>
        {/* Par service */}
        <Card>
          <div style={{ padding:"22px 24px" }}>
            <SectionTitle title="Consultations par service" />
            {parService.length===0
              ? <p style={{ color:C.textMuted, textAlign:"center", padding:20 }}>Aucune donnée pour cette période</p>
              : parService.map(({ service, nb })=>{
                const pct = Math.round(nb/total*100)
                const colors = [C.blue,C.green,C.purple,C.orange,C.amber,C.red]
                const color  = colors[SERVICES.indexOf(service)%colors.length]
                return (
                  <div key={service} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:13, color:C.textPri, fontWeight:500 }}>{service}</span>
                      <span style={{ fontSize:13, fontWeight:700, color }}>{nb} · {pct}%</span>
                    </div>
                    <div style={{ height:7, background:C.slateSoft, borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:4, transition:"width .5s" }} />
                    </div>
                  </div>
                )
              })
            }
          </div>
        </Card>

        {/* Finances & répartition */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card style={{ padding:"20px" }}>
            <SectionTitle title="Paiements" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ background:C.greenSoft, borderRadius:10, padding:"14px", textAlign:"center" }}>
                <p style={{ fontSize:11, color:C.textMuted, marginBottom:6 }}>Cash</p>
                <p style={{ fontSize:24, fontWeight:800, color:C.green }}>{cashNb}</p>
              </div>
              <div style={{ background:C.blueSoft, borderRadius:10, padding:"14px", textAlign:"center" }}>
                <p style={{ fontSize:11, color:C.textMuted, marginBottom:6 }}>Carte</p>
                <p style={{ fontSize:24, fontWeight:800, color:C.blue }}>{carteNb}</p>
              </div>
            </div>
            <div style={{ marginTop:12, padding:"12px 14px", background:C.slateSoft, borderRadius:10 }}>
              <p style={{ fontSize:12, color:C.textMuted }}>Total recettes</p>
              <p style={{ fontSize:20, fontWeight:800, color:C.textPri }}>{recettes.toLocaleString("fr-FR")} FG</p>
            </div>
          </Card>

          <Card style={{ padding:"20px" }}>
            <SectionTitle title="Répartition" />
            <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              <div style={{ flex:1, background:C.purpleSoft, borderRadius:10, padding:"12px", textAlign:"center" }}>
                <p style={{ fontSize:11, color:C.textMuted }}>Femmes</p>
                <p style={{ fontSize:22, fontWeight:800, color:C.purple }}>{femmes}</p>
                <p style={{ fontSize:11, color:C.purple }}>{Math.round(femmes/total*100)}%</p>
              </div>
              <div style={{ flex:1, background:C.blueSoft, borderRadius:10, padding:"12px", textAlign:"center" }}>
                <p style={{ fontSize:11, color:C.textMuted }}>Hommes</p>
                <p style={{ fontSize:22, fontWeight:800, color:C.blue }}>{hommes}</p>
                <p style={{ fontSize:11, color:C.blue }}>{Math.round(hommes/total*100)}%</p>
              </div>
            </div>
            <div style={{ height:8, borderRadius:4, overflow:"hidden", display:"flex" }}>
              <div style={{ width:`${Math.round(femmes/total*100)}%`, background:C.purple }} />
              <div style={{ flex:1, background:C.blue }} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  PAGE ASSIGNATION
// ══════════════════════════════════════════════════════
function PageAssignation({ consultations, patients, medecins, onAssigner }) {
  const [mAssigner, setMAssigner] = useState(null)
  const enAttente = consultations.filter(c=>c.date===today()&&!c.docteurId)
  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <p style={{ fontSize:22, fontWeight:800, color:C.textPri, marginBottom:6 }}>Assignation des patients</p>
      <p style={{ fontSize:14, color:C.textSec, marginBottom:24 }}>Attribuez un médecin à chaque patient en attente</p>

      {mAssigner && <ModalAssigner consultation={mAssigner} patient={patients.find(p=>p.id===mAssigner.patientId)} medecins={medecins} onClose={()=>setMAssigner(null)} onAssigner={onAssigner} />}

      {enAttente.length===0
        ? <Card style={{ padding:40, textAlign:"center" }}><p style={{ fontSize:16, color:C.textMuted }}>✅ Tous les patients du jour ont un médecin assigné</p></Card>
        : (
          <Card style={{ marginBottom:20 }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
              <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Patients sans médecin — {enAttente.length} en attente</p>
            </div>
            {enAttente.map((c,i)=>{
              const p = patients.find(pt=>pt.id===c.patientId)
              if (!p) return null
              return (
                <div key={c.id} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, borderBottom:i<enAttente.length-1?`1px solid ${C.border}`:"none" }}>
                  <Avatar name={p.nom} size={42} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{p.nom}</p>
                    <p style={{ fontSize:13, color:C.textSec }}>{c.motif} · <span style={{ color:C.blue }}>{c.service}</span></p>
                  </div>
                  <StatutBadge statut="en_attente" />
                  <Btn onClick={()=>setMAssigner(c)} small variant="primary">👨‍⚕️ Assigner</Btn>
                </div>
              )
            })}
          </Card>
        )
      }

      {/* Toutes les consultations du jour */}
      <Card>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Toutes les consultations du jour</p>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.slateSoft }}>
              {["Patient","Service","Médecin assigné","Statut","Action"].map(h=>(
                <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:C.textSec, letterSpacing:"0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consultations.filter(c=>c.date===today()).map((c,i,arr)=>{
              const p  = patients.find(pt=>pt.id===c.patientId)
              const dr = medecins.find(d=>d.id===c.docteurId)
              if (!p) return null
              return (
                <tr key={c.id} style={{ borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={p.nom} size={32} />
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                        <p style={{ fontSize:11, color:C.textMuted }}>{c.motif}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px" }}><span style={{ fontSize:13, color:C.blue, fontWeight:500 }}>{c.service}</span></td>
                  <td style={{ padding:"13px 16px", fontSize:13, color:dr?C.textPri:C.red, fontWeight:dr?400:600 }}>{dr?dr.nom:"Non assigné"}</td>
                  <td style={{ padding:"13px 16px" }}><StatutBadge statut={c.statut} /></td>
                  <td style={{ padding:"13px 16px" }}>
                    {!c.docteurId && <Btn onClick={()=>setMAssigner(c)} small variant="primary">Assigner</Btn>}
                  </td>
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
//  PAGE COMPTES
// ══════════════════════════════════════════════════════
function PageComptes({ comptes, setComptes, medecins, setMedecins }) {
  const [tab, setTab]           = useState("medecins")
  const [showMedecin, setShowMedecin] = useState(false)
  const [showCompte, setShowCompte]   = useState(false)

  const toggleStatutCompte = id => setComptes(prev=>prev.map(c=>c.id===id?{...c,statut:c.statut==="actif"?"bloque":"actif"}:c))
  const toggleStatutMedecin= id => setMedecins(prev=>prev.map(d=>d.id===id?{...d,statut:d.statut==="actif"?"bloque":"actif"}:d))

  const handleCreerMedecin = form => {
    const nm = { id:medecins.length+1, nom:`Dr. ${form.nom}`, prenom:form.prenom, specialite:form.specialite, email:form.email, telephone:form.telephone, estChef:false, statut:"actif", creeLe:today() }
    setMedecins(prev=>[...prev,nm])
  }
  const handleCreerCompte = form => {
    const nc = { id:comptes.length+1, nom:form.nom, role:form.role, email:form.email, statut:"actif", creeLe:today(), dernConn:"Jamais" }
    setComptes(prev=>[...prev,nc])
  }

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      {showMedecin && <ModalCreerMedecin onClose={()=>setShowMedecin(false)} onCreer={handleCreerMedecin} />}
      {showCompte  && <ModalCreerCompte  onClose={()=>setShowCompte(false)}  onCreer={handleCreerCompte}  />}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <p style={{ fontSize:22, fontWeight:800, color:C.textPri }}>Gestion des comptes</p>
          <p style={{ fontSize:14, color:C.textSec }}>Créer, activer ou bloquer les accès</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn onClick={()=>setShowMedecin(true)} variant="success" small>+ Nouveau médecin</Btn>
          <Btn onClick={()=>setShowCompte(true)} variant="primary" small>+ Autre compte</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:20 }}>
        {[{id:"medecins",l:"Médecins"},{id:"autres",l:"Autres utilisateurs"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"12px 24px", border:"none", background:"none", cursor:"pointer", fontSize:14, fontWeight:tab===t.id?700:500, color:tab===t.id?C.blue:C.textSec, borderBottom:tab===t.id?`2px solid ${C.blue}`:"2px solid transparent", fontFamily:"inherit" }}>{t.l}</button>
        ))}
      </div>

      {tab==="medecins" && (
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.slateSoft }}>
                {["Médecin","Spécialité","Email","Téléphone","Depuis","Statut","Action"].map(h=>(
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:C.textSec }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medecins.map((d,i)=>(
                <tr key={d.id} style={{ borderBottom:i<medecins.length-1?`1px solid ${C.border}`:"none", opacity:d.statut==="bloque"?.6:1 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={d.nom} size={34} />
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{d.nom}</p>
                          {d.estChef && <span style={{ fontSize:10, background:C.amberSoft, color:C.amber, padding:"2px 7px", borderRadius:10, fontWeight:700 }}>CHEF</span>}
                        </div>
                        <p style={{ fontSize:11, color:C.textMuted }}>{d.prenom}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px", fontSize:13, color:C.blue, fontWeight:500 }}>{d.specialite}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{d.email}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{d.telephone}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{fmt(d.creeLe)}</td>
                  <td style={{ padding:"13px 16px" }}><StatutBadge statut={d.statut} /></td>
                  <td style={{ padding:"13px 16px" }}>
                    {!d.estChef && (
                      <button onClick={()=>toggleStatutMedecin(d.id)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${d.statut==="actif"?C.red:C.green}`, background:"transparent", color:d.statut==="actif"?C.red:C.green, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                        {d.statut==="actif"?"Bloquer":"Débloquer"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab==="autres" && (
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.slateSoft }}>
                {["Utilisateur","Rôle","Email","Créé le","Dernière connexion","Statut","Action"].map(h=>(
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:C.textSec }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comptes.map((c,i)=>(
                <tr key={c.id} style={{ borderBottom:i<comptes.length-1?`1px solid ${C.border}`:"none", opacity:c.statut==="bloque"?.6:1 }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={c.nom} size={32} />
                      <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{c.nom}</p>
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px" }}><RoleBadge role={c.role} /></td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{c.email}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{fmt(c.creeLe)}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{c.dernConn}</td>
                  <td style={{ padding:"13px 16px" }}><StatutBadge statut={c.statut} /></td>
                  <td style={{ padding:"13px 16px" }}>
                    <button onClick={()=>toggleStatutCompte(c.id)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${c.statut==="actif"?C.red:C.green}`, background:"transparent", color:c.statut==="actif"?C.red:C.green, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
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
//  PAGE CONSULTATIONS
// ══════════════════════════════════════════════════════
function PageConsultations({ consultations, patients, medecins, onSigner }) {
  const [mSign, setMSign] = useState(null)
  const nonSignees = consultations.filter(c=>c.statut==="en_attente"&&c.docteurId)

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:22, fontWeight:800, color:C.textPri, marginBottom:6 }}>Consultations</p>
      <p style={{ fontSize:14, color:C.textSec, marginBottom:24 }}>Suivi et signature des consultations</p>

      {mSign && <ModalSigner consultation={mSign} patient={patients.find(p=>p.id===mSign.patientId)} onClose={()=>setMSign(null)} onSigner={(id,notes,diag,trait)=>{ onSigner(id,notes,diag,trait); setMSign(null) }} />}

      {nonSignees.length > 0 && (
        <div style={{ background:C.redSoft, border:`1px solid ${C.red}33`, borderRadius:12, padding:"14px 20px", marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:700, color:C.red, marginBottom:2 }}>🔒 {nonSignees.length} consultation{nonSignees.length>1?"s":""} non signée{nonSignees.length>1?"s":""}</p>
          <p style={{ fontSize:13, color:"#991b1b" }}>Ces consultations ont été effectuées sans signature — anomalie détectée</p>
        </div>
      )}

      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.slateSoft }}>
              {["Patient","Date","Service","Médecin","Montant","Paiement","Statut","Action"].map(h=>(
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:C.textSec }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...consultations].sort((a,b)=>b.date.localeCompare(a.date)).map((c,i,arr)=>{
              const p  = patients.find(pt=>pt.id===c.patientId)
              const dr = medecins.find(d=>d.id===c.docteurId)
              if (!p) return null
              return (
                <tr key={c.id} style={{ borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none", background:c.statut==="en_attente"&&c.docteurId?"#fff9f9":"transparent" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background=c.statut==="en_attente"&&c.docteurId?"#fff9f9":"transparent"}>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={p.nom} size={32} />
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                        <p style={{ fontSize:11, color:C.textMuted }}>{c.motif}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{fmt(c.date)}</td>
                  <td style={{ padding:"13px 16px" }}><span style={{ fontSize:13, color:C.blue, fontWeight:500 }}>{c.service}</span></td>
                  <td style={{ padding:"13px 16px", fontSize:13, color:C.textPri }}>{dr?dr.nom:<span style={{ color:C.red }}>Non assigné</span>}</td>
                  <td style={{ padding:"13px 16px", fontSize:13, fontWeight:600, color:C.textPri }}>{c.montant.toLocaleString("fr-FR")} FG</td>
                  <td style={{ padding:"13px 16px" }}>
                    {c.paiement
                      ? <span style={{ fontSize:12, fontWeight:600, color:c.paiement==="cash"?C.green:C.blue, background:c.paiement==="cash"?C.greenSoft:C.blueSoft, padding:"3px 10px", borderRadius:12 }}>{c.paiement==="cash"?"Cash":"Carte"}</span>
                      : <span style={{ fontSize:12, color:C.textMuted }}>—</span>
                    }
                  </td>
                  <td style={{ padding:"13px 16px" }}><StatutBadge statut={c.statut} /></td>
                  <td style={{ padding:"13px 16px" }}>
                    {c.statut==="en_attente"&&c.docteurId && <Btn onClick={()=>setMSign(c)} small variant="success">✍️ Signer</Btn>}
                    {c.signePar && <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>✓ {c.signePar}</span>}
                  </td>
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
  const [page, setPage]                   = useState("accueil")
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [consultations, setConsultations] = useState(INIT_CONSULTATIONS)
  const [comptes, setComptes]             = useState(INIT_COMPTES)
  const [medecins, setMedecins]           = useState(INIT_MEDECINS)
  const [heure, setHeure]                 = useState("")
  const [showPointer, setShowPointer]     = useState(false)
  const [pointerHeure, setPointerHeure]   = useState(null)

  useEffect(()=>{
    const tick=()=>setHeure(new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  const handleAssigner = (consultId, docteurId) => {
    setConsultations(prev=>prev.map(c=>c.id===consultId?{...c,docteurId}:c))
  }
  const handleSigner = (consultId, notes, diagnostic, traitement) => {
    const ts = new Date().toLocaleString("fr-FR")
    setConsultations(prev=>prev.map(c=>c.id===consultId?{...c,statut:"paye",paiement:"cash",notes:`${notes} | Diag: ${diagnostic} | Trait: ${traitement}`,signePar:"Dr. Doumbouya",signeLe:ts}:c))
  }

  const nonAssignes = consultations.filter(c=>c.date===today()&&!c.docteurId).length
  const nonSigne    = consultations.filter(c=>c.statut==="en_attente"&&c.docteurId).length

  const NAV = [
    { id:"accueil",        label:"Tableau de bord",   icon:"🏠" },
    { id:"assignation",    label:"Assignation",        icon:"👨‍⚕️", badge:nonAssignes },
    { id:"consultations",  label:"Consultations",      icon:"📋", badge:nonSigne },
    { id:"stats",          label:"Statistiques",       icon:"📊" },
    { id:"comptes",        label:"Gestion comptes",    icon:"👤" },
  ]

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:260, background:C.white, boxShadow:"4px 0 20px rgba(0,0,0,0.1)", padding:"24px 16px" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${C.border}` }}>
              <img src={logo} alt="" style={{ width:40, height:40, borderRadius:8, objectFit:"cover" }} />
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.textPri }}>Clinique Marouane</p>
                <p style={{ fontSize:12, color:C.textSec }}>Système de gestion</p>
              </div>
            </div>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>{ setPage(n.id); setSidebarOpen(false) }} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:"none", background:page===n.id?C.blueSoft:"transparent", color:page===n.id?C.blue:C.textSec, fontSize:14, fontWeight:page===n.id?700:500, cursor:"pointer", marginBottom:4, fontFamily:"inherit", textAlign:"left" }}>
                <span style={{ fontSize:18 }}>{n.icon}</span>
                <span style={{ flex:1 }}>{n.label}</span>
                {n.badge>0 && <span style={{ background:C.red, color:"#fff", fontSize:11, fontWeight:700, borderRadius:10, padding:"2px 7px" }}>{n.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HEADER — fidèle à la maquette */}
      <header style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* Menu hamburger */}
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40, height:40, borderRadius:8, border:`1px solid ${C.border}`, background:C.white, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:5 }}>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {/* Horloge */}
          <span style={{ fontSize:13, color:C.textSec, fontVariantNumeric:"tabular-nums" }}>{heure}</span>

          {/* Bouton Pointer Arrivée — exactement comme la maquette */}
          <button onClick={()=>{ const t=nowTime(); setPointerHeure(t); setShowPointer(true) }} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:10, border:`1.5px solid ${C.green}`, background:C.white, color:C.green, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Pointer Arrivée
          </button>

          {/* Profil */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:14, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>Dr. Amadou Koné</p>
              <p style={{ fontSize:12, color:C.textSec }}>Administration</p>
            </div>
            <div style={{ width:38, height:38, borderRadius:"50%", background:C.blueSoft, border:`2px solid ${C.blue}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation pointer */}
      {showPointer && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.white, borderRadius:16, padding:32, maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:C.greenSoft, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize:18, fontWeight:800, color:C.textPri, marginBottom:8 }}>Arrivée enregistrée</p>
            <p style={{ fontSize:14, color:C.textSec, marginBottom:8 }}>Dr. Amadou Koné</p>
            <p style={{ fontSize:24, fontWeight:800, color:C.green, marginBottom:20 }}>{pointerHeure}</p>
            <p style={{ fontSize:13, color:C.textMuted, marginBottom:24 }}>Votre heure d&apos;arrivée a été enregistrée par le système et ne peut pas être modifiée.</p>
            <Btn onClick={()=>setShowPointer(false)} variant="primary" full>Fermer</Btn>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main style={{ padding:"32px 24px" }}>
        {/* Titre de page */}
        {page==="accueil" && (
          <div style={{ marginBottom:28 }}>
            <p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:6 }}>Tableau de Bord Administrateur</p>
            <p style={{ fontSize:15, color:C.textSec }}>Vue d&apos;ensemble de l&apos;activité de la clinique</p>
          </div>
        )}

        {page==="accueil" && <PageAccueil consultations={consultations} patients={INIT_PATIENTS} medecins={medecins} setPage={setPage} />}
        {page==="assignation" && <PageAssignation consultations={consultations} patients={INIT_PATIENTS} medecins={medecins} onAssigner={handleAssigner} />}
        {page==="consultations" && <PageConsultations consultations={consultations} patients={INIT_PATIENTS} medecins={medecins} onSigner={handleSigner} />}
        {page==="stats" && <PageStats consultations={consultations} patients={INIT_PATIENTS} />}
        {page==="comptes" && <PageComptes comptes={comptes} setComptes={setComptes} medecins={medecins} setMedecins={setMedecins} />}
      </main>

      <style>{`
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