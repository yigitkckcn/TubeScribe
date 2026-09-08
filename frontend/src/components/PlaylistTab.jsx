import { Loader2, SearchX } from 'lucide-react'

export default function PlaylistTab({
  videos,
  isLoading,
  error,
  currentVideoId,
  onVideoSelect,
}) {
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

  return (
    <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1">
      {videos.map((video, index) => (
        <div
          key={video.id}
          onClick={() => onVideoSelect(video.id, video.title, video.channel, video.thumbnail)}
          className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${
            currentVideoId === video.id
              ? 'bg-zinc-200 dark:bg-zinc-800'
              : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
          }`}
        >
          {/* Sıra numarası */}
          <span className="text-zinc-500 dark:text-zinc-500 text-xs font-medium w-5 shrink-0 flex items-center justify-center">
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
  )
}
