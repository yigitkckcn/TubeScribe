import {
  AlignLeft,
  Download,
  List,
  Loader2,
  Subtitles,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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
  onSeek,
  currentVideoTime,
}) {
  const [viewMode, setViewMode] = useState('list')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('txt')
  const [exportTimestamps, setExportTimestamps] = useState(true)
  const activeLineRef = useRef(null)

  // ── Aktif satır değiştiğinde otomatik scroll ──
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [currentVideoTime])

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
      // TXT
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
            className="flex-1 bg-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500 cursor-pointer disabled:opacity-50"
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
            className="flex-1 bg-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            {TRANSLATE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Görünüm modu + Export */}
        {transcript.length > 0 && (
          <div className="flex gap-2 items-center">
            {/* Görünüm toggle */}
            <div className="flex bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
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
                onClick={() => setViewMode('paragraph')}
                title="Paragraf Görünümü"
                className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                  viewMode === 'paragraph'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <AlignLeft size={14} />
              </button>
            </div>

            {/* Export butonu */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 flex-1 justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
            >
              <Download size={13} />
              Dışa Aktar
            </button>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center flex-1 text-zinc-500 gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Transkript yükleniyor...</span>
        </div>
      )}

      {/* ── Hata ── */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 gap-2">
          <Subtitles size={32} strokeWidth={1} />
          <p className="text-sm text-center px-4">{error}</p>
        </div>
      )}

      {/* ── Boş ── */}
      {!isLoading && !error && transcript.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 gap-2">
          <Subtitles size={32} strokeWidth={1} />
          <p className="text-sm">Transkript görüntülemek için video seçin</p>
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
                ref={active ? activeLineRef : null}
                onClick={() => onSeek(line.start)}
                className={`flex gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                  active
                    ? 'bg-zinc-800 border-l-2 border-blue-500 pl-1.5'
                    : 'hover:bg-zinc-800/60 border-l-2 border-transparent pl-1.5'
                }`}
              >
                <span
                  className={`text-xs font-mono shrink-0 pt-0.5 w-10 text-right ${
                    active ? 'text-blue-400 font-semibold' : 'text-zinc-500'
                  }`}
                >
                  {formatTimeShort(line.start)}
                </span>
                <span
                  className={`text-sm leading-relaxed ${
                    active ? 'text-blue-300' : 'text-zinc-300'
                  }`}
                >
                  {line.text}
                </span>
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
                    ref={active ? activeLineRef : null}
                    onClick={() => onSeek(line.start)}
                    className={`cursor-pointer transition-colors rounded px-0.5 ${
                      active
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {line.text}{' '}
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
            className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <h2 className="text-zinc-100 font-semibold text-base">
                Dışa Aktarma Seçenekleri
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Format seçimi */}
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide">
                Format
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportFormat('txt')}
                  className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                    exportFormat === 'txt'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  TXT (Metin)
                </button>
                <button
                  onClick={() => setExportFormat('srt')}
                  className={`flex-1 py-2.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                    exportFormat === 'srt'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  SRT (Altyazı)
                </button>
              </div>
            </div>

            {/* Metin tipi — sadece TXT seçiliyse */}
            {exportFormat === 'txt' && (
              <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide">
                  Metin Tipi
                </label>
                <div className="flex flex-col gap-1.5">
                  <label
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      exportTimestamps
                        ? 'bg-zinc-800 border-blue-500'
                        : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
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
                      <span className="text-zinc-200 text-sm">
                        Zaman Damgalı
                      </span>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        [00:15] Metin satırı...
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      !exportTimestamps
                        ? 'bg-zinc-800 border-blue-500'
                        : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
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
                      <span className="text-zinc-200 text-sm">Düz Metin</span>
                      <p className="text-zinc-500 text-xs mt-0.5">
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
                className="flex-1 py-2.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
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
