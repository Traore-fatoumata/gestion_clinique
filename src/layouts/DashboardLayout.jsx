import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "../assets/images/logo.jpeg"
import {
  MdDashboard,
  MdPeople,
  MdLocalHospital,
  MdScience,
  MdLocalPharmacy,
  MdAttachMoney,
  MdBarChart,
  MdSettings,
  MdNotifications,
  MdLogout,
  MdPerson,
} from "react-icons/md"
import { GiMicroscope } from "react-icons/gi"
import { FaUserMd, FaUserNurse } from "react-icons/fa"
import { RiVirusFill } from "react-icons/ri"
import { BsFillCpuFill } from "react-icons/bs"

const menuItems = [
  {
    section: "Principal",
    items: [
      { icon: <MdDashboard size={18}/>, label: "Tableau de bord", path: "/dashboard" },
    ]
  },
  {
    section: "Médical",
    items: [
      { icon: <MdPeople size={18}/>,       label: "Patients",        path: "/patients" },
      { icon: <FaUserMd size={16}/>,       label: "Consultations",   path: "/consultations" },
      { icon: <RiVirusFill size={18}/>,    label: "Maladies",        path: "/maladies" },
      { icon: <BsFillCpuFill size={16}/>,  label: "Aide diagnostic", path: "/diagnostic" },
    ]
  },
  {
    section: "Services",
    items: [
      { icon: <GiMicroscope size={18}/>,    label: "Laboratoire",      path: "/laboratoire" },
      { icon: <MdLocalPharmacy size={18}/>, label: "Pharmacie",        path: "/pharmacie" },
      { icon: <FaUserNurse size={16}/>,     label: "Soins infirmiers", path: "/soins" },
    ]
  },
  {
    section: "Administration",
    items: [
      { icon: <MdAttachMoney size={18}/>, label: "Comptabilité", path: "/comptabilite" },
      { icon: <MdPerson size={18}/>,      label: "Personnel",    path: "/personnel" },
      { icon: <MdBarChart size={18}/>,    label: "Statistiques", path: "/statistiques" },
      { icon: <MdSettings size={18}/>,    label: "Paramètres",   path: "/parametres" },
    ]
  },
]

export default function DashboardLayout({ children, titre }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">

      {/* Sidebar */}
      <aside className="w-60 bg-[#0B1F3A] fixed top-0 left-0 bottom-0 flex flex-col z-50">

        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-36" />
        </div>

        {/* Utilisateur connecté */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2D7A2D] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            AD
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-sm font-semibold truncate">Dr Doumbouya</div>
            <div className="text-[#4CAF50] text-xs">Administrateur</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {menuItems.map((groupe) => (
            <div key={groupe.section} className="mb-4">
              <div className="text-xs font-semibold text-white/25 uppercase tracking-widest px-2 mb-2">
                {groupe.section}
              </div>
              {groupe.items.map((item) => {
                const actif = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition text-sm font-medium
                      ${actif
                        ? "bg-[#2D7A2D]/20 text-[#4CAF50] border border-[#2D7A2D]/30"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <span className={actif ? "text-[#4CAF50]" : "text-white/40"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-3 border-t border-white/10">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-white/40 hover:bg-red-500/10 hover:text-red-400 transition text-sm font-medium"
          >
            <MdLogout size={18} />
            <span>Déconnexion</span>
          </button>
        </div>

      </aside>

      {/* Contenu principal */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="text-base font-bold text-[#0B1F3A]">
            {titre || "Tableau de bord"}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <MdLocalHospital size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-transparent outline-none text-sm text-gray-600 w-40 placeholder-gray-400"
              />
            </div>
            <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#2D7A2D] transition relative">
              <MdNotifications size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#2D7A2D] flex items-center justify-center text-white font-bold text-sm cursor-pointer">
              AD
            </div>
          </div>
        </header>

        {/* Contenu page */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  )
}