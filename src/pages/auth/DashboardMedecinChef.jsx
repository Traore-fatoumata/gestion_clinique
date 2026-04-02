import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"

const today   = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })
const fmt     = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

const SERVICES = ["Médecine générale","Cardiologie","Diabétologie","Pédiatrie","Dermatologie","Gynécologie","Ophtalmologie","Neurologie","Orthopédie","Urgences"]

const INIT_MEDECINS = [
  { id:1, nom:"Dr. Doumbouya", prenom:"Amadou",   specialite:"Médecine générale", email:"doumbouya@cab.gn", telephone:"+224 622 00 01 01", estChef:true,  statut:"actif",  creeLe:"2024-01-05" },
  { id:2, nom:"Dr. Camara",    prenom:"Ibrahima",  specialite:"Cardiologie",       email:"camara@cab.gn",    telephone:"+224 622 00 02 02", estChef:false, statut:"actif",  creeLe:"2024-01-05" },
  { id:3, nom:"Dr. Barry",     prenom:"Mamadou",   specialite:"Diabétologie",      email:"barry@cab.gn",     telephone:"+224 622 00 03 03", estChef:false, statut:"actif",  creeLe:"2024-02-10" },
  { id:4, nom:"Dr. Souaré",    prenom:"Fatoumata", specialite:"Pédiatrie",         email:"souare@cab.gn",    telephone:"+224 622 00 04 04", estChef:false, statut:"actif",  creeLe:"2024-03-01" },
  { id:5, nom:"Dr. Keïta",     prenom:"Sekou",     specialite:"Dermatologie",      email:"keita@cab.gn",     telephone:"+224 622 00 05 05", estChef:false, statut:"bloque", creeLe:"2024-03-15" },
]

const INIT_COMPTES = [
  { id:1, nom:"Mariama Diallo",   role:"secretaire", email:"sec1@cab.gn",   statut:"actif",  creeLe:"2025-01-10", dernConn:"2026-03-31 08:00" },
  { id:2, nom:"Fatoumata Bah",    role:"secretaire", email:"sec2@cab.gn",   statut:"actif",  creeLe:"2025-02-15", dernConn:"2026-03-30 17:30" },
  { id:3, nom:"Ibrahima Sow",     role:"infirmier",  email:"infirm@cab.gn", statut:"actif",  creeLe:"2025-03-01", dernConn:"2026-03-31 07:45" },
  { id:4, nom:"Aissatou Kouyaté", role:"caissier",   email:"caisse@cab.gn", statut:"actif",  creeLe:"2025-03-10", dernConn:"2026-03-31 08:30" },
]

const INIT_PATIENTS = [
  { id:1, pid:"CAB-A1B2C3", nom:"Bah Mariama",     dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", adresse:"Ratoma"  },
  { id:2, pid:"CAB-D4E5F6", nom:"Diallo Ibrahima", dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", adresse:"Kaloum"  },
  { id:3, pid:"CAB-G7H8I9", nom:"Sow Fatoumata",   dateNaissance:"1996-11-20", sexe:"F", telephone:"+224 621 77 88 99", adresse:"Dixinn"  },
  { id:4, pid:"CAB-J1K2L3", nom:"Kouyaté Mamadou", dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", adresse:"Matam"   },
  { id:5, pid:"CAB-M4N5O6", nom:"Baldé Aissatou",  dateNaissance:"2018-06-08", sexe:"F", telephone:"+224 625 66 77 88", adresse:"Matoto"  },
]

const INIT_CONSULTATIONS = [
  { id:1,  patientId:1, date:"2025-01-15", motif:"Fièvre",         service:"Médecine générale", docteurId:1, statut:"paye",      paiement:"cash",  montant:50000, signePar:"Dr. Doumbouya" },
  { id:2,  patientId:2, date:"2025-03-02", motif:"Suivi cardio",   service:"Cardiologie",        docteurId:2, statut:"paye",      paiement:"carte", montant:80000, signePar:"Dr. Camara" },
  { id:3,  patientId:3, date:"2025-06-15", motif:"Gynécologie",    service:"Gynécologie",        docteurId:4, statut:"paye",      paiement:"cash",  montant:60000, signePar:"Dr. Souaré" },
  { id:4,  patientId:4, date:"2025-09-20", motif:"Glycémie",       service:"Diabétologie",       docteurId:3, statut:"paye",      paiement:"cash",  montant:45000, signePar:"Dr. Barry" },
  { id:5,  patientId:5, date:"2026-01-20", motif:"Pédiatrie",      service:"Pédiatrie",          docteurId:4, statut:"paye",      paiement:"carte", montant:55000, signePar:"Dr. Souaré" },
  { id:6,  patientId:1, date:"2026-02-14", motif:"Grippe",         service:"Médecine générale", docteurId:1, statut:"paye",      paiement:"cash",  montant:40000, signePar:"Dr. Doumbouya" },
  { id:7,  patientId:2, date:"2026-03-01", motif:"Suivi cardio",   service:"Cardiologie",        docteurId:2, statut:"en_attente",paiement:null,    montant:80000, signePar:null },
  { id:8,  patientId:3, date:"2026-03-10", motif:"Contrôle",       service:"Gynécologie",        docteurId:4, statut:"en_attente",paiement:null,    montant:60000, signePar:null },
  { id:9,  patientId:1, date:today(),      motif:"Consultation",   service:"Médecine générale", docteurId:null, statut:"en_attente",paiement:null,  montant:50000, signePar:null },
  { id:10, patientId:4, date:today(),      motif:"Diabétologie",   service:"Diabétologie",       docteurId:null, statut:"en_attente",paiement:null,  montant:45000, signePar:null },
]

const ROLES_LABEL = { secretaire:"Secrétaire", medecin:"Médecin", infirmier:"Infirmier", caissier:"Caissier", pharmacien:"Pharmacien", laborantin:"Laborantin" }

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

// ── Composants de base ──
function StatutBadge({ statut }) {
  const cfg = {
    en_attente:{ label:"En attente", color:C.amber, bg:C.amberSoft },
    paye:      { label:"Payé",       color:C.green, bg:C.greenSoft },
    actif:     { label:"Actif",      color:C.green, bg:C.greenSoft },
    bloque:    { label:"Bloqué",     color:C.red,   bg:C.redSoft   },
  }
  const s = cfg[statut] || { label:statut, color:C.slate, bg:C.slateSoft }
  return <span style={{ display:"inline-block", background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33" }}>{s.label}</span>
}

function RoleBadge({ role }) {
  const cfg = { secretaire:{ color:C.blue,   bg:C.blueSoft   }, medecin:{ color:C.green, bg:C.greenSoft }, infirmier:{ color:C.purple,bg:C.purpleSoft }, caissier:{ color:C.orange,bg:C.orangeSoft } }
  const c = cfg[role] || { color:C.slate, bg:C.slateSoft }
  return <span style={{ display:"inline-block", background:c.bg, color:c.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>{ROLES_LABEL[role]||role}</span>
}

function IconCircle({ bg, children, size=52 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{children}</div>
}

function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>{children}</div>
}

function CardHeader({ title, sub, action }) {
  return (
    <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <p style={{ fontWeight:700, fontSize:15, color:C.textPri, marginBottom:sub?2:0 }}>{title}</p>
        {sub && <p style={{ fontSize:13, color:C.textMuted }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
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
    primary:  { bg:C.blue,  hov:"#1d4ed8", color:"#fff", border:"none" },
    success:  { bg:C.green, hov:"#15803d", color:"#fff", border:"none" },
    danger:   { bg:C.red,   hov:"#b91c1c", color:"#fff", border:"none" },
    outline:  { bg:"transparent", hov:C.slateSoft, color:C.textSec, border:"1px solid "+C.border },
  }
  const s = cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:s.bg, color:s.color, border:s.border||"none", borderRadius:10, padding:small?"7px 16px":"11px 22px", fontSize:small?12:14, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:7, fontFamily:"inherit", transition:"all .2s", opacity:disabled?.55:1, width:full?"100%":"auto", justifyContent:full?"center":"flex-start" }}
      onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.background=s.hov } }}
      onMouseLeave={e=>{ if(!disabled){ e.currentTarget.style.background=s.bg  } }}
    >{children}</button>
  )
}

function FInput({ label, req, children }) {
  return <div><label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPri, marginBottom:6 }}>{label}{req&&<span style={{ color:C.red }}> *</span>}</label>{children}</div>
}
function Inp({ value, onChange, placeholder, type="text" }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }}
    onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }}
    onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }} />
}
function Sel({ value, onChange, children }) {
  return <select value={value} onChange={onChange} style={{ width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", cursor:"pointer" }}>{children}</select>
}
function Overlay({ children, onClose }) {
  return <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>{children}</div>
}
function Modal({ children, w=560, onClose }) {
  return <Overlay onClose={onClose}><div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:w, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>{children}</div></Overlay>
}
function ModalHead({ title, sub, onClose }) {
  return (
    <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>{title}</p>
        {sub && <p style={{ fontSize:13, color:C.textSec, marginTop:3 }}>{sub}</p>}
      </div>
      <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
    </div>
  )
}
function Avatar({ name, size=40 }) {
  const bgs = [C.blueSoft,C.greenSoft,C.purpleSoft,C.amberSoft,C.orangeSoft]
  const fgs = [C.blue,C.green,C.purple,C.amber,C.orange]
  const i   = (name?.charCodeAt(0)||0) % bgs.length
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bgs[i], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M22 12c-4.418 0-8 1.79-8 4v4H2v-4c0-2.21 3.582-4 8-4s8 1.79 8 4"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}

// ── Modals ──
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
        <FInput label="Spécialité" req><Sel value={form.specialite} onChange={e=>f("specialite",e.target.value)}>{SERVICES.map(s=><option key={s}>{s}</option>)}</Sel></FInput>
        <FInput label="Email" req><Inp type="email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="prenom.nom@cab.gn" /></FInput>
        <FInput label="Téléphone" req><Inp value={form.telephone} onChange={e=>f("telephone",e.target.value)} placeholder="+224 6XX XX XX XX" /></FInput>
        <FInput label="Mot de passe provisoire" req><Inp type="password" value={form.motDePasse} onChange={e=>f("motDePasse",e.target.value)} placeholder="Min. 8 caractères" /></FInput>
        <div style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:10, padding:"12px 16px" }}>
          <p style={{ fontSize:13, color:C.blue }}>ℹ️ Le médecin devra changer son mot de passe dès la première connexion.</p>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
          <Btn onClick={onClose} variant="outline">Annuler</Btn>
          <Btn onClick={()=>{ if(ok){ onCreer(form); onClose() } }} disabled={!ok} variant="primary">Créer le compte</Btn>
        </div>
      </div>
    </Modal>
  )
}

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
        <FInput label="Rôle" req><Sel value={form.role} onChange={e=>f("role",e.target.value)}>{roles.map(r=><option key={r} value={r}>{ROLES_LABEL[r]}</option>)}</Sel></FInput>
        <FInput label="Mot de passe provisoire" req><Inp type="password" value={form.motDePasse} onChange={e=>f("motDePasse",e.target.value)} placeholder="Min. 8 caractères" /></FInput>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
          <Btn onClick={onClose} variant="outline">Annuler</Btn>
          <Btn onClick={()=>{ if(ok){ onCreer(form); onClose() } }} disabled={!ok}>Créer</Btn>
        </div>
      </div>
    </Modal>
  )
}

function ModalAssigner({ consultation, patient, medecins, onClose, onAssigner }) {
  const [docteurId, setDocteurId] = useState("")
  if (!consultation||!patient) return null
  return (
    <Modal onClose={onClose} w={460}>
      <ModalHead title="Assigner un médecin" sub={patient.nom+" · "+consultation.motif} onClose={onClose} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ background:C.slateSoft, borderRadius:12, padding:"14px 16px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[{l:"Patient",v:patient.nom},{l:"Service",v:consultation.service},{l:"Motif",v:consultation.motif}].map(({l,v})=>(
              <div key={l}><p style={{ fontSize:11, color:C.textMuted, marginBottom:2 }}>{l}</p><p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{v}</p></div>
            ))}
          </div>
        </div>
        <FInput label="Choisir le médecin" req>
          <Sel value={docteurId} onChange={e=>setDocteurId(e.target.value)}>
            <option value="">— Sélectionner —</option>
            {medecins.filter(d=>d.statut==="actif"&&!d.estChef).map(d=>(
              <option key={d.id} value={d.id}>{d.nom} · {d.specialite}</option>
            ))}
          </Sel>
        </FInput>
        <div style={{ background:C.amberSoft, border:"1px solid "+C.amber+"33", borderRadius:10, padding:"12px 16px" }}>
          <p style={{ fontSize:13, color:C.amber }}>⚠️ Seul le médecin chef peut assigner un patient. Action enregistrée dans l'audit.</p>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
          <Btn onClick={onClose} variant="outline">Annuler</Btn>
          <Btn onClick={()=>{ if(docteurId){ onAssigner(consultation.id,parseInt(docteurId)); onClose() } }} disabled={!docteurId} variant="success">Confirmer</Btn>
        </div>
      </div>
    </Modal>
  )
}

function ModalSigner({ consultation, patient, onClose, onSigner }) {
  const [notes, setNotes]     = useState(consultation?.notes||"")
  const [diag, setDiag]       = useState("")
  const [trait, setTrait]     = useState("")
  if (!consultation||!patient) return null
  const ok = diag && trait
  return (
    <Modal onClose={onClose} w={560}>
      <ModalHead title="Signer la consultation" sub={patient.nom+" · "+fmt(consultation.date)} onClose={onClose} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ background:C.slateSoft, borderRadius:12, padding:"14px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[{l:"Patient",v:patient.nom},{l:"Service",v:consultation.service},{l:"Date",v:fmt(consultation.date)},{l:"Motif",v:consultation.motif}].map(({l,v})=>(
            <div key={l}><p style={{ fontSize:11, color:C.textMuted, marginBottom:2 }}>{l}</p><p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{v}</p></div>
          ))}
        </div>
        <FInput label="Observations / Notes">
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observations cliniques…"
            style={{ width:"100%", padding:"11px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", resize:"vertical", minHeight:80 }} />
        </FInput>
        <FInput label="Diagnostic" req><Inp value={diag} onChange={e=>setDiag(e.target.value)} placeholder="Ex : Hypertension artérielle" /></FInput>
        <FInput label="Traitement" req><Inp value={trait} onChange={e=>setTrait(e.target.value)} placeholder="Ex : Paracétamol 500mg 3x/jour" /></FInput>
        <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:10, padding:"12px 16px" }}>
          <p style={{ fontSize:13, color:C.red }}>🔒 Signature obligatoire et définitive. Anomalie détectée si non signée.</p>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
          <Btn onClick={onClose} variant="outline">Annuler</Btn>
          <Btn onClick={()=>{ if(ok){ onSigner(consultation.id,notes,diag,trait); onClose() } }} disabled={!ok} variant="success">✍️ Signer</Btn>
        </div>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE ACCUEIL
// ══════════════════════════════════════════════════════════════
function PageAccueil({ consultations, patients, medecins, setPage }) {
  const consultAuj  = consultations.filter(c=>c.date===today())
  const recettesMois= consultations.filter(c=>{ const d=new Date(c.date),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()&&c.statut==="paye" }).reduce((s,c)=>s+c.montant,0)
  const recettesAuj = consultAuj.filter(c=>c.statut==="paye").reduce((s,c)=>s+c.montant,0)
  const recettesTot = consultations.filter(c=>c.statut==="paye").reduce((s,c)=>s+c.montant,0)
  const cashNb      = consultations.filter(c=>c.paiement==="cash").length
  const carteNb     = consultations.filter(c=>c.paiement==="carte").length
  const recentes    = [...consultations].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)
  const nonAssignes = consultations.filter(c=>c.date===today()&&!c.docteurId).length
  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      {nonAssignes>0&&<div style={{ background:C.amberSoft, border:"1px solid "+C.amber+"44", borderRadius:12, padding:"14px 20px", marginBottom:24, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setPage("assignation")}>
        <span style={{ fontSize:20 }}>⏳</span>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:14, fontWeight:700, color:C.amber }}>{nonAssignes} patient{nonAssignes>1?"s":""} en attente d'assignation</p>
          <p style={{ fontSize:13, color:"#92400e" }}>Cliquez pour assigner un médecin</p>
        </div>
        <span style={{ color:C.amber, fontSize:20, fontWeight:700 }}>→</span>
      </div>}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        {[
          { label:"Patients Total",          val:patients.length,      bg:C.blueSoft,   ico:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.blue}   strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, sub:"Patients enregistrés" },
          { label:"Consultations Aujourd'hui",val:consultAuj.length,   bg:C.greenSoft,  ico:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green}  strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, sub:"Rendez-vous du jour" },
          { label:"Consultations Total",      val:consultations.length,bg:C.purpleSoft, ico:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, sub:"Toutes les consultations" },
          { label:"Recettes du Mois",         val:(recettesMois/1000).toFixed(0)+"K", bg:C.orangeSoft, ico:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, sub:"FG" },
        ].map(({label,val,bg,ico,sub})=>(
          <Card key={label} style={{ padding:"28px 28px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>{label}</p>
                <p style={{ fontSize:40, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:8 }}>{val}</p>
                <p style={{ fontSize:13, color:C.textMuted }}>{sub}</p>
              </div>
              <div style={{ width:56, height:56, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{ico}</div>
            </div>
          </Card>
        ))}
      </div>
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:"22px 24px 14px" }}>
          <SectionTitle title="Consultations Récentes" sub="Dernières consultations enregistrées" />
          {recentes.map((c,i)=>{
            const p=patients.find(pt=>pt.id===c.patientId); if(!p) return null
            return (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:i<recentes.length-1?"1px solid "+C.border:"none" }}>
                <Avatar name={p.nom} size={42} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.textPri, marginBottom:2 }}>{p.nom}</p>
                  {c.motif&&<p style={{ fontSize:13, color:C.textSec, marginBottom:2 }}>{c.motif}</p>}
                  <p style={{ fontSize:12, color:C.textMuted }}>{c.date} <span style={{ color:C.blue, fontWeight:600 }}>{c.service}</span></p>
                </div>
                <StatutBadge statut={c.statut} />
              </div>
            )
          })}
        </div>
      </Card>
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:"22px 24px" }}>
          <SectionTitle title="Statistiques Financières" sub="Aperçu des recettes" />
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:C.greenSoft, borderRadius:12, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><p style={{ fontSize:13, color:C.textSec, marginBottom:4 }}>Recettes Aujourd'hui</p><p style={{ fontSize:22, fontWeight:800, color:C.textPri }}>{recettesAuj.toLocaleString("fr-FR")} FG</p></div>
              <IconCircle bg={C.green} size={46}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></IconCircle>
            </div>
            <div style={{ background:C.blueSoft, borderRadius:12, padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><p style={{ fontSize:13, color:C.textSec, marginBottom:4 }}>Recettes Totales</p><p style={{ fontSize:22, fontWeight:800, color:C.textPri }}>{recettesTot.toLocaleString("fr-FR")} FG</p></div>
              <IconCircle bg={C.blueSoft} size={46}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></IconCircle>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ border:"1px solid "+C.border, borderRadius:10, padding:"14px 16px", textAlign:"center" }}><p style={{ fontSize:12, color:C.textMuted, marginBottom:6 }}>Paiements Cash</p><p style={{ fontSize:24, fontWeight:800, color:C.textPri }}>{cashNb}</p></div>
              <div style={{ border:"1px solid "+C.border, borderRadius:10, padding:"14px 16px", textAlign:"center" }}><p style={{ fontSize:12, color:C.textMuted, marginBottom:6 }}>Paiements Carte</p><p style={{ fontSize:24, fontWeight:800, color:C.textPri }}>{carteNb}</p></div>
            </div>
          </div>
        </div>
      </Card>
      <div style={{ background:C.greenDark, borderRadius:16, padding:"22px 24px", display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
        <IconCircle bg={C.blue} size={50}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></IconCircle>
        <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:4 }}>Bienvenue, Dr. Doumbouya</p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>En tant qu'administrateur, vous avez accès à toutes les fonctionnalités du système. Utilisez le menu latéral pour naviguer.</p>
        </div>
      </div>
      <p style={{ textAlign:"center", fontSize:12, color:C.textMuted, marginTop:20 }}>© 2026 Clinique Marouwana. Tous droits réservés.</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE REGISTRE DES PATIENTS (maquette image 1)
// ══════════════════════════════════════════════════════════════
function PageRegistrePatients({ consultations, patients }) {
  const [recherche, setRecherche] = useState("")
  const [mPatient, setMPatient]   = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [formP, setFormP]         = useState({ nom:"", prenom:"", dateNaissance:"", sexe:"F", telephone:"", adresse:"", tuteur:"" })

  const filtres = patients.filter(p=>{
    const q=recherche.toLowerCase()
    return !q||p.nom.toLowerCase().includes(q)||p.pid.toLowerCase().includes(q)||(p.telephone||"").includes(q)
  })
  const visitesRecentes = consultations.filter(c=>{ const d=new Date(c.date),s=new Date(); s.setDate(s.getDate()-7); return d>=s })

  const inputSt2 = { width:"100%", padding:"10px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>

      {/* Modal fiche */}
      {mPatient && (
        <Overlay onClose={()=>setMPatient(null)}>
          <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:540, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <Avatar name={mPatient.nom} size={46} />
                <div>
                  <p style={{ fontSize:17, fontWeight:800, color:C.textPri }}>{mPatient.nom}</p>
                  <p style={{ fontSize:13, color:C.textSec }}>{mPatient.pid}</p>
                </div>
              </div>
              <button onClick={()=>setMPatient(null)} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
            </div>
            <div style={{ padding:"20px 28px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[{l:"Sexe",v:mPatient.sexe==="F"?"Féminin":"Masculin"},{l:"Téléphone",v:mPatient.telephone},{l:"Adresse",v:mPatient.adresse},{l:"Naissance",v:fmt(mPatient.dateNaissance)}].map(({l,v})=>(
                  <div key={l} style={{ background:C.bg, borderRadius:10, padding:"12px 14px", border:"1px solid "+C.border }}>
                    <p style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{l}</p>
                    <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{v||"—"}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:12, fontWeight:700, color:C.textMuted, textTransform:"uppercase", marginBottom:10 }}>Consultations ({consultations.filter(c=>c.patientId===mPatient.id).length})</p>
              {consultations.filter(c=>c.patientId===mPatient.id).length===0
                ? <p style={{ color:C.textMuted, fontSize:13, textAlign:"center", padding:20 }}>Aucune consultation</p>
                : consultations.filter(c=>c.patientId===mPatient.id).sort((a,b)=>b.date.localeCompare(a.date)).map(c=>(
                  <div key={c.id} style={{ background:C.bg, borderRadius:10, padding:"10px 14px", border:"1px solid "+C.border, marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{fmt(c.date)} · {c.service}</p>
                      <StatutBadge statut={c.statut} />
                    </div>
                    <p style={{ fontSize:12, color:C.textSec, marginTop:4 }}>{c.motif}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </Overlay>
      )}

      {/* Modal nouveau patient */}
      {showForm && (
        <Modal onClose={()=>setShowForm(false)} w={560}>
          <ModalHead title="Nouveau patient" sub="Enregistrer un nouveau dossier patient" onClose={()=>setShowForm(false)} />
          <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <FInput label="Nom" req><Inp value={formP.nom} onChange={e=>setFormP(p=>({...p,nom:e.target.value}))} placeholder="Ex : Diallo" /></FInput>
              <FInput label="Prénom" req><Inp value={formP.prenom} onChange={e=>setFormP(p=>({...p,prenom:e.target.value}))} placeholder="Ex : Aminata" /></FInput>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <FInput label="Date de naissance"><Inp type="date" value={formP.dateNaissance} onChange={e=>setFormP(p=>({...p,dateNaissance:e.target.value}))} /></FInput>
              <FInput label="Sexe"><Sel value={formP.sexe} onChange={e=>setFormP(p=>({...p,sexe:e.target.value}))}><option value="F">Féminin</option><option value="M">Masculin</option></Sel></FInput>
            </div>
            <FInput label="Téléphone"><Inp value={formP.telephone} onChange={e=>setFormP(p=>({...p,telephone:e.target.value}))} placeholder="+224 6XX XX XX XX" /></FInput>
            <FInput label="Adresse"><Inp value={formP.adresse} onChange={e=>setFormP(p=>({...p,adresse:e.target.value}))} placeholder="Ex : Ratoma, Conakry" /></FInput>
            <FInput label="Tuteur (si mineur)"><Inp value={formP.tuteur} onChange={e=>setFormP(p=>({...p,tuteur:e.target.value}))} placeholder="Ex : Bah Mamadou" /></FInput>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:8, borderTop:"1px solid "+C.border }}>
              <Btn onClick={()=>setShowForm(false)} variant="outline">Annuler</Btn>
              <Btn onClick={()=>{ if(formP.nom&&formP.prenom){ alert("Patient enregistré."); setShowForm(false); setFormP({nom:"",prenom:"",dateNaissance:"",sexe:"F",telephone:"",adresse:"",tuteur:""}) } }}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Titre + bouton Nouveau Patient */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Registre des Patients</p>
          <p style={{ fontSize:15, color:C.textSec }}>Gestion des dossiers patients</p>
        </div>
        <button onClick={()=>setShowForm(true)}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 22px", background:C.blue, color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 14px rgba(37,99,235,0.3)" }}
          onMouseEnter={e=>e.currentTarget.style.background="#1d4ed8"}
          onMouseLeave={e=>e.currentTarget.style.background=C.blue}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Nouveau Patient
        </button>
      </div>

      {/* Barre de recherche */}
      <Card style={{ padding:"16px 20px", marginBottom:20 }}>
        <div style={{ position:"relative" }}>
          <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Rechercher par nom, ID ou téléphone..." value={recherche} onChange={e=>setRecherche(e.target.value)}
            style={{ width:"100%", padding:"13px 16px 13px 48px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:12, background:C.bg, color:C.textPri, outline:"none", fontFamily:"inherit" }}
            onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.background=C.white }}
            onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.background=C.bg }} />
        </div>
      </Card>

      {/* KPIs — fidèles à la maquette */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Patients Total",   val:patients.length,          bg:C.blueSoft,   ico:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.blue}   strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
          { label:"Visites Récentes", val:visitesRecentes.length,   bg:C.greenSoft,  ico:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green}  strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
          { label:"Résultats",        val:filtres.length,           bg:C.purpleSoft, ico:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
        ].map(({label,val,bg,ico})=>(
          <Card key={label} style={{ padding:"20px 22px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:50, height:50, borderRadius:14, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{ico}</div>
              <div>
                <p style={{ fontSize:13, color:C.textSec, marginBottom:4 }}>{label}</p>
                <p style={{ fontSize:32, fontWeight:800, color:C.textPri, lineHeight:1, letterSpacing:"-1px" }}>{val}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Liste des patients */}
      <Card>
        <div style={{ padding:"18px 20px", borderBottom:"1px solid "+C.border }}>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Liste des Patients</p>
          <p style={{ fontSize:13, color:C.textMuted }}>{filtres.length} patient{filtres.length>1?"s":""} trouvé{filtres.length>1?"s":""}</p>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.slateSoft }}>
              {["ID Patient","Nom complet","Âge","Sexe","Téléphone","Consultations","Action"].map(h=>(
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtres.length===0
              ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun patient trouvé pour « {recherche} »</td></tr>
              : filtres.map((p,i,arr)=>{
                  const nbC = consultations.filter(c=>c.patientId===p.id).length
                  const age = p.dateNaissance ? Math.floor((Date.now()-new Date(p.dateNaissance))/(365.25*864e5)) : "—"
                  return (
                    <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"14px 16px" }}><span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color:C.blue, background:C.blueSoft, padding:"4px 10px", borderRadius:8 }}>{p.pid}</span></td>
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Avatar name={p.nom} size={34} />
                          <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                        </div>
                      </td>
                      <td style={{ padding:"14px 16px", fontSize:13, color:C.textSec }}>{age} ans</td>
                      <td style={{ padding:"14px 16px" }}><span style={{ fontSize:12, fontWeight:600, background:p.sexe==="F"?C.purpleSoft:C.blueSoft, color:p.sexe==="F"?C.purple:C.blue, padding:"3px 10px", borderRadius:12 }}>{p.sexe==="F"?"Féminin":"Masculin"}</span></td>
                      <td style={{ padding:"14px 16px", fontSize:13, color:C.textSec }}>{p.telephone||"—"}</td>
                      <td style={{ padding:"14px 16px", textAlign:"center" }}><span style={{ background:nbC>0?C.greenSoft:C.slateSoft, color:nbC>0?C.green:C.textMuted, fontWeight:700, fontSize:13, borderRadius:20, padding:"4px 14px" }}>{nbC}</span></td>
                      <td style={{ padding:"14px 16px" }}>
                        <button onClick={()=>setMPatient(p)}
                          style={{ background:C.blue, border:"none", borderRadius:9, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", padding:"8px 16px", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}
                          onMouseEnter={e=>e.currentTarget.style.background="#1d4ed8"}
                          onMouseLeave={e=>e.currentTarget.style.background=C.blue}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          Voir fiche
                        </button>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
        <p style={{ textAlign:"center", fontSize:12, color:C.textMuted, padding:"16px 0", borderTop:"1px solid "+C.border }}>© 2026 Clinique Marouwana. Tous droits réservés.</p>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE STATISTIQUES & RAPPORTS — maquette complète
// ══════════════════════════════════════════════════════════════
function PageStats({ consultations, patients }) {
  const [periode, setPeriode] = useState("mois")

  // Données calculées
  const totalPatients  = patients.length
  const totalConsult   = consultations.length
  const totalRecettes  = consultations.filter(c=>c.statut==="paye").reduce((s,c)=>s+c.montant,0)
  const prixMoyen      = totalConsult>0 ? Math.round(totalRecettes/totalConsult) : 0

  // Activité hebdomadaire (barres)
  const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
  const activiteHebo = [2, 1, 0, 1, 1, 0, 0]
  const maxHebo = Math.max(...activiteHebo, 1)

  // Consultations par service (camembert SVG)
  const parService = [
    { service:"Cardiologie",       nb:2, color:"#2563eb", pct:40 },
    { service:"Pédiatrie",         nb:1, color:"#16a34a", pct:20 },
    { service:"Gynécologie",       nb:1, color:"#ea580c", pct:20 },
    { service:"Médecine Générale", nb:1, color:"#7c3aed", pct:20 },
  ]

  // Évolution recettes (ligne SVG)
  const recettesData = [
    { date:"20 Jan", val:26000 },
    { date:"21 Jan", val:200   },
    { date:"22 Jan", val:100   },
    { date:"23 Jan", val:50    },
    { date:"24 Jan", val:12000 },
    { date:"25 Jan", val:14000 },
    { date:"26 Jan", val:100   },
  ]
  const maxRecette = Math.max(...recettesData.map(r=>r.val), 1)

  // Diagnostics fréquents
  const diagnostics = [
    { nom:"Hypertension",          nb:1, color:C.blue   },
    { nom:"Infection respiratoire",nb:1, color:C.green  },
    { nom:"Syndrome grippal",      nb:1, color:C.amber  },
    { nom:"Grossesse",             nb:1, color:C.purple },
  ]
  const maxDiag = Math.max(...diagnostics.map(d=>d.nb), 1)

  // Récapitulatif par service
  const recap = [
    { service:"Cardiologie",       color:"#2563eb", consultations:2, patientsUniques:2, recettes:55000 },
    { service:"Pédiatrie",         color:"#16a34a", consultations:1, patientsUniques:1, recettes:15000 },
    { service:"Gynécologie",       color:"#ea580c", consultations:1, patientsUniques:1, recettes:20000 },
    { service:"Médecine Générale", color:"#7c3aed", consultations:1, patientsUniques:0, recettes:0     },
  ]
  const totalRecap = {
    consultations:   recap.reduce((s,r)=>s+r.consultations,0),
    patientsUniques: recap.reduce((s,r)=>s+r.patientsUniques,0),
    recettes:        recap.reduce((s,r)=>s+r.recettes,0),
  }

  // Camembert SVG
  const PieChart = () => {
    const cx=160, cy=160, r=120
    let cumul = 0
    const slices = parService.map(s=>{
      const start = cumul
      cumul += s.pct
      return { ...s, start, end: cumul }
    })
    const toRad = deg => (deg/100)*2*Math.PI - Math.PI/2
    const arc = (pct) => {
      const startA = toRad(slices[0].start)
      const ang    = toRad(pct)
      const x1 = cx + r*Math.cos(startA)
      const y1 = cy + r*Math.sin(startA)
      const x2 = cx + r*Math.cos(ang)
      const y2 = cy + r*Math.sin(ang)
      return null
    }
    return (
      <svg width="320" height="320" viewBox="0 0 320 320">
        {slices.map((s,i)=>{
          const startRad = (s.start/100)*2*Math.PI - Math.PI/2
          const endRad   = (s.end/100)*2*Math.PI   - Math.PI/2
          const x1 = cx + r*Math.cos(startRad)
          const y1 = cy + r*Math.sin(startRad)
          const x2 = cx + r*Math.cos(endRad)
          const y2 = cy + r*Math.sin(endRad)
          const large = s.pct > 50 ? 1 : 0
          const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`
          // Label position
          const midRad = ((s.start+s.end)/2/100)*2*Math.PI - Math.PI/2
          const lx = cx + (r+50)*Math.cos(midRad)
          const ly = cy + (r+50)*Math.sin(midRad)
          return (
            <g key={i}>
              <path d={d} fill={s.color} stroke="#fff" strokeWidth="2" />
              <text x={lx} y={ly} textAnchor="middle" fontSize="12" fontWeight="600" fill={s.color}>{s.service}: {s.pct}%</text>
            </g>
          )
        })}
      </svg>
    )
  }

  // Graphique ligne recettes SVG
  const LineChart = () => {
    const W=560, H=200, PL=60, PR=20, PT=20, PB=40
    const iW=W-PL-PR, iH=H-PT-PB
    const pts = recettesData.map((d,i)=>({
      x: PL + (i/(recettesData.length-1))*iW,
      y: PT + iH - (d.val/maxRecette)*iH,
      val: d.val, date: d.date
    }))
    const path = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ")
    const yLabels = [0, 6500, 13000, 19500, 26000]
    return (
      <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{ overflow:"visible" }}>
        {/* Grille */}
        {yLabels.map(v=>{
          const y = PT + iH - (v/maxRecette)*iH
          return (
            <g key={v}>
              <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#e2e8f0" strokeDasharray="4,4" />
              <text x={PL-8} y={y+4} textAnchor="end" fontSize="11" fill="#94a3b8">{v.toLocaleString("fr-FR")}</text>
            </g>
          )
        })}
        {/* Labels X */}
        {pts.map((p,i)=>(
          <text key={i} x={p.x} y={H-PT+16} textAnchor="middle" fontSize="11" fill="#94a3b8">{p.date}</text>
        ))}
        {/* Ligne */}
        <path d={path} fill="none" stroke={C.green} strokeWidth="2.5" strokeLinejoin="round" />
        {/* Points */}
        {pts.map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r="5" fill={C.white} stroke={C.green} strokeWidth="2.5" />
        ))}
        {/* Légende */}
        <circle cx={W/2-30} cy={H+10} r="5" fill={C.green} />
        <text x={W/2-20} y={H+14} fontSize="12" fill="#64748b" fontWeight="600">montant</text>
      </svg>
    )
  }

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>

      {/* Titre + contrôles */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Statistiques &amp; Rapports</p>
          <p style={{ fontSize:15, color:C.textSec }}>Vue globale de la clinique</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {/* Dropdown période */}
          <div style={{ position:"relative" }}>
            <select value={periode} onChange={e=>setPeriode(e.target.value)}
              style={{ appearance:"none", background:C.white, border:"1px solid "+C.border, borderRadius:10, padding:"10px 40px 10px 16px", fontSize:14, fontWeight:500, color:C.textPri, cursor:"pointer", fontFamily:"inherit", outline:"none" }}>
              <option value="semaine">Cette semaine</option>
              <option value="mois">Ce mois</option>
              <option value="trimestre">Ce trimestre</option>
              <option value="annee">Cette année</option>
            </select>
            <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {/* Bouton Exporter */}
          <button style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", background:C.white, color:C.textPri, border:"1px solid "+C.border, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}
            onClick={()=>alert("Export des statistiques en cours…")}
            onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
            onMouseLeave={e=>e.currentTarget.style.background=C.white}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter
          </button>
        </div>
      </div>

      {/* 4 KPIs 2x2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
        {/* Total Patients */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Total Patients</p>
              <p style={{ fontSize:46, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:10 }}>{totalPatients}</p>
              <p style={{ fontSize:13, color:C.green, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                +12% ce mois
              </p>
            </div>
            <div style={{ width:56, height:56, borderRadius:"50%", background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
        </Card>

        {/* Consultations */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Consultations</p>
              <p style={{ fontSize:46, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:10 }}>{totalConsult}</p>
              <p style={{ fontSize:13, color:C.green, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                +8% ce mois
              </p>
            </div>
            <div style={{ width:56, height:56, borderRadius:"50%", background:C.greenSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
          </div>
        </Card>

        {/* Recettes Totales */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Recettes Totales</p>
              <p style={{ fontSize:46, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:6 }}>{(totalRecettes/1000).toFixed(0)}K</p>
              <p style={{ fontSize:13, color:C.textMuted }}>FG</p>
            </div>
            <div style={{ width:56, height:56, borderRadius:"50%", background:C.purpleSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
          </div>
        </Card>

        {/* Prix Moyen */}
        <Card style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Prix Moyen</p>
              <p style={{ fontSize:46, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:6 }}>{prixMoyen.toLocaleString("fr-FR")}</p>
              <p style={{ fontSize:13, color:C.textMuted }}>FG / consultation</p>
            </div>
            <div style={{ width:56, height:56, borderRadius:"50%", background:C.orangeSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.84 2 2 0 0 1 3.59 2.66h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.43 17"/></svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Activité Hebdomadaire — graphique barres SVG */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:"20px 24px" }}>
          <p style={{ fontSize:16, fontWeight:700, color:C.textPri, marginBottom:4 }}>Activité Hebdomadaire</p>
          <p style={{ fontSize:13, color:C.textMuted, marginBottom:20 }}>Nombre de consultations par jour</p>
          <div style={{ position:"relative", height:240 }}>
            {/* Lignes de grille horizontales */}
            {[0,0.5,1,1.5,2].map(v=>{
              const y = 200 - (v/maxHebo)*180
              return (
                <div key={v} style={{ position:"absolute", left:40, right:10, top:y, borderTop:"1px dashed #e2e8f0", display:"flex", alignItems:"center" }}>
                  <span style={{ position:"absolute", left:-36, fontSize:11, color:"#94a3b8", transform:"translateY(-50%)" }}>{v}</span>
                </div>
              )
            })}
            {/* Barres */}
            <div style={{ position:"absolute", left:40, right:10, bottom:30, top:0, display:"flex", alignItems:"flex-end", justifyContent:"space-around", gap:8 }}>
              {JOURS.map((j,i)=>{
                const val = activiteHebo[i]
                const h   = val>0 ? Math.max((val/maxHebo)*170, 8) : 0
                return (
                  <div key={j} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, flex:1 }}>
                    <div style={{ width:"100%", height:h, background:val>0?C.blue:"transparent", borderRadius:"4px 4px 0 0", maxWidth:60, transition:"height .3s" }} />
                    <span style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{j}</span>
                  </div>
                )
              })}
            </div>
            {/* Axe X */}
            <div style={{ position:"absolute", left:40, right:10, bottom:28, height:1, background:C.border }} />
          </div>
        </div>
      </Card>

      {/* Camembert + Évolution recettes */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:20, marginBottom:20 }}>
        {/* Camembert */}
        <Card>
          <div style={{ padding:"20px 24px" }}>
            <p style={{ fontSize:16, fontWeight:700, color:C.textPri, marginBottom:4 }}>Consultations par Service</p>
            <p style={{ fontSize:13, color:C.textMuted, marginBottom:16 }}>Distribution des consultations</p>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <PieChart />
            </div>
          </div>
        </Card>

        {/* Évolution recettes */}
        <Card>
          <div style={{ padding:"20px 24px" }}>
            <p style={{ fontSize:16, fontWeight:700, color:C.textPri, marginBottom:4 }}>Évolution des Recettes</p>
            <p style={{ fontSize:13, color:C.textMuted, marginBottom:16 }}>Recettes journalières (FG)</p>
            <div style={{ overflowX:"auto" }}>
              <LineChart />
            </div>
          </div>
        </Card>
      </div>

      {/* Diagnostics les Plus Fréquents */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:"20px 24px" }}>
          <p style={{ fontSize:16, fontWeight:700, color:C.textPri, marginBottom:4 }}>Diagnostics les Plus Fréquents</p>
          <p style={{ fontSize:13, color:C.textMuted, marginBottom:20 }}>Top des pathologies diagnostiquées</p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {diagnostics.map(d=>{
              const pct = Math.round((d.nb/maxDiag)*100)
              return (
                <div key={d.nom}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:C.textPri }}>{d.nom}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{d.nb}</span>
                  </div>
                  <div style={{ height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:pct+"%", background:d.color, borderRadius:4, transition:"width .5s" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Récapitulatif par Service */}
      <Card>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid "+C.border }}>
          <p style={{ fontSize:16, fontWeight:700, color:C.textPri, marginBottom:4 }}>Récapitulatif par Service</p>
          <p style={{ fontSize:13, color:C.textMuted }}>Performance de chaque service médical</p>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Service","Consultations","Patients Uniques","Recettes (FG)"].map(h=>(
                <th key={h} style={{ padding:"14px 24px", textAlign:"left", fontSize:13, fontWeight:700, color:C.textPri, borderBottom:"1px solid "+C.border }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recap.map((r,i)=>(
              <tr key={r.service} style={{ borderBottom:"1px solid "+C.border }}
                onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"16px 24px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:r.color, flexShrink:0 }} />
                    <span style={{ fontSize:14, fontWeight:600, color:C.textPri }}>{r.service}</span>
                  </div>
                </td>
                <td style={{ padding:"16px 24px", fontSize:14, color:C.textSec, textAlign:"left" }}>{r.consultations}</td>
                <td style={{ padding:"16px 24px", fontSize:14, color:C.textSec, textAlign:"left" }}>{r.patientsUniques}</td>
                <td style={{ padding:"16px 24px", fontSize:14, fontWeight:600, color:C.textPri, textAlign:"left" }}>{r.recettes.toLocaleString("fr-FR")}</td>
              </tr>
            ))}
            {/* Ligne TOTAL */}
            <tr style={{ background:"#f8f9fa" }}>
              <td style={{ padding:"16px 24px" }}><span style={{ fontSize:14, fontWeight:800, color:C.textPri }}>TOTAL</span></td>
              <td style={{ padding:"16px 24px", fontSize:14, fontWeight:800, color:C.textPri }}>{totalRecap.consultations}</td>
              <td style={{ padding:"16px 24px", fontSize:14, fontWeight:800, color:C.textPri }}>{totalRecap.patientsUniques}</td>
              <td style={{ padding:"16px 24px", fontSize:14, fontWeight:800, color:C.textPri }}>{totalRecap.recettes.toLocaleString("fr-FR")}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ textAlign:"center", fontSize:13, color:C.textMuted, padding:"20px 0", borderTop:"1px solid "+C.border }}>© 2026 Clinique Marouwana. Tous droits réservés.</p>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE ASSIGNATION
// ══════════════════════════════════════════════════════════════
function PageAssignation({ consultations, patients, medecins, onAssigner }) {
  const [mAssigner, setMAssigner] = useState(null)
  const enAttente = consultations.filter(c=>c.date===today()&&!c.docteurId)
  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <p style={{ fontSize:22, fontWeight:800, color:C.textPri, marginBottom:6 }}>Assignation des patients</p>
      <p style={{ fontSize:14, color:C.textSec, marginBottom:24 }}>Attribuez un médecin à chaque patient en attente</p>
      {mAssigner&&<ModalAssigner consultation={mAssigner} patient={patients.find(p=>p.id===mAssigner.patientId)} medecins={medecins} onClose={()=>setMAssigner(null)} onAssigner={onAssigner} />}
      {enAttente.length===0
        ? <Card style={{ padding:40, textAlign:"center" }}><p style={{ fontSize:16, color:C.textMuted }}>✅ Tous les patients du jour ont un médecin assigné</p></Card>
        : <Card style={{ marginBottom:20 }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border }}><p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Patients sans médecin — {enAttente.length} en attente</p></div>
            {enAttente.map((c,i)=>{
              const p=patients.find(pt=>pt.id===c.patientId); if(!p) return null
              return (
                <div key={c.id} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, borderBottom:i<enAttente.length-1?"1px solid "+C.border:"none" }}>
                  <Avatar name={p.nom} size={42} />
                  <div style={{ flex:1 }}><p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{p.nom}</p><p style={{ fontSize:13, color:C.textSec }}>{c.motif} · <span style={{ color:C.blue }}>{c.service}</span></p></div>
                  <StatutBadge statut="en_attente" />
                  <Btn onClick={()=>setMAssigner(c)} small>👨‍⚕️ Assigner</Btn>
                </div>
              )
            })}
          </Card>
      }
      <Card>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border }}><p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Toutes les consultations du jour</p></div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.slateSoft }}>{["Patient","Service","Médecin assigné","Statut","Action"].map(h=>(<th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:C.textSec }}>{h}</th>))}</tr></thead>
          <tbody>
            {consultations.filter(c=>c.date===today()).map((c,i,arr)=>{
              const p=patients.find(pt=>pt.id===c.patientId),dr=medecins.find(d=>d.id===c.docteurId); if(!p) return null
              return (
                <tr key={c.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }} onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={p.nom} size={32} /><div><p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p><p style={{ fontSize:11, color:C.textMuted }}>{c.motif}</p></div></div></td>
                  <td style={{ padding:"13px 16px" }}><span style={{ fontSize:13, color:C.blue, fontWeight:500 }}>{c.service}</span></td>
                  <td style={{ padding:"13px 16px", fontSize:13, color:dr?C.textPri:C.red, fontWeight:dr?400:600 }}>{dr?dr.nom:"Non assigné"}</td>
                  <td style={{ padding:"13px 16px" }}><StatutBadge statut={c.statut} /></td>
                  <td style={{ padding:"13px 16px" }}>{!c.docteurId&&<Btn onClick={()=>setMAssigner(c)} small>Assigner</Btn>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE CONSULTATIONS — maquette image 1 + image 2
// ══════════════════════════════════════════════════════════════
function PageConsultations({ consultations, patients, medecins, onSigner }) {
  const [mSign, setMSign] = useState(null)
  const nonSignees = consultations.filter(c=>c.statut==="en_attente"&&c.docteurId)

  // Données file d'attente — patients en attente avec symptômes multiples
  const fileAttente = [
    { id:"f1", date:"2026-01-20", patient:"Aminata Sanogo",     motifTags:["Douleurs thoraciques","Essoufflement","Fièvre"],   statut:"paye",      diagnostic:"Hypertension artérielle",           traitement:"Amlodipine 5mg, repos, régime hyposodé"    },
    { id:"f2", date:"2026-01-25", patient:"Fatoumata Coulibaly",motifTags:["Fièvre","Toux","Nausées"],                          statut:"paye",      diagnostic:"Infection respiratoire haute",       traitement:"Paracétamol, antitussif, hydratation"       },
    { id:"f3", date:"2026-01-24", patient:"Moussa Keita",       motifTags:["Céphalées","Fatigue","Courbatures"],                statut:"paye",      diagnostic:"Syndrome grippal",                   traitement:"Paracétamol, repos, hydratation"            },
    { id:"f4", date:"2026-01-26", patient:"Sekou Diarra",       motifTags:["Douleurs thoraciques"],                             statut:"en_attente",diagnostic:"Grossesse présumée - 8 semaines",   traitement:"Acide folique, vitamines prénatales"        },
  ]

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Consultations - Administration</p>
        <p style={{ fontSize:15, color:C.textSec }}>Gérez vos files d'attente et votre historique</p>
      </div>

      {mSign&&<ModalSigner consultation={mSign} patient={patients.find(p=>p.id===mSign.patientId)} onClose={()=>setMSign(null)} onSigner={(id,notes,diag,trait)=>{ onSigner(id,notes,diag,trait); setMSign(null) }} />}

      {/* Alerte non signées */}
      {nonSignees.length>0&&(
        <div style={{ background:C.redSoft, border:"1px solid "+C.red+"33", borderRadius:12, padding:"14px 20px", marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:700, color:C.red, marginBottom:2 }}>🔒 {nonSignees.length} consultation{nonSignees.length>1?"s":""} non signée{nonSignees.length>1?"s":""}</p>
          <p style={{ fontSize:13, color:"#991b1b" }}>Ces consultations ont été effectuées sans signature — anomalie détectée</p>
        </div>
      )}

      {/* ── FILE D'ATTENTE — image 1 ── */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid "+C.border }}>
          <p style={{ fontSize:16, fontWeight:700, color:C.textPri, marginBottom:3 }}>File d'attente</p>
          <p style={{ fontSize:14, color:C.textMuted }}>Patients en attente de consultation</p>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Date","Patient","Motif / Symptômes","Statut","Action"].map(h=>(
                <th key={h} style={{ padding:"14px 24px", textAlign:"left", fontSize:14, fontWeight:700, color:C.textPri, borderBottom:"1px solid "+C.border }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fileAttente.map((c,i)=>{
              const extra = c.motifTags.length > 2 ? c.motifTags.length - 2 : 0
              return (
                <tr key={c.id} style={{ borderBottom:i<fileAttente.length-1?"1px solid "+C.border:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"18px 24px", fontSize:14, color:C.textPri, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}>{c.date}</td>
                  <td style={{ padding:"18px 24px" }}>
                    <p style={{ fontSize:14, fontWeight:600, color:C.textPri }}>{c.patient}</p>
                  </td>
                  <td style={{ padding:"18px 24px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      {c.motifTags.slice(0,2).map(t=>(
                        <span key={t} style={{ background:"#f1f5f9", color:"#475569", fontSize:13, fontWeight:500, padding:"5px 14px", borderRadius:20, border:"1px solid #e2e8f0" }}>{t}</span>
                      ))}
                      {extra>0&&<span style={{ background:"#f1f5f9", color:"#94a3b8", fontSize:13, fontWeight:500, padding:"5px 10px", borderRadius:20 }}>+{extra}</span>}
                    </div>
                  </td>
                  <td style={{ padding:"18px 24px" }}>
                    {c.statut==="paye"
                      ? <span style={{ background:"#dcfce7", color:"#16a34a", fontSize:13, fontWeight:600, padding:"6px 18px", borderRadius:20, border:"1px solid #16a34a33", display:"inline-block" }}>Payé</span>
                      : <span style={{ background:"#fef3c7", color:"#d97706", fontSize:13, fontWeight:600, padding:"6px 14px", borderRadius:20, border:"1px solid #d9770633", display:"inline-block" }}>En attente paiement</span>
                    }
                  </td>
                  <td style={{ padding:"18px 24px" }}>
                    <button
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 22px", background:C.blue, color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#1d4ed8"}
                      onMouseLeave={e=>e.currentTarget.style.background=C.blue}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.84 2 2 0 0 1 3.59 2.66h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.43 17"/></svg>
                      Consulter
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* ── HISTORIQUE RÉCENT — image 2 ── */}
      <Card>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid "+C.border }}>
          <p style={{ fontSize:16, fontWeight:700, color:C.textPri, marginBottom:3 }}>Historique Récent</p>
          <p style={{ fontSize:14, color:C.textMuted }}>Vos dernières consultations effectuées</p>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Date","Patient","Diagnostic","Traitement","Statut"].map(h=>(
                <th key={h} style={{ padding:"14px 24px", textAlign:"left", fontSize:14, fontWeight:700, color:C.textPri, borderBottom:"1px solid "+C.border }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fileAttente.filter(c=>c.statut==="paye").map((c,i,arr)=>(
              <tr key={c.id+"h"} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"18px 24px", fontSize:14, color:C.textSec, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}>{c.date}</td>
                <td style={{ padding:"18px 24px" }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>{c.patient}</p>
                </td>
                <td style={{ padding:"18px 24px", fontSize:14, color:C.textSec }}>{c.diagnostic}</td>
                <td style={{ padding:"18px 24px", fontSize:14, color:C.textSec }}>{c.traitement}</td>
                <td style={{ padding:"18px 24px" }}>
                  <span style={{ background:C.slateSoft, color:C.slate, fontSize:13, fontWeight:500, padding:"5px 16px", borderRadius:20, border:"1px solid "+C.border, display:"inline-block" }}>Terminé</span>
                </td>
              </tr>
            ))}
            {/* Ligne bonus fidèle à la maquette */}
            <tr onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{ padding:"18px 24px", fontSize:14, color:C.textSec, fontVariantNumeric:"tabular-nums" }}>2026-01-26</td>
              <td style={{ padding:"18px 24px" }}><p style={{ fontSize:14, fontWeight:700, color:C.textPri }}>Mariam Traoré</p></td>
              <td style={{ padding:"18px 24px", fontSize:14, color:C.textSec }}>Grossesse présumée - 8 semaines</td>
              <td style={{ padding:"18px 24px", fontSize:14, color:C.textSec }}>Acide folique, vitamines prénatales</td>
              <td style={{ padding:"18px 24px" }}><span style={{ background:C.slateSoft, color:C.slate, fontSize:13, fontWeight:500, padding:"5px 16px", borderRadius:20, border:"1px solid "+C.border, display:"inline-block" }}>Terminé</span></td>
            </tr>
          </tbody>
        </table>
        <p style={{ textAlign:"center", fontSize:13, color:C.textMuted, padding:"20px 0", borderTop:"1px solid "+C.border }}>© 2026 Clinique Marouwana. Tous droits réservés.</p>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE LABORATOIRE — maquette
// ══════════════════════════════════════════════════════════════
function PageLaboratoire() {
  const [recherche, setRecherche] = useState("")

  const FICHES = [
    {
      id:"P001", patient:"Aminata Sanogo",      date:"2026-01-20", technicien:"Mamadou",
      analyses:[
        { nom:"Glycémie à jeun",   resultat:"5.2 mmol/L", reference:"4.0 - 6.0 mmol/L", statut:"normal"  },
        { nom:"Cholestérol total", resultat:"6.8 mmol/L", reference:"< 5.2 mmol/L",      statut:"anormal" },
        { nom:"Triglycérides",     resultat:"2.1 mmol/L", reference:"< 1.7 mmol/L",      statut:"anormal" },
        { nom:"HDL Cholestérol",   resultat:"1.1 mmol/L", reference:"> 1.0 mmol/L",      statut:"normal"  },
      ]
    },
    {
      id:"P002", patient:"Fatoumata Coulibaly", date:"2026-01-25", technicien:"Aissatou",
      analyses:[
        { nom:"Numération formule",resultat:"4.8 g/dL",   reference:"4.5 - 5.5 g/dL",   statut:"normal"  },
        { nom:"Plaquettes",        resultat:"145 G/L",    reference:"150 - 400 G/L",     statut:"anormal" },
        { nom:"CRP",               resultat:"12 mg/L",    reference:"< 5 mg/L",           statut:"anormal" },
      ]
    },
    {
      id:"P003", patient:"Moussa Keita",        date:"2026-01-24", technicien:"Mamadou",
      analyses:[
        { nom:"Créatinine",        resultat:"78 µmol/L",  reference:"62 - 106 µmol/L",   statut:"normal"  },
        { nom:"Urée",              resultat:"5.1 mmol/L", reference:"2.5 - 7.6 mmol/L",  statut:"normal"  },
        { nom:"Acide urique",      resultat:"420 µmol/L", reference:"< 416 µmol/L",      statut:"anormal" },
      ]
    },
  ]

  const fichesFiltrees = FICHES.filter(f=>{
    const q=recherche.toLowerCase()
    return !q||f.patient.toLowerCase().includes(q)||f.id.toLowerCase().includes(q)
  })

  const totalAnalyses = FICHES.reduce((s,f)=>s+f.analyses.length, 0)
  const nbNormaux     = FICHES.reduce((s,f)=>s+f.analyses.filter(a=>a.statut==="normal").length, 0)
  const nbAnormaux    = FICHES.reduce((s,f)=>s+f.analyses.filter(a=>a.statut==="anormal").length, 0)
  const nbCritiques   = 0

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Laboratoire</p>
      <p style={{ fontSize:15, color:C.textSec, marginBottom:28 }}>Gestion des analyses et résultats</p>

      {/* 4 KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <Card style={{ padding:"22px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:10 }}>Total Analyses</p>
              <p style={{ fontSize:36, fontWeight:800, color:C.textPri, lineHeight:1 }}>{totalAnalyses}</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
            </div>
          </div>
        </Card>
        <Card style={{ padding:"22px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:10 }}>Résultats<br/>Normaux</p>
              <p style={{ fontSize:36, fontWeight:800, color:C.green, lineHeight:1 }}>{nbNormaux}</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:C.greenSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
        </Card>
        <Card style={{ padding:"22px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:10 }}>Résultats<br/>Anormaux</p>
              <p style={{ fontSize:36, fontWeight:800, color:C.amber, lineHeight:1 }}>{nbAnormaux}</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:C.amberSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
        </Card>
        <Card style={{ padding:"22px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:10 }}>Résultats<br/>Critiques</p>
              <p style={{ fontSize:36, fontWeight:800, color:C.red, lineHeight:1 }}>{nbCritiques}</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:C.redSoft, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card style={{ padding:"16px 20px", marginBottom:20 }}>
        <div style={{ position:"relative" }}>
          <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Rechercher par nom de patient ou ID..." value={recherche} onChange={e=>setRecherche(e.target.value)}
            style={{ width:"100%", padding:"13px 16px 13px 48px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:12, background:C.bg, color:C.textPri, outline:"none", fontFamily:"inherit" }}
            onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.background=C.white }}
            onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.background=C.bg }} />
        </div>
      </Card>

      {/* Fiches patients */}
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {fichesFiltrees.length===0
          ? <Card style={{ padding:40, textAlign:"center" }}><p style={{ color:C.textMuted }}>Aucune analyse trouvée pour « {recherche} »</p></Card>
          : fichesFiltrees.map(fiche=>(
            <Card key={fiche.id}>
              {/* Header fiche — fond bleu très clair */}
              <div style={{ background:"#eff6ff", borderRadius:"16px 16px 0 0", padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderBottom:"1px solid "+C.border }}>
                <div>
                  <p style={{ fontSize:20, fontWeight:800, color:C.textPri, marginBottom:4 }}>{fiche.patient}</p>
                  <p style={{ fontSize:13, color:C.textSec, marginBottom:2 }}>ID: {fiche.id} • Analyse du {fiche.date}</p>
                  <p style={{ fontSize:13, color:C.textSec }}>Technicien: {fiche.technicien}</p>
                </div>
                <button onClick={()=>alert("Impression fiche "+fiche.patient+" en A4…")}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 20px", background:"#0f172a", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#1e293b"}
                  onMouseLeave={e=>e.currentTarget.style.background="#0f172a"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Imprimer Fiche A4
                </button>
              </div>

              {/* Analyses avec bordure colorée gauche */}
              <div style={{ padding:"16px 24px", display:"flex", flexDirection:"column", gap:12 }}>
                {fiche.analyses.map((a,i)=>{
                  const isNormal  = a.statut==="normal"
                  const isAnormal = a.statut==="anormal"
                  const borderCol = isNormal ? C.green : isAnormal ? C.amber : C.red
                  const bgCol     = isNormal ? "#f0fdf4" : isAnormal ? "#fffbeb" : C.redSoft
                  return (
                    <div key={i} style={{ background:bgCol, borderRadius:12, padding:"16px 20px", borderLeft:"4px solid "+borderCol }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:15, fontWeight:700, color:C.textPri, marginBottom:14 }}>{a.nom}</p>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                            <div>
                              <p style={{ fontSize:12, color:C.textMuted, marginBottom:4 }}>Résultat:</p>
                              <p style={{ fontSize:16, fontWeight:700, color:C.textPri }}>{a.resultat}</p>
                            </div>
                            <div>
                              <p style={{ fontSize:12, color:C.textMuted, marginBottom:4 }}>Valeurs de référence:</p>
                              <p style={{ fontSize:15, fontWeight:600, color:C.textSec }}>{a.reference}</p>
                            </div>
                          </div>
                        </div>
                        <span style={{ background:isNormal?C.green:isAnormal?C.amber:C.red, color:"#fff", fontSize:13, fontWeight:700, padding:"6px 16px", borderRadius:20, marginLeft:20, whiteSpace:"nowrap", flexShrink:0 }}>
                          {isNormal?"Normal":isAnormal?"Anormal":"Critique"}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))
        }
      </div>
      <p style={{ textAlign:"center", fontSize:13, color:C.textMuted, marginTop:24 }}>© 2026 Clinique Marouwana. Tous droits réservés.</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE COMPTABILITÉ & FACTURATION — maquette
// ══════════════════════════════════════════════════════════════
function PageComptabilite({ consultations }) {
  const [recherche, setRecherche] = useState("")
  const [paiements, setPaiements] = useState([
    { id:"REC-2026-001", date:"2026-01-20", patient:"Aminata Sanogo",      pid:"P001", montant:25000, methode:"cash",  service:"Cardiologie",   statut:"paye"      },
    { id:"REC-2026-002", date:"2026-01-24", patient:"Moussa Keita",        pid:"P003", montant:15000, methode:"carte", service:"Médecine générale",statut:"paye"   },
    { id:"REC-2026-003", date:"2026-01-25", patient:"Fatoumata Coulibaly", pid:"P002", montant:12000, methode:"cash",  service:"Gynécologie",   statut:"paye"      },
  ])
  const enAttente = [
    { id:"a1", patient:"Mariam Traoré",  service:"Gynécologie",  date:"2026-01-26", montant:20000 },
    { id:"a2", patient:"Sekou Diarra",   service:"Cardiologie",  date:"2026-01-26", montant:30000 },
  ]

  const recettesAuj   = 0
  const totalRecettes = paiements.reduce((s,p)=>s+p.montant, 0)
  const cashNb        = paiements.filter(p=>p.methode==="cash").length
  const enAttenteNb   = enAttente.length

  const paiementsFiltres = paiements.filter(p=>{
    const q=recherche.toLowerCase()
    return !q||p.patient.toLowerCase().includes(q)||p.id.toLowerCase().includes(q)||p.pid.toLowerCase().includes(q)
  })

  const handleEncaisser = (id) => {
    const item = enAttente.find(a=>a.id===id)
    if (!item) return
    const newPaiement = {
      id:"REC-2026-00"+(paiements.length+1),
      date:today(), patient:item.patient, pid:"P00"+(paiements.length+4),
      montant:item.montant, methode:"cash", service:item.service, statut:"paye"
    }
    setPaiements(prev=>[newPaiement,...prev])
    alert("Paiement de "+item.montant.toLocaleString("fr-FR")+" FG encaissé pour "+item.patient)
  }

  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:4 }}>Comptabilité &amp; Facturation</p>
      <p style={{ fontSize:15, color:C.textSec, marginBottom:28 }}>Gestion des paiements et reçus</p>

      {/* 4 KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {/* Recettes Aujourd'hui */}
        <Card style={{ padding:"22px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:10, lineHeight:1.4 }}>Recettes<br/>Aujourd'hui</p>
              <p style={{ fontSize:32, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:4 }}>{recettesAuj.toLocaleString("fr-FR")}</p>
              <p style={{ fontSize:12, color:C.textMuted }}>FG</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:C.greenSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
          </div>
        </Card>
        {/* Total Recettes */}
        <Card style={{ padding:"22px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:10 }}>Total Recettes</p>
              <p style={{ fontSize:32, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:4 }}>{(totalRecettes/1000).toFixed(0)+" 000"}</p>
              <p style={{ fontSize:12, color:C.textMuted }}>FG</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
          </div>
        </Card>
        {/* Paiements Cash */}
        <Card style={{ padding:"22px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:10 }}>Paiements Cash</p>
              <p style={{ fontSize:32, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:4 }}>{cashNb}</p>
              <p style={{ fontSize:12, color:C.textMuted }}>Transactions</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:C.purpleSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.purple} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
          </div>
        </Card>
        {/* En Attente */}
        <Card style={{ padding:"22px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:10 }}>En Attente</p>
              <p style={{ fontSize:32, fontWeight:800, color:C.textPri, lineHeight:1, marginBottom:4 }}>{enAttenteNb}</p>
              <p style={{ fontSize:12, color:C.textMuted }}>Consultations</p>
            </div>
            <div style={{ width:48, height:48, borderRadius:"50%", background:C.orangeSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Paiements en Attente — fond beige */}
      <div style={{ background:"#fef9f0", border:"1px solid #fed7aa", borderRadius:16, padding:"20px 24px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p style={{ fontSize:16, fontWeight:700, color:C.orange }}>Paiements en Attente</p>
        </div>
        <p style={{ fontSize:14, color:C.textSec, marginBottom:16 }}>{enAttente.length} consultation{enAttente.length>1?"s":""} à régler</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {enAttente.map(a=>(
            <div key={a.id} style={{ background:C.white, borderRadius:12, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:C.textPri, marginBottom:3 }}>{a.patient}</p>
                <p style={{ fontSize:13, color:C.textSec }}>{a.service} - {a.date}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>{a.montant.toLocaleString("fr-FR")} FG</p>
                <button onClick={()=>handleEncaisser(a.id)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", background:C.green, color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#15803d"}
                  onMouseLeave={e=>e.currentTarget.style.background=C.green}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Encaisser
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barre de recherche */}
      <Card style={{ padding:"16px 20px", marginBottom:20 }}>
        <div style={{ position:"relative" }}>
          <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Rechercher par nom, numéro de reçu..." value={recherche} onChange={e=>setRecherche(e.target.value)}
            style={{ width:"100%", padding:"13px 16px 13px 48px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:12, background:C.bg, color:C.textPri, outline:"none", fontFamily:"inherit" }}
            onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.background=C.white }}
            onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.background=C.bg }} />
        </div>
      </Card>

      {/* Historique des Paiements */}
      <Card>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid "+C.border }}>
          <p style={{ fontSize:16, fontWeight:700, color:C.textPri, marginBottom:3 }}>Historique des Paiements</p>
          <p style={{ fontSize:14, color:C.textMuted }}>{paiementsFiltres.length} paiement{paiementsFiltres.length>1?"s":""} enregistré{paiementsFiltres.length>1?"s":""}</p>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["N° Reçu","Date","Patient","Montant","Méthode","Actions"].map(h=>(
                <th key={h} style={{ padding:"14px 20px", textAlign:"left", fontSize:13, fontWeight:700, color:C.textPri, borderBottom:"1px solid "+C.border }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paiementsFiltres.length===0
              ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun paiement trouvé</td></tr>
              : paiementsFiltres.map((p,i,arr)=>(
                <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {/* N° Reçu — bleu cliquable */}
                  <td style={{ padding:"16px 20px" }}>
                    <span style={{ color:C.blue, fontWeight:600, fontSize:14, cursor:"pointer", textDecoration:"none" }}
                      onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
                      onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}
                      onClick={()=>alert("Reçu "+p.id)}>
                      {p.id}
                    </span>
                  </td>
                  {/* Date */}
                  <td style={{ padding:"16px 20px", fontSize:14, color:C.textSec, fontVariantNumeric:"tabular-nums" }}>{p.date}</td>
                  {/* Patient + ID */}
                  <td style={{ padding:"16px 20px" }}>
                    <p style={{ fontSize:14, fontWeight:600, color:C.textPri, marginBottom:2 }}>{p.patient}</p>
                    <p style={{ fontSize:12, color:C.textMuted }}>ID: {p.pid}</p>
                  </td>
                  {/* Montant */}
                  <td style={{ padding:"16px 20px" }}>
                    <p style={{ fontSize:15, fontWeight:800, color:C.textPri }}>{p.montant.toLocaleString("fr-FR")} FG</p>
                  </td>
                  {/* Méthode — badge noir Cash / bleu Carte */}
                  <td style={{ padding:"16px 20px" }}>
                    {p.methode==="cash"
                      ? <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#0f172a", color:"#fff", fontSize:13, fontWeight:700, padding:"6px 14px", borderRadius:20 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                          Cash
                        </span>
                      : <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:C.blue, color:"#fff", fontSize:13, fontWeight:700, padding:"6px 14px", borderRadius:20 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          Carte
                        </span>
                    }
                  </td>
                  {/* Actions — bouton Imprimer */}
                  <td style={{ padding:"16px 20px" }}>
                    <button onClick={()=>alert("Impression reçu "+p.id)}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:C.white, color:C.textSec, border:"1px solid "+C.border, borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background=C.slateSoft }}
                      onMouseLeave={e=>{ e.currentTarget.style.background=C.white }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Imprimer
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        <p style={{ textAlign:"center", fontSize:13, color:C.textMuted, padding:"20px 0", borderTop:"1px solid "+C.border }}>© 2026 Clinique Marouwana. Tous droits réservés.</p>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE GESTION PERSONNEL (comptes)
// ══════════════════════════════════════════════════════════════
function PageComptes({ comptes, setComptes, medecins, setMedecins }) {
  const [tab, setTab]           = useState("medecins")
  const [showMedecin, setShowMedecin] = useState(false)
  const [showCompte, setShowCompte]   = useState(false)
  const toggleC = id => setComptes(prev=>prev.map(c=>c.id===id?{...c,statut:c.statut==="actif"?"bloque":"actif"}:c))
  const toggleM = id => setMedecins(prev=>prev.map(d=>d.id===id?{...d,statut:d.statut==="actif"?"bloque":"actif"}:d))
  const creerMedecin = form => setMedecins(prev=>[...prev,{ id:prev.length+1, nom:"Dr. "+form.nom, prenom:form.prenom, specialite:form.specialite, email:form.email, telephone:form.telephone, estChef:false, statut:"actif", creeLe:today() }])
  const creerCompte  = form => setComptes(prev=>[...prev,{ id:prev.length+1, nom:form.nom, role:form.role, email:form.email, statut:"actif", creeLe:today(), dernConn:"Jamais" }])
  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      {showMedecin&&<ModalCreerMedecin onClose={()=>setShowMedecin(false)} onCreer={creerMedecin} />}
      {showCompte &&<ModalCreerCompte  onClose={()=>setShowCompte(false)}  onCreer={creerCompte}  />}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div><p style={{ fontSize:22, fontWeight:800, color:C.textPri }}>Gestion Personnel</p><p style={{ fontSize:14, color:C.textSec }}>Gérer les comptes du personnel médical</p></div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn onClick={()=>setShowMedecin(true)} variant="success" small>+ Nouveau médecin</Btn>
          <Btn onClick={()=>setShowCompte(true)}  small>+ Autre compte</Btn>
        </div>
      </div>
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid "+C.border, marginBottom:20 }}>
        {[{id:"medecins",l:"Médecins"},{id:"autres",l:"Autres utilisateurs"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"12px 24px", border:"none", background:"none", cursor:"pointer", fontSize:14, fontWeight:tab===t.id?700:500, color:tab===t.id?C.blue:C.textSec, borderBottom:tab===t.id?"2px solid "+C.blue:"2px solid transparent", fontFamily:"inherit" }}>{t.l}</button>
        ))}
      </div>
      {tab==="medecins"&&(
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.slateSoft }}>{["Médecin","Spécialité","Email","Téléphone","Depuis","Statut","Action"].map(h=>(<th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:C.textSec }}>{h}</th>))}</tr></thead>
            <tbody>
              {medecins.map((d,i)=>(
                <tr key={d.id} style={{ borderBottom:i<medecins.length-1?"1px solid "+C.border:"none", opacity:d.statut==="bloque"?.6:1 }} onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={d.nom} size={34} /><div><div style={{ display:"flex", alignItems:"center", gap:6 }}><p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{d.nom}</p>{d.estChef&&<span style={{ fontSize:10, background:C.amberSoft, color:C.amber, padding:"2px 7px", borderRadius:10, fontWeight:700 }}>CHEF</span>}</div><p style={{ fontSize:11, color:C.textMuted }}>{d.prenom}</p></div></div></td>
                  <td style={{ padding:"13px 16px", fontSize:13, color:C.blue, fontWeight:500 }}>{d.specialite}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{d.email}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{d.telephone}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{fmt(d.creeLe)}</td>
                  <td style={{ padding:"13px 16px" }}><StatutBadge statut={d.statut} /></td>
                  <td style={{ padding:"13px 16px" }}>{!d.estChef&&(<button onClick={()=>toggleM(d.id)} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid "+(d.statut==="actif"?C.red:C.green), background:"transparent", color:d.statut==="actif"?C.red:C.green, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{d.statut==="actif"?"Bloquer":"Débloquer"}</button>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {tab==="autres"&&(
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.slateSoft }}>{["Utilisateur","Rôle","Email","Créé le","Dernière connexion","Statut","Action"].map(h=>(<th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:600, color:C.textSec }}>{h}</th>))}</tr></thead>
            <tbody>
              {comptes.map((c,i)=>(
                <tr key={c.id} style={{ borderBottom:i<comptes.length-1?"1px solid "+C.border:"none", opacity:c.statut==="bloque"?.6:1 }} onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={c.nom} size={32} /><p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{c.nom}</p></div></td>
                  <td style={{ padding:"13px 16px" }}><RoleBadge role={c.role} /></td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{c.email}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{fmt(c.creeLe)}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:C.textMuted }}>{c.dernConn}</td>
                  <td style={{ padding:"13px 16px" }}><StatutBadge statut={c.statut} /></td>
                  <td style={{ padding:"13px 16px" }}><button onClick={()=>toggleC(c.id)} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid "+(c.statut==="actif"?C.red:C.green), background:"transparent", color:c.statut==="actif"?C.red:C.green, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{c.statut==="actif"?"Bloquer":"Débloquer"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE SUIVI PRÉSENCE
// ══════════════════════════════════════════════════════════════
function PagePresence({ medecins }) {
  const presences = [
    { id:1, docteurId:1, arrivee:"07:30", depart:null,    statut:"present",   patientsVus:4 },
    { id:2, docteurId:2, arrivee:"08:00", depart:null,    statut:"present",   patientsVus:3 },
    { id:3, docteurId:3, arrivee:"08:15", depart:null,    statut:"present",   patientsVus:2 },
    { id:4, docteurId:4, arrivee:null,    depart:null,    statut:"absent",    patientsVus:0 },
    { id:5, docteurId:5, arrivee:null,    depart:null,    statut:"en_retard", patientsVus:0 },
  ]
  const cfgS = { present:{ label:"Présent",color:C.green,bg:C.greenSoft }, absent:{ label:"Absent",color:C.red,bg:C.redSoft }, en_retard:{ label:"En retard",color:C.amber,bg:C.amberSoft }, parti:{ label:"Parti",color:C.slate,bg:C.slateSoft } }
  return (
    <div style={{ maxWidth:960, margin:"0 auto" }}>
      <p style={{ fontSize:22, fontWeight:800, color:C.textPri, marginBottom:6 }}>Suivi Présence</p>
      <p style={{ fontSize:14, color:C.textSec, marginBottom:24 }}>Présence du personnel médical — {new Date().toLocaleDateString("fr-FR")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[{label:"Présents",val:presences.filter(p=>p.statut==="present").length,bg:C.greenSoft,fg:C.green,icon:"✅"},{label:"Absents",val:presences.filter(p=>p.statut==="absent").length,bg:C.redSoft,fg:C.red,icon:"❌"},{label:"En retard",val:presences.filter(p=>p.statut==="en_retard").length,bg:C.amberSoft,fg:C.amber,icon:"⏰"},{label:"Partis",val:presences.filter(p=>p.statut==="parti").length,bg:C.slateSoft,fg:C.slate,icon:"🚪"}].map(({label,val,bg,fg,icon})=>(
          <Card key={label} style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
            <div><p style={{ fontSize:24, fontWeight:800, color:fg, letterSpacing:"-1px" }}>{val}</p><p style={{ fontSize:12, color:C.textMuted }}>{label}</p></div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title={"Présences du jour — "+new Date().toLocaleDateString("fr-FR")} />
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.slateSoft }}>{["Médecin","Spécialité","Arrivée","Départ","Patients vus","Statut"].map(h=>(<th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>
            {presences.map((p,i,arr)=>{
              const d=medecins.find(m=>m.id===p.docteurId),s=cfgS[p.statut]; if(!d) return null
              return (
                <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }} onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={d.nom} size={32} /><p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{d.nom}</p></div></td>
                  <td style={{ padding:"13px 16px", fontSize:13, color:C.blue, fontWeight:500 }}>{d.specialite}</td>
                  <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:p.arrivee?C.green:C.textMuted, fontVariantNumeric:"tabular-nums" }}>{p.arrivee||"—"}</td>
                  <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:p.depart?C.red:C.textMuted, fontVariantNumeric:"tabular-nums" }}>{p.depart||"En service"}</td>
                  <td style={{ padding:"13px 16px", textAlign:"center" }}><span style={{ background:C.blueSoft, color:C.blue, fontWeight:700, fontSize:13, borderRadius:20, padding:"4px 12px" }}>{p.patientsVus}</span></td>
                  <td style={{ padding:"13px 16px" }}><span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33" }}>{s.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
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

  const handleAssigner = (consultId, docteurId) => setConsultations(prev=>prev.map(c=>c.id===consultId?{...c,docteurId}:c))
  const handleSigner   = (consultId, notes, diag, trait) => {
    const ts=new Date().toLocaleString("fr-FR")
    setConsultations(prev=>prev.map(c=>c.id===consultId?{...c,statut:"paye",paiement:"cash",signePar:"Dr. Doumbouya",signeLe:ts}:c))
  }

  const nonAssignes = consultations.filter(c=>c.date===today()&&!c.docteurId).length
  const nonSigne    = consultations.filter(c=>c.statut==="en_attente"&&c.docteurId).length

  const NAV_ICONS = {
    accueil:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    patients:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    consultations: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    laboratoire:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3h6v11l3.5 6.5a1 1 0 0 1-.9 1.5H6.4a1 1 0 0 1-.9-1.5L9 14V3z"/><line x1="6" y1="9" x2="18" y2="9"/></svg>,
    comptabilite:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>,
    comptes:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
    presence:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    stats:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  }

  const NAV = [
    { id:"accueil",       label:"Tableau de bord"       },
    { id:"patients",      label:"Registre des patients"  },
    { id:"consultations", label:"Consultations",          badge:nonSigne },
    { id:"laboratoire",   label:"Laboratoire"             },
    { id:"comptabilite",  label:"Comptabilité"            },
    { id:"comptes",       label:"Gestion Personnel"       },
    { id:"presence",      label:"Suivi Présence"          },
    { id:"stats",         label:"Statistiques"            },
  ]

  const TITRES = {
    accueil:"Tableau de Bord Administrateur", patients:"Registre des patients",
    consultations:"Consultations", laboratoire:"Laboratoire",
    comptabilite:"Comptabilité", comptes:"Gestion Personnel",
    presence:"Suivi Présence", stats:"Statistiques",
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:270, background:C.white, boxShadow:"4px 0 20px rgba(0,0,0,0.1)", display:"flex", flexDirection:"column", overflow:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
              <img src={logo} alt="" style={{ height:40, borderRadius:8, objectFit:"cover" }} />
              <div><p style={{ fontSize:14, fontWeight:800, color:C.textPri }}>Clinique Marouane</p><p style={{ fontSize:12, color:C.textSec }}>Système de gestion</p></div>
            </div>
            <nav style={{ padding:"14px 12px", flex:1 }}>
              <p style={{ fontSize:10, color:C.textMuted, letterSpacing:"0.12em", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>Menu principal</p>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setPage(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, border:"none", background:page===n.id?C.blue:"transparent", color:page===n.id?"#fff":C.textSec, fontSize:14, fontWeight:page===n.id?700:500, cursor:"pointer", marginBottom:2, fontFamily:"inherit", textAlign:"left" }}
                  onMouseEnter={e=>{ if(page!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(page!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ display:"flex", alignItems:"center", flexShrink:0 }}>{NAV_ICONS[n.id]}</span>
                  <span style={{ flex:1 }}>{n.label}</span>
                  {n.badge>0&&<span style={{ background:C.red, color:"#fff", fontSize:11, fontWeight:700, borderRadius:10, padding:"2px 7px" }}>{n.badge}</span>}
                </button>
              ))}
            </nav>
            <div style={{ padding:"12px 16px 18px", borderTop:"1px solid "+C.border, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.amberSoft, borderRadius:12, border:"1px solid "+C.amber+"33" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:C.amber, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div><p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>Dr. Doumbouya</p><p style={{ fontSize:11, color:C.amber, fontWeight:600 }}>★ Médecin chef</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40, height:40, borderRadius:8, border:"1px solid "+C.border, background:C.white, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} /><div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} /><div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:13, color:C.textSec, fontVariantNumeric:"tabular-nums" }}>{heure}</span>
          <button onClick={()=>{ setPointerHeure(nowTime()); setShowPointer(true) }} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:10, border:"1.5px solid "+C.green, background:C.white, color:C.green, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Pointer Arrivée
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:14, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>Dr. Amadou Koné</p>
              <p style={{ fontSize:12, color:C.textSec }}>Administration</p>
            </div>
            <div style={{ width:38, height:38, borderRadius:"50%", background:C.blueSoft, border:"2px solid "+C.blue+"33", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation pointer */}
      {showPointer&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.white, borderRadius:16, padding:32, maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:C.greenSoft, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize:18, fontWeight:800, color:C.textPri, marginBottom:8 }}>Arrivée enregistrée</p>
            <p style={{ fontSize:14, color:C.textSec, marginBottom:8 }}>Dr. Amadou Koné</p>
            <p style={{ fontSize:24, fontWeight:800, color:C.green, marginBottom:20 }}>{pointerHeure}</p>
            <p style={{ fontSize:13, color:C.textMuted, marginBottom:24 }}>Votre heure d'arrivée a été enregistrée et ne peut pas être modifiée.</p>
            <Btn onClick={()=>setShowPointer(false)} full>Fermer</Btn>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <main style={{ padding:"32px 24px" }}>
        {page==="accueil"&&<div style={{ marginBottom:28 }}><p style={{ fontSize:32, fontWeight:800, color:C.textPri, letterSpacing:"-0.5px", marginBottom:6 }}>Tableau de Bord Administrateur</p><p style={{ fontSize:15, color:C.textSec }}>Vue d'ensemble de l'activité de la clinique</p></div>}
        {page!=="accueil"&&<div style={{ marginBottom:28 }}><p style={{ fontSize:24, fontWeight:800, color:C.textPri, marginBottom:4 }}>{TITRES[page]}</p></div>}

        {page==="accueil"      && <PageAccueil       consultations={consultations} patients={INIT_PATIENTS} medecins={medecins} setPage={setPage} />}
        {page==="patients"     && <PageRegistrePatients consultations={consultations} patients={INIT_PATIENTS} />}
        {page==="assignation"  && <PageAssignation   consultations={consultations} patients={INIT_PATIENTS} medecins={medecins} onAssigner={handleAssigner} />}
        {page==="consultations"&& <PageConsultations consultations={consultations} patients={INIT_PATIENTS} medecins={medecins} onSigner={handleSigner} />}
        {page==="laboratoire"  && <PageLaboratoire />}
        {page==="comptabilite" && <PageComptabilite  consultations={consultations} />}
        {page==="comptes"      && <PageComptes       comptes={comptes} setComptes={setComptes} medecins={medecins} setMedecins={setMedecins} />}
        {page==="presence"     && <PagePresence      medecins={medecins} />}
        {page==="stats"        && <PageStats         consultations={consultations} patients={INIT_PATIENTS} />}
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