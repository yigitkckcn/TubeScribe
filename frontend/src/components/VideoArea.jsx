import { MonitorPlay } from 'lucide-react'
import YouTube from 'react-youtube'

export default function VideoArea({ videoId, title, channel, onPlayerReady }) {
  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  }

  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
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
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>

      {/* Video bilgileri */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-zinc-100 text-lg font-semibold leading-snug">
          {title}
        </h1>
        {channel && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">{channel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
