import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useClinicSettings } from "../../hooks/useClinicSettings.jsx"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
function genId(seed) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let result = "CAB-", n = seed * 48271 + 1000003
  for (let i = 0; i < 6; i++) { n = (n*1664525+1013904223)&0x7fffffff; result+=chars[n%chars.length] }
  return result
}
const today   = () => new Date().toISOString().slice(0,10)
const nowTime = () => new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
const fmt     = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

const SERVICES = [
  "Accueil","Ophtalmologie","ORL","Laboratoire","Pharmacie","Pédiatrie",
  "Médecine générale","Traumatologie","Gynécologie","Cardiologie",
  "Neurologie","Urologie","Chirurgie","Diabétologie / Endocrinologie",
]

// ══════════════════════════════════════════════════════
//  DONNÉES MOCK
// ══════════════════════════════════════════════════════
const PATIENTS_DB = [
  { id:1, pid:genId(1), nom:"Bah Mariama",     age:"34 ans",    dateNaissance:"1990-03-12", sexe:"F", telephone:"+224 622 11 22 33", quartier:"Ratoma",   secteur:"Lansanayah", profession:"Commerçante", responsable:"Mamadou Bah" },
  { id:2, pid:genId(2), nom:"Diallo Ibrahima", age:"52 ans",    dateNaissance:"1972-07-04", sexe:"M", telephone:"+224 628 44 55 66", quartier:"Kaloum",   secteur:"Boulbinet",  profession:"Enseignant",  responsable:"Lui-même"    },
  { id:3, pid:genId(3), nom:"Sow Fatoumata",   age:"1an 3mois", dateNaissance:"2022-11-20", sexe:"F", telephone:"+224 621 77 88 99", quartier:"Dixinn",   secteur:"Yimbayah",   profession:"S/C",          responsable:"Mamadou Sow" },
  { id:4, pid:genId(4), nom:"Kouyaté Mamadou", age:"61 ans",    dateNaissance:"1963-01-15", sexe:"M", telephone:"+224 624 33 44 55", quartier:"Matam",    secteur:"Tannerie",   profession:"Commerçant",  responsable:"Lui-même"    },
  { id:5, pid:genId(5), nom:"Baldé Aissatou",  age:"19 ans",    dateNaissance:"2005-06-08", sexe:"F", telephone:"+224 625 66 77 88", quartier:"Matoto",   secteur:"Gbessia",    profession:"Élève",        responsable:"Mamadou Baldé"},
]

const DOCTEURS = [
  { id:1, nom:"Dr. Doumbouya", specialite:"Médecine générale",          statut:"present" },
  { id:2, nom:"Dr. Camara",    specialite:"Cardiologie",                 statut:"present" },
  { id:3, nom:"Dr. Barry",     specialite:"Diabétologie / Endocrinologie", statut:"present" },
  { id:4, nom:"Dr. Souaré",    specialite:"Pédiatrie",                   statut:"absent"  },
  { id:5, nom:"Dr. Keïta",     specialite:"Gynécologie",                 statut:"present" },
  { id:6, nom:"Dr. Bah",       specialite:"Ophtalmologie",               statut:"present" },
  { id:7, nom:"Dr. Diallo",    specialite:"Traumatologie",               statut:"present" },
  { id:8, nom:"Dr. Konaté",    specialite:"Neurologie",                  statut:"present" },
  { id:9, nom:"Dr. Traoré",    specialite:"ORL",                         statut:"present" },
]

const RDV_INIT = [
  { id:1, patientId:3, patient:"Sow Fatoumata",   date:"2026-04-05", heure:"09:00", service:"Gynécologie",  docteur:"Dr. Keïta",     motif:"CPN - 7ème mois",      rappelEnvoye:false },
  { id:2, patientId:1, patient:"Bah Mariama",     date:"2026-04-05", heure:"10:00", service:"Cardiologie",  docteur:"Dr. Camara",    motif:"Suivi tension",         rappelEnvoye:true  },
  { id:3, patientId:5, patient:"Baldé Aissatou",  date:"2026-04-07", heure:"08:30", service:"Ophtalmologie",docteur:"Dr. Bah",       motif:"Contrôle vue",          rappelEnvoye:false },
]

// File d'attente du jour (envoyés au médecin chef)
const FILE_INIT = [
  { id:1, patientId:2, pid:genId(2), nom:"Diallo Ibrahima", arrivee:"08:45", typeVisite:"consultation", statut:"en_attente", montantTotal:50000, paiement:null },
  { id:2, patientId:4, pid:genId(4), nom:"Kouyaté Mamadou", arrivee:"09:30", typeVisite:"rendez_vous",  statut:"en_attente", montantTotal:75000, paiement:null },
]

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

// ══════════════════════════════════════════════════════
//  COMPOSANTS DE BASE
// ══════════════════════════════════════════════════════
function Badge({ statut }) {
  const cfg = {
    en_attente:{ label:"En attente",  color:C.slate,  bg:C.slateSoft },
    en_salle:  { label:"En salle",    color:C.green,  bg:C.greenSoft, pulse:true },
    consultation:{label:"Consultation",color:C.green,  bg:C.greenSoft },
    rendez_vous: {label:"Rendez-vous", color:C.purple, bg:C.purpleSoft},
    parti:     { label:"Parti",       color:C.slate,  bg:C.slateSoft },
    paye:      { label:"Payé",        color:C.green,  bg:C.greenSoft },
    partiel:   { label:"Partiel",     color:C.slate,  bg:C.slateSoft },
    impaye:    { label:"Impayé",      color:C.red,    bg:C.redSoft   },
  }
  const s = cfg[statut]||cfg.en_attente
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33", whiteSpace:"nowrap" }}>
      {s.pulse&&<span style={{ width:5,height:5,borderRadius:"50%",background:s.color,animation:"blink 2s ease-in-out infinite" }}/>}
      {s.label}
    </span>
  )
}

function Avatar({ name, size=36 }) {
  const bgs=[C.blueSoft,C.greenSoft,C.purpleSoft,C.slateSoft,C.orangeSoft]
  const fgs=[C.blue,C.green,C.purple,C.slate,C.orange]
  const i=(name?.charCodeAt(0)||0)%bgs.length
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:bgs[i],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}
function Card({ children, style={} }) {
  return <div style={{ background:C.white,borderRadius:16,border:"1px solid "+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",...style }}>{children}</div>
}
function CardHeader({ title, action }) {
  return (
    <div style={{ padding:"16px 20px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
      <p style={{ fontWeight:700,fontSize:15,color:C.textPri }}>{title}</p>
      {action}
    </div>
  )
}
function Btn({ children, onClick, variant="primary", small=false, disabled=false }) {
  const cfg={ primary:{bg:C.blue,hov:"#155e8b",color:"#fff",border:"none"}, success:{bg:C.green,hov:"#166534",color:"#fff",border:"none"}, secondary:{bg:"transparent",hov:C.slateSoft,color:C.textSec,border:"1px solid "+C.border} }
  const s=cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:s.bg,color:s.color,border:s.border||"none",borderRadius:10,padding:small?"7px 14px":"10px 20px",fontSize:small?12:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,fontFamily:"inherit",transition:"all .2s",opacity:disabled?.55:1 }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=s.hov }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.background=s.bg }}
    >{children}</button>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — ENREGISTRER NOUVEAU PATIENT (formulaire image)
// ══════════════════════════════════════════════════════
function ModalNouveauPatient({ onClose, onEnregistrer }) {
  const INIT={ nom:"",prenom:"",age:"",dateNaissance:"",sexe:"F",telephone:"",profession:"",quartier:"",secteur:"",responsable:"",telResponsable:"",typeVisite:"consultation" }
  const [form, setForm]=useState(INIT)
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}))
  const ok=form.nom&&form.prenom

  const iSt={ width:"100%",padding:"13px 16px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:12,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }
  const foc=e=>{e.target.style.borderColor=C.blue;e.target.style.boxShadow="0 0 0 3px "+C.blueSoft}
  const blr=e=>{e.target.style.borderColor=C.border;e.target.style.boxShadow="none"}

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px",overflowY:"auto" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:860,marginTop:20,boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>

        {/* En-tête */}
        <div style={{ padding:"24px 32px 20px",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:20,fontWeight:800,color:C.textPri,marginBottom:4 }}>Registre d'Accueil — Enregistrer un patient</p>
            <p style={{ fontSize:13,color:C.textMuted }}>Remplir la fiche complète. Le médecin chef assignera le médecin après.</p>
          </div>
          <button onClick={onClose}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",border:"1px solid "+C.border,borderRadius:10,background:C.white,color:C.textSec,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
            onMouseLeave={e=>e.currentTarget.style.background=C.white}>
            Fermer
          </button>
        </div>

        <div style={{ padding:"0 32px 28px",display:"flex",flexDirection:"column",gap:24 }}>

          {/* IDENTITÉ DU PATIENT */}
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16 }}>Identité du patient</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16 }}>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Nom de famille <span style={{ color:C.red }}>*</span></label>
                <input value={form.nom} onChange={e=>setF("nom",e.target.value)} placeholder="Ex : DIALLO" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Prénom(s) <span style={{ color:C.red }}>*</span></label>
                <input value={form.prenom} onChange={e=>setF("prenom",e.target.value)} placeholder="Ex : Aminata" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Téléphone</label>
                <input value={form.telephone} onChange={e=>setF("telephone",e.target.value)} placeholder="+224 6XX XX XX XX" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Âge</label>
                <input value={form.age} onChange={e=>setF("age",e.target.value)} placeholder="Ex : 35 ans" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Date de naissance</label>
                <input type="date" value={form.dateNaissance} onChange={e=>setF("dateNaissance",e.target.value)} style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Sexe</label>
                <select value={form.sexe} onChange={e=>setF("sexe",e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                </select>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Profession</label>
                <input value={form.profession} onChange={e=>setF("profession",e.target.value)} placeholder="Ex : Commerçant, Élève, S/C..." style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Quartier</label>
                <input value={form.quartier} onChange={e=>setF("quartier",e.target.value)} placeholder="Ex : Ratoma" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Secteur / District</label>
                <input value={form.secteur} onChange={e=>setF("secteur",e.target.value)} placeholder="Ex : Yimbayah, Lansanayah..." style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          </div>

          {/* PERSONNE RESPONSABLE */}
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16 }}>Personne responsable</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Nom du responsable</label>
                <input value={form.responsable} onChange={e=>setF("responsable",e.target.value)} placeholder="Ex : Mamadou Diallo ou Lui-même" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
              <div>
                <label style={{ display:"block",fontSize:13,fontWeight:500,color:C.textPri,marginBottom:8 }}>Téléphone responsable</label>
                <input value={form.telResponsable} onChange={e=>setF("telResponsable",e.target.value)} placeholder="+224 6XX XX XX XX" style={iSt} onFocus={foc} onBlur={blr}/>
              </div>
            </div>
          </div>

          {/* TYPE DE VISITE */}
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:16 }}>Type de visite</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              {[
                { val:"consultation",label:"Consultation",   desc:"Visite sans rendez-vous",      icon:"C" },
                { val:"rendez_vous", label:"Rendez-vous",    desc:"RDV programmé à l'avance",     icon:"rdv" },
              ].map(opt=>(
                <div key={opt.val} onClick={()=>setF("typeVisite",opt.val)}
                  style={{ padding:"14px 18px",borderRadius:14,border:"2px solid "+(form.typeVisite===opt.val?C.blue:C.border),background:form.typeVisite===opt.val?C.blueSoft:C.white,cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:12 }}>
                  <span style={{ fontSize:22 }}>{opt.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14,fontWeight:700,color:form.typeVisite===opt.val?C.blue:C.textPri,marginBottom:2 }}>{opt.label}</p>
                    <p style={{ fontSize:12,color:C.textMuted }}>{opt.desc}</p>
                  </div>
                  {form.typeVisite===opt.val&&(
                    <div style={{ width:20,height:20,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:12,paddingTop:16,borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={()=>{ if(ok) onEnregistrer(form) }} disabled={!ok}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Enregistrer et envoyer au médecin chef
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — RECHERCHER DOSSIER EXISTANT
// ══════════════════════════════════════════════════════
function ModalRechercheDossier({ patients, onClose, onSignaler }) {
  const [q, setQ]=useState("")
  const resultats = q.length>=2 ? patients.filter(p=>
    p.pid.toLowerCase().includes(q.toLowerCase())||
    p.nom.toLowerCase().includes(q.toLowerCase())||
    (p.telephone||"").includes(q)
  ) : []

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:560,boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>Rechercher un dossier patient</p>
            <p style={{ fontSize:13,color:C.textSec,marginTop:3 }}>Par N° dossier, nom ou téléphone</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft,border:"none",borderRadius:8,color:C.textSec,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"20px 28px 24px" }}>
          <div style={{ position:"relative",marginBottom:16 }}>
            <svg style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Ex : CAB-A1B2C3 ou Bah Mariama..."
              style={{ width:"100%",padding:"12px 14px 12px 40px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:12,background:C.bg,color:C.textPri,outline:"none",fontFamily:"inherit" }}
              onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.background=C.white }}
              onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.background=C.bg }}/>
          </div>
          {q.length<2 && <p style={{ fontSize:13,color:C.textMuted,textAlign:"center",padding:"20px 0" }}>Tapez au moins 2 caractères pour rechercher</p>}
          {q.length>=2 && resultats.length===0 && (
            <div style={{ padding:"24px",textAlign:"center",background:C.bg,borderRadius:12,border:"1px solid "+C.border }}>
              <p style={{ fontSize:14,color:C.textMuted,marginBottom:8 }}>Aucun dossier trouvé pour « {q} »</p>
              <p style={{ fontSize:13,color:C.textSec }}>Ce patient n'est pas encore enregistré.</p>
            </div>
          )}
          {resultats.map(p=>(
            <div key={p.id} style={{ padding:"14px 16px",borderRadius:12,border:"1px solid "+C.border,marginBottom:10,display:"flex",alignItems:"center",gap:12,background:C.bg }}>
              <Avatar name={p.nom} size={40}/>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:2 }}>{p.nom}</p>
                <p style={{ fontSize:12,color:C.textSec }}>{p.pid} · {p.age} · {p.telephone}</p>
                <p style={{ fontSize:12,color:C.textMuted }}>{p.quartier}{p.secteur?", "+p.secteur:""}</p>
              </div>
              <Btn onClick={()=>{ onSignaler(p); onClose() }} small variant="success">
                Signaler au médecin chef →
              </Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — CRÉER UN RENDEZ-VOUS
// ══════════════════════════════════════════════════════
function ModalCreerRdv({ patients, docteurs, onClose, onCreate }) {
  const [form,setForm]=useState({ patientId:"",docteur:"",service:SERVICES[6],date:"",heure:"",motif:"" })
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}))
  const ok=form.patientId&&form.date&&form.heure

  const iSt={ width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:540,maxHeight:"90vh",overflow:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>Créer un rendez-vous</p>
            <p style={{ fontSize:13,color:C.textSec,marginTop:3 }}>Le patient recevra un rappel automatique</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft,border:"none",borderRadius:8,color:C.textSec,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px",display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Patient <span style={{ color:C.red }}>*</span></label>
            <select value={form.patientId} onChange={e=>setF("patientId",e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
              <option value="">— Choisir un patient —</option>
              {patients.map(p=><option key={p.id} value={p.id}>{p.nom} · {p.pid}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Médecin / Service <span style={{ color:C.red }}>*</span></label>
            <select value={form.docteur} onChange={e=>setF("docteur",e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
              <option value="">— Choisir un médecin —</option>
              {docteurs.filter(d=>d.statut==="present").map(d=><option key={d.id} value={d.nom}>{d.nom} — {d.specialite}</option>)}
            </select>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Date <span style={{ color:C.red }}>*</span></label>
              <input type="date" value={form.date} onChange={e=>setF("date",e.target.value)} style={iSt}/>
            </div>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Heure <span style={{ color:C.red }}>*</span></label>
              <input type="time" value={form.heure} onChange={e=>setF("heure",e.target.value)} style={iSt}/>
            </div>
          </div>
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Motif du rendez-vous</label>
            <input value={form.motif} onChange={e=>setF("motif",e.target.value)} placeholder="Ex : CPN suivi, Contrôle tension..." style={iSt}/>
          </div>
          <div style={{ background:C.blueSoft,border:"1px solid "+C.blue+"33",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:10 }}>
            <p style={{ fontSize:13,color:C.textPri }}>Un rappel SMS sera envoyé automatiquement au patient la veille du rendez-vous.</p>
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={()=>{ if(ok) onCreate(form) }} disabled={!ok}>
               Créer le rendez-vous
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — PAIEMENT
// ══════════════════════════════════════════════════════
function ModalPaiement({ patient, montantDu, paiementExistant, onClose, onValider }) {
  const [methode,   setMethode]   = useState(paiementExistant?.methode || "cash")
  const [statut,    setStatut]    = useState(paiementExistant?.statut || "total")   // total | partiel | impaye
  const [montant,   setMontant]   = useState(paiementExistant?.montant?.toString() || (montantDu||""))
  const [delai,     setDelai]     = useState(paiementExistant?.delai || "")
  const [note,      setNote]      = useState(paiementExistant?.note || "")

  if (!patient) return null

  const montantPaye = parseInt(montant||0)
  const resteAPayer = montantDu ? montantDu - montantPaye : 0

  const iSt={ width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>Gestion du paiement</p>
            <p style={{ fontSize:13,color:C.textSec,marginTop:3 }}>{patient.nom}</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft,border:"none",borderRadius:8,color:C.textSec,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px",display:"flex",flexDirection:"column",gap:16 }}>

          {/* Résumé des montants */}
          <div style={{ background:C.bg,borderRadius:14,padding:"16px 18px",border:"1px solid "+C.border }}>
            <p style={{ fontSize:11,fontWeight:700,color:C.textPri,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12 }}>Récapitulatif du paiement</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
              {/* Total à payer */}
              <div style={{ background:C.white,borderRadius:10,padding:"12px",border:"1px solid "+C.border }}>
                <p style={{ fontSize:11,color:C.textMuted,marginBottom:4 }}>Total à payer</p>
                <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>
                  {montantDu ? montantDu.toLocaleString("fr-FR") : "—"} <span style={{ fontSize:11,fontWeight:500 }}>GNF</span>
                </p>
              </div>
              {/* Déjà payé */}
              <div style={{ background:C.white,borderRadius:10,padding:"12px",border:"1px solid "+(statut!=="impaye"?C.green:C.border) }}>
                <p style={{ fontSize:11,color:C.textMuted,marginBottom:4 }}>Déjà payé</p>
                <p style={{ fontSize:18,fontWeight:800,color:statut!=="impaye"?C.green:C.textMuted }}>
                  {statut!=="impaye" ? montantPaye.toLocaleString("fr-FR") : "0"} <span style={{ fontSize:11,fontWeight:500 }}>GNF</span>
                </p>
              </div>
              {/* Reste à payer */}
              <div style={{ background:C.white,borderRadius:10,padding:"12px",border:"1px solid "+(resteAPayer>0?C.slate:C.border) }}>
                <p style={{ fontSize:11,color:C.textMuted,marginBottom:4 }}>Reste à payer</p>
                <p style={{ fontSize:18,fontWeight:800,color:resteAPayer>0?C.slate:C.green }}>
                  {resteAPayer.toLocaleString("fr-FR")} <span style={{ fontSize:11,fontWeight:500 }}>GNF</span>
                </p>
              </div>
            </div>
          </div>

          {/* Statut paiement */}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:10 }}>Statut du paiement</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
              {[
                { val:"total",   label:"Tout payé",        icon:"", color:C.green,  bg:C.greenSoft  },
                { val:"partiel", label:"Paiement partiel", icon:"", color:C.slate,  bg:C.slateSoft  },
                { val:"impaye",  label:"Rien payé",        icon:"", color:C.red,    bg:C.redSoft    },
              ].map(opt=>(
                <div key={opt.val} onClick={()=>setStatut(opt.val)}
                  style={{ padding:"12px 10px",borderRadius:12,border:"2px solid "+(statut===opt.val?opt.color:C.border),background:statut===opt.val?opt.bg:C.white,cursor:"pointer",textAlign:"center",transition:"all .15s" }}>
                  <p style={{ fontSize:18,marginBottom:4 }}>{opt.icon}</p>
                  <p style={{ fontSize:12,fontWeight:700,color:statut===opt.val?opt.color:C.textSec }}>{opt.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Méthode de paiement */}
          {statut!=="impaye" && (
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:10 }}>Méthode de paiement</label>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[
                  { val:"cash",         label:"Cash (espèces)", icon:"" },
                  { val:"orange_money", label:"Orange Money",   icon:"" },
                ].map(opt=>(
                  <div key={opt.val} onClick={()=>setMethode(opt.val)}
                    style={{ padding:"12px 16px",borderRadius:12,border:"2px solid "+(methode===opt.val?C.blue:C.border),background:methode===opt.val?C.blueSoft:C.white,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .15s" }}>
                    <span style={{ fontSize:20 }}>{opt.icon}</span>
                    <p style={{ fontSize:13,fontWeight:700,color:methode===opt.val?C.blue:C.textPri }}>{opt.label}</p>
                    {methode===opt.val&&<div style={{ marginLeft:"auto",width:18,height:18,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center" }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Montant payé */}
          {statut!=="impaye" && (
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>
                {statut==="partiel"?"Montant versé (GNF)":"Montant encaissé (GNF)"}
              </label>
              <input type="number" value={montant} onChange={e=>setMontant(e.target.value)}
                placeholder={"Ex : "+(montantDu||50000)} style={iSt}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
              {statut==="partiel"&&montantDu&&montant&&(
                <p style={{ fontSize:12,color:C.slate,marginTop:6,fontWeight:600 }}>
                  Reste à payer : {resteAPayer.toLocaleString("fr-FR")} GNF
                </p>
              )}
            </div>
          )}

          {/* Délai de paiement (si partiel ou impayé) */}
          {(statut==="partiel"||statut==="impaye") && (
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>
                Date limite de règlement <span style={{ color:C.red }}>*</span>
              </label>
              <input type="date" value={delai} onChange={e=>setDelai(e.target.value)} style={iSt}
                min={today()}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
              <p style={{ fontSize:12,color:C.textMuted,marginTop:4 }}>Le solde doit être réglé avant cette date pour poursuivre les soins.</p>
            </div>
          )}

          {/* Note */}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Note (optionnelle)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex : Paiement en attente de virement..." style={iSt}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>

          {/* Avertissement impayé */}
          {statut==="impaye" && (
            <div style={{ background:C.redSoft,border:"1px solid "+C.red+"33",borderRadius:10,padding:"12px 16px" }}>
              <p style={{ fontSize:13,color:C.red,fontWeight:600 }}>Le patient doit régler avant la date limite pour que la consultation puisse commencer.</p>
            </div>
          )}

          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={()=>{ if(statut==="impaye"&&!delai){ alert("Veuillez fixer une date limite."); return }; onValider({ statut,methode,montant:montantPaye,delai,note }); onClose() }}
              variant={statut==="total"?"success":"primary"}>
              Valider le paiement
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — PERMISSION / ABSENCE
// ══════════════════════════════════════════════════════
function ModalPermission({ medecin, onClose, onValider }) {
  const [type, setType] = useState(null) // 'maladie' | 'urgence'
  const [description, setDescription] = useState("")
  const [dateDebut, setDateDebut] = useState(today())
  const [dateFin, setDateFin] = useState(today())
  const [justificatif, setJustificatif] = useState(null)

  if (!medecin) return null

  const iSt = { width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:520,boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>Enregistrer une absence</p>
            <p style={{ fontSize:13,color:C.textSec,marginTop:3 }}>{medecin.nom} — {medecin.specialite}</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft,border:"none",borderRadius:8,color:C.textSec,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>×</button>
        </div>

        <div style={{ padding:"24px 28px",display:"flex",flexDirection:"column",gap:16 }}>
          {/* Type d'absence */}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:8 }}>Type d'absence <span style={{ color:C.red }}>*</span></label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[
                { val:"maladie", label:"Maladie", icon:"", color:C.slate },
                { val:"urgence", label:"Urgence", icon:"", color:C.red },
              ].map(opt => (
                <div key={opt.val} onClick={()=>setType(opt.val)}
                  style={{ padding:"12px 14px",borderRadius:12,border:"2px solid "+(type===opt.val?opt.color:C.border),background:type===opt.val?opt.color+"11":C.white,cursor:"pointer",textAlign:"center",transition:"all .15s" }}>
                  <p style={{ fontSize:20,marginBottom:4 }}>{opt.icon}</p>
                  <p style={{ fontSize:13,fontWeight:700,color:type===opt.val?opt.color:C.textSec }}>{opt.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Précisez le motif de l'absence..." style={{...iSt,minHeight:80,resize:"vertical"}} />
          </div>

          {/* Dates */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Date de début <span style={{ color:C.red }}>*</span></label>
              <input type="date" value={dateDebut} onChange={e=>setDateDebut(e.target.value)} style={iSt} />
            </div>
            <div>
              <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Date de fin <span style={{ color:C.red }}>*</span></label>
              <input type="date" value={dateFin} onChange={e=>setDateFin(e.target.value)} style={iSt} min={dateDebut} />
            </div>
          </div>

          {/* Justificatif */}
          <div>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.textPri,marginBottom:6 }}>Justificatif (optionnel)</label>
            <input type="file" onChange={e=>setJustificatif(e.target.files?.[0]||null)} style={iSt} accept=".pdf,.jpg,.jpeg,.png" />
            <p style={{ fontSize:11,color:C.textMuted,marginTop:4 }}>Formats acceptés : PDF, JPG, PNG</p>
          </div>

          {/* Avertissement */}
          {type && (
            <div style={{ background:type==="maladie"?C.slateSoft:C.redSoft,border:"1px solid "+(type==="maladie"?C.slate:C.red)+"33",borderRadius:10,padding:"12px 16px" }}>
              <p style={{ fontSize:13,color:type==="maladie"?C.slate:C.red,fontWeight:600 }}>
                Cette absence sera enregistrée dans l'historique de présence
              </p>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid "+C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={()=>{ if(type&&dateDebut&&dateFin) { onValider({ type, description, dateDebut, dateFin, justificatif }); onClose(); } }} variant="success" disabled={!type||!dateDebut||!dateFin}>
              Enregistrer l'absence
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — HISTORIQUE DE PRÉSENCE
// ══════════════════════════════════════════════════════
function ModalHistorique({ medecins, historique, onClose }) {
  const [filtreMedecin, setFiltreMedecin] = useState("tous")
  const [filtreDate, setFiltreDate] = useState("")
  const [filtreType, setFiltreType] = useState("tous")

  const iSt = { width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }

  const filtreHistorique = historique.filter(h => {
    const medOk = filtreMedecin === "tous" || h.medecinId === parseInt(filtreMedecin)
    const dateOk = !filtreDate || h.date === filtreDate
    const typeOk = filtreType === "tous" || h.type === filtreType
    return medOk && dateOk && typeOk
  }).sort((a,b) => new Date(b.date + " " + b.heure) - new Date(a.date + " " + a.heure))

  const getMedecinNom = (id) => {
    const med = medecins.find(m => m.id === id)
    return med ? med.nom : "Inconnu"
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:800,maxHeight:"90vh",overflow:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18,fontWeight:800,color:C.textPri }}>Historique de présence</p>
            <p style={{ fontSize:13,color:C.textSec,marginTop:3 }}>Consultation des pointages et absences</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft,border:"none",borderRadius:8,color:C.textSec,cursor:"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>×</button>
        </div>
        
        {/* Filtres */}
        <div style={{ padding:"18px 28px",borderBottom:"1px solid "+C.border,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textPri,marginBottom:6 }}>Médecin</label>
            <select value={filtreMedecin} onChange={e=>setFiltreMedecin(e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
              <option value="tous">Tous les médecins</option>
              {medecins.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textPri,marginBottom:6 }}>Date</label>
            <input type="date" value={filtreDate} onChange={e=>setFiltreDate(e.target.value)} style={iSt}/>
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:C.textPri,marginBottom:6 }}>Type</label>
            <select value={filtreType} onChange={e=>setFiltreType(e.target.value)} style={{ ...iSt,cursor:"pointer" }}>
              <option value="tous">Tous les types</option>
              <option value="arrivée">Arrivées</option>
              <option value="départ">Départs</option>
              <option value="maladie">Absences maladie</option>
              <option value="urgence">Absences urgence</option>
            </select>
          </div>
        </div>

        {/* Liste */}
        <div style={{ padding:"20px 28px" }}>
          {filtreHistorique.length === 0 ? (
            <p style={{ padding:24,textAlign:"center",color:C.textMuted }}>Aucun événement trouvé pour ces critères</p>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {filtreHistorique.map((h, i) => (
                <div key={i} style={{ padding:"14px 16px",borderRadius:12,border:"1px solid "+C.border,background:h.type==="maladie"?C.slateSoft+"33":h.type==="urgence"?C.redSoft+"33":"transparent" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:h.type==="maladie"?C.slateSoft:h.type==="urgence"?C.redSoft:C.blueSoft,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <span style={{ fontSize:18 }}>
                          {h.type==="arrivée"?"↑":h.type==="départ"?"↓":h.type==="maladie"?"M":h.type==="urgence"?"U":"—"}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>{getMedecinNom(h.medecinId)}</p>
                        <p style={{ fontSize:12,color:C.textSec }}>{h.type} · {fmt(h.date)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:14,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{h.heure}</p>
                      {h.description && <p style={{ fontSize:11,color:C.textMuted,marginTop:2 }}>{h.description}</p>}
                    </div>
                  </div>
                  {h.justificatif && (
                    <div style={{ fontSize:11,color:C.textMuted,marginTop:6 }}>
                      Justificatif : {h.justificatif}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardSecretaire() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { patients, addPatient, file, addToFile, updateFileEntry, rdv: rdvs, addRdv, updateRdv } = useSharedData()

  const [onglet,       setOnglet]       = useState("accueil")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [heure,        setHeure]        = useState("")
  const [dateStr,      setDateStr]      = useState("")
  const [showNouveau,  setShowNouveau]  = useState(false)
  const [showRecherche,setShowRecherche]= useState(false)
  const [showRdv,      setShowRdv]      = useState(false)
  
  const [paiementData, setPaiementData] = useState(null) // { patient, montantDu }
  const [notifications,setNotifications]= useState([
    { id:1, type:"rdv",  message:"RDV de Sow Fatoumata demain à 09h00 — Gynécologie", lu:false, date:today() },
    { id:2, type:"rdv",  message:"Rappel : Baldé Aissatou a un RDV le 07/04 à 08h30", lu:false, date:today() },
  ])
  const [showNotifs, setShowNotifs]=useState(false)
  const [recherchePatients, setRecherchePatients]=useState("")
  const [permissionModal, setPermissionModal] = useState(null) // { medecin, type: null }
  useClinicSettings()

  const patientsFiltres = patients.filter(p=>{
    const q=recherchePatients.toLowerCase().trim()
    if(!q) return true
    return p.nom.toLowerCase().includes(q)||
           p.pid.toLowerCase().includes(q)||
           (p.telephone||"").includes(q)||
           (p.quartier||"").toLowerCase().includes(q)||
           (p.secteur||"").toLowerCase().includes(q)||
           (p.profession||"").toLowerCase().includes(q)
  })

  useEffect(()=>{
    const tick=()=>{
      const n=new Date()
      setHeure(n.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
      setDateStr(n.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))
    }
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  const nonLues = notifications.filter(n=>!n.lu).length

  const handleEnregistrer = (form) => {
    const fullNom = form.nom.trim()+" "+form.prenom.trim()
    const existing = patients.find(p=>p.nom.toLowerCase()===fullNom.toLowerCase())
    if (existing) {
      alert(""+fullNom+" est déjà enregistré ("+existing.pid+"). Utilisez 'Rechercher dossier' pour le signaler au médecin chef.")
      setShowNouveau(false); return
    }
    let age=form.age||""
    if (!age&&form.dateNaissance) { const a=Math.floor((Date.now()-new Date(form.dateNaissance))/(365.25*24*3600*1000)); age=a+" ans" }
    const nouveau={
      id:Date.now(), pid:genId(Date.now()%999999),
      nom:fullNom, age, dateNaissance:form.dateNaissance, sexe:form.sexe,
      telephone:form.telephone, quartier:form.quartier, secteur:form.secteur,
      profession:form.profession, responsable:form.responsable,
    }
    addPatient(nouveau)
    addToFile({ patientId:nouveau.id, pid:nouveau.pid, nom:nouveau.nom, arrivee:nowTime(), typeVisite:form.typeVisite, statut:"en_attente", montantTotal:0, paiement:null })
    setShowNouveau(false)
    alert(""+fullNom+" enregistré et ajouté à la file du médecin chef.")
  }

  const handleSignaler = (patient) => {
    const deja = file.find(f=>f.patientId===patient.id)
    if (deja) { alert(patient.nom+" est déjà dans la file d'attente."); return }
    addToFile({ patientId:patient.id, pid:patient.pid, nom:patient.nom, arrivee:nowTime(), typeVisite:"consultation", statut:"en_attente", montantTotal:0, paiement:null })
    alert(""+patient.nom+" signalé au médecin chef.")
  }

  const handleCreerRdv = (form) => {
    const p=patients.find(pt=>pt.id===parseInt(form.patientId))
    const nouveauRdv={ patientId:parseInt(form.patientId), patient:p?.nom||"—", date:form.date, heure:form.heure, service:form.service, docteur:form.docteur, motif:form.motif, rappelEnvoye:false }
    addRdv(nouveauRdv)
    setNotifications(prev=>[{ id:prev.length+1, type:"rdv", message:"RDV créé : "+p?.nom+" le "+fmt(form.date)+" à "+form.heure+" — "+form.docteur, lu:false, date:today() },...prev])
    setShowRdv(false)
    alert("Rendez-vous créé. Un rappel sera envoyé au patient.")
  }

  const handlePaiement = (data) => {
    const { patientId } = paiementData
    const entry = file.find(f=>f.patientId===patientId)
    if (entry) updateFileEntry(entry.id, { paiement:data })
    setPaiementData(null)
  }

  const envoyerRappel = (rdvId) => {
    updateRdv(rdvId, { rappelEnvoye:true })
    alert("Rappel envoyé au patient.")
  }

  // ══════════════════════════════════════════════════════
  //  GESTION PRÉSENCE MÉDECINS
  // ══════════════════════════════════════════════════════
  const [medecins, setMedecins] = useState(() => {
    const saved = localStorage.getItem('clinique_medecins_presence')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Vérifier si c'est un nouveau jour
        if (parsed.date === today()) {
          return DOCTEURS.map(d => {
            const savedMed = parsed.medecins.find(m => m.id === d.id)
            return savedMed ? { ...d, ...savedMed, historique: [] } : { ...d, arrivee: null, depart: null, present: false, historique: [] }
          })
        }
      } catch {
        // Erreur de parsing, on initialise à vide
      }
    }
    return DOCTEURS.map(d => ({ ...d, arrivee: null, depart: null, present: false, historique: [] }))
  })

  // Sauvegarder dans localStorage à chaque modification
  useEffect(() => {
    const medecinsToSave = medecins.map(m => {
      const { historique: _historique, ...rest } = m
      return rest
    })
    localStorage.setItem('clinique_medecins_presence', JSON.stringify({
      date: today(),
      medecins: medecinsToSave
    }))
  }, [medecins])

  // Historique de présence
  const [historique, setHistorique] = useState(() => {
    const saved = localStorage.getItem('clinique_historique_presence')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  // Sauvegarder l'historique
  useEffect(() => {
    localStorage.setItem('clinique_historique_presence', JSON.stringify(historique))
  }, [historique])

  const pointerArrivee = (id) => {
    const heure = nowTime()
    setMedecins(prev => prev.map(m => 
      m.id === id ? { 
        ...m, 
        arrivee: heure, 
        depart: null, 
        present: true,
        historique: [...(m.historique || []), { type: 'arrivée', heure, date: today() }]
      } : m
    ))
    // Ajouter à l'historique global
    setHistorique(prev => [...prev, { medecinId: id, type: 'arrivée', heure, date: today() }])
    const med = medecins.find(m => m.id === id)
    alert(`${med.nom} est arrivé(e) à ${heure}`)
  }

  const pointerDepart = (id) => {
    const heure = nowTime()
    setMedecins(prev => prev.map(m => 
      m.id === id ? { 
        ...m, 
        depart: heure, 
        present: false,
        historique: [...(m.historique || []), { type: 'départ', heure, date: today() }]
      } : m
    ))
    // Ajouter à l'historique global
    setHistorique(prev => [...prev, { medecinId: id, type: 'départ', heure, date: today() }])
    const med = medecins.find(m => m.id === id)
    alert(`${med.nom} est parti(e) à ${heure}`)
  }

  // Gestion des permissions
  const demanderPermission = (medecin) => {
    setPermissionModal({ medecin, type: null })
  }

  const validerPermission = ({ type, description, dateDebut, dateFin, justificatif }) => {
    const medecin = permissionModal.medecin
    const nouvelHistorique = [
      ...historique,
      { 
        medecinId: medecin.id, 
        type, 
        heure: nowTime(), 
        date: today(), 
        description, 
        dateDebut, 
        dateFin, 
        justificatif: justificatif ? justificatif.name : null 
      }
    ]
    setHistorique(nouvelHistorique)
    
    // Mettre à jour le statut du médecin si c'est aujourd'hui
    if (dateDebut <= today() && dateFin >= today()) {
      setMedecins(prev => prev.map(m => 
        m.id === medecin.id ? { 
          ...m, 
          present: false, 
          arrivee: null, 
          depart: null,
          historique: [...(m.historique || []), { type, heure: nowTime(), date: today(), description }]
        } : m
      ))
    }
    
    alert(`Permission enregistrée pour ${medecin.nom} (${type})`)
  }

  // Statistiques du jour
  const presenceStats = {
    presents: medecins.filter(m => m.present).length,
    absents: medecins.filter(m => !m.present).length,
    total: medecins.length,
    pourcentage: Math.round((medecins.filter(m => m.present).length / medecins.length) * 100)
  }

  const NAV_ICONS = {
    accueil:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    file:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    liste:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    rdv:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    compta:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    presence: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  }
  const NAV=[
    { id:"accueil",  label:"Accueil",           icon:"accueil",  desc:"Vue d'ensemble"         },
    { id:"file",     label:"File d'attente",    icon:"file",     desc:"Patients du jour"       },
    { id:"patients", label:"Tous les patients", icon:"liste",    desc:"Registre complet"       },
    { id:"rdv",      label:"Rendez-vous",       icon:"rdv",      desc:"Planning"               },
    { id:"compta",   label:"Comptabilité",      icon:"compta",   desc:"Paiements"              },
    { id:"presence", label:"Présence Médecins", icon:"presence", desc:"Pointage Arrivée/Départ"},
  ]

  return (
    <div style={{ minHeight:"100vh",background:"#ffffff",fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.textPri }}>

      {/* MODALS */}
      {showNouveau   && <ModalNouveauPatient patients={patients} onClose={()=>setShowNouveau(false)} onEnregistrer={handleEnregistrer}/>}
      {showRecherche && <ModalRechercheDossier patients={patients} onClose={()=>setShowRecherche(false)} onSignaler={handleSignaler}/>}
      {showRdv       && <ModalCreerRdv patients={patients} docteurs={DOCTEURS} onClose={()=>setShowRdv(false)} onCreate={handleCreerRdv}/>}
      {paiementData  && <ModalPaiement patient={paiementData.patient} montantDu={paiementData.montantTotal} paiementExistant={paiementData.paiement} onClose={()=>setPaiementData(null)} onValider={handlePaiement}/>}
      {permissionModal && <ModalPermission medecin={permissionModal.medecin} onClose={()=>setPermissionModal(null)} onValider={validerPermission}/>}
      {onglet === "historique" && <ModalHistorique medecins={medecins} historique={historique} onClose={()=>setOnglet("presence")}/>}

      {/* SIDEBAR */}
      {sidebarOpen&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute",left:0,top:0,bottom:0,width:265,background:C.white,boxShadow:"4px 0 24px rgba(0,0,0,0.12)",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",gap:12 }}>
              <img src={logo} alt="" style={{ height:42,borderRadius:8,objectFit:"cover",border:"1px solid "+C.border }}/>
              <div>
                <p style={{ fontSize:14,fontWeight:800,color:C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize:12,color:C.textSec }}>Espace secrétaire</p>
              </div>
            </div>
            <nav style={{ padding:"14px 12px",flex:1 }}>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setOnglet(n.id); setSidebarOpen(false) }}
                  style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:12,border:"none",background:onglet===n.id?C.blueSoft:"transparent",color:onglet===n.id?C.blue:C.textSec,fontSize:14,fontWeight:onglet===n.id?700:500,cursor:"pointer",textAlign:"left",marginBottom:3,transition:"all .15s" }}
                  onMouseEnter={e=>{ if(onglet!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(onglet!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:7,background:onglet===n.id?"rgba(37,99,235,0.12)":"transparent",flexShrink:0 }}>{NAV_ICONS[n.icon]}</span>
                  <div>
                    <p style={{ fontSize:13 }}>{n.label}</p>
                    <p style={{ fontSize:10,color:C.textMuted,marginTop:1 }}>{n.desc}</p>
                  </div>
                </button>
              ))}
            </nav>
            <div style={{ padding:"14px 16px 20px",borderTop:"1px solid "+C.border }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.greenSoft,borderRadius:12,border:"1px solid "+C.green+"33" }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:13,fontWeight:700,color:C.textPri }}>{user?.nom||"Secrétaire"}</p>
                  <p style={{ fontSize:11,color:C.green,fontWeight:600 }}>{user?.titre||"Secrétaire"} · Accueil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white,borderBottom:"1px solid "+C.border,padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40,height:40,borderRadius:8,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5 }}>
          <div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/><div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/><div style={{ width:20,height:2,background:C.textPri,borderRadius:2 }}/>
        </button>
        <div style={{ flex:1,marginLeft:20 }}>
          <p style={{ fontSize:15,fontWeight:700,color:C.textPri,lineHeight:1.2 }}>Clinique ABC Marouane — Accueil</p>
          <p style={{ fontSize:12,color:C.textMuted,textTransform:"capitalize" }}>{dateStr}</p>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {/* Notifications */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowNotifs(v=>!v)}
              style={{ width:40,height:40,borderRadius:10,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSec} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {nonLues>0&&<span style={{ position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:C.red,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>{nonLues}</span>}
            </button>
            {showNotifs&&(
              <div style={{ position:"absolute",top:48,right:0,width:320,background:C.white,borderRadius:14,border:"1px solid "+C.border,boxShadow:"0 8px 30px rgba(0,0,0,0.15)",zIndex:200 }}>
                <div style={{ padding:"14px 16px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>Notifications</p>
                  <button onClick={()=>setNotifications(prev=>prev.map(n=>({...n,lu:true})))} style={{ fontSize:11,color:C.textPri,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit" }}>Tout lire</button>
                </div>
                {notifications.length===0&&<p style={{ padding:20,textAlign:"center",color:C.textMuted,fontSize:13 }}>Aucune notification</p>}
                {notifications.map(n=>(
                  <div key={n.id} onClick={()=>setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,lu:true}:x))}
                    style={{ padding:"12px 16px",borderBottom:"1px solid "+C.border,cursor:"pointer",background:n.lu?"transparent":C.blueSoft+"66",display:"flex",gap:10,alignItems:"flex-start" }}>
                    <span style={{ fontSize:16,marginTop:1 }}>{n.type==="rdv"?"RDV":""}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13,color:C.textPri,lineHeight:1.4 }}>{n.message}</p>
                      <p style={{ fontSize:11,color:C.textMuted,marginTop:2 }}>{n.date}</p>
                    </div>
                    {!n.lu&&<div style={{ width:8,height:8,borderRadius:"50%",background:C.blue,flexShrink:0,marginTop:4 }}/>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background:C.greenSoft,border:"1px solid "+C.green+"33",borderRadius:10,padding:"6px 14px",fontSize:14,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{heure}</div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13,fontWeight:700,color:C.textPri }}>{user?.nom||"Secrétaire"}</p>
              <p style={{ fontSize:11,color:C.textSec }}>{user?.titre||"Secrétaire Médicale"}</p>
            </div>
            <div style={{ width:36,height:36,borderRadius:"50%",background:C.greenSoft,border:"2px solid "+C.green+"33",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <button onClick={handleLogout} title="Se déconnecter"
            style={{ width:36,height:36,borderRadius:8,border:"1px solid #fca5a5",background:"#fff5f5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main style={{ padding:"24px 28px" }}>

        {/* ══ ACCUEIL ══ */}
        {onglet==="accueil"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
            {/* KPIs */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16 }}>
              {[
                { val:file.length, label:"File d'attente", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, bg:C.blueSoft, fg:C.blue },
                { val:file.filter(f=>f.typeVisite==="rendez_vous").length, label:"Rendez-vous du jour", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, bg:C.purpleSoft, fg:C.purple },
                { val:rdvs.filter(r=>r.date===today()).length, label:"RDV aujourd'hui", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, bg:C.slateSoft, fg:C.slate },
                { val:file.filter(f=>f.paiement?.statut==="impaye").length, label:"Impayés", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, bg:C.redSoft, fg:C.red },
              ].map(({val,label,svg,bg,fg})=>(
                <Card key={label} style={{ padding:"20px" }}>
                  <div style={{ width:42,height:42,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,color:fg }}>{svg}</div>
                  <p style={{ fontSize:28,fontWeight:800,color:C.textPri,lineHeight:1,marginBottom:4 }}>{val}</p>
                  <p style={{ fontSize:12,color:C.textMuted }}>{label}</p>
                </Card>
              ))}
            </div>

            {/* Actions rapides */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
              {[
                { label:"Nouveau patient",    desc:"Enregistrer un nouveau patient", svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>, action:()=>setShowNouveau(true), color:C.blue },
                { label:"Rechercher dossier", desc:"Patient déjà enregistré",        svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>, action:()=>setShowRecherche(true), color:C.green },
                { label:"Créer un RDV",       desc:"Programmer un rendez-vous",      svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, action:()=>setShowRdv(true), color:C.purple },
              ].map(({label,desc,svg,action,color})=>(
                <Card key={label} style={{ padding:"20px",cursor:"pointer",transition:"all .15s",border:"1.5px solid "+C.border }}
                  onClick={action}
                  onMouseEnter={e=>{ e.currentTarget.style.border="1.5px solid "+color; e.currentTarget.style.background=color+"11" }}
                  onMouseLeave={e=>{ e.currentTarget.style.border="1.5px solid "+C.border; e.currentTarget.style.background=C.white }}>
                  <div style={{ width:46,height:46,borderRadius:12,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,color }}>{svg}</div>
                  <p style={{ fontSize:14,fontWeight:700,color:C.textPri,marginBottom:4 }}>{label}</p>
                  <p style={{ fontSize:12,color:C.textMuted }}>{desc}</p>
                </Card>
              ))}
            </div>

            {/* File du jour */}
            <Card>
              <CardHeader title={"File d'attente — "+file.length+" patient"+(file.length>1?"s":"")} action={<button onClick={()=>setOnglet("file")} style={{ background:"none",border:"none",color:C.blue,fontSize:13,cursor:"pointer",fontWeight:600 }}>Tout voir →</button>}/>
              {file.length===0
                ? <p style={{ padding:32,textAlign:"center",color:C.textMuted }}>Aucun patient en attente</p>
                : file.slice(0,4).map((f,i)=>(
                  <div key={f.id} style={{ padding:"13px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:i<Math.min(file.length,4)-1?"1px solid "+C.border:"none" }}>
                    <Avatar name={f.nom} size={36}/>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{f.nom}</p>
                      <p style={{ fontSize:11,color:C.textSec }}>{f.pid}</p>
                    </div>
                    {f.typeVisite==="rendez_vous"
                      ? <span style={{ fontSize:11,fontWeight:700,background:C.purpleSoft,color:C.purple,padding:"3px 10px",borderRadius:10 }}>RDV</span>
                      : <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"3px 10px",borderRadius:10 }}>Consultation</span>
                    }
                    <span style={{ fontSize:13,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{f.arrivee}</span>
                  </div>
                ))
              }
            </Card>

            {/* RDV du jour */}
            <Card>
              <CardHeader title={"Rendez-vous d'aujourd'hui — "+rdvs.filter(r=>r.date===today()).length} action={<button onClick={()=>setOnglet("rdv")} style={{ background:"none",border:"none",color:C.blue,fontSize:13,cursor:"pointer",fontWeight:600 }}>Tout voir →</button>}/>
              {rdvs.filter(r=>r.date===today()).length===0
                ? <p style={{ padding:32,textAlign:"center",color:C.textMuted }}>Aucun RDV aujourd'hui</p>
                : rdvs.filter(r=>r.date===today()).map((r,i,arr)=>(
                  <div key={r.id} style={{ padding:"13px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}>
                    <div style={{ width:44,height:44,borderRadius:10,background:C.purpleSoft,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <p style={{ fontSize:12,fontWeight:800,color:C.textPri }}>{r.heure}</p>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{r.patient}</p>
                      <p style={{ fontSize:11,color:C.textSec }}>{r.motif} · {r.docteur}</p>
                    </div>
                    {!r.rappelEnvoye
                      ? <button onClick={()=>envoyerRappel(r.id)} style={{ padding:"5px 12px",background:C.slate,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Rappeler</button>
                      : <span style={{ fontSize:11,fontWeight:600,color:C.green }}>Rappelé</span>
                    }
                  </div>
                ))
              }
            </Card>
          </div>
        )}

        {/* ══ FILE D'ATTENTE ══ */}
        {onglet==="file"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:4 }}>File d'attente</p>
                <p style={{ fontSize:14,color:C.textSec }}>{file.length} patient{file.length>1?"s":""} en attente du médecin chef</p>
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <Btn onClick={()=>setShowNouveau(true)} small>Nouveau patient</Btn>
                <Btn onClick={()=>setShowRecherche(true)} small variant="secondary">Dossier existant</Btn>
              </div>
            </div>
            {file.length===0
              ? <Card style={{ padding:40,textAlign:"center" }}><p style={{ color:C.textMuted }}>Aucun patient en attente</p></Card>
              : file.map((f,)=>(
                <Card key={f.id} style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                    <Avatar name={f.nom} size={46}/>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                        <p style={{ fontSize:15,fontWeight:700,color:C.textPri }}>{f.nom}</p>
                        {f.typeVisite==="rendez_vous"
                          ? <span style={{ fontSize:11,fontWeight:700,background:C.purpleSoft,color:C.purple,padding:"2px 9px",borderRadius:10 }}>RDV</span>
                          : <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"2px 9px",borderRadius:10 }}>Consultation</span>
                        }
                      </div>
                      <p style={{ fontSize:12,color:C.textSec }}>{f.pid}</p>
                    </div>
                    {/* Heure d'arrivée */}
                    <div style={{ textAlign:"center",padding:"8px 16px",background:C.greenSoft,border:"1px solid "+C.green+"33",borderRadius:10 }}>
                      <p style={{ fontSize:10,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2 }}>Arrivée</p>
                      <p style={{ fontSize:16,fontWeight:800,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{f.arrivee}</p>
                    </div>
                    {/* Statut paiement */}
                    {f.paiement
                      ? <Badge statut={f.paiement.statut}/>
                      : <span style={{ fontSize:12,color:C.textMuted,fontStyle:"italic" }}>Paiement non fait</span>
                    }
                    {/* Bouton paiement */}
                    <Btn onClick={()=>{ const p=patients.find(pt=>pt.id===f.patientId); setPaiementData({ patient:p||{nom:f.nom,id:f.patientId}, montantTotal:f.montantTotal||0, paiement:f.paiement, patientId:f.patientId }) }} small variant={f.paiement?"secondary":"success"}>
                      {f.paiement?"Modifier paiement":"Encaisser"}
                    </Btn>
                  </div>
                  {/* Délai si impayé/partiel */}
                  {f.paiement&&(f.paiement.statut==="impaye"||f.paiement.statut==="partiel")&&f.paiement.delai&&(
                    <div style={{ marginTop:12,padding:"10px 14px",background:C.slateSoft,borderRadius:10,border:"1px solid "+C.slate+"33",display:"flex",alignItems:"center",gap:8 }}>
                      <span>⏰</span>
                      <p style={{ fontSize:13,color:C.slate,fontWeight:600 }}>
                        {f.paiement.statut==="partiel"?"Paiement partiel":"Impayé"} · Date limite : {fmt(f.paiement.delai)}
                        {f.paiement.statut==="partiel"&&f.paiement.montant?" · Versé : "+f.paiement.montant.toLocaleString("fr-FR")+" GNF":""}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            }
          </div>
        )}

        {/* ══ TOUS LES PATIENTS ══ */}
        {onglet==="patients"&&(
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <div>
                <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:4 }}>Registre des patients</p>
                <p style={{ fontSize:14,color:C.textSec }}>{patients.length} patient{patients.length>1?"s":""} enregistrés</p>
              </div>
              <Btn onClick={()=>setShowNouveau(true)} small>Nouveau patient</Btn>
            </div>

            {/* Barre de recherche */}
            <div style={{ position:"relative",marginBottom:16 }}>
              <svg style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                placeholder="Rechercher par nom, N° dossier, téléphone, quartier..."
                value={recherchePatients}
                onChange={e=>setRecherchePatients(e.target.value)}
                style={{ width:"100%",padding:"12px 14px 12px 42px",fontSize:14,border:"1.5px solid "+C.border,borderRadius:12,background:C.white,color:C.textPri,outline:"none",fontFamily:"inherit" }}
                onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }}
                onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }}
              />
              {recherchePatients&&<button onClick={()=>setRecherchePatients("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.textMuted,fontSize:16 }}>×</button>}
            </div>

            <Card>
              <div style={{ padding:"14px 20px",borderBottom:"1px solid "+C.border }}>
                <p style={{ fontSize:14,fontWeight:700,color:C.textPri }}>
                  {recherchePatients
                    ? patientsFiltres.length+" résultat"+(patientsFiltres.length>1?"s":"")+" pour « "+recherchePatients+" »"
                    : patients.length+" patients enregistrés"
                  }
                </p>
              </div>
              {patientsFiltres.length===0
                ? <p style={{ padding:40,textAlign:"center",color:C.textMuted }}>Aucun patient trouvé pour « {recherchePatients} »</p>
                : (
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:C.slateSoft }}>
                      {["N° Dossier","Nom complet","Âge","Sexe","Téléphone","Quartier / Secteur","Responsable","Action"].map(h=>(
                        <th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patientsFiltres.map((p,i,arr)=>(
                      <tr key={p.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none",transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"12px 14px" }}>
                          <span style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.textPri,background:C.blueSoft,padding:"3px 9px",borderRadius:8 }}>{p.pid}</span>
                        </td>
                        <td style={{ padding:"12px 14px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                            <Avatar name={p.nom} size={32}/>
                            <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{p.nom}</p>
                          </div>
                        </td>
                        <td style={{ padding:"12px 14px",fontSize:13,color:C.textSec }}>{p.age||"—"}</td>
                        <td style={{ padding:"12px 14px" }}>
                          <span style={{ fontSize:12,fontWeight:600,background:p.sexe==="F"?C.purpleSoft:C.blueSoft,color:p.sexe==="F"?"#1a4a25":C.blue,padding:"3px 10px",borderRadius:12 }}>
                            {p.sexe==="F"?"Féminin":"Masculin"}
                          </span>
                        </td>
                        <td style={{ padding:"12px 14px",fontSize:13,color:C.textSec }}>{p.telephone||"—"}</td>
                        <td style={{ padding:"12px 14px",fontSize:13,color:C.textSec }}>
                          {p.quartier||"—"}{p.secteur?", "+p.secteur:""}
                        </td>
                        <td style={{ padding:"12px 14px",fontSize:13,color:C.textSec }}>{p.responsable||"—"}</td>
                        <td style={{ padding:"12px 14px" }}>
                          <button onClick={()=>handleSignaler(p)}
                            style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:C.greenSoft,border:"1px solid "+C.green+"33",borderRadius:8,color:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}
                            onMouseEnter={e=>{ e.currentTarget.style.background=C.green; e.currentTarget.style.color="#fff" }}
                            onMouseLeave={e=>{ e.currentTarget.style.background=C.greenSoft; e.currentTarget.style.color=C.green }}>
                            Envoyer au médecin
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )
              }
              <p style={{ textAlign:"center",fontSize:12,color:C.textMuted,padding:"14px 0",borderTop:"1px solid "+C.border }}>© 2026 Clinique ABC Marouane. Tous droits réservés.</p>
            </Card>
          </div>
        )}

        {/* ══ RENDEZ-VOUS ══ */}
        {onglet==="rdv"&&(
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <div>
                <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:4 }}>Rendez-vous</p>
                <p style={{ fontSize:14,color:C.textSec }}>{rdvs.length} rendez-vous programmés</p>
              </div>
              <Btn onClick={()=>setShowRdv(true)} small>Nouveau RDV</Btn>
            </div>
            <Card>
              <CardHeader title="Tous les rendez-vous"/>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.slateSoft }}>
                    {["Patient","Date","Heure","Médecin / Service","Motif","Rappel"].map(h=>(
                      <th key={h} style={{ padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.06em",textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rdvs.sort((a,b)=>a.date.localeCompare(b.date)).map((r,i,arr)=>(
                    <tr key={r.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none",transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <Avatar name={r.patient} size={30}/>
                          <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{r.patient}</p>
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px",fontSize:13,color:r.date===today()?C.green:C.textSec,fontWeight:r.date===today()?700:400 }}>{fmt(r.date)}</td>
                      <td style={{ padding:"13px 16px",fontSize:13,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{r.heure}</td>
                      <td style={{ padding:"13px 16px" }}>
                        <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{r.docteur}</p>
                        <p style={{ fontSize:11,color:C.textSec }}>{r.service}</p>
                      </td>
                      <td style={{ padding:"13px 16px",fontSize:12,color:C.textSec }}>{r.motif||"—"}</td>
                      <td style={{ padding:"13px 16px" }}>
                        {!r.rappelEnvoye
                          ? <button onClick={()=>envoyerRappel(r.id)} style={{ padding:"5px 12px",background:C.slateSoft,color:C.slate,border:"1px solid "+C.slate+"33",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Envoyer rappel</button>
                          : <span style={{ fontSize:12,fontWeight:600,color:C.green }}>Rappel envoyé</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ══ COMPTABILITÉ ══ */}
        {onglet==="compta"&&(
          <div>
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:22,fontWeight:800,color:C.textPri,marginBottom:4 }}>Comptabilité — Paiements</p>
              <p style={{ fontSize:14,color:C.textSec }}>Suivi des paiements de la journée</p>
            </div>
            {/* Résumé */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20 }}>
              {[
                { label:"Total payés",    val:file.filter(f=>f.paiement?.statut==="total").length,   bg:C.greenSoft,  fg:C.green  },
                { label:"Paiements partiels",val:file.filter(f=>f.paiement?.statut==="partiel").length,bg:C.slateSoft,fg:C.slate },
                { label:"Impayés",        val:file.filter(f=>f.paiement?.statut==="impaye").length,  bg:C.redSoft,    fg:C.red    },
                { label:"Non enregistrés",val:file.filter(f=>!f.paiement).length,                    bg:C.slateSoft,  fg:C.slate  },
              ].map(({label,val})=>(
                <Card key={label} style={{ padding:"18px" }}>
                  <p style={{ fontSize:26,fontWeight:800,color:C.textPri,marginBottom:4 }}>{val}</p>
                  <p style={{ fontSize:12,color:C.textMuted }}>{label}</p>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader title="Détail des paiements — Aujourd'hui"/>
              {file.length===0
                ? <p style={{ padding:32,textAlign:"center",color:C.textMuted }}>Aucun patient aujourd'hui</p>
                : (
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:C.slateSoft }}>
                      {["Patient","Arrivée","Type","Statut paiement","Méthode","Montant","Délai","Action"].map(h=>(
                        <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.textSec,letterSpacing:"0.06em",textTransform:"uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {file.map((f,i,arr)=>{
                      const p=patients.find(pt=>pt.id===f.patientId)
                      return (
                        <tr key={f.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}
                          onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"12px 14px" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                              <Avatar name={f.nom} size={28}/>
                              <div>
                                <p style={{ fontSize:13,fontWeight:600,color:C.textPri }}>{f.nom}</p>
                                <p style={{ fontSize:11,color:C.textMuted }}>{f.pid}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"12px 14px",fontSize:13,fontWeight:700,color:C.textPri,fontVariantNumeric:"tabular-nums" }}>{f.arrivee}</td>
                          <td style={{ padding:"12px 14px" }}>
                            {f.typeVisite==="rendez_vous"
                              ? <span style={{ fontSize:11,fontWeight:700,background:C.purpleSoft,color:C.purple,padding:"2px 8px",borderRadius:10 }}>RDV</span>
                              : <span style={{ fontSize:11,fontWeight:700,background:C.greenSoft,color:C.green,padding:"2px 8px",borderRadius:10 }}>Consult.</span>
                            }
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            {f.paiement ? <Badge statut={f.paiement.statut}/> : <span style={{ fontSize:12,color:C.textMuted }}>—</span>}
                          </td>
                          <td style={{ padding:"12px 14px",fontSize:12,color:C.textSec }}>
                            {f.paiement?.methode==="orange_money"?"Orange Money":f.paiement?.methode==="cash"?"Cash":"—"}
                          </td>
                          <td style={{ padding:"12px 14px",fontSize:13,fontWeight:700,color:f.paiement?.montant?C.green:C.textMuted }}>
                            {f.paiement?.montant?f.paiement.montant.toLocaleString("fr-FR")+" GNF":"—"}
                          </td>
                          <td style={{ padding:"12px 14px",fontSize:12,color:f.paiement?.delai?C.slate:C.textMuted }}>
                            {f.paiement?.delai?fmt(f.paiement.delai):"—"}
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            <button onClick={()=>setPaiementData({ patient:p||{nom:f.nom,id:f.patientId}, montantTotal:f.montantTotal||0, paiement:f.paiement, patientId:f.patientId })}
                              style={{ padding:"6px 12px",background:C.blueSoft,border:"1px solid "+C.blue+"33",borderRadius:8,color:C.blue,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}
                              onMouseEnter={e=>{ e.currentTarget.style.background=C.blue; e.currentTarget.style.color="#fff" }}
                              onMouseLeave={e=>{ e.currentTarget.style.background=C.blueSoft; e.currentTarget.style.color=C.blue }}>
                              {f.paiement?"Modifier":"Enregistrer"}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                )
              }
            </Card>
          </div>
        )}

        {/* ══ PRÉSENCE MÉDECINS ══ */}
        {onglet==="presence"&&(
          <div>
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:24, fontWeight:800, color:C.textPri }}>Présence des Médecins</p>
              <p style={{ color:C.textMuted }}>Pointage d'arrivée et de départ en temps réel — {dateStr}</p>
            </div>

            {/* Statistiques du jour */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
              <Card style={{ padding:"20px" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:C.blue }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                <p style={{ fontSize:28, fontWeight:800, color:C.blue, lineHeight:1, marginBottom:4 }}>{presenceStats.total}</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Médecins total</p>
              </Card>
              <Card style={{ padding:"20px" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:C.greenSoft, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:C.green }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <p style={{ fontSize:28, fontWeight:800, color:C.green, lineHeight:1, marginBottom:4 }}>{presenceStats.presents}</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Présents</p>
              </Card>
              <Card style={{ padding:"20px" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:C.redSoft, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:C.red }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
                <p style={{ fontSize:28, fontWeight:800, color:C.red, lineHeight:1, marginBottom:4 }}>{presenceStats.absents}</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Absents</p>
              </Card>
              <Card style={{ padding:"20px" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:C.purpleSoft, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:C.purple }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
                <p style={{ fontSize:28, fontWeight:800, color:C.purple, lineHeight:1, marginBottom:4 }}>{presenceStats.pourcentage}%</p>
                <p style={{ fontSize:12, color:C.textMuted }}>Taux de présence</p>
              </Card>
            </div>

            {/* Actions globales */}
            <div style={{ marginBottom:16, display:"flex", gap:12 }}>
              <Btn onClick={()=>setOnglet("historique")} variant="secondary">
                Voir l'historique
              </Btn>
            </div>

            {/* Liste des médecins */}
            <Card>
              <CardHeader 
                title="Liste des médecins" 
                action={
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:12, color:C.textMuted }}>{medecins.filter(m=>m.present).length}/{medecins.length} présents</span>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:presenceStats.pourcentage>=80?C.green:presenceStats.pourcentage>=50?C.slate:C.red }}/>
                  </div>
                } 
              />
              <div style={{ padding:"8px" }}>
                {medecins.map((med, i) => (
                  <div key={med.id} style={{
                    display:"flex", alignItems:"center", gap:16, padding:"14px 16px",
                    borderBottom: i < medecins.length-1 ? "1px solid "+C.border : "none",
                    background: med.present ? "transparent" : C.slateSoft+"33",
                    borderRadius: med.present ? 0 : 8,
                    transition:"background .15s"
                  }}>
                    <Avatar name={med.nom} size={44} />

                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>{med.nom}</p>
                      <p style={{ fontSize:12, color:C.textSec }}>{med.specialite}</p>
                    </div>

                    {/* Statut */}
                    <div style={{ minWidth:110, textAlign:"center" }}>
                      {med.present ? 
                        <span style={{ 
                          display:"inline-flex", alignItems:"center", gap:6,
                          background:C.greenSoft, color:C.green, 
                          padding:"4px 14px", borderRadius:20, 
                          fontSize:12, fontWeight:700 
                        }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:C.green, animation:"blink 2s ease-in-out infinite" }}/>
                          Présent
                        </span>
                      : 
                        <span style={{ 
                          display:"inline-flex", alignItems:"center", gap:6,
                          background:C.redSoft, color:C.red, 
                          padding:"4px 14px", borderRadius:20, 
                          fontSize:12, fontWeight:700 
                        }}>
                          Absent
                        </span>
                      }
                    </div>

                    {/* Horaires */}
                    <div style={{ minWidth:160, fontSize:12 }}>
                      {med.arrivee ? (
                        <div style={{ display:"flex", alignItems:"center", gap:6, color:C.green, fontWeight:600 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Arrivée : {med.arrivee}
                        </div>
                      ) : (
                        <div style={{ color:C.textMuted }}>—</div>
                      )}
                      {med.depart && (
                        <div style={{ display:"flex", alignItems:"center", gap:6, color:C.slate, fontWeight:600, marginTop:2 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Départ : {med.depart}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ minWidth:200, display:"flex", gap:8 }}>
                      {!med.present ? (
                        <>
                          <Btn onClick={() => pointerArrivee(med.id)} variant="success" small>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Pointer arrivée
                          </Btn>
                          <Btn onClick={() => demanderPermission(med)} variant="secondary" small>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Permission
                          </Btn>
                        </>
                      ) : (
                        <Btn onClick={() => pointerDepart(med.id)} variant="secondary" small>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Pointer départ
                        </Btn>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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