import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"

function genId(seed) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  let result = "CAB-", n = seed * 48271 + 1000003
  for (let i = 0; i < 6; i++) { n = (n * 1664525 + 1013904223) & 0x7fffffff; result += chars[n % chars.length] }
  return result
}
const today   = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
const fmt     = d => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

const PATIENTS_INIT = [
  { id:1, pid:genId(1), nom:"Bah Mariama",     age:34, dateNaissance:"1990-03-12", adresse:"Ratoma, Conakry",   telephone:"+224 622 11 22 33", sexe:"F", motif:"Consultation générale", arrivee:"08:15", depart:null,    statut:"en_attente", docteur:"Non assigné", tuteur:"" },
  { id:2, pid:genId(2), nom:"Diallo Ibrahima", age:52, dateNaissance:"1972-07-04", adresse:"Kaloum, Conakry",   telephone:"+224 628 44 55 66", sexe:"M", motif:"Cardiologie",           arrivee:"08:45", depart:null,    statut:"en_salle",   docteur:"Dr. Camara",  tuteur:"" },
  { id:3, pid:genId(3), nom:"Sow Fatoumata",   age:28, dateNaissance:"1996-11-20", adresse:"Dixinn, Conakry",   telephone:"+224 621 77 88 99", sexe:"F", motif:"Pédiatrie",             arrivee:"09:00", depart:null,    statut:"en_attente", docteur:"Non assigné", tuteur:"" },
  { id:4, pid:genId(4), nom:"Kouyaté Mamadou", age:61, dateNaissance:"1963-01-15", adresse:"Matam, Conakry",    telephone:"+224 624 33 44 55", sexe:"M", motif:"Diabétologie",          arrivee:"09:30", depart:null,    statut:"en_attente", docteur:"Non assigné", tuteur:"" },
  { id:5, pid:genId(5), nom:"Baldé Aissatou",  age:19, dateNaissance:"2005-06-08", adresse:"Matoto, Conakry",   telephone:"+224 625 66 77 88", sexe:"F", motif:"Dermatologie",          arrivee:"10:00", depart:null,    statut:"en_attente", docteur:"Non assigné", tuteur:"" },
  { id:6, pid:genId(6), nom:"Condé Ousmane",   age:45, dateNaissance:"1979-09-30", adresse:"Lambanyi, Conakry", telephone:"+224 627 99 00 11", sexe:"M", motif:"Ophtalmologie",         arrivee:"10:20", depart:"11:05", statut:"parti",      docteur:"Dr. Barry",   tuteur:"" },
]

const DOCTEURS = [
  { id:1, nom:"Dr. Doumbouya", specialite:"Médecine générale", statut:"present",   arrive:"07:30", patients:4 },
  { id:2, nom:"Dr. Camara",    specialite:"Cardiologie",       statut:"present",   arrive:"08:00", patients:3 },
  { id:3, nom:"Dr. Barry",     specialite:"Diabétologie",      statut:"present",   arrive:"08:15", patients:2 },
  { id:4, nom:"Dr. Souaré",    specialite:"Pédiatrie",         statut:"absent",    arrive:null,    patients:0 },
  { id:5, nom:"Dr. Keïta",     specialite:"Dermatologie",      statut:"en_retard", arrive:null,    patients:1 },
]

const RDV_JOUR = [
  { id:1, heure:"08:00", patient:"Bah Mariama",     docteur:"Dr. Doumbouya", type:"Consultation", statut:"termine"    },
  { id:2, heure:"09:00", patient:"Diallo Ibrahima", docteur:"Dr. Camara",    type:"Suivi cardio", statut:"en_cours"   },
  { id:3, heure:"10:00", patient:"Sow Fatoumata",   docteur:"Dr. Doumbouya", type:"Pédiatrie",    statut:"en_attente" },
  { id:4, heure:"10:30", patient:"Kouyaté Mamadou", docteur:"Dr. Barry",     type:"Glycémie",     statut:"en_attente" },
  { id:5, heure:"11:00", patient:"Baldé Aissatou",  docteur:"Dr. Camara",    type:"Dermatologie", statut:"en_attente" },
  { id:6, heure:"14:00", patient:"Traoré Sekou",    docteur:"Dr. Barry",     type:"Diabétologie", statut:"programme"  },
]


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

function Badge({ statut }) {
  const cfg = {
    present:    { label:"Présent",    color:C.green,  bg:C.greenSoft },
    en_salle:   { label:"En salle",   color:C.green,  bg:C.greenSoft, pulse:true },
    en_cours:   { label:"En cours",   color:C.green,  bg:C.greenSoft, pulse:true },
    en_attente: { label:"En attente", color:C.amber,  bg:C.amberSoft },
    en_retard:  { label:"En retard",  color:C.amber,  bg:C.amberSoft },
    programme:  { label:"Programmé",  color:C.blue,   bg:C.blueSoft  },
    absent:     { label:"Absent",     color:C.red,    bg:C.redSoft   },
    parti:      { label:"Parti",      color:C.slate,  bg:C.slateSoft },
    termine:    { label:"Terminé",    color:C.slate,  bg:C.slateSoft },
  }
  const s = cfg[statut] || cfg.programme
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color, fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20, border:"1px solid "+s.color+"33", whiteSpace:"nowrap" }}>
      {s.pulse && <span style={{ width:5, height:5, borderRadius:"50%", background:s.color, animation:"blink 2s ease-in-out infinite" }} />}
      {s.label}
    </span>
  )
}

function Avatar({ name, size=36 }) {
  const bgs = [C.blueSoft,C.greenSoft,C.purpleSoft,C.amberSoft,C.orangeSoft]
  const fgs = [C.blue,C.green,C.purple,C.amber,C.orange]
  const i   = (name?.charCodeAt(0)||0) % bgs.length
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bgs[i], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*.42} height={size*.42} viewBox="0 0 24 24" fill="none" stroke={fgs[i]} strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  )
}

function Card({ children, style={} }) {
  return <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>{children}</div>
}

function CardHeader({ title, action }) {
  return (
    <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <p style={{ fontWeight:700, fontSize:15, color:C.textPri }}>{title}</p>
      {action}
    </div>
  )
}

function Btn({ children, onClick, variant="primary", small=false, disabled=false }) {
  const cfg = {
    primary:  { bg:C.blue,  hov:"#1d4ed8", color:"#fff", border:"none" },
    success:  { bg:C.green, hov:"#15803d", color:"#fff", border:"none" },
    secondary:{ bg:"transparent", hov:C.slateSoft, color:C.textSec, border:"1px solid "+C.border },
  }
  const s = cfg[variant]||cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:s.bg, color:s.color, border:s.border||"none", borderRadius:10, padding:small?"7px 16px":"10px 20px", fontSize:small?12:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", transition:"all .2s", opacity:disabled?.55:1 }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=s.hov }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.background=s.bg }}
    >{children}</button>
  )
}

function ModalPatient({ patient, historiques, onClose, onNouvelleConsultation }) {
  if (!patient) return null
  const visites  = historiques.filter(h=>h.patientId===patient.id).sort((a,b)=>b.date.localeCompare(a.date))
  const nbVisites = visites.length
  const champs = [
    { label:"ID Clinique",       val:patient.pid },
    { label:"Nom complet",       val:patient.nom },
    { label:"Date de naissance", val:patient.dateNaissance ? fmt(patient.dateNaissance) : "—" },
    { label:"Âge",               val:patient.age+" ans" },
    { label:"Sexe",              val:patient.sexe==="F"?"Féminin":"Masculin" },
    { label:"Téléphone",         val:patient.telephone },
    { label:"Adresse",           val:patient.adresse, full:true },
    { label:"Tuteur",            val:patient.tuteur||"—", full:true },
  ]
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:580, maxHeight:"90vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar name={patient.nom} size={48} />
            <div>
              <p style={{ fontSize:18, fontWeight:800, color:C.textPri, marginBottom:3 }}>{patient.nom}</p>
              <p style={{ fontSize:13, color:C.textSec }}>{patient.pid} · {nbVisites} visite{nbVisites>1?"s":""}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        {nbVisites > 1 && (
          <div style={{ background:C.amberSoft, borderBottom:"1px solid "+C.amber+"33", padding:"10px 28px", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>🔁</span>
            <p style={{ fontSize:13, color:C.amber, fontWeight:600 }}>Patient de retour — {nbVisites}ème visite · Dernière venue le {fmt(visites[0]?.date)}</p>
          </div>
        )}
        <div style={{ padding:"24px 28px" }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Informations</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {champs.map(({ label, val, full })=>(
              <div key={label} style={{ background:C.bg, borderRadius:10, padding:"12px 14px", border:"1px solid "+C.border, gridColumn:full?"1/-1":"auto" }}>
                <p style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</p>
                <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{val}</p>
              </div>
            ))}
          </div>
          {visites.length > 0 && (
            <>
              <p style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Historique des visites</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                {visites.map((v,i)=>(
                  <div key={v.id} style={{ background:C.bg, borderRadius:10, padding:"12px 16px", border:"1px solid "+C.border, display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.blue, flexShrink:0 }}>{visites.length-i}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:C.textPri, marginBottom:2 }}>{fmt(v.date)}</p>
                      <p style={{ fontSize:12, color:C.textSec }}>{v.motif} · {v.docteur}</p>
                      {v.notes && <p style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>{v.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:12, padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri, marginBottom:2 }}>Nouvelle consultation ?</p>
              <p style={{ fontSize:12, color:C.textSec }}>Signalez au médecin chef pour assigner ce patient</p>
            </div>
            <Btn onClick={()=>onNouvelleConsultation(patient)} small variant="success">Signaler au médecin chef</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalRdv({ rdv, onClose }) {
  if (!rdv) return null
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:440, boxShadow:"0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"22px 28px 18px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:18, fontWeight:800, color:C.textPri }}>Rendez-vous</p>
            <p style={{ fontSize:13, color:C.textSec }}>{rdv.patient} · {rdv.heure}</p>
          </div>
          <button onClick={onClose} style={{ background:C.slateSoft, border:"none", borderRadius:8, color:C.textSec, cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:"24px 28px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[{l:"Patient",v:rdv.patient},{l:"Médecin",v:rdv.docteur},{l:"Heure",v:rdv.heure},{l:"Type",v:rdv.type},{l:"Statut",v:<Badge statut={rdv.statut}/>}].map(({l,v})=>(
              <div key={l} style={{ background:C.bg, borderRadius:10, padding:"12px 14px", border:"1px solid "+C.border }}>
                <p style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{l}</p>
                <div style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardSecretaire() {
  const [onglet, setOnglet]                    = useState("accueil")
  const [sidebarOpen, setSidebarOpen]          = useState(false)
  const [patients, setPatients]                = useState(PATIENTS_INIT)
  const [docPresence, setDocPresence]          = useState(DOCTEURS.map(d=>({...d, arrivee:d.arrive, depart:null})))
  const [patientVu, setPatientVu]              = useState(null)
  const [rdvVu, setRdvVu]                      = useState(null)
  const [recherche, setRecherche]              = useState("")
  const [showForm, setShowForm]                = useState(false)
  const [heure, setHeure]                      = useState("")
  const [dateStr, setDateStr]                  = useState("")
  const [rdvForm, setRdvForm]                  = useState({ patientId:"", docteur:"", heure:"", type:"Consultation", date:today() })

  const FORM_INIT = { nom:"", prenom:"", dateNaissance:"", adresse:"", sexe:"F", telephone:"", motif:"", tuteur:"" }
  const [form, setForm] = useState(FORM_INIT)

  useEffect(()=>{
    const tick=()=>{
      const n=new Date()
      setHeure(n.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
      setDateStr(n.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))
    }
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  const totalPatients = patients.length
  const enAttente     = patients.filter(p=>p.statut==="en_attente").length
  const enSalle       = patients.filter(p=>p.statut==="en_salle").length
  const docPresents   = DOCTEURS.filter(d=>d.statut==="present").length

  const patientsFiltres = patients.filter(p=>{
    const q=recherche.toLowerCase().trim()
    if(!q) return true
    return p.nom.toLowerCase().includes(q)||p.motif.toLowerCase().includes(q)||p.docteur.toLowerCase().includes(q)||p.pid.toLowerCase().includes(q)||(p.telephone||"").includes(q)||(p.adresse||"").toLowerCase().includes(q)
  })
  const patientsAffiches = [...patientsFiltres].sort((a,b)=>{
    const pr=s=>(s==="en_attente"||s==="en_salle"?0:1)
    return pr(a.statut)-pr(b.statut)
  })

  const handleAjouter = () => {
    if (!form.nom||!form.prenom) return
    const fullNom = form.nom+" "+form.prenom
    const existing = patients.find(p=>p.nom===fullNom)
    if (existing) {
      alert("Patient "+fullNom+" est de retour. Notifié au médecin chef.")
      setForm(FORM_INIT); setShowForm(false); return
    }
    let age=0
    if(form.dateNaissance){ const diff=Date.now()-new Date(form.dateNaissance).getTime(); age=Math.floor(diff/(365.25*24*3600*1000)) }
    const nouveau={ id:patients.length+1, pid:genId(Date.now()%999999), nom:fullNom, age, dateNaissance:form.dateNaissance, adresse:form.adresse, telephone:form.telephone, sexe:form.sexe, motif:form.motif||"Consultation", arrivee:nowTime(), depart:null, statut:"en_attente", docteur:"Non assigné", tuteur:form.tuteur }
    setPatients(prev=>[nouveau,...prev])
    setForm(FORM_INIT); setShowForm(false)
  }

  const handleNouvelleConsultation = (patient) => {
    alert("Le médecin chef a été notifié pour "+patient.nom+".")
    setPatientVu(null)
  }

  const updatePresence = (docteurId, action) => {
    const t = nowTime()
    setDocPresence(prev=>prev.map(d=>d.id===docteurId?{...d,[action]:t}:d))
  }

  const inputSt = { width:"100%", padding:"10px 14px", fontSize:14, border:"1.5px solid "+C.border, borderRadius:10, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit" }

  const NAV = [
    { id:"accueil",     label:"Accueil",     icon:"🏠", desc:"Vue d'ensemble" },
    { id:"patients",    label:"Patients",    icon:"👥", desc:"Liste du jour"  },
    { id:"docteurs",    label:"Médecins",    icon:"👨‍⚕️", desc:"Présences"      },
    { id:"rdv",         label:"Rendez-vous", icon:"📅", desc:"Planning"       },
  ]

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.textPri }}>

      <ModalPatient patient={patientVu} historiques={[]} onClose={()=>setPatientVu(null)} onNouvelleConsultation={handleNouvelleConsultation} />
      <ModalRdv rdv={rdvVu} onClose={()=>setRdvVu(null)} />

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:100 }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:270, background:C.white, boxShadow:"4px 0 24px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12 }}>
              <img src={logo} alt="" style={{ height:44, borderRadius:8, objectFit:"cover", border:"1px solid "+C.border }} />
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.textPri, lineHeight:1.2 }}>Clinique Marouane</p>
                <p style={{ fontSize:12, color:C.textSec }}>Système de gestion</p>
              </div>
            </div>
            <nav style={{ padding:"14px 12px", flex:1 }}>
              <p style={{ fontSize:10, color:C.textMuted, letterSpacing:"0.12em", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>Menu principal</p>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{ setOnglet(n.id); setSidebarOpen(false) }} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:12, border:"none", background:onglet===n.id?C.blueSoft:"transparent", color:onglet===n.id?C.blue:C.textSec, fontSize:14, fontWeight:onglet===n.id?700:500, cursor:"pointer", textAlign:"left", marginBottom:3, transition:"all .15s", boxShadow:onglet===n.id?"inset 3px 0 0 "+C.blue:"none" }}
                  onMouseEnter={e=>{ if(onglet!==n.id) e.currentTarget.style.background=C.slateSoft }}
                  onMouseLeave={e=>{ if(onglet!==n.id) e.currentTarget.style.background="transparent" }}>
                  <span style={{ fontSize:18 }}>{n.icon}</span>
                  <div>
                    <p style={{ fontSize:13, lineHeight:1.2 }}>{n.label}</p>
                    <p style={{ fontSize:10, color:C.textMuted, lineHeight:1.2, marginTop:1 }}>{n.desc}</p>
                  </div>
                </button>
              ))}
            </nav>
            <div style={{ padding:"14px 16px 20px", borderTop:"1px solid "+C.border }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:C.greenSoft, borderRadius:12, border:"1px solid "+C.green+"33" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:C.green, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>Secrétaire</p>
                  <p style={{ fontSize:11, color:C.green, fontWeight:600, marginTop:1 }}>Accueil · Clinique Marouane</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <button onClick={()=>setSidebarOpen(true)} style={{ width:40, height:40, borderRadius:8, border:"1px solid "+C.border, background:C.white, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5 }}>
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
          <div style={{ width:20, height:2, background:C.textPri, borderRadius:2 }} />
        </button>
        <div style={{ flex:1, marginLeft:20 }}>
          <p style={{ fontSize:15, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>
            {onglet==="accueil"     && "Accueil"}
            {onglet==="patients"    && (recherche ? "Résultats — « "+recherche+" »" : "Patients du jour")}
            {onglet==="docteurs"    && "Médecins — Présences"}
            {onglet==="rdv"         && "Rendez-vous"}
          </p>
          <p style={{ fontSize:12, color:C.textMuted, textTransform:"capitalize", lineHeight:1.2 }}>{dateStr}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ position:"relative" }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Nom, ID, téléphone…" value={recherche}
              onChange={e=>{ setRecherche(e.target.value); if(e.target.value.trim()) setOnglet("patients") }}
              style={{ padding:"8px 32px 8px 32px", fontSize:13, border:"1.5px solid "+C.border, borderRadius:10, background:C.bg, color:C.textPri, outline:"none", fontFamily:"inherit", width:220 }}
              onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.background=C.white }}
              onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.background=C.bg }}
            />
            {recherche && <button onClick={()=>setRecherche("")} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.textMuted, fontSize:16 }}>✕</button>}
          </div>
          <div style={{ background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:10, padding:"8px 16px", fontSize:14, fontWeight:700, color:C.green, fontVariantNumeric:"tabular-nums", minWidth:112, textAlign:"center" }}>{heure}</div>
          
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.textPri, lineHeight:1.2 }}>Secrétaire</p>
              <p style={{ fontSize:11, color:C.textSec }}>Clinique Marouane</p>
            </div>
            <div style={{ width:36, height:36, borderRadius:"50%", background:C.greenSoft, border:"2px solid "+C.green+"33", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main style={{ padding:"28px 28px" }}>

        {/* ACCUEIL */}
        {onglet==="accueil" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:16 }}>
              <Card style={{ padding:"28px 28px 24px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <p style={{ fontSize:14, color:C.textSec, marginBottom:12 }}>Patients aujourd'hui</p>
                    <p style={{ fontSize:46, fontWeight:800, color:C.textPri, lineHeight:1, letterSpacing:"-2px", marginBottom:8 }}>{totalPatients}</p>
                    <p style={{ fontSize:13, color:C.textMuted }}>Patients enregistrés</p>
                  </div>
                  <div style={{ width:54, height:54, borderRadius:"50%", background:C.blueSoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                </div>
              </Card>
              {[
                { val:enAttente,   label:"En attente",        icon:"⏳", bg:C.amberSoft, fg:C.amber },
                { val:enSalle,     label:"En consultation",   icon:"🏥", bg:C.blueSoft,  fg:C.blue  },
                { val:docPresents, label:"Médecins présents", icon:"👨‍⚕️", bg:C.greenSoft, fg:C.green },
              ].map(({ val, label, icon, bg, fg })=>(
                <Card key={label} style={{ padding:"22px 20px" }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:14 }}>{icon}</div>
                  <p style={{ fontSize:30, fontWeight:800, color:fg, letterSpacing:"-1px", lineHeight:1 }}>{val}</p>
                  <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>{label}</p>
                </Card>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:16 }}>
              <Card>
                <CardHeader title="Patients du jour" action={<button onClick={()=>setOnglet("patients")} style={{ background:"none", border:"none", color:C.blue, fontSize:13, cursor:"pointer", fontWeight:600 }}>Tout voir →</button>} />
                {patients.slice(0,5).map((p,i)=>(
                  <div key={p.id} style={{ padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:i<4?"1px solid "+C.border:"none", cursor:"pointer", transition:"background .15s" }}
                    onClick={()=>setPatientVu(p)}
                    onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Avatar name={p.nom} size={34} />
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                        <p style={{ fontSize:11, color:C.textSec }}>{p.motif}</p>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <Badge statut={p.statut} />
                      <p style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>{p.arrivee}</p>
                    </div>
                  </div>
                ))}
              </Card>
              <Card>
                <CardHeader title="Médecins présents" action={<button onClick={()=>setOnglet("docteurs")} style={{ background:"none", border:"none", color:C.blue, fontSize:13, cursor:"pointer", fontWeight:600 }}>Tout voir →</button>} />
                {DOCTEURS.map((d,i)=>(
                  <div key={d.id} style={{ padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:i<DOCTEURS.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={d.nom.split(" ")[1]} size={32} />
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{d.nom}</p>
                        <p style={{ fontSize:11, color:C.textSec }}>{d.specialite}</p>
                      </div>
                    </div>
                    <Badge statut={d.statut} />
                  </div>
                ))}
              </Card>
            </div>

            <Card>
              <CardHeader title="Rendez-vous du jour" action={<button onClick={()=>setOnglet("rdv")} style={{ background:"none", border:"none", color:C.blue, fontSize:13, cursor:"pointer", fontWeight:600 }}>Tout voir →</button>} />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)" }}>
                {RDV_JOUR.map((r,i)=>(
                  <div key={r.id} style={{ padding:"18px 14px", textAlign:"center", borderRight:i<5?"1px solid "+C.border:"none", transition:"background .15s", cursor:"pointer" }}
                    onClick={()=>setRdvVu(r)}
                    onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <p style={{ fontSize:17, fontWeight:800, color:C.blue, marginBottom:6, fontVariantNumeric:"tabular-nums" }}>{r.heure}</p>
                    <p style={{ fontSize:12, fontWeight:600, color:C.textPri, marginBottom:2 }}>{r.patient.split(" ")[0]}</p>
                    <p style={{ fontSize:11, color:C.textMuted, marginBottom:10 }}>{r.type}</p>
                    <Badge statut={r.statut} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* PATIENTS */}
        {onglet==="patients" && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {showForm && (
              <Card style={{ border:"1.5px solid "+C.blue+"33" }}>
                <div style={{ padding:"22px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <div>
                      <h2 style={{ fontSize:16, fontWeight:800, color:C.textPri }}>Enregistrer un nouveau patient</h2>
                      <p style={{ color:C.textMuted, fontSize:12, marginTop:2 }}>Le médecin chef assignera le médecin après l'enregistrement</p>
                    </div>
                    <Btn onClick={()=>setShowForm(false)} variant="secondary" small>✕ Fermer</Btn>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                    {[
                      {label:"Nom de famille",     key:"nom",      placeholder:"Ex : Diallo",          req:true},
                      {label:"Prénom",             key:"prenom",   placeholder:"Ex : Aminata",         req:true},
                      {label:"Téléphone",          key:"telephone",placeholder:"+224 6XX XX XX XX"             },
                      {label:"Adresse",            key:"adresse",  placeholder:"Ex : Ratoma, Conakry", req:true},
                      {label:"Raison de la visite",key:"motif",    placeholder:"Ex : Fièvre…"                  },
                      {label:"Tuteur (si mineur)", key:"tuteur",   placeholder:"Ex : Bah Mamadou"             },
                    ].map(({ label, key, placeholder, req })=>(
                      <div key={key}>
                        <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>{label} {req&&<span style={{ color:C.red }}>*</span>}</label>
                        <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} style={inputSt}
                          onFocus={e=>{ e.target.style.borderColor=C.blue; e.target.style.boxShadow="0 0 0 3px "+C.blueSoft }}
                          onBlur={e=>{ e.target.style.borderColor=C.border; e.target.style.boxShadow="none" }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Date de naissance <span style={{ color:C.red }}>*</span></label>
                      <input type="date" value={form.dateNaissance} onChange={e=>setForm({...form,dateNaissance:e.target.value})} style={inputSt}
                        onFocus={e=>e.target.style.borderColor=C.blue}
                        onBlur={e=>e.target.style.borderColor=C.border} />
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Sexe</label>
                      <select value={form.sexe} onChange={e=>setForm({...form,sexe:e.target.value})} style={{ ...inputSt, cursor:"pointer" }}>
                        <option value="F">Féminin</option>
                        <option value="M">Masculin</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop:16, background:C.greenSoft, border:"1px solid "+C.green+"33", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                    <span>ℹ️</span>
                    <p style={{ fontSize:12, color:C.green, fontWeight:600 }}>L'assignation au médecin est faite par le médecin chef. Le patient sera en statut "En attente".</p>
                  </div>
                  <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:20, paddingTop:20, borderTop:"1px solid "+C.border }}>
                    <Btn onClick={()=>{ setShowForm(false); setForm(FORM_INIT) }} variant="secondary">Annuler</Btn>
                    <Btn onClick={handleAjouter}>Enregistrer</Btn>
                  </div>
                </div>
              </Card>
            )}
            <Card>
              <CardHeader
                title={"Liste du jour ("+patientsAffiches.length+" patient"+(patientsAffiches.length>1?"s":"")+")"}
                action={!showForm && (
                  <Btn onClick={()=>setShowForm(true)} small>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    Nouveau patient
                  </Btn>
                )}
              />
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.slateSoft }}>
                    {["ID","Patient","Action"].map(h=>(
                      <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patientsAffiches.length===0
                    ? <tr><td colSpan={3} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun patient trouvé pour « {recherche} »</td></tr>
                    : patientsAffiches.map((p,i)=>(
                      <tr key={p.id} style={{ borderBottom:i<patientsAffiches.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"13px 16px" }}>
                          <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color:C.blue, background:C.blueSoft, padding:"3px 8px", borderRadius:6 }}>{p.pid}</span>
                        </td>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <Avatar name={p.nom} size={30} />
                            <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{p.nom}</p>
                          </div>
                        </td>
                        <td style={{ padding:"13px 16px" }}>
                          <button onClick={()=>setPatientVu(p)} style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:8, color:C.blue, fontSize:12, fontWeight:600, cursor:"pointer", padding:"6px 14px", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}
                            onMouseEnter={e=>{ e.currentTarget.style.background=C.blue; e.currentTarget.style.color="#fff" }}
                            onMouseLeave={e=>{ e.currentTarget.style.background=C.blueSoft; e.currentTarget.style.color=C.blue }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            Voir
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* MÉDECINS */}
        {onglet==="docteurs" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
              {[
                { label:"Présents",  val:DOCTEURS.filter(d=>d.statut==="present").length,   bg:C.greenSoft, fg:C.green, icon:"✅" },
                { label:"Absents",   val:DOCTEURS.filter(d=>d.statut==="absent").length,    bg:C.redSoft,   fg:C.red,   icon:"❌" },
                { label:"En retard", val:DOCTEURS.filter(d=>d.statut==="en_retard").length, bg:C.amberSoft, fg:C.amber, icon:"⏰" },
              ].map(({ label, val, bg, fg, icon })=>(
                <Card key={label} style={{ padding:"20px 22px", display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize:26, fontWeight:800, color:fg, letterSpacing:"-1px" }}>{val}</p>
                    <p style={{ fontSize:12, color:C.textMuted }}>{label}</p>
                  </div>
                </Card>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {docPresence.map(d=>(
                <Card key={d.id} style={{ border:"1.5px solid "+(d.statut==="present"?C.green+"44":C.border) }}>
                  <div style={{ padding:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <Avatar name={d.nom.split(" ")[1]} size={44} />
                      <Badge statut={d.statut} />
                    </div>
                    <p style={{ fontSize:14, fontWeight:800, color:C.textPri, marginBottom:2 }}>{d.nom}</p>
                    <p style={{ fontSize:12, color:C.textSec, marginBottom:14 }}>{d.specialite}</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                      <div style={{ background:C.bg, borderRadius:9, padding:"10px 12px", border:"1px solid "+C.border }}>
                        <p style={{ fontSize:10, color:C.textMuted, marginBottom:3, textTransform:"uppercase" }}>Arrivée</p>
                        <p style={{ fontSize:15, fontWeight:700, color:d.arrivee?C.green:C.textMuted }}>{d.arrivee||"—"}</p>
                      </div>
                      <div style={{ background:C.bg, borderRadius:9, padding:"10px 12px", border:"1px solid "+C.border }}>
                        <p style={{ fontSize:10, color:C.textMuted, marginBottom:3, textTransform:"uppercase" }}>Patients</p>
                        <p style={{ fontSize:15, fontWeight:700, color:C.textPri }}>{d.patients}</p>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      {!d.arrivee && <Btn onClick={()=>updatePresence(d.id,"arrivee")} small variant="success">✔ Arrivée</Btn>}
                      {d.arrivee && !d.depart && <Btn onClick={()=>updatePresence(d.id,"depart")} small variant="secondary">✔ Départ</Btn>}
                    </div>
                    <p style={{ fontSize:10, color:C.textMuted, marginTop:10, padding:"6px 8px", background:C.slateSoft, borderRadius:6, border:"1px solid "+C.border }}>🔒 Enregistré par la secrétaire uniquement</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* RDV */}
        {onglet==="rdv" && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Card>
              <CardHeader title="Créer un rendez-vous" />
              <div style={{ padding:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Patient</label>
                    <select value={rdvForm.patientId} onChange={e=>setRdvForm({...rdvForm,patientId:e.target.value})} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">— Choisir patient —</option>
                      {patients.map(p=><option key={p.id} value={p.id}>{p.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Médecin</label>
                    <select value={rdvForm.docteur} onChange={e=>setRdvForm({...rdvForm,docteur:e.target.value})} style={{ ...inputSt, cursor:"pointer" }}>
                      <option value="">— Choisir médecin —</option>
                      {DOCTEURS.map(d=><option key={d.id} value={d.nom}>{d.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Heure</label>
                    <input type="time" value={rdvForm.heure} onChange={e=>setRdvForm({...rdvForm,heure:e.target.value})} style={inputSt} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Date</label>
                    <input type="date" value={rdvForm.date} onChange={e=>setRdvForm({...rdvForm,date:e.target.value})} style={inputSt} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Type</label>
                    <input value={rdvForm.type} onChange={e=>setRdvForm({...rdvForm,type:e.target.value})} placeholder="Ex : Consultation, Suivi…" style={inputSt} />
                  </div>
                </div>
                <div style={{ marginTop:14 }}>
                  <Btn onClick={()=>{ if(rdvForm.patientId&&rdvForm.heure){ alert("Rendez-vous créé avec succès"); setRdvForm({patientId:"",docteur:"",heure:"",type:"Consultation",date:today()}) } }} small>Créer le rendez-vous</Btn>
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader title={"Rendez-vous — "+new Date().toLocaleDateString("fr-FR")} />
              {RDV_JOUR.map((r,i)=>(
                <div key={r.id} style={{ padding:"15px 20px", display:"flex", alignItems:"center", gap:16, borderBottom:i<RDV_JOUR.length-1?"1px solid "+C.border:"none", transition:"background .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{ width:60, height:60, borderRadius:12, background:C.blueSoft, border:"1px solid "+C.blue+"33", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <p style={{ fontSize:14, fontWeight:800, color:C.blue, fontVariantNumeric:"tabular-nums" }}>{r.heure}</p>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:C.textPri, marginBottom:3 }}>{r.patient}</p>
                    <p style={{ fontSize:12, color:C.textMuted }}>{r.type} · {r.docteur}</p>
                  </div>
                  <Badge statut={r.statut} />
                  <button onClick={()=>setRdvVu(r)} style={{ background:C.blueSoft, border:"1px solid "+C.blue+"33", borderRadius:8, color:C.blue, fontSize:12, fontWeight:600, cursor:"pointer", padding:"7px 14px", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=C.blue; e.currentTarget.style.color="#fff" }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=C.blueSoft; e.currentTarget.style.color=C.blue }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Voir
                  </button>
                </div>
              ))}
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