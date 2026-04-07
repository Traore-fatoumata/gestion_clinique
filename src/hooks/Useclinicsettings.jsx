import { useState, useEffect, createContext, useContext, useRef } from 'react'

const ClinicSettingsContext = createContext()

const DEFAULT_SETTINGS = {
  backgroundColor: '#f8f9fa',
  backgroundImage: '',
  backgroundType: 'color',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  fontSize: 14,
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  theme: 'light',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#16a34a',
  sidebarCollapsed: false,
  compactMode: false,
  showAnimations: true,
  borderRadius: 12,
  soundEnabled: true,
  notificationPosition: 'top-right',
  language: 'fr',
}

const PRESET_THEMES = {
  light:    { backgroundColor: '#f8f9fa', primaryColor: '#2563eb', secondaryColor: '#64748b', accentColor: '#16a34a' },
  dark:     { backgroundColor: '#1e293b', primaryColor: '#60a5fa', secondaryColor: '#94a3b8', accentColor: '#4ade80' },
  nature:   { backgroundColor: '#f0fdf4', primaryColor: '#16a34a', secondaryColor: '#4ade80', accentColor: '#059669' },
  ocean:    { backgroundColor: '#f0f9ff', primaryColor: '#0284c7', secondaryColor: '#7dd3fc', accentColor: '#0ea5e9' },
  sunset:   { backgroundColor: '#fff7ed', primaryColor: '#ea580c', secondaryColor: '#fb923c', accentColor: '#f97316' },
  lavender: { backgroundColor: '#f5f3ff', primaryColor: '#7c3aed', secondaryColor: '#a78bfa', accentColor: '#8b5cf6' },
}

const BACKGROUND_IMAGES = [
  { id: 'none',      name: 'Aucun',          url: '' },
  { id: 'gradient1', name: 'Dégradé bleu',   url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient2', name: 'Dégradé chaud',  url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient3', name: 'Dégradé nature', url: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' },
  { id: 'gradient4', name: 'Dégradé océan',  url: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
]

const FONT_SIZES = [
  { value: 12, label: 'Très petit' },
  { value: 13, label: 'Petit'      },
  { value: 14, label: 'Normal'     },
  { value: 15, label: 'Grand'      },
  { value: 16, label: 'Très grand' },
]

// ── Named export du hook ───────────────────────────────
export function useClinicSettings() {
  const context = useContext(ClinicSettingsContext)
  if (!context) {
    throw new Error('useClinicSettings must be used within a ClinicSettingsProvider')
  }
  return context
}

// ── Named export du Provider ───────────────────────────
export function ClinicSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('clinique_settings')
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    } catch (e) {
      console.error('Erreur chargement paramètres:', e)
    }
    return DEFAULT_SETTINGS
  })

  const isInitialized = useRef(false)

  const applySettingsToDOM = (s) => {
    const root = document.documentElement
    root.style.setProperty('--base-font-size',   `${s.fontSize}px`)
    root.style.setProperty('--font-family',       s.fontFamily)
    root.style.setProperty('--primary-color',     s.primaryColor)
    root.style.setProperty('--secondary-color',   s.secondaryColor)
    root.style.setProperty('--accent-color',      s.accentColor)
    root.style.setProperty('--background-color',  s.backgroundColor)

    if (s.backgroundType === 'gradient') {
      root.style.setProperty('--background-image',
        `linear-gradient(135deg, ${s.gradientStart} 0%, ${s.gradientEnd} 100%)`)
    } else if (s.backgroundType === 'image' && s.backgroundImage) {
      root.style.setProperty('--background-image', `url(${s.backgroundImage})`)
    } else {
      root.style.setProperty('--background-image', 'none')
    }

    s.theme === 'dark'
      ? root.setAttribute('data-theme', 'dark')
      : root.removeAttribute('data-theme')

    s.compactMode
      ? root.setAttribute('data-compact', 'true')
      : root.removeAttribute('data-compact')
  }

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      applySettingsToDOM(settings)
      return
    }
    localStorage.setItem('clinique_settings', JSON.stringify(settings))
    applySettingsToDOM(settings)
  }, [settings])

  const updateSetting    = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const applyPresetTheme = (name) => {
    const theme = PRESET_THEMES[name]
    if (theme) setSettings(prev => ({ ...prev, ...theme, theme: name }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('clinique_settings')
  }

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'clinique-abc-marouane-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      setSettings(prev => ({ ...prev, ...parsed }))
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  return (
    <ClinicSettingsContext.Provider value={{
      settings, updateSetting, applyPresetTheme,
      resetSettings, exportSettings, importSettings,
      PRESET_THEMES, BACKGROUND_IMAGES, FONT_SIZES,
    }}>
      {children}
    </ClinicSettingsContext.Provider>
  )
}

// ── PAS de export default — uniquement named exports ──