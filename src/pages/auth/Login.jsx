import { useState } from "react"
import logo from "../../assets/images/logo.jpeg"

export default function Login() {
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState("")
  const [voir, setVoir] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErreur("")
    if (!email || !motDePasse) {
      setErreur("Veuillez remplir tous les champs.")
      return
    }
    setChargement(true)
    setTimeout(() => setChargement(false), 1500)
  }

  return (
    <div className="min-h-screen flex">

      {/* Panneau gauche */}
      <div className="hidden lg:flex w-1/2 bg-[#0B1F3A] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-[#2D7A2D]/10" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full bg-[#CC3300]/10" />

        <img src={logo} alt="Logo Clinique Marouane" className="w-72 mb-10 relative z-10" />

        <div className="relative z-10 text-center">
          <h2 className="text-white text-2xl font-bold mb-3">
            Bienvenue dans votre espace
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Système de gestion intégrée de la Clinique Médicale CAB Marouane.
            Connectez-vous pour accéder à votre espace de travail.
          </p>
        </div>

        {/* Infos clinique */}
        <div className="relative z-10 mt-10 flex flex-col gap-3 w-full max-w-xs">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span className="text-[#2D7A2D]">📍</span>
            <span className="text-gray-300 text-sm">Conakry, République de Guinée</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span className="text-[#2D7A2D]">✉️</span>
            <span className="text-gray-300 text-sm">clinique.abc.marouane@gmail.com</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span className="text-[#CC3300]">🚨</span>
            <span className="text-gray-300 text-sm">Urgences disponibles 24h/24</span>
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F5F7FA] p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

          {/* Logo mobile uniquement */}
          <div className="flex lg:hidden justify-center mb-6">
            <img src={logo} alt="Logo" className="w-40" />
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Connexion</h1>
            <p className="text-sm text-gray-400 mt-1">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>

          {/* Erreur */}
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              ⚠️ {erreur}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={voir ? "text" : "password"}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setVoir(!voir)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  {voir ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-[#2D7A2D] hover:bg-[#245E24] text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-2"
            >
              {chargement ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Se connecter"
              )}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-300 mt-8">
            © 2025 Clinique Médicale CAB Marouane · Conakry
          </p>

        </div>
      </div>

    </div>
  )
}