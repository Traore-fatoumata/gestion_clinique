import { useState } from "react"
import DashboardLayout from "../../layouts/DashboardLayout"
import {
  MdPersonAdd, MdSearch, MdPeople,
  MdAccessTime, MdCheckCircle, MdClose, MdArrowForward
} from "react-icons/md"

const patientsJour = [
  { id: "CM-00247", nom: "Mariama Diallo",  age: 28, sexe: "F", service: "Gynécologie",   heure: "08:32", statut: "En cours"   },
  { id: "CM-00246", nom: "Ibrahima Bah",    age: 52, sexe: "M", service: "Cardiologie",   heure: "08:18", statut: "En attente" },
  { id: "CM-00245", nom: "Aïssatou Sow",    age: 7,  sexe: "F", service: "Pédiatrie",     heure: "07:55", statut: "Terminé"    },
  { id: "CM-00244", nom: "Mamadou Camara",  age: 61, sexe: "M", service: "Neurologie",    heure: "07:40", statut: "En attente" },
  { id: "CM-00243", nom: "Kadiatou Traoré", age: 34, sexe: "F", service: "Méd. Générale", heure: "07:20", statut: "Terminé"    },
]

const services = [
  "Pédiatrie", "Médecine Générale", "Gynécologie", "Obstétrique",
  "Cardiologie", "Neurologie", "Urologie", "Rhumatologie",
  "Stomatologie", "Ophtalmologie", "ORL", "Chirurgie",
  "Laboratoire", "Pharmacie", "Soins Infirmiers"
]

const statutStyle = {
  "En cours":   "bg-blue-50 text-blue-600",
  "En attente": "bg-orange-50 text-orange-600",
  "Terminé":    "bg-green-50 text-green-600",
}

export default function Secretaire() {
  const [recherche, setRecherche] = useState("")
  const [modalOuvert, setModalOuvert] = useState(false)
  const [succes, setSucces] = useState(false)
  const [form, setForm] = useState({
    nom: "", prenom: "", date_naissance: "", sexe: "",
    telephone: "", adresse: "", service: "",
    est_enfant: false, nom_parent: "", tel_parent: "",
    personne_contact: "", tel_contact: ""
  })

  const patientsFiltres = patientsJour.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    p.id.toLowerCase().includes(recherche.toLowerCase()) ||
    p.service.toLowerCase().includes(recherche.toLowerCase())
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === "checkbox" ? checked : value })
  }

  const handleSoumettre = (e) => {
    e.preventDefault()
    setSucces(true)
    setTimeout(() => {
      setSucces(false)
      setModalOuvert(false)
      setForm({
        nom: "", prenom: "", date_naissance: "", sexe: "",
        telephone: "", adresse: "", service: "",
        est_enfant: false, nom_parent: "", tel_parent: "",
        personne_contact: "", tel_contact: ""
      })
    }, 2000)
  }

  return (
    <DashboardLayout titre="Secrétariat — Accueil patients">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <MdPeople size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0B1F3A]">47</div>
            <div className="text-xs text-gray-400">Patients aujourd'hui</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <MdAccessTime size={20} className="text-orange-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0B1F3A]">12</div>
            <div className="text-xs text-gray-400">En attente</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <MdCheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0B1F3A]">32</div>
            <div className="text-xs text-gray-400">Consultés</div>
          </div>
        </div>
      </div>

      {/* Barre recherche + bouton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-full sm:w-96 shadow-sm">
          <MdSearch size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher un patient (nom, ID, service...)"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-600 w-full placeholder-gray-400"
          />
          {recherche && (
            <MdClose
              size={16}
              className="text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={() => setRecherche("")}
            />
          )}
        </div>
        <button
          onClick={() => setModalOuvert(true)}
          className="flex items-center gap-2 bg-[#2D7A2D] hover:bg-[#245E24] text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm text-sm"
        >
          <MdPersonAdd size={18} />
          Nouveau patient
        </button>
      </div>

      {/* Tableau patients du jour */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#0B1F3A] text-sm">
            Patients du jour
            <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {patientsFiltres.length}
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-5">Patient</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">Âge</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">Service</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">Heure</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">Statut</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {patientsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                    Aucun patient trouvé
                  </td>
                </tr>
              ) : (
                patientsFiltres.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${p.sexe === "F" ? "bg-pink-400" : "bg-blue-400"}`}>
                          {p.nom.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#0B1F3A]">{p.nom}</div>
                          <div className="text-xs text-gray-400">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{p.age} ans</td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{p.service}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{p.heure}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${statutStyle[p.statut]}`}>
                        {p.statut}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="flex items-center gap-1 text-xs text-[#2D7A2D] font-semibold hover:underline">
                        Voir <MdArrowForward size={14}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nouveau patient */}
      {modalOuvert && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-[#0B1F3A] text-base">Nouveau patient</h2>
                <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations du patient</p>
              </div>
              <button
                onClick={() => setModalOuvert(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <MdClose size={18} className="text-gray-500" />
              </button>
            </div>

            {succes && (
              <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-medium">
                <MdCheckCircle size={18} />
                Patient enregistré avec succès !
              </div>
            )}

            <form onSubmit={handleSoumettre} className="px-6 py-4 space-y-5">

              {/* Infos personnelles */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom *</label>
                    <input name="nom" value={form.nom} onChange={handleChange} required
                      placeholder="Nom de famille"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Prénom *</label>
                    <input name="prenom" value={form.prenom} onChange={handleChange} required
                      placeholder="Prénom"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date de naissance</label>
                    <input type="date" name="date_naissance" value={form.date_naissance} onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sexe *</label>
                    <select name="sexe" value={form.sexe} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition bg-white"
                    >
                      <option value="">Sélectionner</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Téléphone *</label>
                    <input name="telephone" value={form.telephone} onChange={handleChange} required
                      placeholder="+224 6XX XXX XXX"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Adresse</label>
                    <input name="adresse" value={form.adresse} onChange={handleChange}
                      placeholder="Quartier, commune..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Service */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Orientation
                </h3>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Service concerné *</label>
                <select name="service" value={form.service} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition bg-white"
                >
                  <option value="">Sélectionner un service</option>
                  {services.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Enfant */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="est_enfant"
                    checked={form.est_enfant} onChange={handleChange}
                    className="w-4 h-4 accent-[#2D7A2D]"
                  />
                  <span className="text-sm font-semibold text-gray-600">Le patient est un enfant (mineur)</span>
                </label>
              </div>

              {form.est_enfant && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Informations du parent / tuteur
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom du parent *</label>
                      <input name="nom_parent" value={form.nom_parent} onChange={handleChange}
                        placeholder="Nom complet"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Téléphone parent *</label>
                      <input name="tel_parent" value={form.tel_parent} onChange={handleChange}
                        placeholder="+224 6XX XXX XXX"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact urgence */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Personne à contacter en cas d'urgence
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom complet</label>
                    <input name="personne_contact" value={form.personne_contact} onChange={handleChange}
                      placeholder="Nom complet"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Téléphone</label>
                    <input name="tel_contact" value={form.tel_contact} onChange={handleChange}
                      placeholder="+224 6XX XXX XXX"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/10 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalOuvert(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#2D7A2D] hover:bg-[#245E24] text-white rounded-xl text-sm font-semibold transition"
                >
                  Enregistrer le patient
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  )
}