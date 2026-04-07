import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.jpeg"

// ══════════════════════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════════════════════
const today = () => new Date().toISOString().slice(0, 10)
const getNowTime = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
const getAge = (dateNaissance) => {
  const diff = Date.now() - new Date(dateNaissance).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

// ══════════════════════════════════════════════════════
//  DONNÉES DE DÉMONSTRATION
// ══════════════════════════════════════════════════════
const PATIENTS_DB = [
  { id: 1, pid: "CAB-A1B2C3", nom: "Bah Mariama",     dateNaissance: "1990-03-12", sexe: "F", telephone: "+224 622 11 22 33" },
  { id: 2, pid: "CAB-D4E5F6", nom: "Diallo Ibrahima", dateNaissance: "1972-07-04", sexe: "M", telephone: "+224 628 44 55 66" },
  { id: 3, pid: "CAB-G7H8I9", nom: "Sow Fatoumata",   dateNaissance: "1996-11-20", sexe: "F", telephone: "+224 621 77 88 99" },
  { id: 4, pid: "CAB-J1K2L3", nom: "Kouyaté Mamadou", dateNaissance: "1963-01-15", sexe: "M", telephone: "+224 624 33 44 55" },
  { id: 5, pid: "CAB-M4N5O6", nom: "Baldé Aissatou",  dateNaissance: "2018-06-08", sexe: "F", telephone: "+224 625 66 77 88" },
]

const TYPES_SOINS = [
  "Injection IM", "Injection IV", "Injection SC", "Perfusion",
  "Pansement", "Suture", "Retrait de points", "Prise de sang",
  "Sondage", "Oxygénothérapie", "Aspiration", "Nébulisation",
  "Électrocardiogramme", "Surveillance tension", "Autre"
]

const ZONES_ADMIN = [
  "Bras droit", "Bras gauche", "Main droite", "Main gauche",
  "Avant-bras droit", "Avant-bras gauche", "Cuisse droite", "Cuisse gauche",
  "Fesse droite", "Fesse gauche", "Abdomen", "Dos", "Autre"
]

const INFIRMIERS = ["Mme. Diallo", "M. Camara", "Mme. Bah", "M. Kouyaté"]

const SOINS_INIT = [
  {
    id: 1, patientId: 1, patient: PATIENTS_DB[0], date: today(), heure: "08:30",
    typeSoin: "Injection IM", zone: "Fesse droite", medicament: "Paracétamol 1g",
    dose: "1 ampoule", voie: "Intramusculaire",
    infirmier: "Mme. Diallo", observations: "Bien toléré", tolerance: "bonne",
    statut: "fait", dateProgrammee: today(), heureProgrammee: "08:30", urgent: false
  },
  {
    id: 2, patientId: 2, patient: PATIENTS_DB[1], date: today(), heure: "09:15",
    typeSoin: "Perfusion", zone: "Avant-bras gauche", medicament: "Sérum physiologique 500ml",
    dose: "500 ml", voie: "Intraveineuse",
    infirmier: "M. Camara", observations: "Débit 20 gouttes/min", tolerance: "bonne",
    statut: "en_cours", dateProgrammee: today(), heureProgrammee: "09:00", urgent: false
  },
  {
    id: 3, patientId: 3, patient: PATIENTS_DB[2], date: today(), heure: "10:00",
    typeSoin: "Pansement", zone: "Abdomen", medicament: "Bétadine, compresses",
    dose: "1 pansement", voie: "Local",
    infirmier: "—", observations: "Plaie propre, pas de signes d'infection", tolerance: null,
    statut: "programme", dateProgrammee: today(), heureProgrammee: "10:00", urgent: false
  },
  {
    id: 4, patientId: 4, patient: PATIENTS_DB[3], date: today(), heure: "10:30",
    typeSoin: "Prise de sang", zone: "Pli du coude gauche", medicament: "—",
    dose: "3 tubes", voie: "Veineuse",
    infirmier: "—", observations: "Bilan glycémique + NFS", tolerance: null,
    statut: "programme", dateProgrammee: today(), heureProgrammee: "10:30", urgent: true
  },
  {
    id: 5, patientId: 5, patient: PATIENTS_DB[4], date: today(), heure: "11:00",
    typeSoin: "Électrocardiogramme", zone: "Thorax", medicament: "—",
    dose: "—", voie: "—",
    infirmier: "—", observations: "Contrôle routine", tolerance: null,
    statut: "retarde", dateProgrammee: today(), heureProgrammee: "10:00", urgent: false
  },
]

// ══════════════════════════════════════════════════════
//  COULEURS (unifié avec les autres dashboards)
// ══════════════════════════════════════════════════════
const C = {
  bg: "#f8f9fa",
  white: "#ffffff",
  textPri: "#0f172a",
  textSec: "#64748b",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  green: "#16a34a", greenSoft: "#dcfce7", greenDark: "#15803d",
  blue: "#2563eb",  blueSoft: "#dbeafe",  blueDark: "#1d4ed8",
  amber: "#d97706", amberSoft: "#fef3c7",
  red: "#dc2626",   redSoft: "#fee2e2",
  slate: "#475569", slateSoft: "#e2e8f0",
  purple: "#7c3aed",purpleSoft: "#ede9fe",
  orange: "#ea580c",orangeSoft: "#ffedd5",
  teal: "#0d9488",  tealSoft: "#ccfbf1",
}

// ══════════════════════════════════════════════════════
//  BADGE STATUT
// ══════════════════════════════════════════════════════
function Badge({ statut }) {
  const cfg = {
    programme: { label: "Programmé",  color: C.blue,   bg: C.blueSoft   },
    en_cours:  { label: "En cours",   color: C.amber,  bg: C.amberSoft  },
    fait:      { label: "Réalisé",    color: C.green,  bg: C.greenSoft  },
    retarde:   { label: "Retardé",    color: C.red,    bg: C.redSoft    },
    annule:    { label: "Annulé",     color: C.slate,  bg: C.slateSoft  },
  }
  const s = cfg[statut] || { label: statut, color: C.slate, bg: C.slateSoft }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: "4px 10px", borderRadius: 20, border: "1px solid " + s.color + "33"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}

// ══════════════════════════════════════════════════════
//  AVATAR
// ══════════════════════════════════════════════════════
function Avatar({ name, size = 36 }) {
  const palettes = [
    { bg: "#dbeafe", fg: "#2563eb" }, { bg: "#dcfce7", fg: "#16a34a" },
    { bg: "#ede9fe", fg: "#7c3aed" }, { bg: "#fef3c7", fg: "#d97706" },
    { bg: "#ccfbf1", fg: "#0d9488" },
  ]
  const p = palettes[(name?.charCodeAt(0) || 0) % palettes.length]
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: p.bg, color: p.fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 800, flexShrink: 0,
      border: "2px solid " + p.fg + "30"
    }}>
      {initials}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  BOUTON
// ══════════════════════════════════════════════════════
function Btn({ children, onClick, variant = "primary", small = false, disabled = false, style: customStyle = {} }) {
  const [hov, setHov] = useState(false)
  const cfg = {
    primary:   { bg: C.blue,  hov: C.blueDark,  color: "#fff" },
    success:   { bg: C.green, hov: C.greenDark,  color: "#fff" },
    secondary: { bg: C.white, hov: C.slateSoft,  color: C.textSec, border: "1.5px solid " + C.border },
    danger:    { bg: C.red,   hov: "#b91c1c",    color: "#fff" },
    warning:   { bg: C.amber, hov: "#b45309",    color: "#fff" },
    ghost:     { bg: "transparent", hov: C.slateSoft, color: C.textSec },
  }
  const s = cfg[variant] || cfg.primary
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov && !disabled ? s.hov : s.bg,
        color: s.color, border: s.border || "none", borderRadius: 10,
        padding: small ? "6px 14px" : "9px 18px",
        fontSize: small ? 12 : 13, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "inherit", transition: "all .15s",
        opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap", ...customStyle
      }}>
      {children}
    </button>
  )
}

// ══════════════════════════════════════════════════════
//  OVERLAY / MODAL WRAPPER
// ══════════════════════════════════════════════════════
function Overlay({ children, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      zIndex: 300, display: "flex", alignItems: "center",
      justifyContent: "center", padding: 20, backdropFilter: "blur(4px)"
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  HELPERS UI
// ══════════════════════════════════════════════════════
function CloseBtn({ onClose }) {
  return (
    <button onClick={onClose} style={{
      background: C.slateSoft, border: "none", borderRadius: 8,
      color: C.textSec, cursor: "pointer", width: 32, height: 32,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18, fontFamily: "inherit", flexShrink: 0
    }}>×</button>
  )
}
function Field({ label, children, required }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textPri, marginBottom: 6 }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      {children}
    </div>
  )
}
function Input({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle()} />
}
function Select({ value, onChange, children, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle()}>
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  )
}
function inputStyle() {
  return {
    width: "100%", padding: "10px 14px", fontSize: 14,
    border: "1.5px solid " + C.border, borderRadius: 10,
    background: C.white, color: C.textPri,
    outline: "none", fontFamily: "inherit", transition: "border-color .15s"
  }
}
function PatientBanner({ patient }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: C.slateSoft, border: "1px solid " + C.border }}>
      <Avatar name={patient.nom} size={44} />
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.textPri }}>{patient.nom}</p>
        <p style={{ fontSize: 12, color: C.textMuted }}>{patient.pid} · {getAge(patient.dateNaissance)} ans · {patient.sexe === "F" ? "Femme" : "Homme"}</p>
        <p style={{ fontSize: 12, color: C.textMuted }}>{patient.telephone}</p>
      </div>
    </div>
  )
}
function InfoGrid({ soin }) {
  const items = [
    { label: "Type de soin", val: soin.typeSoin },
    { label: "Zone", val: soin.zone || "—" },
    { label: "Médicament", val: soin.medicament || "—" },
    { label: "Dose", val: soin.dose || "—" },
    { label: "Voie", val: soin.voie || "—" },
    { label: "Heure prévue", val: soin.heureProgrammee || soin.heure },
  ]
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
      {items.map(it => (
        <div key={it.label} style={{ padding: "10px 14px", background: C.slateSoft, borderRadius: 10 }}>
          <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{it.label}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{it.val}</p>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — DÉTAIL SOIN
// ══════════════════════════════════════════════════════
function ModalDetailSoin({ soin, onClose }) {
  const toleranceCfg = {
    bonne:    { label: "Bonne",    icon: "😊", color: C.green },
    moyenne:  { label: "Moyenne",  icon: "😐", color: C.amber },
    mauvaise: { label: "Mauvaise", icon: "😣", color: C.red   },
  }
  const tol = toleranceCfg[soin.tolerance]
  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.greenSoft, borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✅</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.greenDark }}>Soin réalisé</p>
              <p style={{ fontSize: 12, color: C.green }}>{soin.heure} — {soin.infirmier}</p>
            </div>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "24px" }}>
          <PatientBanner patient={soin.patient} />
          <InfoGrid soin={soin} />
          {tol && (
            <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: tol.color + "15", border: "1px solid " + tol.color + "40", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{tol.icon}</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tolérance</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: tol.color }}>{tol.label}</p>
              </div>
            </div>
          )}
          {soin.observations && (
            <div style={{ marginTop: 16, padding: "14px 18px", background: C.slateSoft, borderRadius: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Observations</p>
              <p style={{ fontSize: 13, color: C.textPri, lineHeight: 1.6 }}>{soin.observations}</p>
            </div>
          )}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={onClose} variant="secondary">Fermer</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — NOUVEAU SOIN
// ══════════════════════════════════════════════════════
function ModalNouveauSoin({ patients, onClose, onCreate }) {
  const [form, setForm] = useState({
    patientId: "", typeSoin: "", zone: "", medicament: "",
    dose: "", voie: "", observations: "", urgent: false,
    dateProgrammee: today(), heureProgrammee: ""
  })
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const ok = form.patientId && form.typeSoin && form.dateProgrammee && form.heureProgrammee

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.textPri }}>Programmer un soin</p>
            <p style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>Nouvelle prescription infirmière</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Patient" required>
            <Select value={form.patientId} onChange={v => setF("patientId", v)} placeholder="— Choisir un patient —">
              {patients.map(p => <option key={p.id} value={p.id}>{p.nom} — {p.pid}</option>)}
            </Select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Type de soin" required>
              <Select value={form.typeSoin} onChange={v => setF("typeSoin", v)} placeholder="— Choisir —">
                {TYPES_SOINS.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Zone d'administration">
              <Select value={form.zone} onChange={v => setF("zone", v)} placeholder="— Choisir —">
                {ZONES_ADMIN.map(z => <option key={z} value={z}>{z}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <Field label="Médicament / Produit">
              <Input value={form.medicament} onChange={v => setF("medicament", v)} placeholder="Ex : Paracétamol 1g" />
            </Field>
            <Field label="Dose">
              <Input value={form.dose} onChange={v => setF("dose", v)} placeholder="Ex : 1 ampoule" />
            </Field>
          </div>
          <Field label="Voie d'administration">
            <Input value={form.voie} onChange={v => setF("voie", v)} placeholder="Ex : Intramusculaire, Intraveineuse..." />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Date prévue" required>
              <input type="date" value={form.dateProgrammee} min={today()} onChange={e => setF("dateProgrammee", e.target.value)} style={inputStyle()} />
            </Field>
            <Field label="Heure prévue" required>
              <input type="time" value={form.heureProgrammee} onChange={e => setF("heureProgrammee", e.target.value)} style={inputStyle()} />
            </Field>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12,
            background: form.urgent ? C.redSoft : C.slateSoft,
            border: "1.5px solid " + (form.urgent ? C.red + "40" : C.border),
            cursor: "pointer", transition: "all .15s"
          }} onClick={() => setF("urgent", !form.urgent)}>
            <input type="checkbox" checked={form.urgent} onChange={() => {}} style={{ width: 18, height: 18, accentColor: C.red, cursor: "pointer" }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: form.urgent ? C.red : C.textSec }}>⚡ Marquer comme urgent</p>
              <p style={{ fontSize: 11, color: C.textMuted }}>Ce soin apparaîtra en priorité dans la liste</p>
            </div>
          </div>
          <Field label="Observations / Prescription médicale">
            <textarea value={form.observations} onChange={e => setF("observations", e.target.value)} rows={3}
              placeholder="Ex : À jeun, Surveillance tension avant administration..."
              style={{ ...inputStyle(), resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => { if (ok) { onCreate(form); onClose() } }} disabled={!ok} variant="success">
              ✓ Programmer le soin
            </Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  MODAL — EXÉCUTION DU SOIN
// ══════════════════════════════════════════════════════
function ModalExecutionSoin({ soin, onClose, onValider }) {
  const [observations, setObservations] = useState(soin.observations || "")
  const [tolerance, setTolerance]       = useState("bonne")
  const [infirmier, setInfirmier]       = useState(INFIRMIERS[0])

  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.blueSoft, borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💉</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.blueDark }}>Exécuter le soin</p>
              <p style={{ fontSize: 12, color: C.blue }}>{soin.patient.nom} — {soin.typeSoin}</p>
            </div>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <PatientBanner patient={soin.patient} />
          <InfoGrid soin={soin} />
          <Field label="Infirmier(ère) exécutant">
            <Select value={infirmier} onChange={v => setInfirmier(v)} placeholder="">
              {INFIRMIERS.map(i => <option key={i} value={i}>{i}</option>)}
            </Select>
          </Field>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.textPri, marginBottom: 10 }}>Tolérance du patient</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { val: "bonne",    label: "Bonne",    icon: "😊", color: C.green, bg: C.greenSoft },
                { val: "moyenne",  label: "Moyenne",  icon: "😐", color: C.amber, bg: C.amberSoft },
                { val: "mauvaise", label: "Mauvaise", icon: "😣", color: C.red,   bg: C.redSoft   },
              ].map(opt => (
                <div key={opt.val} onClick={() => setTolerance(opt.val)} style={{
                  padding: "14px 10px", borderRadius: 12, cursor: "pointer",
                  border: "2px solid " + (tolerance === opt.val ? opt.color : C.border),
                  background: tolerance === opt.val ? opt.bg : C.white,
                  textAlign: "center", transition: "all .15s"
                }}>
                  <p style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: tolerance === opt.val ? opt.color : C.textSec }}>{opt.label}</p>
                </div>
              ))}
            </div>
          </div>
          <Field label="Observations post-soin">
            <textarea value={observations} onChange={e => setObservations(e.target.value)} rows={3}
              placeholder="Ex : Patient tolère bien, pas de réaction adverse..."
              style={{ ...inputStyle(), resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid " + C.border }}>
            <Btn onClick={onClose} variant="secondary">Annuler</Btn>
            <Btn onClick={() => onValider(observations, tolerance, infirmier)} variant="success">
              ✓ Valider l'exécution
            </Btn>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

// ══════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════
export default function DashboardSoinsInfirmiers() {
  const [onglet,       setOnglet]       = useState("today")
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [soins,        setSoins]        = useState(SOINS_INIT)
  const [patients]                      = useState(PATIENTS_DB)
  const [showNouveau,  setShowNouveau]  = useState(false)
  const [showExecution,setShowExecution]= useState(null)
  const [showDetail,   setShowDetail]   = useState(null)
  const [recherche,    setRecherche]    = useState("")
  const [heure,        setHeure]        = useState(getNowTime())
  const [dateStr,      setDateStr]      = useState("")

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setHeure(n.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setDateStr(n.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // ── Filtrage ──────────────────────────────────────
  const getSoinsFiltres = () => {
    let liste = soins
    if (onglet === "today")      liste = soins.filter(s => s.dateProgrammee === today())
    else if (onglet === "programmes") liste = soins.filter(s => s.statut === "programme")
    else if (onglet === "en_cours")   liste = soins.filter(s => s.statut === "en_cours")
    else if (onglet === "faits")      liste = soins.filter(s => s.statut === "fait")
    else if (onglet === "retardes")   liste = soins.filter(s => s.statut === "retarde")

    if (recherche.trim()) {
      const q = recherche.toLowerCase()
      liste = liste.filter(s =>
        s.patient.nom.toLowerCase().includes(q) ||
        s.patient.pid.toLowerCase().includes(q) ||
        s.typeSoin.toLowerCase().includes(q)
      )
    }
    return [...liste].sort((a, b) => {
      if (a.urgent && !b.urgent) return -1
      if (!a.urgent && b.urgent) return 1
      return (a.heureProgrammee || a.heure).localeCompare(b.heureProgrammee || b.heure)
    })
  }

  const soinsFiltres = getSoinsFiltres()

  const stats = {
    programmes: soins.filter(s => s.statut === "programme").length,
    en_cours:   soins.filter(s => s.statut === "en_cours").length,
    faits:      soins.filter(s => s.statut === "fait").length,
    retardes:   soins.filter(s => s.statut === "retarde").length,
    total:      soins.filter(s => s.dateProgrammee === today()).length,
  }

  // ── Handlers ─────────────────────────────────────
  const handleCreerSoin = (form) => {
    const patient = patients.find(p => p.id === parseInt(form.patientId))
    setSoins(prev => [{
      id: Date.now(), patientId: patient.id, patient,
      date: form.dateProgrammee, heure: form.heureProgrammee,
      typeSoin: form.typeSoin, zone: form.zone,
      medicament: form.medicament, dose: form.dose,
      voie: form.voie, infirmier: "—",
      observations: form.observations, tolerance: null,
      statut: "programme",
      dateProgrammee: form.dateProgrammee,
      heureProgrammee: form.heureProgrammee,
      urgent: form.urgent
    }, ...prev])
  }
  const handleDemarrer = (soinId) => setSoins(prev => prev.map(s => s.id === soinId ? { ...s, statut: "en_cours" } : s))
  const handleRetarder = (soinId) => setSoins(prev => prev.map(s => s.id === soinId ? { ...s, statut: "retarde" } : s))
  const handleAnnuler  = (soinId) => {
    if (window.confirm("Annuler ce soin ?"))
      setSoins(prev => prev.map(s => s.id === soinId ? { ...s, statut: "annule" } : s))
  }
  const handleValiderExecution = (soinId, observations, tolerance, infirmier) => {
    setSoins(prev => prev.map(s => s.id === soinId
      ? { ...s, statut: "fait", observations, tolerance, infirmier, heure: getNowTime() }
      : s
    ))
    setShowExecution(null)
  }

  // ── Navigation ────────────────────────────────────
  const NAV = [
    { id: "today",      label: "Aujourd'hui", icon: "📅", count: stats.total    },
    { id: "programmes", label: "À faire",     icon: "⏰", count: stats.programmes, color: C.blue  },
    { id: "en_cours",   label: "En cours",    icon: "💉", count: stats.en_cours,   color: C.amber },
    { id: "faits",      label: "Réalisés",    icon: "✅", count: stats.faits,      color: C.green },
    { id: "retardes",   label: "Retardés",    icon: "⚠️", count: stats.retardes,   color: C.red   },
    { id: "historique", label: "Historique",  icon: "📊", count: soins.length     },
  ]

  const titres = {
    today: "Soins du jour", programmes: "Soins à faire",
    en_cours: "Soins en cours", faits: "Soins réalisés",
    retardes: "Soins retardés", historique: "Historique complet"
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.textPri }}>

      {/* MODALS */}
      {showNouveau   && <ModalNouveauSoin patients={patients} onClose={() => setShowNouveau(false)} onCreate={handleCreerSoin} />}
      {showExecution && <ModalExecutionSoin soin={showExecution} onClose={() => setShowExecution(null)} onValider={(obs, tol, inf) => handleValiderExecution(showExecution.id, obs, tol, inf)} />}
      {showDetail    && <ModalDetailSoin soin={showDetail} onClose={() => setShowDetail(null)} />}

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100 }} onClick={() => setSidebarOpen(false)}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 265, background: C.white, boxShadow: "4px 0 24px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", overflow: "auto" }}
            onClick={e => e.stopPropagation()}>

            {/* Logo */}
            <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 12 }}>
              <img src={logo} alt="" style={{ height: 42, borderRadius: 8, objectFit: "cover", border: "1px solid " + C.border }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.textPri }}>Clinique ABC Marouane</p>
                <p style={{ fontSize: 12, color: C.textSec }}>Soins infirmiers</p>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: "14px 12px", flex: 1 }}>
              <p style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Menu</p>
              {NAV.map(n => (
                <button key={n.id} onClick={() => { setOnglet(n.id); setSidebarOpen(false) }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 12px", borderRadius: 12, border: "none",
                    background: onglet === n.id ? C.blueSoft : "transparent",
                    color: onglet === n.id ? C.blue : C.textSec,
                    fontSize: 14, fontWeight: onglet === n.id ? 700 : 500,
                    cursor: "pointer", textAlign: "left", marginBottom: 2, fontFamily: "inherit"
                  }}
                  onMouseEnter={e => { if (onglet !== n.id) e.currentTarget.style.background = C.slateSoft }}
                  onMouseLeave={e => { if (onglet !== n.id) e.currentTarget.style.background = "transparent" }}>
                  <span style={{ fontSize: 18 }}>{n.icon}</span>
                  <span style={{ flex: 1 }}>{n.label}</span>
                  <span style={{
                    background: onglet === n.id ? C.blue : C.slateSoft,
                    color: onglet === n.id ? "#fff" : C.textMuted,
                    fontSize: 11, fontWeight: 700, borderRadius: 10,
                    padding: "2px 7px", minWidth: 22, textAlign: "center"
                  }}>{n.count}</span>
                </button>
              ))}
            </nav>

            {/* Profil */}
            <div style={{ padding: "14px 16px 20px", borderTop: "1px solid " + C.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.greenSoft, borderRadius: 12, border: "1px solid " + C.green + "33" }}>
                <Avatar name="Mme. Diallo" size={36} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>Mme. Diallo</p>
                  <p style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>Infirmière principale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{
        background: C.white, borderBottom: "1px solid " + C.border,
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        {/* Hamburger */}
        <button onClick={() => setSidebarOpen(true)}
          style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid " + C.border, background: C.white, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
          <div style={{ width: 20, height: 2, background: C.textPri, borderRadius: 2 }} />
        </button>

        {/* Titre */}
        <div style={{ flex: 1, marginLeft: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.textPri, lineHeight: 1.2 }}>
            🏥 Module Soins Infirmiers
          </p>
          <p style={{ fontSize: 12, color: C.textMuted, textTransform: "capitalize" }}>{dateStr}</p>
        </div>

        {/* Droite */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {stats.programmes > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.amberSoft, border: "1px solid " + C.amber + "40", borderRadius: 10, padding: "6px 12px" }}>
              <span style={{ fontSize: 14 }}>⏰</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>{stats.programmes} soin{stats.programmes > 1 ? "s" : ""} en attente</span>
            </div>
          )}
          <div style={{ background: C.greenSoft, border: "1px solid " + C.green + "33", borderRadius: 10, padding: "6px 14px", fontSize: 14, fontWeight: 700, color: C.green, fontVariantNumeric: "tabular-nums" }}>
            {heure}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>Mme. Diallo</p>
              <p style={{ fontSize: 11, color: C.textSec }}>Infirmière principale</p>
            </div>
            <Avatar name="Mme. Diallo" size={36} />
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main style={{ padding: "28px 28px", maxWidth: 1400, margin: "0 auto" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "À faire",          val: stats.programmes, icon: "⏰", color: C.blue,   bg: C.blueSoft   },
            { label: "En cours",          val: stats.en_cours,   icon: "💉", color: C.amber,  bg: C.amberSoft  },
            { label: "Réalisés",          val: stats.faits,      icon: "✅", color: C.green,  bg: C.greenSoft  },
            { label: "Total aujourd'hui", val: stats.total,      icon: "📊", color: C.purple, bg: C.purpleSoft },
          ].map(k => (
            <div key={k.label} style={{ background: C.white, borderRadius: 16, border: "1px solid " + C.border, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 900, color: k.color, lineHeight: 1, marginBottom: 6 }}>{k.val}</p>
                <p style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{k.label}</p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{k.icon}</div>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.white, padding: 5, borderRadius: 14, border: "1px solid " + C.border, width: "fit-content", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = onglet === n.id
            return (
              <button key={n.id} onClick={() => setOnglet(n.id)} style={{
                padding: "8px 14px", borderRadius: 10, border: "none",
                background: active ? (n.color || C.blue) : "transparent",
                color: active ? "#fff" : C.textSec,
                fontSize: 13, fontWeight: active ? 700 : 500,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontFamily: "inherit", transition: "all .15s", whiteSpace: "nowrap"
              }}>
                {n.icon} {n.label}
                <span style={{
                  background: active ? "rgba(255,255,255,0.25)" : C.slateSoft,
                  color: active ? "#fff" : C.textMuted,
                  fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20, minWidth: 22, textAlign: "center"
                }}>{n.count}</span>
              </button>
            )
          })}
        </div>

        {/* Barre actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.textPri, letterSpacing: "-0.02em" }}>{titres[onglet]}</p>
            <p style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>
              {soinsFiltres.length} résultat{soinsFiltres.length > 1 ? "s" : ""}{recherche && ` pour "${recherche}"`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input placeholder="Rechercher patient, soin..." value={recherche} onChange={e => setRecherche(e.target.value)}
                style={{ padding: "9px 12px 9px 34px", fontSize: 13, border: "1.5px solid " + C.border, borderRadius: 10, background: C.white, color: C.textPri, outline: "none", fontFamily: "inherit", width: 240 }} />
            </div>
            <Btn onClick={() => setShowNouveau(true)} variant="success">+ Nouveau soin</Btn>
          </div>
        </div>

        {/* TABLEAU */}
        <div style={{ background: C.white, borderRadius: 16, border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.slateSoft }}>
                {["Patient", "Heure", "Type de soin", "Médicament / Dose", "Zone", "Infirmier(ère)", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {soinsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "60px 40px", textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>
                      {onglet === "faits" ? "✅" : onglet === "en_cours" ? "💉" : "📋"}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Aucun soin dans cette catégorie</p>
                    <p style={{ fontSize: 13, color: C.textMuted }}>
                      {recherche ? `Aucun résultat pour "${recherche}"` : "Les soins apparaîtront ici au fur et à mesure"}
                    </p>
                  </td>
                </tr>
              ) : soinsFiltres.map((s, i, arr) => (
                <tr key={s.id}
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none", background: s.urgent ? "#fff8f8" : "transparent", transition: "background .1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = s.urgent ? C.redSoft : C.slateSoft}
                  onMouseLeave={e => e.currentTarget.style.background = s.urgent ? "#fff8f8" : "transparent"}>

                  {/* Patient */}
                  <td style={{ padding: "14px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={s.patient.nom} size={36} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: C.textPri }}>{s.patient.nom}</p>
                          {s.urgent && <span style={{ fontSize: 10, fontWeight: 800, color: C.red, background: C.redSoft, padding: "1px 6px", borderRadius: 6 }}>⚡ URGENT</span>}
                        </div>
                        <p style={{ fontSize: 11, color: C.textMuted }}>{s.patient.pid}</p>
                      </div>
                    </div>
                  </td>

                  {/* Heure */}
                  <td style={{ padding: "14px 14px" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.green, fontVariantNumeric: "tabular-nums" }}>{s.heureProgrammee || s.heure}</p>
                    {s.statut === "fait" && s.heure !== s.heureProgrammee && (
                      <p style={{ fontSize: 10, color: C.textMuted }}>Exécuté : {s.heure}</p>
                    )}
                  </td>

                  {/* Type */}
                  <td style={{ padding: "14px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, background: C.blueSoft, color: C.blue, padding: "5px 10px", borderRadius: 8, display: "inline-block" }}>{s.typeSoin}</span>
                  </td>

                  {/* Médicament */}
                  <td style={{ padding: "14px 14px" }}>
                    <p style={{ fontSize: 13, color: C.textPri, fontWeight: 500 }}>{s.medicament || "—"}</p>
                    {s.dose && s.dose !== "—" && <p style={{ fontSize: 11, color: C.textMuted }}>{s.dose}</p>}
                  </td>

                  {/* Zone */}
                  <td style={{ padding: "14px 14px", fontSize: 13, color: C.textSec }}>{s.zone || "—"}</td>

                  {/* Infirmier */}
                  <td style={{ padding: "14px 14px", fontSize: 13, color: s.infirmier === "—" ? C.textMuted : C.textSec, fontWeight: s.infirmier !== "—" ? 600 : 400 }}>{s.infirmier}</td>

                  {/* Statut */}
                  <td style={{ padding: "14px 14px" }}>
                    <Badge statut={s.statut} />
                    {s.tolerance && (
                      <p style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>
                        {s.tolerance === "bonne" ? "😊" : s.tolerance === "moyenne" ? "😐" : "😣"} Tolérance {s.tolerance}
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 14px" }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {s.statut === "programme" && (
                        <>
                          <Btn onClick={() => { handleDemarrer(s.id); setShowExecution({ ...s, statut: "en_cours" }) }} small variant="success">✏️ Exécuter</Btn>
                          <Btn onClick={() => handleRetarder(s.id)} small variant="warning">⏸ Retarder</Btn>
                        </>
                      )}
                      {s.statut === "en_cours" && (
                        <>
                          <Btn onClick={() => setShowExecution(s)} small variant="success">✓ Terminer</Btn>
                          <Btn onClick={() => handleAnnuler(s.id)} small variant="danger">✕ Annuler</Btn>
                        </>
                      )}
                      {s.statut === "retarde" && (
                        <>
                          <Btn onClick={() => handleDemarrer(s.id)} small variant="success">▶ Reprendre</Btn>
                          <Btn onClick={() => handleAnnuler(s.id)} small variant="danger">✕ Annuler</Btn>
                        </>
                      )}
                      {s.statut === "fait" && (
                        <Btn onClick={() => setShowDetail(s)} small variant="secondary">📄 Rapport</Btn>
                      )}
                      {s.statut === "annule" && (
                        <span style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>Annulé</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign: "center", fontSize: 12, color: C.textMuted, padding: "14px 0", borderTop: "1px solid " + C.border }}>
            © 2026 Clinique ABC Marouane. Tous droits réservés.
          </p>
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0 }
        input::placeholder, textarea::placeholder { color: #94a3b8 }
        select option { font-family: 'Segoe UI', system-ui, sans-serif; background: #fff; color: #0f172a }
        ::-webkit-scrollbar { width: 5px; height: 5px }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        input:focus, select:focus, textarea:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
        }
        button:focus { outline: none }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
      `}</style>
    </div>
  )
}