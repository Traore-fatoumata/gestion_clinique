import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"
import { useAuth } from "../../hooks/useAuth.jsx"
import { useNavigate } from "react-router-dom"
import { useSharedData } from "../../hooks/useSharedData.jsx"

const calcAge = d => { if(!d) return 0; return Math.floor((Date.now()-new Date(d))/(365.25*864e5)) }

// Tarif selon âge
function tarifParAge(dateNaissance) {
  const age = calcAge(dateNaissance)
  if (age < 5)  return { montant:30000, label:"Nourrisson (< 5 ans)" }
  if (age < 15) return { montant:35000, label:"Enfant (5–14 ans)" }
  if (age < 61) return { montant:50000, label:"Adulte (15–60 ans)" }
  return { montant:40000, label:"Senior (> 60 ans)" }
}

const C = {
  bg:"#f7f9f8", white:"#ffffff",
  textPri:"#111827", textSec:"#374151", textMuted:"#6b7280",
  border:"#e2ebe4",
  green:"#16a34a", greenSoft:"#dcfce7", greenDark:"#15803d",
  blue:"#1d6fa4",  blueSoft:"#e8f4fb",
  amber:"#b45309", amberSoft:"#fef3c7",
  red:"#dc2626",   redSoft:"#fef2f2",
  slate:"#475569", slateSoft:"#f1f5f9",
  purple:"#6d28d9",purpleSoft:"#ede9fe",
  teal:"#0f766e",  tealSoft:"#f0fdfa",
}

function fmtMoney(n) { return (n||0).toLocaleString("fr-FR")+" GNF" }

function Avatar({ name, size=36, bg="#1d6fa4" }) {
  const initials = (name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center",
      justifyContent:"center", color:"#fff", fontSize:size*0.36, fontWeight:800, flexShrink:0 }}>
      {initials}
    </div>
  )
}

function Badge({ statut }) {
  const cfg = {
    paye:      { label:"Payé",         bg:C.greenSoft,  color:C.green  },
    partiel:   { label:"Partiel",      bg:C.amberSoft,  color:C.amber  },
    impaye:    { label:"Non payé",     bg:C.redSoft,    color:C.red    },
    en_attente:{ label:"En attente",   bg:C.slateSoft,  color:C.slate  },
  }
  const s = cfg[statut] || cfg.en_attente
  return (
    <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
      background:s.bg, color:s.color, border:"1px solid "+s.color+"33", whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  )
}

// ── Modal paiement consultation (obligatoire, 100%) ─────
function ModalPaiementConsultation({ entree, patient, onClose, onSave }) {
  const tarif = tarifParAge(patient?.dateNaissance)
  const montantDu = entree.montantConsultation || tarif.montant
  const [methode, setMethode] = useState("cash")
  const [note,    setNote]    = useState("")

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:C.white,borderRadius:20,width:"100%",maxWidth:480,boxShadow:"0 25px 60px rgba(0,0,0,0.2)",overflow:"hidden" }}>
        <div style={{ padding:"20px 24px",background:"linear-gradient(135deg,#0f4c2a,#16a34a)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <p style={{ fontSize:16,fontWeight:800,color:"#fff" }}>Frais de consultation — {entree.nom}</p>
            <p style={{ fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2 }}>{tarif.label} · Paiement intégral obligatoire</p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"20px 24px",display:"flex",flexDirection:"column",gap:16 }}>
          {/* Montant fixe */}
          <div style={{ background:C.greenSoft,borderRadius:14,padding:"16px 20px",border:"1px solid "+C.green+"33",textAlign:"center" }}>
            <p style={{ fontSize:12,color:C.textMuted,marginBottom:4 }}>Montant à encaisser</p>
            <p style={{ fontSize:32,fontWeight:800,color:C.green }}>{fmtMoney(montantDu)}</p>
            <p style={{ fontSize:11,color:C.textMuted,marginTop:4 }}>Ce montant doit être payé intégralement avant la consultation</p>
          </div>
          {/* Méthode */}
          <div>
            <label style={{ fontSize:12,fontWeight:700,color:C.textSec,display:"block",marginBottom:8 }}>Mode de paiement</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[{val:"cash",label:"Espèces"},{val:"orange_money",label:"Orange Money"},{val:"wave",label:"Wave"},{val:"virement",label:"Virement"}].map(opt=>(
                <button key={opt.val} type="button" onClick={()=>setMethode(opt.val)}
                  style={{ padding:"10px",borderRadius:10,border:"2px solid "+(methode===opt.val?C.green:C.border),
                    background:methode===opt.val?C.greenSoft:C.white,color:methode===opt.val?C.green:C.textSec,
                    fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Note */}
          <div>
            <label style={{ fontSize:12,fontWeight:700,color:C.textSec,display:"block",marginBottom:4 }}>Note (facultatif)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Reçu espèces, numéro transaction…"
              style={{ width:"100%",padding:"10px 12px",border:"1.5px solid "+C.border,borderRadius:10,fontSize:14,fontFamily:"inherit",boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex",gap:10,paddingTop:4 }}>
            <button onClick={onClose}
              style={{ flex:1,padding:"11px",border:"1.5px solid "+C.border,borderRadius:10,background:C.white,color:C.textSec,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
              Annuler
            </button>
            <button onClick={()=>onSave({ statut:"paye", montant:montantDu, methode, note, montantConsultation:montantDu })}
              style={{ flex:2,padding:"11px",border:"none",borderRadius:10,background:C.green,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
              Confirmer l'encaissement ({fmtMoney(montantDu)})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Impression reçu ────────────────────────────────────
function imprimerRecu(f) {
  const pmt = f.paiementConsultation||{}
  const date = new Date().toLocaleDateString("fr-FR")
  const montantTotal = f.montantConsultation || 50000
  const montantPaye  = pmt.statut==="paye" ? montantTotal : 0
  const reste        = Math.max(0, montantTotal - montantPaye)
  const statutColor  = pmt.statut==="paye"?"#16a34a":"#dc2626"
  const statutLabel  = pmt.statut==="paye"?"FRAIS DE CONSULTATION PAYÉS":"EN ATTENTE DE PAIEMENT"
  const w = window.open("","_blank","width=600,height=800")
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reçu</title><style>
    body{font-family:'Segoe UI',sans-serif;margin:0;padding:32px;color:#000}
    .header{text-align:center;border-bottom:2px solid #16a34a;padding-bottom:16px;margin-bottom:20px}
    .title{font-size:20px;font-weight:800;color:#16a34a;margin:0}
    .sub{font-size:12px;color:#555;margin:3px 0}
    .badge{display:inline-block;padding:4px 16px;border-radius:20px;font-weight:700;font-size:14px;margin:8px 0;color:${statutColor};border:2px solid ${statutColor}22;background:${statutColor}11}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px}
    .row:last-child{border:none}
    .total{font-weight:800;font-size:16px}
    .footer{margin-top:30px;text-align:center;font-size:11px;color:#999}
    @media print{body{padding:16px}}
  </style></head><body>
  <div class="header">
    <div class="title">Clinique Médicale ABC Marouane</div>
    <div class="sub">Tannerie, Kaloum · Conakry · +224 624 00 00 00</div>
    <div class="sub" style="font-size:15px;font-weight:700;margin-top:6px">REÇU DE PAIEMENT</div>
    <div class="badge">${statutLabel}</div>
  </div>
  <div class="row"><span>Date</span><span>${date}</span></div>
  <div class="row"><span>Patient</span><span>${f.nom}</span></div>
  <div class="row"><span>Service</span><span>${f.service||"—"}</span></div>
  <div class="row"><span>Motif</span><span>${f.motif||"—"}</span></div>
  <div class="row"><span>Montant consultation</span><span>${montantTotal.toLocaleString("fr-FR")} GNF</span></div>
  <div class="row"><span>Montant reçu</span><span style="color:#16a34a;font-weight:700">${montantPaye.toLocaleString("fr-FR")} GNF</span></div>
  ${reste>0?`<div class="row total"><span>Reste à payer</span><span style="color:#dc2626">${reste.toLocaleString("fr-FR")} GNF</span></div>`:""}
  ${pmt.delai?`<div class="row"><span>Date limite règlement</span><span>${pmt.delai}</span></div>`:""}
  ${pmt.note?`<div class="row"><span>Note</span><span>${pmt.note}</span></div>`:""}
  <div class="footer">
    <p>Clinique Médicale ABC Marouane · Document officiel</p>
    <p style="margin-top:30px;border-top:1px solid #000;padding-top:6px;width:180px;margin-left:auto;text-align:center">Signature Comptable</p>
  </div></body></html>`)
  w.document.close(); setTimeout(()=>w.print(),400)
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardComptabilite() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate("/login") }

  const { patients: sharedPatients, file, updateFileEntry } = useSharedData()
  const [onglet, setOnglet] = useState("caisse")
  const [recherche, setRecherche] = useState("")
  const [mPmt, setMPmt] = useState(null)
  const [heure, setHeure] = useState("")
  const [dateStr, setDateStr] = useState("")
  const [filterStatut, setFilterStatut] = useState("tous")

  useEffect(()=>{
    const tick=()=>{
      const n=new Date()
      setHeure(n.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}))
      setDateStr(n.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))
    }
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t)
  },[])

  // Enrichir les entrées de la file avec infos patient
  const fileEnrichie = file.map(f => {
    const p = sharedPatients.find(sp => sp.id === f.patientId) || {}
    return { ...p, ...f, id: f.id, patientId: f.patientId }
  })

  const fileAujourdhui = fileEnrichie.filter(f => f.statut !== "termine")

  // Stats consultation
  const totalJour      = fileAujourdhui.reduce((s,f) => s + (f.montantConsultation || tarifParAge(f.dateNaissance).montant), 0)
  const totalEncaisse  = fileAujourdhui.reduce((s,f) => {
    const montant = f.montantConsultation || tarifParAge(f.dateNaissance).montant
    return s + (f.paiementConsultation?.statut==="paye" ? montant : 0)
  }, 0)
  const totalReste     = totalJour - totalEncaisse
  const nbPayes        = fileAujourdhui.filter(f => f.paiementConsultation?.statut==="paye").length
  const nbAttente      = fileAujourdhui.filter(f => !f.paiementConsultation || f.paiementConsultation.statut!=="paye").length

  const fileFiltree = fileAujourdhui.filter(f => {
    const q = recherche.toLowerCase()
    const matchRecherche = !q || f.nom?.toLowerCase().includes(q) || (f.pid||"").toLowerCase().includes(q) || (f.service||"").toLowerCase().includes(q)
    const matchStatut = filterStatut==="tous"
      || (filterStatut==="impaye" && (!f.paiementConsultation || f.paiementConsultation.statut!=="paye"))
      || (filterStatut==="paye" && f.paiementConsultation?.statut==="paye")
    return matchRecherche && matchStatut
  })

  const handleSavePmt = (data) => {
    updateFileEntry(mPmt.id, { paiementConsultation: data })
    setMPmt(null)
  }

  const getStatutPmt = (f) => f.paiementConsultation?.statut === "paye" ? "paye" : "en_attente"

  const NAV = [
    { id:"caisse",    label:"Caisse du jour",      icon:"💰", badge: nbAttente > 0 ? nbAttente : 0 },
    { id:"historique",label:"Historique",           icon:"📋", badge: 0 },
    { id:"stats",     label:"Statistiques",         icon:"📊", badge: 0 },
  ]

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif", background:C.bg, color:C.textPri }}>

      {/* HEADER */}
      <header style={{ background:C.white, borderBottom:"1px solid "+C.border, padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:"#fff", padding:4, boxShadow:"0 2px 8px rgba(0,0,0,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src={logo} alt="Logo" style={{ width:"100%", height:"100%", borderRadius:6, objectFit:"contain" }} />
          </div>
          <div>
            <p style={{ fontSize:15, fontWeight:800, color:C.textPri }}>Comptabilité</p>
            <p style={{ fontSize:11, color:C.textMuted, textTransform:"capitalize" }}>{dateStr} · {heure}</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Avatar name={user?.nom} size={36} bg={C.teal} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{user?.nom}</p>
            <p style={{ fontSize:11, color:C.textMuted }}>Comptable</p>
          </div>
          <button onClick={handleLogout}
            style={{ marginLeft:8, width:36, height:36, borderRadius:8, border:"1px solid #fca5a5", background:"#fff5f5", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cc2222" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <div style={{ display:"flex", flex:1 }}>
        {/* SIDEBAR */}
        <aside style={{ width:220, background:C.white, borderRight:"1px solid "+C.border, padding:"20px 12px", display:"flex", flexDirection:"column", gap:4 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>setOnglet(n.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:12, border:"none",
                background:onglet===n.id?C.tealSoft:"transparent", color:onglet===n.id?C.teal:C.textSec,
                fontSize:13, fontWeight:onglet===n.id?700:500, cursor:"pointer", fontFamily:"inherit",
                boxShadow:onglet===n.id?"inset 3px 0 0 "+C.teal:"none", position:"relative" }}>
              <span style={{ fontSize:17 }}>{n.icon}</span>
              <span style={{ flex:1, textAlign:"left" }}>{n.label}</span>
              {n.badge > 0 && <span style={{ background:C.red, color:"#fff", fontSize:10, fontWeight:700, borderRadius:10, padding:"1px 6px" }}>{n.badge}</span>}
            </button>
          ))}
        </aside>

        {/* CONTENU */}
        <main style={{ flex:1, padding:"28px 28px", overflowY:"auto" }}>

          {/* ── CAISSE DU JOUR ── */}
          {onglet === "caisse" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* KPIs */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                {[
                  { label:"Total à encaisser",  val:fmtMoney(totalJour),     fg:C.blue   },
                  { label:"Encaissé",            val:fmtMoney(totalEncaisse), fg:C.green  },
                  { label:"Reste à percevoir",   val:fmtMoney(totalReste),    fg:C.red    },
                  { label:"En attente paiement", val:nbAttente,               fg:C.amber  },
                ].map(({ label, val, fg }) => (
                  <div key={label} style={{ background:C.white, borderRadius:16, padding:"18px 20px", border:"1px solid "+C.border, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                    <p style={{ fontSize:28, fontWeight:800, color:fg, letterSpacing:"-0.5px" }}>{val}</p>
                    <p style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Filtres + recherche */}
              <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ position:"relative", flex:1, minWidth:220 }}>
                  <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Rechercher un patient…"
                    style={{ width:"100%", padding:"10px 12px 10px 38px", border:"1.5px solid "+C.border, borderRadius:12, fontSize:13, background:C.white, color:C.textPri, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
                </div>
                {["tous","impaye","paye"].map(s=>(
                  <button key={s} onClick={()=>setFilterStatut(s)}
                    style={{ padding:"8px 16px", borderRadius:10, border:"1.5px solid "+(filterStatut===s?C.teal:C.border),
                      background:filterStatut===s?C.tealSoft:C.white, color:filterStatut===s?C.teal:C.textSec,
                      fontSize:12, fontWeight:filterStatut===s?700:500, cursor:"pointer", fontFamily:"inherit" }}>
                    {s==="tous"?"Tous":s==="impaye"?"En attente":"Payé"}
                    {s==="impaye"&&nbAttente>0&&<span style={{ marginLeft:6,background:C.red,color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700 }}>{nbAttente}</span>}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ padding:"16px 20px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ fontSize:15, fontWeight:700 }}>Patients du jour — {fileFiltree.length} entrée{fileFiltree.length>1?"s":""}</p>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{ background:C.slateSoft }}>
                    {["Patient","Service","Montant","Statut","Actions"].map(h=>(
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {fileFiltree.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding:40, textAlign:"center", color:C.textMuted, fontSize:14 }}>Aucun patient trouvé</td></tr>
                    ) : fileFiltree.map((f, i) => {
                      const montantConsult = f.montantConsultation || tarifParAge(f.dateNaissance).montant
                      const statut = getStatutPmt(f)
                      return (
                        <tr key={f.id} style={{ borderBottom:i<fileFiltree.length-1?"1px solid "+C.border:"none" }}
                          onMouseEnter={e=>e.currentTarget.style.background=C.slateSoft}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <Avatar name={f.nom} size={32} bg={C.teal} />
                              <div>
                                <p style={{ fontSize:13, fontWeight:600, color:C.textPri }}>{f.nom}</p>
                                <p style={{ fontSize:11, color:C.textMuted }}>{f.arrivee||"—"} · {f.typeVisite==="rendez_vous"?"RDV":"Consultation"}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"13px 16px", fontSize:12, color:C.textSec }}>{f.service||"—"}</td>
                          <td style={{ padding:"13px 16px" }}>
                            <p style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{fmtMoney(montantConsult)}</p>
                            <p style={{ fontSize:11, color:C.textMuted }}>{tarifParAge(f.dateNaissance).label}</p>
                          </td>
                          <td style={{ padding:"13px 16px" }}><Badge statut={statut} /></td>
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex", gap:6 }}>
                              {statut === "paye" && (
                                <button onClick={()=>imprimerRecu(f)}
                                  style={{ padding:"5px 12px", border:"1px solid "+C.border, borderRadius:8, background:C.white, fontSize:12, cursor:"pointer", fontFamily:"inherit", color:C.textSec }}>
                                  Reçu
                                </button>
                              )}
                              {statut !== "paye" && (
                                <button onClick={()=>setMPmt(f)}
                                  style={{ padding:"5px 12px", border:"none", borderRadius:8, background:C.green, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                                  Encaisser
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── HISTORIQUE ── */}
          {onglet === "historique" && (
            <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, overflow:"hidden" }}>
              <div style={{ padding:"18px 24px", borderBottom:"1px solid "+C.border }}>
                <p style={{ fontSize:16, fontWeight:700 }}>Historique des paiements</p>
                <p style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>Tous les paiements enregistrés</p>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:C.slateSoft }}>
                  {["Patient","Service","Total","Reçu","Reste","Statut","Date"].map(h=>(
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textSec, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {fileEnrichie.filter(f=>f.paiementConsultation?.statut==="paye").map((f,i,arr)=>{
                    const montantConsult = f.montantConsultation || 50000
                    return (
                      <tr key={f.id} style={{ borderBottom:i<arr.length-1?"1px solid "+C.border:"none" }}>
                        <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600 }}>{f.nom}</td>
                        <td style={{ padding:"11px 16px", fontSize:12, color:C.textSec }}>{f.service||"—"}</td>
                        <td style={{ padding:"11px 16px", fontSize:13, fontWeight:700 }}>{fmtMoney(montantConsult)}</td>
                        <td style={{ padding:"11px 16px", fontSize:13, color:C.green, fontWeight:600 }}>{fmtMoney(montantConsult)}</td>
                        <td style={{ padding:"11px 16px", fontSize:13, color:C.textMuted }}>—</td>
                        <td style={{ padding:"11px 16px" }}><Badge statut="paye" /></td>
                        <td style={{ padding:"11px 16px", fontSize:12, color:C.textMuted }}>{f.paiementConsultation?.methode==="orange_money"?"Orange Money":f.paiementConsultation?.methode==="wave"?"Wave":f.paiementConsultation?.methode==="virement"?"Virement":"Espèces"}</td>
                      </tr>
                    )
                  })}
                  {fileEnrichie.filter(f=>f.paiementConsultation?.statut==="paye").length===0 && (
                    <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:C.textMuted }}>Aucun paiement enregistré</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── STATISTIQUES ── */}
          {onglet === "stats" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {/* Répartition par statut */}
                <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, padding:"20px 24px" }}>
                  <p style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Répartition des paiements</p>
                  {[
                    { label:"Consultation payée",   nb:nbPayes,   color:C.green },
                    { label:"En attente paiement",  nb:nbAttente, color:C.red   },
                  ].map(({ label, nb, color }) => {
                    const total = fileAujourdhui.length || 1
                    return (
                      <div key={label} style={{ marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:13, color:C.textSec }}>{label}</span>
                          <span style={{ fontSize:13, fontWeight:700, color }}>{nb}</span>
                        </div>
                        <div style={{ height:8, borderRadius:4, background:"#e5e7eb", overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(nb/total)*100}%`, background:color, borderRadius:4, transition:"width .5s" }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Taux de recouvrement */}
                <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, padding:"20px 24px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <p style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Taux de recouvrement</p>
                  <p style={{ fontSize:52, fontWeight:800, color:C.teal, letterSpacing:"-2px", lineHeight:1 }}>
                    {totalJour > 0 ? Math.round((totalEncaisse/totalJour)*100) : 0}%
                  </p>
                  <p style={{ fontSize:13, color:C.textMuted, marginTop:8 }}>{fmtMoney(totalEncaisse)} / {fmtMoney(totalJour)}</p>
                </div>
              </div>

              {/* Tarifs par tranche d'âge */}
              <div style={{ background:C.white, borderRadius:16, border:"1px solid "+C.border, padding:"20px 24px" }}>
                <p style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Grille tarifaire — Consultation</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                  {[
                    { label:"Nourrisson",  tranche:"< 5 ans",   tarif:30000, color:C.purple },
                    { label:"Enfant",      tranche:"5 – 14 ans",tarif:35000, color:C.blue   },
                    { label:"Adulte",      tranche:"15 – 60 ans",tarif:50000,color:C.green  },
                    { label:"Senior",      tranche:"> 60 ans",  tarif:40000, color:C.teal   },
                  ].map(({ label, tranche, tarif, color }) => (
                    <div key={label} style={{ background:color+"11", borderRadius:12, padding:"16px", border:"1px solid "+color+"33", textAlign:"center" }}>
                      <p style={{ fontSize:13, fontWeight:700, color, marginBottom:4 }}>{label}</p>
                      <p style={{ fontSize:11, color:C.textMuted, marginBottom:8 }}>{tranche}</p>
                      <p style={{ fontSize:22, fontWeight:800, color }}>{(tarif/1000).toFixed(0)}k GNF</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modal paiement */}
      {mPmt && (
        <ModalPaiementConsultation
          entree={mPmt}
          patient={sharedPatients.find(p=>p.id===mPmt.patientId)}
          onClose={()=>setMPmt(null)}
          onSave={handleSavePmt}
        />
      )}
    </div>
  )
}
