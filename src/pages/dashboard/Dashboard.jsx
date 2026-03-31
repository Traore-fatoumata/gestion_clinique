import DashboardLayout from "../../layouts/DashboardLayout"
import { MdPeople, MdLocalHospital, MdScience, MdAttachMoney, MdTrendingUp, MdWarning, MdCheckCircle, MdAccessTime } from "react-icons/md"
import { FaUserMd } from "react-icons/fa"

const stats = [
  { icon: <MdPeople size={22}/>, label: "Patients aujourd'hui", valeur: "47", tendance: "+5 ce matin", couleur: "bg-blue-50 text-blue-600" },
  { icon: <FaUserMd size={20}/>, label: "Consultations", valeur: "32", tendance: "+3 en cours", couleur: "bg-green-50 text-green-600" },
  { icon: <MdScience size={22}/>, label: "Examens labo", valeur: "18", tendance: "8 en attente", couleur: "bg-purple-50 text-purple-600" },
  { icon: <MdAttachMoney size={22}/>, label: "Recettes du jour", valeur: "850 000 GNF", tendance: "+12% vs hier", couleur: "bg-orange-50 text-orange-600" },
]

const patientsRecents = [
  { id: "CM-00247", nom: "Mariama Diallo",    service: "Gynécologie",    heure: "08:32", statut: "En cours"   },
  { id: "CM-00246", nom: "Ibrahima Bah",      service: "Cardiologie",    heure: "08:18", statut: "En attente" },
  { id: "CM-00245", nom: "Aïssatou Sow",      service: "Pédiatrie",      heure: "07:55", statut: "Terminé"    },
  { id: "CM-00244", nom: "Mamadou Camara",    service: "Neurologie",     heure: "07:40", statut: "En attente" },
  { id: "CM-00243", nom: "Kadiatou Traoré",   service: "Méd. Générale",  heure: "07:20", statut: "Terminé"    },
]

const alertes = [
  { type: "danger",  icon: <MdWarning size={16}/>,      titre: "Stock pharmacie bas",       msg: "3 médicaments en rupture imminente." },
  { type: "warning", icon: <MdAccessTime size={16}/>,   titre: "5 patients en attente",     msg: "File d'attente importante en pédiatrie." },
  { type: "success", icon: <MdCheckCircle size={16}/>,  titre: "Système opérationnel",      msg: "Dernière sauvegarde : aujourd'hui 06h00." },
]

const statutStyle = {
  "En cours":   "bg-blue-50 text-blue-600",
  "En attente": "bg-orange-50 text-orange-600",
  "Terminé":    "bg-green-50 text-green-600",
}

const alerteStyle = {
  danger:  "bg-red-50 border-red-200 text-red-700",
  warning: "bg-orange-50 border-orange-200 text-orange-700",
  success: "bg-green-50 border-green-200 text-green-700",
}

export default function Dashboard() {
  return (
    <DashboardLayout titre="Tableau de bord">

      {/* Barre de bienvenue */}
      <div className="bg-[#0B1F3A] rounded-2xl px-6 py-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-sm mb-1">Bonjour 👋</p>
          <h2 className="text-white text-xl font-bold">Dr Doumbouya — Administrateur</h2>
          <p className="text-white/40 text-xs mt-1">Lundi 02 Mars 2026 · Vue complète de la clinique</p>
        </div>
        <div className="hidden md:flex gap-3">
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
            <div className="text-white font-bold text-xl">47</div>
            <div className="text-white/40 text-xs">Patients</div>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
            <div className="text-white font-bold text-xl">12</div>
            <div className="text-white/40 text-xs">En cours</div>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
            <div className="text-white font-bold text-xl">5</div>
            <div className="text-white/40 text-xs">Urgences</div>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.couleur}`}>
                {s.icon}
              </div>
              <MdTrendingUp size={16} className="text-green-400" />
            </div>
            <div className="text-2xl font-bold text-[#0B1F3A] mb-1">{s.valeur}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-xs text-green-500 mt-1">{s.tendance}</div>
          </div>
        ))}
      </div>

      {/* Tableau + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Tableau patients récents */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B1F3A] text-sm">Derniers patients enregistrés</h3>
            <button className="text-xs text-[#2D7A2D] font-semibold hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 px-2">Patient</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 px-2">Service</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 px-2">Heure</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 px-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {patientsRecents.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <MdPeople size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#0B1F3A]">{p.nom}</div>
                          <div className="text-xs text-gray-400">{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{p.service}</span>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-500">{p.heure}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${statutStyle[p.statut]}`}>
                        {p.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-[#0B1F3A] text-sm mb-4">Alertes & Notifications</h3>
          <div className="flex flex-col gap-3">
            {alertes.map((a, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-xl border ${alerteStyle[a.type]}`}>
                <div className="mt-0.5 flex-shrink-0">{a.icon}</div>
                <div>
                  <div className="text-xs font-bold mb-0.5">{a.titre}</div>
                  <div className="text-xs opacity-80">{a.msg}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Services actifs */}
          <h3 className="font-bold text-[#0B1F3A] text-sm mt-6 mb-3">Services actifs</h3>
          {[
            { nom: "Pédiatrie",     val: 85 },
            { nom: "Gynécologie",   val: 72 },
            { nom: "Méd. Générale", val: 68 },
            { nom: "Laboratoire",   val: 90 },
          ].map((s, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">{s.nom}</span>
                <span className="text-gray-400">{s.val}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2D7A2D] rounded-full transition-all"
                  style={{ width: `${s.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

    </DashboardLayout>
  )
}