import {
  AlignLeft,
  Columns,
  ChevronDown,
  ChevronUp,
  Download,
  List,
  Loader2,
  Search,
  Subtitles,
  X,
  BrainCircuit,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'

// ── Global çeviri dilleri — value kesinlikle ISO 639-1 kodu ──
const TRANSLATE_LANGUAGES = [
  { code: '', label: 'Çeviri yok' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'İngilizce' },
  { code: 'de', label: 'Almanca' },
  { code: 'fr', label: 'Fransızca' },
  { code: 'es', label: 'İspanyolca' },
  { code: 'it', label: 'İtalyanca' },
  { code: 'pt', label: 'Portekizce' },
  { code: 'nl', label: 'Felemenkçe' },
  { code: 'ru', label: 'Rusça' },
  { code: 'pl', label: 'Lehçe' },
  { code: 'uk', label: 'Ukraynaca' },
  { code: 'cs', label: 'Çekçe' },
  { code: 'sv', label: 'İsveççe' },
  { code: 'da', label: 'Danca' },
  { code: 'fi', label: 'Fince' },
  { code: 'el', label: 'Yunanca' },
  { code: 'ro', label: 'Romence' },
  { code: 'hu', label: 'Macarca' },
  { code: 'ar', label: 'Arapça' },
  { code: 'fa', label: 'Farsça' },
  { code: 'hi', label: 'Hintçe' },
  { code: 'bn', label: 'Bengalce' },
  { code: 'ur', label: 'Urduca' },
  { code: 'zh-Hans', label: 'Çince (Basitleştirilmiş)' },
  { code: 'zh-Hant', label: 'Çince (Geleneksel)' },
  { code: 'ja', label: 'Japonca' },
  { code: 'ko', label: 'Korece' },
  { code: 'vi', label: 'Vietnamca' },
  { code: 'th', label: 'Tayca' },
  { code: 'id', label: 'Endonezce' },
  { code: 'ms', label: 'Malayca' },
  { code: 'tl', label: 'Filipince' },
  { code: 'sw', label: 'Svahili' },
  { code: 'af', label: 'Afrikaanca' },
  { code: 'he', label: 'İbranice' },
]

export default function TranscriptTab({
  transcript,
  isLoading,
  error,
  availableLangs,
  selectedLang,
  translateTo,
  onLangChange,
  onTranslateChange,
  isDualMode,
  onDualModeChange,
  onSeek,
  currentVideoTime,
}) {
  const [viewMode, setViewMode] = useState('list')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('txt')
  const [exportTimestamps, setExportTimestamps] = useState(true)
  
  // ── Arama State'leri ──
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [matchIndices, setMatchIndices] = useState([])
  const [currentMatchIdx, setCurrentMatchIdx] = useState(-1)
  
  // ── AI Özet State'leri ──
  const [summary, setSummary] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  const activeLineRef = useRef(null)
  const lineRefs = useRef([])
  const searchInputRef = useRef(null)

  const handleSummarize = async () => {
    const apiKey = localStorage.getItem('aiApiKey')
    const provider = localStorage.getItem('aiProvider') || 'gemini'
    
    if (!apiKey) {
      alert("Lütfen önce Ayarlar sekmesinden API anahtarınızı (API Key) girin.")
      return
    }

    if (!transcript || transcript.length === 0) return

    setShowSummary(true)
    setIsSummarizing(true)
    setSummaryError('')
    
    // Sadece çevrilmiş (veya orijinal) metinleri birleştir
    const fullText = transcript.map(t => t.translatedText || t.text).join(' ')

    try {
      const res = await axios.post('http://localhost:8000/api/summarize', {
        transcript: fullText,
        provider: provider,
        api_key: apiKey
      })
      setSummary(res.data.summary)
    } catch (err) {
      setSummaryError(err.response?.data?.detail || "Özet oluşturulurken bir hata oluştu.")
    } finally {
      setIsSummarizing(false)
    }
  }

  // ── Ctrl+F Dinleyicisi ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Sadece Ctrl+F veya Cmd+F tuşlarına basıldığında arama kutusunu aç
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setIsSearchVisible(true)
        setTimeout(() => searchInputRef.current?.focus(), 50)
      } else if (e.key === 'Escape' && isSearchVisible) {
        setIsSearchVisible(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchVisible])

  // ── Arama Yapıldığında Eşleşmeleri Bul ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchIndices([])
      setCurrentMatchIdx(-1)
      return
    }

    const query = searchQuery.toLowerCase()
    const indices = []
    transcript.forEach((line, idx) => {
      const orig = line.text?.toLowerCase() || ''
      const trans = line.translatedText?.toLowerCase() || ''
      if (orig.includes(query) || trans.includes(query)) {
        indices.push(idx)
      }
    })

    setMatchIndices(indices)
    setCurrentMatchIdx(indices.length > 0 ? 0 : -1)
  }, [searchQuery, transcript])

  // ── Arama Sonucuna Scroll Yapma ──
  useEffect(() => {
    if (currentMatchIdx >= 0 && matchIndices.length > 0) {
      const lineIndex = matchIndices[currentMatchIdx]
      const el = lineRefs.current[lineIndex]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentMatchIdx, matchIndices])

  function handleNextMatch() {
    if (matchIndices.length === 0) return
    setCurrentMatchIdx((prev) => (prev + 1) % matchIndices.length)
  }

  function handlePrevMatch() {
    if (matchIndices.length === 0) return
    setCurrentMatchIdx((prev) => (prev - 1 + matchIndices.length) % matchIndices.length)
  }

  // ── Aktif satır değiştiğinde otomatik scroll ──
  useEffect(() => {
    const isSearching = isSearchVisible && searchQuery.trim().length > 0
    // Kullanıcı arama yapıyorsa, videonun süresine göre otomatik kaydırmayı durdur
    if (activeLineRef.current && !isSearching) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [currentVideoTime, isSearchVisible, searchQuery])

  // ── Arama metni vurgulayıcı ──
  function renderHighlightedText(text, index) {
    if (!searchQuery.trim()) return text

    // regex özel karakterlerini kaçır
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))
    
    const isCurrentMatchLine = matchIndices[currentMatchIdx] === index

    return (
      <>
        {parts.map((part, i) => {
          if (part.toLowerCase() === searchQuery.toLowerCase()) {
            return (
              <mark
                key={i}
                className={`rounded-sm px-0.5 ${
                  isCurrentMatchLine 
                    ? 'bg-orange-500 text-white font-medium shadow-sm' 
                    : 'bg-yellow-500/40 text-yellow-100'
                }`}
              >
                {part}
              </mark>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </>
    )
  }

  // ── Zaman formatlayıcılar ──
  function formatTimeShort(seconds) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function formatTimeSRT(seconds) {
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const ss = String(Math.floor(seconds % 60)).padStart(2, '0')
    const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0')
    return `${hh}:${mm}:${ss},${ms}`
  }

  function formatTimeTXT(seconds) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // ── Dosya indirme ──
  function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleExportDownload() {
    if (exportFormat === 'srt') {
      const blocks = transcript.map((line, i) => {
        const startTime = formatTimeSRT(line.start)
        const endTime = formatTimeSRT(line.start + line.duration)
        return `${i + 1}\n${startTime} --> ${endTime}\n${line.text}`
      })
      downloadBlob(
        blocks.join('\n\n'),
        'transcript.srt',
        'text/plain;charset=utf-8'
      )
    } else {
      let content
      if (exportTimestamps) {
        content = transcript
          .map((line) => `[${formatTimeTXT(line.start)}] ${line.text}`)
          .join('\n')
      } else {
        content = transcript.map((line) => line.text).join(' ')
      }
      downloadBlob(content, 'transcript.txt', 'text/plain;charset=utf-8')
    }
    setShowExportModal(false)
  }

  // ── Aktif satır kontrolü ──
  function isActive(line) {
    return (
      currentVideoTime >= line.start &&
      currentVideoTime < line.start + line.duration
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden gap-2">
      {/* ── Üst kontroller ── */}
      <div className="flex flex-col gap-2 px-1 shrink-0">
        {/* Dil seçiciler */}
        <div className="flex gap-2">
          <select
            value={selectedLang}
            onChange={(e) => onLangChange(e.target.value)}
            disabled={availableLangs.length === 0}
            className="flex-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-500 cursor-pointer disabled:opacity-50"
          >
            {availableLangs.length === 0 ? (
              <option>Dil yok</option>
            ) : (
              availableLangs.map((lang) => (
                <option key={lang.language_code} value={lang.language_code}>
                  {lang.language}
                  {lang.is_generated ? ' (Otomatik)' : ''}
                </option>
              ))
            )}
          </select>

          <select
            value={translateTo}
            onChange={(e) => onTranslateChange(e.target.value)}
            className="flex-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            {TRANSLATE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Görünüm modu, Çift Dil, Arama ve Export */}
        {transcript.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap">
            {/* Çift Dil Toggle */}
            {translateTo && (
              <button
                onClick={() => {
                  onDualModeChange(!isDualMode)
                  if (!isDualMode) setViewMode('list') // Çift dilde paragraf mantıksız olur
                }}
                title={isDualMode ? "Tekli Moda Geç" : "Çift Dilli Okuma Modu"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-medium ${
                  isDualMode
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Columns size={14} />
                <span className="hidden sm:inline">Çift Dil</span>
              </button>
            )}

            {/* Görünüm toggle */}
            <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode('list')}
                title="Liste Görünümü"
                className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => !isDualMode && setViewMode('paragraph')}
                disabled={isDualMode}
                title={isDualMode ? "Çift dilli modda paragraf görünümü kullanılamaz" : "Paragraf Görünümü"}
                className={`px-2.5 py-1.5 transition-colors ${
                  isDualMode 
                    ? 'text-zinc-500 opacity-50 cursor-not-allowed'
                    : viewMode === 'paragraph'
                      ? 'bg-blue-600 text-white cursor-pointer'
                      : 'text-zinc-400 hover:text-zinc-200 cursor-pointer'
                }`}
              >
                <AlignLeft size={14} />
              </button>
            </div>

            {/* Arama Butonu */}
            <button
              onClick={() => {
                setIsSearchVisible(!isSearchVisible)
                if (!isSearchVisible) setTimeout(() => searchInputRef.current?.focus(), 50)
              }}
              title="Transkriptte Ara (Ctrl+F)"
              className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                isSearchVisible || searchQuery
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Search size={14} />
            </button>

            {/* AI Özetle Butonu */}
            <button
              onClick={handleSummarize}
              title="Yapay Zeka ile Özetle"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg border border-indigo-500 transition-colors cursor-pointer"
            >
              <BrainCircuit size={14} />
              <span className="hidden sm:inline">Özetle</span>
            </button>

            {/* Export butonu */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 flex-1 justify-center bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-200 hover:dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <Download size={13} />
              Dışa Aktar
            </button>
          </div>
        )}

        {/* ── ARAMA ÇUBUĞU (Ctrl+F) ── */}
        {isSearchVisible && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100/80 dark:bg-zinc-200 dark:bg-zinc-800/80 rounded-lg border border-zinc-300 dark:border-zinc-600 shadow-sm mt-0.5">
            <Search size={14} className="text-zinc-600 dark:text-zinc-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (e.shiftKey) handlePrevMatch()
                  else handleNextMatch()
                }
              }}
              placeholder="Transkriptte kelime ara..."
              className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder-zinc-500 min-w-0"
            />
            {searchQuery && (
              <span className="text-xs text-zinc-600 dark:text-zinc-400 tabular-nums shrink-0 font-medium">
                {matchIndices.length > 0 ? currentMatchIdx + 1 : 0} / {matchIndices.length}
              </span>
            )}
            <div className="flex items-center gap-0.5 shrink-0 border-l border-zinc-300 dark:border-zinc-700 pl-2 ml-1">
              <button
                onClick={handlePrevMatch}
                disabled={matchIndices.length === 0}
                className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-200 hover:dark:bg-zinc-700 rounded disabled:opacity-30 cursor-pointer transition-colors"
                title="Önceki (Shift+Enter)"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={matchIndices.length === 0}
                className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-200 hover:dark:bg-zinc-700 rounded disabled:opacity-30 cursor-pointer transition-colors"
                title="Sonraki (Enter)"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => {
                  setIsSearchVisible(false)
                  setSearchQuery('')
                }}
                className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-red-400 hover:bg-zinc-200 hover:dark:bg-zinc-700 rounded cursor-pointer transition-colors ml-1"
                title="Kapat (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center flex-1 text-zinc-500 dark:text-zinc-500 gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Transkript yükleniyor...</span>
        </div>
      )}

      {/* ── Hata ── */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 dark:text-zinc-500 gap-2">
          <Subtitles size={32} strokeWidth={1} />
          <p className="text-sm text-center px-4">{error}</p>
        </div>
      )}

      {/* ── Boş ── */}
      {!isLoading && !error && transcript.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 dark:text-zinc-500 gap-2">
          <Subtitles size={32} strokeWidth={1} />
          <p className="text-sm">Transkript görüntülemek için video seçin</p>
        </div>
      )}

      {/* ── AI Özet Alanı ── */}
      {showSummary && (
        <div className="flex flex-col mx-1 my-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl overflow-hidden shrink-0">
          <div className="flex items-center justify-between px-3 py-2 bg-indigo-100/50 dark:bg-indigo-900/50 border-b border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
              <BrainCircuit size={16} />
              AI Video Özeti
            </div>
            <button 
              onClick={() => setShowSummary(false)}
              className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-4 text-sm text-zinc-800 dark:text-zinc-200 overflow-y-auto max-h-80 leading-relaxed [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mb-2 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-3 [&>li]:mb-1 [&>p]:mb-3 [&>strong]:text-indigo-700 dark:[&>strong]:text-indigo-400">
            {isSummarizing ? (
              <div className="flex flex-col items-center justify-center py-4 gap-3 text-indigo-500">
                <Loader2 size={24} className="animate-spin" />
                <span className="font-medium">Video analiz ediliyor...</span>
              </div>
            ) : summaryError ? (
              <div className="text-red-500 text-center py-2">{summaryError}</div>
            ) : (
              <ReactMarkdown>{summary}</ReactMarkdown>
            )}
          </div>
        </div>
      )}

      {/* ── LİSTE GÖRÜNÜMÜ ── */}
      {!isLoading && !error && transcript.length > 0 && viewMode === 'list' && (
        <div className="flex flex-col overflow-y-auto flex-1 pr-1">
          {transcript.map((line, index) => {
            const active = isActive(line)
            return (
              <div
                key={index}
                ref={(el) => {
                  lineRefs.current[index] = el
                  if (active) activeLineRef.current = el
                }}
                onClick={() => onSeek(line.start)}
                className={`flex gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                  active
                    ? 'bg-zinc-200 dark:bg-zinc-800 border-l-2 border-blue-500 pl-1.5'
                    : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 border-l-2 border-transparent pl-1.5'
                }`}
              >
                <span
                  className={`text-xs font-mono shrink-0 pt-0.5 w-10 text-right ${
                    active ? 'text-blue-400 font-semibold' : 'text-zinc-500'
                  }`}
                >
                  {formatTimeShort(line.start)}
                </span>
                {isDualMode && translateTo ? (
                  <div className="flex w-full gap-3">
                    <div className="flex-1 border-r border-zinc-300 dark:border-zinc-700 pr-3">
                       <span className={`text-sm leading-relaxed ${active ? 'text-blue-300' : 'text-zinc-400'}`}>
                         {renderHighlightedText(line.text, index)}
                       </span>
                    </div>
                    <div className="flex-1 pl-1">
                       <span className={`text-sm leading-relaxed font-medium ${active ? 'text-blue-400' : 'text-zinc-200'}`}>
                         {renderHighlightedText(line.translatedText || '', index)}
                       </span>
                    </div>
                  </div>
                ) : (
                  <span
                    className={`text-sm leading-relaxed ${
                      active ? 'text-blue-300' : 'text-zinc-300'
                    }`}
                  >
                    {renderHighlightedText(line.text, index)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── PARAGRAF GÖRÜNÜMÜ ── */}
      {!isLoading &&
        !error &&
        transcript.length > 0 &&
        viewMode === 'paragraph' && (
          <div className="overflow-y-auto flex-1 pr-1 px-2">
            <p className="text-sm leading-relaxed">
              {transcript.map((line, index) => {
                const active = isActive(line)
                return (
                  <span
                    key={index}
                    ref={(el) => {
                      lineRefs.current[index] = el
                      if (active) activeLineRef.current = el
                    }}
                    onClick={() => onSeek(line.start)}
                    className={`cursor-pointer transition-colors rounded px-0.5 ${
                      active
                        ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {renderHighlightedText(line.text, index)}{' '}
                  </span>
                )
              })}
            </p>
          </div>
        )}

      {/* ══════════════ EXPORT MODAL ══════════════ */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <h2 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base">
                Dışa Aktarma Seçenekleri
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 hover:dark:text-zinc-300 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Format seçimi */}
            <div className="flex flex-col gap-2">
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-medium uppercase tracking-wide">
                Format
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportFormat('txt')}
                  className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                    exportFormat === 'txt'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  TXT (Metin)
                </button>
                <button
                  onClick={() => setExportFormat('srt')}
                  className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                    exportFormat === 'srt'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  SRT (Altyazı)
                </button>
              </div>
            </div>

            {/* Metin tipi — sadece TXT seçiliyse */}
            {exportFormat === 'txt' && (
               <div className="flex flex-col gap-2">
                <label className="text-zinc-600 dark:text-zinc-400 text-xs font-medium uppercase tracking-wide">
                  Metin Tipi
                </label>
                <div className="flex flex-col gap-1.5">
                  <label
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      exportTimestamps
                        ? 'bg-zinc-200 dark:bg-zinc-800 border-blue-500'
                        : 'bg-zinc-200 dark:bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="txtType"
                      checked={exportTimestamps}
                      onChange={() => setExportTimestamps(true)}
                      className="accent-blue-500"
                    />
                    <div>
                      <span className="text-zinc-800 dark:text-zinc-200 text-sm">
                        Zaman Damgalı
                      </span>
                      <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">
                        [00:15] Metin satırı...
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      !exportTimestamps
                        ? 'bg-zinc-200 dark:bg-zinc-800 border-blue-500'
                        : 'bg-zinc-200 dark:bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="txtType"
                      checked={!exportTimestamps}
                      onChange={() => setExportTimestamps(false)}
                      className="accent-blue-500"
                    />
                    <div>
                      <span className="text-zinc-800 dark:text-zinc-200 text-sm">Düz Metin</span>
                      <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">
                        Zaman damgasız paragraf metni
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 text-sm bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-200 hover:dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleExportDownload}
                className="flex-1 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer font-medium"
              >
                İndir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
