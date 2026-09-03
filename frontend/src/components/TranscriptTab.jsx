import { Download, FileText, Loader2, Subtitles } from 'lucide-react'

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
}) {
  const translatableLangs = availableLangs.filter((l) => l.is_translatable)

  // ── Zaman formatlayıcılar ──

  function formatTimeShort(seconds) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function formatTimeSRT(seconds) {
    const date = new Date(seconds * 1000)
    const hh = String(date.getUTCHours()).padStart(2, '0')
    const mm = String(date.getUTCMinutes()).padStart(2, '0')
    const ss = String(date.getUTCSeconds()).padStart(2, '0')
    const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0')
    return `${hh}:${mm}:${ss},${ms}`
  }

  function formatTimeTXT(seconds) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // ── Dosya indirme yardımcısı ──

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

  // ── TXT İndir ──

  function downloadTXT() {
    const lines = transcript.map(
      (line) => `[${formatTimeTXT(line.start)}] ${line.text}`
    )
    downloadBlob(lines.join('\n'), 'transcript.txt', 'text/plain;charset=utf-8')
  }

  // ── SRT İndir ──

  function downloadSRT() {
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
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden gap-2">
      {/* Üst kontroller: Dropdown'lar + Export butonları */}
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
            disabled={translatableLangs.length === 0}
            className="flex-1 bg-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500 cursor-pointer disabled:opacity-50"
          >
            <option value="">Çeviri yok</option>
            {translatableLangs.length > 0 &&
              availableLangs.map((lang) => (
                <option key={lang.language_code} value={lang.language_code}>
                  {lang.language} → Çevir
                </option>
              ))}
          </select>
        </div>

        {/* Export butonları */}
        {transcript.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={downloadTXT}
              className="flex items-center gap-1.5 flex-1 justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-2 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
            >
              <FileText size={14} />
              TXT İndir
            </button>
            <button
              onClick={downloadSRT}
              className="flex items-center gap-1.5 flex-1 justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-2 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
            >
              <Download size={14} />
              SRT İndir
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center flex-1 text-zinc-500 gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Transkript yükleniyor...</span>
        </div>
      )}

      {/* Hata */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 gap-2">
          <Subtitles size={32} strokeWidth={1} />
          <p className="text-sm text-center px-4">{error}</p>
        </div>
      )}

      {/* Boş durum */}
      {!isLoading && !error && transcript.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 gap-2">
          <Subtitles size={32} strokeWidth={1} />
          <p className="text-sm">Transkript görüntülemek için video seçin</p>
        </div>
      )}

      {/* Transkript satırları — tıklanınca seek */}
      {!isLoading && !error && transcript.length > 0 && (
        <div className="flex flex-col overflow-y-auto flex-1 pr-1">
          {transcript.map((line, index) => (
            <div
              key={index}
              onClick={() => onSeek(line.start)}
              className="flex gap-3 px-2 py-2 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <span className="text-blue-400 text-xs font-mono shrink-0 pt-0.5 w-10 text-right">
                {formatTimeShort(line.start)}
              </span>
              <span className="text-zinc-300 text-sm leading-relaxed">
                {line.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
