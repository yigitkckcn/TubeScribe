import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import VideoArea from './components/VideoArea'

const API = 'http://localhost:8000/api'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [searchResults, setSearchResults] = useState([])
  const [currentVideoId, setCurrentVideoId] = useState(null)
  const [currentVideoTitle, setCurrentVideoTitle] = useState('')
  const [currentChannel, setCurrentChannel] = useState('')
  const [currentThumbnail, setCurrentThumbnail] = useState('')
  const [transcript, setTranscript] = useState([])
  const [availableLangs, setAvailableLangs] = useState([])
  const [selectedLang, setSelectedLang] = useState('')
  const [translateTo, setTranslateTo] = useState('')
  const [isDualMode, setIsDualMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [transcriptError, setTranscriptError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [activeTab, setActiveTab] = useState('playlist')
  const [savedVideos, setSavedVideos] = useState([])

  const playerRef = useRef(null)
  const intervalRef = useRef(null)



  // ── Sayfa ilk açıldığında Backend'den Kaydedilenleri ve Ayarları Çek ──
  useEffect(() => {
    fetchSavedVideos()
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data } = await axios.get(`${API}/settings`)
      if (data) {
        if (data.ai_provider) localStorage.setItem('aiProvider', data.ai_provider)
        if (data.ai_api_key) localStorage.setItem('aiApiKey', data.ai_api_key)
        if (typeof data.smart_memory === 'boolean') {
          localStorage.setItem('setting_smartMemory', String(data.smart_memory))
        }
      }
    } catch (err) {
      console.error('Ayarlar yüklenirken hata:', err)
    }
  }

  // ── Tema Değişimi ──
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  async function fetchSavedVideos() {
    try {
      const { data } = await axios.get(`${API}/saved`)
      setSavedVideos(data || [])
    } catch (err) {
      console.error('Kaydedilenleri çekerken hata:', err)
    }
  }

  // ── Global Klavye Kısayolları (Oynat/Duraklat, Atla) ──
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Kullanıcı bir form elemanında (arama kutusu vb.) yazı yazıyorsa kısayolları yoksay
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        document.activeElement?.isContentEditable
      ) {
        return
      }

      if (!playerRef.current) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          const state = playerRef.current.getPlayerState()
          if (state === 1) {
            // 1: Oynatılıyor
            playerRef.current.pauseVideo()
          } else {
            playerRef.current.playVideo()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          playerRef.current.seekTo(Math.max(0, playerRef.current.getCurrentTime() - 5), true)
          break
        case 'ArrowRight':
          e.preventDefault()
          playerRef.current.seekTo(playerRef.current.getCurrentTime() + 5, true)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // ── Logo tıklanınca her şeyi sıfırla ──
  function resetApp() {
    stopTimeTracking()
    playerRef.current = null
    setCurrentVideoId(null)
    setCurrentVideoTitle('')
    setCurrentChannel('')
    setCurrentThumbnail('')
    setTranscript([])
    setAvailableLangs([])
    setSelectedLang('')
    setTranslateTo('')
    setTranscriptLoading(false)
    setTranscriptError('')
    setSearchError('')
    setCurrentVideoTime(0)
    setActiveTab('playlist')
    setSearchResults([])
  }

  // ── Kaydet / Kaldır (Backend'e istek atılır) ──
  async function toggleSaveVideo() {
    if (!currentVideoId) return
    const isSaved = savedVideos.some((v) => v.id === currentVideoId)

    try {
      if (isSaved) {
        await axios.delete(`${API}/saved/${currentVideoId}`)
        setSavedVideos((prev) => prev.filter((v) => v.id !== currentVideoId))
      } else {
        const newVideo = {
          id: currentVideoId,
          title: currentVideoTitle,
          channel: currentChannel,
          thumbnail: currentThumbnail || `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`,
        }
        await axios.post(`${API}/saved`, newVideo)
        setSavedVideos((prev) => [...prev, newVideo])
      }
    } catch (err) {
      console.error('Kaydetme işlemi başarısız:', err)
      alert('Video kaydedilirken bir hata oluştu.')
    }
  }

  async function removeSavedVideo(videoId) {
    try {
      await axios.delete(`${API}/saved/${videoId}`)
      setSavedVideos((prev) => prev.filter((v) => v.id !== videoId))
    } catch (err) {
      console.error('Video silme başarısız:', err)
    }
  }

  async function handleImportSaved(importedVideos) {
    try {
      await axios.put(`${API}/saved/sync`, { videos: importedVideos })
      await fetchSavedVideos() // Güncel listeyi çek
      alert('Videolar başarıyla içe aktarıldı!')
    } catch (err) {
      console.error('İçe aktarma hatası:', err)
      alert('İçe aktarma sırasında bir hata oluştu.')
    }
  }

  const isVideoSaved = currentVideoId
    ? savedVideos.some((v) => v.id === currentVideoId)
    : false

  // ── Player hazır ──
  function handlePlayerReady(event) {
    playerRef.current = event.target
    
    // Akıllı Hafıza: Eğer bu video için önceden kaydedilmiş bir süre varsa oradan devam et
    if (currentVideoId) {
      try {
        const isSmartMemoryEnabled = localStorage.getItem('setting_smartMemory') !== 'false'
        if (isSmartMemoryEnabled) {
          const history = JSON.parse(localStorage.getItem('watchHistory') || '{}')
          const savedTime = history[currentVideoId]
          if (savedTime && savedTime > 0) {
            playerRef.current.seekTo(savedTime, true)
          }
        }
      } catch (e) {
        console.error("Akıllı hafıza okunamadı:", e)
      }
    }
  }

  // ── Zaman takibi ──
  const startTimeTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime()
        setCurrentVideoTime(currentTime)
        
        // Akıllı Hafıza: Son izlenen saniyeyi localStorage'a kaydet (sadece 2 saniyeden fazlaysa)
        if (currentVideoId && currentTime > 2) {
          try {
            const isSmartMemoryEnabled = localStorage.getItem('setting_smartMemory') !== 'false'
            if (isSmartMemoryEnabled) {
              const history = JSON.parse(localStorage.getItem('watchHistory') || '{}')
              history[currentVideoId] = currentTime
              localStorage.setItem('watchHistory', JSON.stringify(history))
            }
          } catch (e) {
            console.error("Akıllı hafıza kaydedilemedi:", e)
          }
        }
      }
    }, 1000)
  }, [currentVideoId])

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  function handleStateChange(event) {
    if (event.data === 1) {
      startTimeTracking()
    } else {
      stopTimeTracking()
    }
  }

  function handleSeek(seconds) {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true)
      playerRef.current.playVideo()
    }
  }

  // ── Arama ──
  async function handleSearch(query) {
    if (!query.trim()) return
    setIsLoading(true)
    setSearchError('')
    setSearchResults([])

    try {
      const isPlaylist = query.includes('playlist') || query.includes('list=')
      if (isPlaylist) {
        const { data } = await axios.get(`${API}/playlist`, { params: { url: query } })
        setSearchResults(data.videos || [])
      } else {
        const { data } = await axios.get(`${API}/search`, { params: { q: query } })
        setSearchResults(data.results || [])
      }
      setActiveTab('playlist')
    } catch (err) {
      console.error('Arama hatası:', err)
      setSearchError('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Video seçimi ──
  async function handleVideoSelect(videoId, title, channel, thumbnail) {
    setCurrentVideoId(videoId)
    setCurrentVideoTitle(title)
    setCurrentChannel(channel || '')
    setCurrentThumbnail(thumbnail || '')
    setTranscript([])
    setAvailableLangs([])
    setTranscriptError('')
    setSelectedLang('')
    setTranslateTo('')
    setCurrentVideoTime(0)
    setTranscriptLoading(true)
    setActiveTab('transcript')

    try {
      const { data: subsData } = await axios.get(`${API}/subtitles/${videoId}`)
      const langs = subsData.languages || []
      setAvailableLangs(langs)

      if (langs.length === 0) {
        setTranscriptError('Bu video için altyazı bulunamadı.')
        setTranscriptLoading(false)
        return
      }
      const firstLang = langs[0].language_code
      setSelectedLang(firstLang)
      await fetchTranscript(videoId, firstLang, '')
    } catch (err) {
      console.error('Altyazı hatası:', err)
      setTranscriptError('Altyazı bilgisi alınamadı.')
    } finally {
      setTranscriptLoading(false)
    }
  }

  async function fetchTranscript(videoId, lang, translateTarget, dualMode = isDualMode) {
    setTranscriptLoading(true)
    setTranscriptError('')
    try {
      if (dualMode && translateTarget) {
        // Çift dilli mod: Hem orijinali hem çeviriyi çekip birleştir
        const [origRes, transRes] = await Promise.all([
          axios.get(`${API}/transcript/${videoId}`, { params: { lang } }),
          axios.get(`${API}/transcript/${videoId}`, { params: { lang, translate_to: translateTarget } })
        ])
        
        const origList = origRes.data.transcript || []
        const transList = transRes.data.transcript || []
        
        // Zaman damgalarına göre eşleştir
        const merged = origList.map((item, i) => ({
          ...item,
          text: item.text, // Orijinal metin
          translatedText: transList[i] ? transList[i].text : '' // Çevrilmiş metin
        }))
        setTranscript(merged)
      } else {
        // Standart tekil mod
        const params = { lang }
        if (translateTarget) params.translate_to = translateTarget
        const { data } = await axios.get(`${API}/transcript/${videoId}`, { params })
        setTranscript(data.transcript || [])
      }
    } catch (err) {
      console.error('Transkript hatası:', err)
      setTranscript([])
      const detail = err.response?.data?.detail
      if (detail) {
        if (detail.includes('çeviri desteklenmiyor')) {
          setTranscriptError('Bu dil için çeviri desteklenmiyor.')
        } else if (detail.includes('çevrilebilir')) {
          setTranscriptError('Bu video için çevrilebilir transkript bulunamadı.')
        } else {
          // Backend'den gelen asıl hata mesajını göster
          setTranscriptError(detail)
        }
      } else {
        setTranscriptError('Transkript alınamadı.')
      }
    } finally {
      setTranscriptLoading(false)
    }
  }

  function handleLangChange(lang) {
    setSelectedLang(lang)
    if (currentVideoId) fetchTranscript(currentVideoId, lang, translateTo, isDualMode)
  }

  function handleTranslateChange(target) {
    setTranslateTo(target)
    if (currentVideoId) fetchTranscript(currentVideoId, selectedLang, target, isDualMode)
  }

  function handleDualModeChange(checked) {
    setIsDualMode(checked)
    if (currentVideoId) fetchTranscript(currentVideoId, selectedLang, translateTo, checked)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <Navbar 
        onSearch={handleSearch} 
        isLoading={isLoading} 
        onReset={resetApp} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-2 overflow-hidden">
          <VideoArea
            videoId={currentVideoId}
            title={currentVideoTitle}
            channel={currentChannel}
            onPlayerReady={handlePlayerReady}
            onStateChange={handleStateChange}
            isSaved={isVideoSaved}
            onToggleSave={toggleSaveVideo}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <Sidebar
            searchResults={searchResults}
            isLoading={isLoading}
            searchError={searchError}
            currentVideoId={currentVideoId}
            onVideoSelect={handleVideoSelect}
            transcript={transcript}
            transcriptLoading={transcriptLoading}
            transcriptError={transcriptError}
            availableLangs={availableLangs}
            selectedLang={selectedLang}
            translateTo={translateTo}
            onLangChange={handleLangChange}
            onTranslateChange={handleTranslateChange}
            isDualMode={isDualMode}
            onDualModeChange={handleDualModeChange}
            onSeek={handleSeek}
            currentVideoTime={currentVideoTime}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            savedVideos={savedVideos}
            onRemoveSaved={removeSavedVideo}
            onImportSaved={handleImportSaved}
          />
        </div>
      </div>
    </div>
  )
}
