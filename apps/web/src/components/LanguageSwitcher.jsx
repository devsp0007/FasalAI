import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage, t, LANGUAGES } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  // Group languages by region
  const regions = ['Pan-India', 'North', 'South', 'East', 'West', 'Central']

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        className="lang-switcher-btn"
        onClick={() => setOpen(!open)}
        title={t('lang_selectLanguage')}
        aria-label={t('lang_selectLanguage')}
      >
        <span className="lang-switcher-icon">🌐</span>
        <span className="lang-switcher-code">{language.toUpperCase()}</span>
      </button>

      {open && (
        <div className="lang-dropdown animate-fade-in">
          <div className="lang-dropdown-header">{t('lang_selectLanguage')}</div>
          {regions.map(region => {
            const langs = LANGUAGES.filter(l => l.region === region)
            if (langs.length === 0) return null
            return (
              <div key={region}>
                <div className="lang-region-label">{region}</div>
                {langs.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${language === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code)
                      setOpen(false)
                    }}
                  >
                    <span className="lang-option-native">{lang.nativeName}</span>
                    <span className="lang-option-name">{lang.name}</span>
                    {language === lang.code && <span className="lang-check">✓</span>}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
