import { Bookmark, Download, Trash2, Upload } from 'lucide-react'
import { useRef } from 'react'

export default function SavedTab({
  savedVideos,
  currentVideoId,
  onVideoSelect,
  onRemoveSaved,
  onImportSaved,
}) {
  const fileInputRef = useRef(null)

  // JSON Dışa Aktar
  function exportJSON() {
    const json = JSON.stringify(savedVideos, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tubiscribe_yedek.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // JSON İçe Aktar
  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        // Geçerli bir dizi olup olmadığını basitçe kontrol et
        if (Array.isArray(json)) {
          onImportSaved(json)
        } else {
          alert("Dosya formatı geçerli değil!")
        }
      } catch (err) {
        alert("Geçersiz JSON dosyası!")
      }
    }
    reader.readAsText(file)
    e.target.value = null // aynı dosyayı tekrar seçebilmek için reset
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden gap-2">
      {/* Aksiyon Butonları */}
      <div className="flex gap-2 mx-1 shrink-0">
        <button
          onClick={exportJSON}
          title="Kaydedilenleri Dışa Aktar"
          disabled={!savedVideos || savedVideos.length === 0}
          className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-xs rounded-lg border border-zinc-700 transition-colors cursor-pointer"
        >
          <Download size={13} />
          Dışa Aktar
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Yedeklenmiş Listeyi İçe Aktar"
          className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg border border-zinc-700 transition-colors cursor-pointer"
        >
          <Upload size={13} />
          İçe Aktar
        </button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {(!savedVideos || savedVideos.length === 0) && (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 gap-2">
          <Bookmark size={32} strokeWidth={1} />
          <p className="text-sm">Henüz kaydedilen video yok</p>
          <p className="text-xs text-zinc-600">
            Video oynatırken "Kaydet" butonuna basın
          </p>
        </div>
      )}

      {/* Video listesi */}
      {savedVideos && savedVideos.length > 0 && (
        <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1">
          {savedVideos.map((video, index) => (
            <div
              key={video.id}
              className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${
                currentVideoId === video.id
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-800/60'
              }`}
            >
              {/* Sıra */}
              <span className="text-zinc-500 text-xs font-medium w-5 shrink-0 flex items-center justify-center">
                {index + 1}
              </span>

              {/* Thumbnail */}
              <div
                className="relative w-28 shrink-0 aspect-video rounded-md overflow-hidden bg-zinc-800"
                onClick={() =>
                  onVideoSelect(video.id, video.title, video.channel, video.thumbnail)
                }
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bilgiler */}
              <div
                className="flex flex-col justify-center gap-0.5 min-w-0 flex-1"
                onClick={() =>
                  onVideoSelect(video.id, video.title, video.channel, video.thumbnail)
                }
              >
                <span className="text-zinc-200 text-sm font-medium leading-snug line-clamp-2">
                  {video.title}
                </span>
                <span className="text-zinc-500 text-xs">{video.channel}</span>
              </div>

              {/* Sil butonu */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveSaved(video.id)
                }}
                className="self-center text-zinc-600 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                title="Kaydedilenlerden çıkar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
