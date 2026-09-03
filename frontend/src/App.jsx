import axios from 'axios'
import { useCallback, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import VideoArea from './components/VideoArea'

const API = 'http://localhost:8000/api'

export default function App() {
  const [searchResults, setSearchResults] = useState([])
  const [currentVideoId, setCurrentVideoId] = useState(null)
  const [currentVideoTitle, setCurrentVideoTitle] = useState('')
  const [currentChannel, setCurrentChannel] = useState('')
  const [transcript, setTranscript] = useState([])
  const [availableLangs, setAvailableLangs] = useState([])
  const [selectedLang, setSelectedLang] = useState('')
  const [translateTo, setTranslateTo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [transcriptError, setTranscriptError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [currentVideoTime, setCurrentVideoTime] = useState(0)

  const playerRef = useRef(null)
  const intervalRef = useRef(null)

  // ── Player hazır ──
  function handlePlayerReady(event) {
    playerRef.current = event.target
  }

  // ── Zaman takibi: oynarken 500ms aralıkla güncelle ──
  const startTimeTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        setCurrentVideoTime(playerRef.current.getCurrentTime())
      }
    }, 500)
  }, [])

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  function handleStateChange(event) {
    // 1 = playing
    if (event.data === 1) {
      startTimeTracking()
    } else {
      stopTimeTracking()
    }
  }

  // ── Seek ──
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
      const isPlaylist =
        query.includes('playlist') || query.includes('list=')

      if (isPlaylist) {
        const { data } = await axios.get(`${API}/playlist`, {
          params: { url: query },
        })
        setSearchResults(data.videos || [])
      } else {
        const { data } = await axios.get(`${API}/search`, {
          params: { q: query },
        })
        setSearchResults(data.results || [])
      }
    } catch (err) {
      console.error('Arama hatası:', err)
      setSearchError('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Video seçimi ──
  async function handleVideoSelect(videoId, title, channel) {
    setCurrentVideoId(videoId)
    setCurrentVideoTitle(title)
    setCurrentChannel(channel || '')
    setTranscript([])
    setAvailableLangs([])
    setTranscriptError('')
    setSelectedLang('')
    setTranslateTo('')
    setCurrentVideoTime(0)
    setTranscriptLoading(true)

    try {
      const { data: subsData } = await axios.get(
        `${API}/subtitles/${videoId}`
      )
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

  // ── Transkript çek ──
  async function fetchTranscript(videoId, lang, translateTarget) {
    setTranscriptLoading(true)
    setTranscriptError('')

    try {
      const params = { lang }
      if (translateTarget) params.translate_to = translateTarget

      const { data } = await axios.get(`${API}/transcript/${videoId}`, {
        params,
      })
      setTranscript(data.transcript || [])
    } catch (err) {
      console.error('Transkript hatası:', err)
      setTranscript([])
      setTranscriptError('Transkript alınamadı.')
    } finally {
      setTranscriptLoading(false)
    }
  }

  // ── Dil değişikliği ──
  function handleLangChange(lang) {
    setSelectedLang(lang)
    if (currentVideoId) fetchTranscript(currentVideoId, lang, translateTo)
  }

  function handleTranslateChange(target) {
    setTranslateTo(target)
    if (currentVideoId) fetchTranscript(currentVideoId, selectedLang, target)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 overflow-hidden">
      <Navbar onSearch={handleSearch} isLoading={isLoading} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-2 overflow-hidden">
          <VideoArea
            videoId={currentVideoId}
            title={currentVideoTitle}
            channel={currentChannel}
            onPlayerReady={handlePlayerReady}
            onStateChange={handleStateChange}
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
            onSeek={handleSeek}
            currentVideoTime={currentVideoTime}
          />
        </div>
      </div>
    </div>
  )
}
