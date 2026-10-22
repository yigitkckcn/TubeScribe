import { Loader2, SearchX, Download, CheckSquare, Square } from 'lucide-react'
import { useState } from 'react'
import BulkDownloadModal from './BulkDownloadModal'

export default function PlaylistTab({
  videos,
  isLoading,
  error,
  currentVideoId,
  onVideoSelect,
}) {
  const [selectedVideos, setSelectedVideos] = useState(new Set())
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 text-zinc-500 dark:text-zinc-500 gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Aranıyor...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1 text-red-400 text-sm px-4 text-center">
        {error}
      </div>
    )
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 dark:text-zinc-500 gap-2">
        <SearchX size={32} strokeWidth={1} />
        <p className="text-sm">Henüz arama yapılmadı</p>
      </div>
    )
  }

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    const newSet = new Set(selectedVideos)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedVideos(newSet)
  }

  const selectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set())
    } else {
      setSelectedVideos(new Set(videos.map(v => v.id)))
    }
  }

  const selectedVideosList = videos.filter(v => selectedVideos.has(v.id))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toplu İşlem Çubuğu */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div 
          onClick={selectAll}
          className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {selectedVideos.size === videos.length ? (
            <CheckSquare size={16} className="text-blue-500" />
          ) : (
            <Square size={16} />
          )}
          Tümünü Seç ({selectedVideos.size}/{videos.length})
        </div>

        {selectedVideos.size > 0 && (
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition-colors"
          >
            <Download size={14} />
            Seçilenleri İndir
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto flex-1 p-1">
        {videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => onVideoSelect(video.id, video.title, video.channel, video.thumbnail)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${
              currentVideoId === video.id
                ? 'bg-zinc-200 dark:bg-zinc-800'
                : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            {/* Checkbox */}
            <div 
              onClick={(e) => toggleSelect(video.id, e)}
              className="pl-1 flex items-center justify-center text-zinc-400 hover:text-blue-500 transition-colors"
            >
              {selectedVideos.has(video.id) ? (
                <CheckSquare size={18} className="text-blue-500" />
              ) : (
                <Square size={18} />
              )}
            </div>

            {/* Sıra numarası */}
            <span className="text-zinc-500 dark:text-zinc-500 text-xs font-medium w-4 shrink-0 text-center">
              {index + 1}
            </span>

            {/* Küçük resim */}
            <div className="relative w-28 shrink-0 aspect-video rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/80 text-zinc-800 dark:text-zinc-200 text-[10px] font-medium px-1 py-0.5 rounded">
                {video.duration}
              </span>
            </div>

            {/* Bilgiler */}
            <div className="flex flex-col justify-center gap-0.5 min-w-0">
              <span className="text-zinc-800 dark:text-zinc-200 text-sm font-medium leading-snug line-clamp-2">
                {video.title}
              </span>
              <span className="text-zinc-500 dark:text-zinc-500 text-xs">{video.channel}</span>
            </div>
          </div>
        ))}
      </div>

      {isBulkModalOpen && (
        <BulkDownloadModal 
          videos={selectedVideosList}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}
    </div>
  )
}
