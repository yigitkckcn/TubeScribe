import { useState, useEffect } from 'react'
import { Save, BrainCircuit, Key, Layout, Settings } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000/api'

export default function SettingsTab() {
  const [provider, setProvider] = useState('gemini')
  const [apiKey, setApiKey] = useState('')
  const [smartMemory, setSmartMemory] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Sayfa açıldığında sunucudan settings.json verilerini çek
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await axios.get(`${API}/settings`)
        const data = res.data
        setProvider(data.ai_provider || 'gemini')
        setApiKey(data.ai_api_key || '')
        setSmartMemory(data.smart_memory !== false)
        setTheme(data.theme || 'dark')
        
        // localStorage ile de senkronize et
        localStorage.setItem('aiProvider', data.ai_provider || 'gemini')
        localStorage.setItem('aiApiKey', data.ai_api_key || '')
        localStorage.setItem('setting_smartMemory', data.smart_memory !== false)
      } catch (err) {
        // Hata durumunda yerelden oku
        setProvider(localStorage.getItem('aiProvider') || 'gemini')
        setApiKey(localStorage.getItem('aiApiKey') || '')
        setSmartMemory(localStorage.getItem('setting_smartMemory') !== 'false')
        setTheme(localStorage.getItem('theme') || 'dark')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    // Hem yerel hafızaya hem de backend settings.json'a kaydet
    localStorage.setItem('aiProvider', provider)
    localStorage.setItem('aiApiKey', apiKey)
    localStorage.setItem('setting_smartMemory', smartMemory)

    try {
      await axios.post(`${API}/settings`, {
        ai_provider: provider,
        ai_api_key: apiKey,
        smart_memory: smartMemory,
        theme: theme,
      })
    } catch (err) {
      console.error('Ayarlar sunucuya kaydedilemedi:', err)
    }

    let needsReload = false
    if (theme !== localStorage.getItem('theme')) {
      localStorage.setItem('theme', theme)
      needsReload = true
    }

    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      if (needsReload) window.location.reload()
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 gap-6">
      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-lg mb-2">
        <Settings className="w-5 h-5" />
        Uygulama Ayarları
      </div>

      {/* Yapay Zeka Ayarları */}
      <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <BrainCircuit className="w-4 h-4" />
          Yapay Zeka (AI) Entegrasyonu
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Yapay Zeka Sağlayıcısı</label>
          <select 
            value={provider} 
            onChange={e => setProvider(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
          >
            <option value="gemini">Google Gemini (Ücretsiz API Alınabilir)</option>
            <option value="openai">OpenAI (ChatGPT)</option>
          </select>
          <p className="text-xs text-zinc-500 mt-1">Videoları otomatik özetlemek için kendi API anahtarınızı girmelisiniz.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Key className="w-4 h-4" /> API Anahtarı
          </label>
          <input 
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={`${provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}`}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Özellikler ve Arayüz */}
      <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <Layout className="w-4 h-4" />
          Özellik ve Arayüz Seçenekleri
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={smartMemory}
              onChange={e => setSmartMemory(e.target.checked)}
              className="sr-only"
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${smartMemory ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${smartMemory ? 'translate-x-4' : ''}`}></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">Akıllı Hafıza</span>
            <span className="text-xs text-zinc-500">Kaldığın yerden devam etme özelliğini aktif eder.</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={theme === 'dark'}
              onChange={e => setTheme(e.target.checked ? 'dark' : 'light')}
              className="sr-only"
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`}></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">Karanlık Tema</span>
            <span className="text-xs text-zinc-500">Genel renk temasını belirler. (Kaydedince sayfa yenilenir)</span>
          </div>
        </label>
      </div>

      <button 
        onClick={handleSave}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm"
      >
        {isSaved ? <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Kaydedildi</span> : <><Save className="w-5 h-5" /> Ayarları Kaydet</>}
      </button>
    </div>
  )
}

function CheckCircle({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
