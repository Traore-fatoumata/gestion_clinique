import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/images/logo.jpeg"

// ── Remplace cette ligne par ton import photo d'équipe quand tu l'auras ──
// import photoEquipe from "../../assets/images/equipe.jpeg"
// Pour l'instant on affiche un placeholder visuel

const UTILISATEURS = [
  { email: "secretaire@clinique.com",    motDePasse: "1234", route: "/secretaire"              },
  { email: "medecin@clinique.com",       motDePasse: "1234", route: "/medecin"                  },
  { email: "chef@clinique.com",          motDePasse: "1234", route: "/dashboard-medecin-chef"   },
]

export default function Login() {
  const [email, setEmail]           = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]         = useState("")
  const [voir, setVoir]             = useState(false)
  const navigate                    = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setErreur("")
    if (!email || !motDePasse) {
      setErreur("Veuillez remplir tous les champs.")
      return
    }
    const user = UTILISATEURS.find(u => u.email === email && u.motDePasse === motDePasse)
    if (!user) {
      setErreur("Email ou mot de passe incorrect.")
      return
    }
    setChargement(true)
    setTimeout(() => { setChargement(false); navigate(user.route) }, 1500)
  }

  const focusInput = e => {
    e.target.style.borderColor = "#2d7a3f"
    e.target.style.boxShadow   = "0 0 0 3px rgba(45,122,63,0.12)"
    e.target.style.background  = "#fff"
  }
  const blurInput = e => {
    e.target.style.borderColor = "#e2e8e2"
    e.target.style.boxShadow   = "none"
    e.target.style.background  = "#f8faf8"
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      background: "#f0f7f2",
    }}>

      {/* ══════════════════════════════
          PANNEAU GAUCHE — Photo équipe
      ══════════════════════════════ */}
      <div className="hidden lg:flex" style={{
        width: "52%",
        position: "relative",
        overflow: "hidden",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}>



        {/* ── ZONE PHOTO — remplace le placeholder par ton image ── */}
        {/* Quand tu as la photo : remplace tout ce bloc par :
            <img src={photoEquipe} alt="Équipe Clinique Marouane"
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
        */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, #1a3a22 0%, #2d6a3f 40%, #3d8a52 100%)",
        }}>
          {/* Motif décoratif en attendant la photo */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.08 }} viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
            <circle cx="150" cy="200" r="180" fill="#ffffff"/>
            <circle cx="500" cy="150" r="120" fill="#ffffff"/>
            <circle cx="80"  cy="600" r="200" fill="#ffffff"/>
            <circle cx="520" cy="700" r="160" fill="#ffffff"/>
            <circle cx="300" cy="450" r="100" fill="#ffffff"/>
          </svg>
          {/* Icône placeholder équipe */}
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" }}>
            <div style={{ width:"120px", height:"120px", borderRadius:"50%", background:"rgba(255,255,255,0.12)", border:"2px dashed rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", textAlign:"center", maxWidth:"200px", lineHeight:1.6 }}>
              Remplacez ce bloc par la photo de votre équipe
            </p>
          </div>
        </div>

        {/* Overlay dégradé bas pour le texte */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(10,25,14,0.88) 0%, rgba(10,25,14,0.4) 45%, transparent 100%)",
          zIndex: 2,
        }}/>

        {/* Texte sur la photo */}
        <div style={{ position:"relative", zIndex:3, padding:"48px 52px 52px 60px" }}>

          {/* Logo + nom */}
          <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"28px" }}>
           
            <div>
              <p style={{ color:"white", fontSize:"35px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:"2px" }}>Clinique Médicale Marouane</p>
              
            </div>
          </div>

          <div style={{ width:"40px", height:"2px", background:"linear-gradient(90deg, #CE1126, #FCD116, #009460)", borderRadius:"2px", marginBottom:"20px" }}/>

          <h2 style={{ color:"#ffffff", fontSize:"28px", fontWeight:800, lineHeight:1.25, marginBottom:"12px", maxWidth:"340px" }}>
            Des soins de qualité,<br/>
            <span style={{ color:"rgba(255,255,255,0.55)", fontWeight:400, fontStyle:"italic" }}>une gestion simplifiée.</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"14px", lineHeight:1.7, maxWidth:"320px" }}>
            Plateforme sécurisée pour la gestion des patients, rendez-vous et dossiers médicaux.
          </p>

          {/* Stats */}
          <div style={{ display:"flex", gap:"12px", marginTop:"32px" }}>
            {[
              { n:"15", label:"Services" },
              { n:"8",  label:"Rôles" },
              { n:"24h",label:"Urgences" },
            ].map(({ n, label }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "14px",
                padding: "12px 18px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}>
                <p style={{ color:"#ffffff", fontSize:"20px", fontWeight:800, lineHeight:1, letterSpacing:"-0.5px" }}>{n}</p>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"11px", marginTop:"3px" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Infos */}
          <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginTop:"24px" }}>
            {[
              { text:"Conakry, République de Guinée" },
              { text:"clinique.abc.marouane@gmail.com" },
              { text:"Urgences disponibles 24h/24", accent:true },
            ].map(({ text, accent }) => (
              <div key={text} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", flexShrink:0, background: accent ? "#FCD116" : "rgba(255,255,255,0.35)" }}/>
                <span style={{ fontSize:"12px", color: accent ? "#FCD116" : "rgba(255,255,255,0.5)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          PANNEAU DROIT — Formulaire
      ══════════════════════════════ */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        background: "#ffffff",
        position: "relative",
      }}>



        <div style={{ width:"100%", maxWidth:"380px" }}>

          {/* ── Logo rond centré — inspiré de l'image ── */}
          <div style={{ textAlign:"center", marginBottom:"28px" }}>
            <div style={{
              width: "96px", height: "96px",
              borderRadius: "50%",
              background: "#2d7a3f",
              margin: "0 auto 20px",
              padding: "6px",
              boxShadow: "0 8px 32px rgba(45,122,63,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img
                src={logo}
                alt="Logo Clinique Marouane"
                style={{ width:"84px", height:"84px", borderRadius:"50%", objectFit:"contain", background:"#fff", display:"block" }}
              />
            </div>

            <h1 style={{ color:"#0f1f0f", fontSize:"28px", fontWeight:800, letterSpacing:"-0.5px", marginBottom:"6px" }}>
              Clinique Marouane
            </h1>
            <p style={{ color:"#8aaa90", fontSize:"14px", fontWeight:400 }}>
              Système de Gestion Intégré
            </p>
          </div>

          {/* Séparateur */}
          <div style={{ height:"1px", background:"#edf4ee", marginBottom:"32px" }}/>

          {/* Erreur */}
          {erreur && (
            <div style={{
              display:"flex", alignItems:"center", gap:"10px",
              background:"#fff5f5", border:"1.5px solid #fca5a5",
              borderRadius:"12px", padding:"12px 16px",
              marginBottom:"20px", color:"#cc2222", fontSize:"13px", fontWeight:500,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {erreur}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>

            {/* Email */}
            <div>
              <label style={{ display:"block", fontSize:"13px", fontWeight:700, color:"#2d4a2d", marginBottom:"8px" }}>
                Identifiant / Email
              </label>
              <div style={{ position:"relative" }}>
                <svg style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                  width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#aac0aa" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Votre email de connexion"
                  style={{
                    width:"100%", padding:"14px 14px 14px 46px", fontSize:"14px",
                    border:"1.5px solid #e2e8e2", borderRadius:"12px",
                    background:"#f8faf8", color:"#0f1f0f",
                    outline:"none", fontFamily:"inherit",
                    transition:"border-color 0.2s, box-shadow 0.2s, background 0.2s",
                  }}
                  onFocus={focusInput} onBlur={blurInput}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display:"block", fontSize:"13px", fontWeight:700, color:"#2d4a2d", marginBottom:"8px" }}>
                Mot de passe
              </label>
              <div style={{ position:"relative" }}>
                <svg style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                  width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#aac0aa" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={voir ? "text" : "password"} value={motDePasse}
                  onChange={e => setMotDePasse(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width:"100%", padding:"14px 48px 14px 46px", fontSize:"14px",
                    border:"1.5px solid #e2e8e2", borderRadius:"12px",
                    background:"#f8faf8", color:"#0f1f0f",
                    outline:"none", fontFamily:"inherit",
                    transition:"border-color 0.2s, box-shadow 0.2s, background 0.2s",
                  }}
                  onFocus={focusInput} onBlur={blurInput}
                />
                <button type="button" onClick={() => setVoir(!voir)} style={{
                  position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", color:"#aac0aa", display:"flex", padding:"4px",
                }}>
                  {voir
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div style={{ textAlign:"right", marginTop:"-6px" }}>
              <button type="button" style={{ background:"none", border:"none", fontSize:"13px", color:"#2d7a3f", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton Se connecter */}
            <button
              type="submit" disabled={chargement}
              style={{
                width:"100%", padding:"15px",
                background: chargement ? "#3d8a50" : "#2d7a3f",
                color:"#fff", fontSize:"15px", fontWeight:700,
                border:"none", borderRadius:"12px",
                cursor: chargement ? "not-allowed" : "pointer",
                fontFamily:"inherit",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                boxShadow:"0 4px 20px rgba(45,122,63,0.32)",
                transition:"all 0.2s",
                letterSpacing:"0.02em",
              }}
              onMouseEnter={e => { if (!chargement) { e.currentTarget.style.background="#236030"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(45,122,63,0.4)" }}}
              onMouseLeave={e => { if (!chargement) { e.currentTarget.style.background="#2d7a3f"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(45,122,63,0.32)" }}}
              onMouseDown={e  => { if (!chargement) e.currentTarget.style.transform="scale(0.985)" }}
              onMouseUp={e    => { if (!chargement) e.currentTarget.style.transform="translateY(-1px)" }}
            >
              {chargement ? (
                <>
                  <div style={{ width:"17px", height:"17px", border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                  </svg>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Sécurité */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", marginTop:"28px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b0c8b0" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize:"12px", color:"#b0c8b0" }}>Connexion sécurisée — HTTPS chiffré</span>
          </div>

          <p style={{ textAlign:"center", fontSize:"11px", color:"#c0d4c0", marginTop:"12px" }}>
            © 2025 Clinique Médicale Marouane · Conakry, Guinée
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #c0d4c0; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}