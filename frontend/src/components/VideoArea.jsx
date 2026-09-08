import axios from 'axios'
import { Bookmark, BookmarkCheck, Download, Loader2, MonitorPlay, X } from 'lucide-react'
import { useState } from 'react'
import YouTube from 'react-youtube'

const API = 'http://localhost:8000/api'

export default function VideoArea({
  videoId,
  title,
  channel,
  onPlayerReady,
  onStateChange,
  isSaved,
  onToggleSave,
}) {
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [formats, setFormats] = useState([])
  const [formatsLoading, setFormatsLoading] = useState(false)
  const [formatsError, setFormatsError] = useState('')
  const [downloadNotice, setDownloadNotice] = useState('') // Yeni bilgi state'i

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  }

  async function openDownloadModal() {
    setShowDownloadModal(true)
    setFormatsLoading(true)
    setFormatsError('')
    setDownloadNotice('')
    setFormats([])

    try {
      const { data } = await axios.get(`${API}/formats/${videoId}`)
      setFormats(data.formats || [])
    } catch (err) {
      console.error('Format hatası:', err)
      setFormatsError('Format bilgisi alınamadı.')
    } finally {
      setFormatsLoading(false)
    }
  }

  function handleDownload(formatId) {
    // Kullanıcıyı arka planda birleştirme yapıldığına dair uyar
    setDownloadNotice('Video hazırlanıyor. Tarayıcınızın indirme penceresi açılana kadar lütfen bekleyin (Videonun uzunluğuna göre birleştirme sürebilir)...')
    
    // Yönlendir (İndirme bittiğinde tarayıcı otomatik pop-up çıkartır)
    const downloadUrl = `${API}/download/${videoId}?format_id=${formatId}`
    window.location.href = downloadUrl
  }

  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500 dark:text-zinc-500">
        <MonitorPlay size={64} strokeWidth={1} />
        <p className="text-lg">Lütfen bir video arayın veya seçin</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 gap-3 overflow-hidden">
      {/* Video oynatıcı */}
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>

      {/* Video bilgileri + butonlar */}
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-zinc-900 dark:text-zinc-100 text-lg font-semibold leading-snug">
            {title}
          </h1>
          {channel && (
            <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{channel}</span>
          )}
        </div>

        {/* Aksiyon butonları */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onToggleSave}
            title={isSaved ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30'
                : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {isSaved ? 'Kaydedildi' : 'Kaydet'}
          </button>

          <button
            onClick={openDownloadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 hover:dark:bg-zinc-700 transition-colors cursor-pointer"
          >
            <Download size={14} />
            İndir
          </button>
        </div>
      </div>

      {/* ══════ İNDİRME MODAL ══════ */}
      {showDownloadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <h2 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base">
                Videoyu İndir
              </h2>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 hover:dark:text-zinc-300 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 text-xs line-clamp-1">{title}</p>

            {/* İndirme Başladı Bildirimi */}
            {downloadNotice && (
              <div className="bg-blue-900/40 border border-blue-800 text-blue-300 px-4 py-3 rounded-lg text-sm text-center font-medium animate-pulse">
                {downloadNotice}
              </div>
            )}

            {/* Loading */}
            {formatsLoading && (
              <div className="flex items-center justify-center py-8 text-zinc-500 dark:text-zinc-500 gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Formatlar hesaplanıyor...</span>
              </div>
            )}

            {/* Hata */}
            {formatsError && (
              <p className="text-red-400 text-sm text-center py-4">
                {formatsError}
              </p>
            )}

            {/* Format listesi */}
            {!formatsLoading && !formatsError && formats.length > 0 && !downloadNotice && (
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                {formats.map((f) => (
                  <button
                    key={f.format_id}
                    onClick={() => handleDownload(f.format_id)}
                    className="flex items-center justify-between px-3 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-200 hover:dark:bg-zinc-700 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer text-left"
                  >
                    <span className="text-zinc-800 dark:text-zinc-200 text-sm">{f.label}</span>
                    <Download size={14} className="text-zinc-600 dark:text-zinc-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {!formatsLoading && !formatsError && formats.length === 0 && (
              <p className="text-zinc-500 dark:text-zinc-500 text-sm text-center py-4">
                İndirilebilir format bulunamadı.
              </p>
            )}

            {/* Kapat */}
            <button
              onClick={() => setShowDownloadModal(false)}
              className="w-full py-2.5 text-sm bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-200 hover:dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
