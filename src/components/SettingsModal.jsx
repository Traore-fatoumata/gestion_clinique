import { useState } from 'react'
import { useClinicSettings } from '../hooks/useClinicSettings.jsx'

export default function SettingsModal({ onClose }) {
  const {
    settings, updateSetting, applyPresetTheme,
    resetSettings, exportSettings, importSettings,
    PRESET_THEMES, BACKGROUND_IMAGES, FONT_SIZES,
  } = useClinicSettings()

  const [activeTab,   setActiveTab]   = useState('appearance')
  const [importError, setImportError] = useState('')

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const result = importSettings(text)
    setImportError(result.success ? '' : result.error)
  }

  // ── Styles réutilisables ───────────────────────────
  const iSt = {
    width: '100%', padding: '10px 14px', fontSize: 13,
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    background: '#ffffff', color: '#0f172a',
    outline: 'none', fontFamily: 'inherit',
  }
  const toggle = (key) => (
    <button onClick={() => updateSetting(key, !settings[key])}
      style={{
        width: 48, height: 26, borderRadius: 13, border: 'none', flexShrink: 0,
        background: settings[key] ? '#2563eb' : '#cbd5e1',
        cursor: 'pointer', position: 'relative', transition: 'background .2s',
      }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2,
        left: settings[key] ? 24 : 2,
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )

  return (
    // ── Overlay — portal-like, couvre tout l'écran ──
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.55)',
      zIndex: 9999,                         // très haut pour passer au-dessus de tout
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      backdropFilter: 'blur(3px)',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Boîte modale — largeur fixe, centrée */}
      <div style={{
        background: '#ffffff', borderRadius: 20,
        width: '100%', maxWidth: 660,
        maxHeight: '88vh', overflow: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        // isolation empêche que le parent affecte le positionnement
        isolation: 'isolate',
      }}>

        {/* ── En-tête ── */}
        <div style={{
          padding: '22px 28px 18px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
          borderRadius: '20px 20px 0 0',
        }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>⚙️ Paramètres de la clinique</p>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>Personnalisation de l'apparence et de l'interface</p>
          </div>
          <button onClick={onClose} style={{
            background: '#e2e8f0', border: 'none', borderRadius: 8,
            color: '#64748b', cursor: 'pointer',
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>×</button>
        </div>

        {/* ── Onglets ── */}
        <div style={{
          padding: '0 28px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', gap: 4,
          position: 'sticky', top: 62, background: '#fff', zIndex: 1,
        }}>
          {[
            { id: 'appearance', label: 'Apparence', icon: '🎨' },
            { id: 'display',    label: 'Affichage',  icon: '📱' },
            { id: 'advanced',   label: 'Avancé',     icon: '🔧' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Contenu ── */}
        <div style={{ padding: '24px 28px' }}>

          {/* ═══ APPARENCE ═══ */}
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Thèmes */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Thèmes prédéfinis</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {Object.entries(PRESET_THEMES).map(([name, theme]) => (
                    <div key={name} onClick={() => applyPresetTheme(name)} style={{
                      padding: '14px', borderRadius: 12,
                      border: `2px solid ${settings.theme === name ? '#2563eb' : '#e2e8f0'}`,
                      background: theme.backgroundColor, cursor: 'pointer',
                      textAlign: 'center', transition: 'all .15s',
                    }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.primaryColor, margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{name}</p>
                      {settings.theme === name && (
                        <p style={{ fontSize: 10, color: '#2563eb', marginTop: 4 }}>✓ Actif</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fond d'écran */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>Fond d'écran</p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  {[
                    { val: 'color',    label: 'Couleur unie' },
                    { val: 'gradient', label: 'Dégradé'      },
                  ].map(opt => (
                    <button key={opt.val} onClick={() => updateSetting('backgroundType', opt.val)} style={{
                      flex: 1, padding: '10px 14px', borderRadius: 10,
                      border: `2px solid ${settings.backgroundType === opt.val ? '#2563eb' : '#e2e8f0'}`,
                      background: settings.backgroundType === opt.val ? '#dbeafe' : '#fff',
                      cursor: 'pointer', fontSize: 13,
                      fontWeight: settings.backgroundType === opt.val ? 700 : 500,
                      color: settings.backgroundType === opt.val ? '#2563eb' : '#64748b',
                      fontFamily: 'inherit',
                    }}>{opt.label}</button>
                  ))}
                </div>

                {settings.backgroundType === 'color' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="color" value={settings.backgroundColor}
                      onChange={e => updateSetting('backgroundColor', e.target.value)}
                      style={{ width: 48, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                    <input type="text" value={settings.backgroundColor}
                      onChange={e => updateSetting('backgroundColor', e.target.value)}
                      style={{ ...iSt, flex: 1, fontFamily: 'monospace' }} />
                  </div>
                )}

                {settings.backgroundType === 'gradient' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Couleur 1</p>
                      <input type="color" value={settings.gradientStart}
                        onChange={e => updateSetting('gradientStart', e.target.value)}
                        style={{ width: '100%', height: 44, border: 'none', borderRadius: 10, cursor: 'pointer' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Couleur 2</p>
                      <input type="color" value={settings.gradientEnd}
                        onChange={e => updateSetting('gradientEnd', e.target.value)}
                        style={{ width: '100%', height: 44, border: 'none', borderRadius: 10, cursor: 'pointer' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Dégradés prédéfinis */}
              {settings.backgroundType === 'gradient' && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>Dégradés prédéfinis</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {BACKGROUND_IMAGES.filter(bg => bg.id !== 'none').map(bg => (
                      <div key={bg.id} title={bg.name}
                        onClick={() => {
                          const colors = {
                            gradient1: ['#667eea','#764ba2'],
                            gradient2: ['#f093fb','#f5576c'],
                            gradient3: ['#5ee7df','#b490ca'],
                            gradient4: ['#a8edea','#fed6e3'],
                          }
                          const [start, end] = colors[bg.id] || ['#667eea','#764ba2']
                          updateSetting('gradientStart', start)
                          updateSetting('gradientEnd',   end)
                        }}
                        style={{
                          height: 52, borderRadius: 10, background: bg.url,
                          cursor: 'pointer', border: '2px solid #e2e8f0', transition: 'all .15s',
                        }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Aperçu en direct */}
              <div style={{
                padding: '14px 16px', borderRadius: 12,
                background: settings.backgroundType === 'gradient'
                  ? `linear-gradient(135deg, ${settings.gradientStart} 0%, ${settings.gradientEnd} 100%)`
                  : settings.backgroundColor,
                border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>👁️</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Aperçu du fond d'écran</p>
              </div>
            </div>
          )}

          {/* ═══ AFFICHAGE ═══ */}
          {activeTab === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Taille de police globale</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                  {FONT_SIZES.map(size => (
                    <button key={size.value} onClick={() => updateSetting('fontSize', size.value)} style={{
                      padding: '10px 8px', borderRadius: 10,
                      border: `2px solid ${settings.fontSize === size.value ? '#2563eb' : '#e2e8f0'}`,
                      background: settings.fontSize === size.value ? '#dbeafe' : '#fff',
                      cursor: 'pointer', fontSize: size.value,
                      fontWeight: settings.fontSize === size.value ? 700 : 500,
                      color: settings.fontSize === size.value ? '#2563eb' : '#64748b',
                      fontFamily: 'inherit', textAlign: 'center',
                    }}>{size.label}</button>
                  ))}
                </div>
              </div>

              {[
                { key: 'compactMode',    label: 'Mode compact',  desc: 'Réduit les espacements pour afficher plus de contenu' },
                { key: 'showAnimations', label: 'Animations',    desc: 'Activer les transitions et effets visuels'            },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', background: '#f8f9fa', borderRadius: 12, border: '1px solid #e2e8f0',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{label}</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{desc}</p>
                  </div>
                  {toggle(key)}
                </div>
              ))}
            </div>
          )}

          {/* ═══ AVANCÉ ═══ */}
          {activeTab === 'advanced' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>Sauvegarde et restauration</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={exportSettings} style={{
                    flex: 1, padding: '12px 16px', borderRadius: 10,
                    border: '2px solid #2563eb', background: '#dbeafe',
                    color: '#2563eb', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>📥 Exporter les paramètres</button>

                  <label style={{
                    flex: 1, padding: '12px 16px', borderRadius: 10,
                    border: '2px solid #64748b', background: '#f1f5f9',
                    color: '#475569', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    📤 Importer
                    <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                  </label>
                </div>
                {importError && (
                  <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>⚠️ Erreur : {importError}</p>
                )}
              </div>

              {/* Réinitialiser */}
              <div style={{ padding: 16, background: '#fee2e2', borderRadius: 12, border: '1px solid #fca5a5' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', marginBottom: 6 }}>⚠️ Zone de danger</p>
                <p style={{ fontSize: 12, color: '#991b1b', marginBottom: 12 }}>
                  Réinitialiser tous les paramètres aux valeurs par défaut. Cette action est irréversible.
                </p>
                <button onClick={() => { resetSettings(); alert('✅ Paramètres réinitialisés.') }} style={{
                  padding: '9px 18px', borderRadius: 10, border: 'none',
                  background: '#dc2626', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>Réinitialiser les paramètres</button>
              </div>

              {/* Infos */}
              <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 12, border: '1px solid #bae6fd' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0369a1', marginBottom: 8 }}>ℹ️ Informations</p>
                <div style={{ fontSize: 12, color: '#0c4a6e', lineHeight: 1.9 }}>
                  <p>• Les paramètres sont sauvegardés localement dans le navigateur</p>
                  <p>• Les modifications s'appliquent instantanément</p>
                  <p>• Les paramètres sont partagés entre toutes les pages</p>
                  <p>• Clinique ABC Marouane — Version 1.0.0</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Pied de page ── */}
        <div style={{
          padding: '14px 28px', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'flex-end',
          position: 'sticky', bottom: 0, background: '#fff',
          borderRadius: '0 0 20px 20px',
        }}>
          <button onClick={onClose} style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: '#2563eb', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Fermer</button>
        </div>
      </div>
    </div>
  )
}